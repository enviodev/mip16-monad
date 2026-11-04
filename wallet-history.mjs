// Every transaction a wallet sent on Monad mainnet, oldest first, with block timestamps.
// Usage: node wallet-history.mjs <address>
import { rpc, hex } from "./lib/rpc.mjs";

const wallet = process.argv[2];
if (!wallet) throw new Error("Usage: node wallet-history.mjs <address>");

const toBlock = BigInt(await rpc("eth_blockNumber", []));
let fromBlock = 0n;
const txs = [];
const timestamps = new Map();

while (fromBlock <= toBlock) {
  const page = await rpc("eth_queryTransactions", [{
    filter: { from: wallet },
    fields: {
      transactions: ["hash", "to", "value", "blockNumber"],
      blocks: ["number", "timestamp"],
    },
    fromBlock: hex(fromBlock),
    toBlock: hex(toBlock),
  }]);
  txs.push(...page.data.transactions);
  for (const b of page.data.blocks ?? []) timestamps.set(b.number, Number(b.timestamp));
  // Each page ends at cursorBlock. The next page starts one block later.
  fromBlock = BigInt(page.cursorBlock.number) + 1n;
}

console.log(`${txs.length} transactions sent by ${wallet}`);
for (const tx of txs.slice(-5)) {
  console.log({
    hash: tx.hash,
    to: tx.to,
    valueMON: Number(BigInt(tx.value)) / 1e18,
    block: Number(BigInt(tx.blockNumber)),
    time: new Date(timestamps.get(tx.blockNumber) * 1000).toISOString(),
  });
}
