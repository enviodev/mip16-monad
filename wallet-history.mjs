// Every transaction a wallet sent on Monad mainnet, oldest first, with block timestamps.
// Usage: node wallet-history.mjs <address>
import { rpc, hex } from "./lib/rpc.mjs";

const wallet = process.argv[2];
if (!wallet) throw new Error("Usage: node wallet-history.mjs <address>");

let fromBlock = "earliest";
let toBlock = "latest";
const txs = [];
const timestamps = new Map();

while (true) {
  const page = await rpc("eth_queryTransactions", [{
    filter: { from: wallet },
    fields: {
      transactions: ["hash", "to", "value", "blockNumber"],
      blocks: ["number", "timestamp"],
    },
    fromBlock,
    toBlock,
  }]);
  txs.push(...page.data.transactions);
  for (const b of page.data.blocks ?? []) timestamps.set(b.number, Number(b.timestamp));
  // Keep the same end block for every page, and stop once a page reaches it.
  toBlock = page.toBlock.number;
  const cursor = BigInt(page.cursorBlock.number);
  if (cursor >= BigInt(toBlock)) break;
  // Each page ends at cursorBlock. The next page starts one block later.
  fromBlock = hex(cursor + 1n);
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
