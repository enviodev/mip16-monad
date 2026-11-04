// Every USDC transfer in the last N blocks on Monad mainnet, joined to its sender and block timestamp.
// Usage: node transfers-with-context.mjs [blocks]
import { rpc, hex } from "./lib/rpc.mjs";

const USDC = "0x754704bc059f8c67012fed69bc8a327a5aafb603";
const TRANSFER = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const span = BigInt(process.argv[2] ?? 2000);

const toBlock = BigInt(await rpc("eth_blockNumber", []));
let fromBlock = toBlock - span + 1n;
let requests = 0;

const logs = [];
const senders = new Map();
const timestamps = new Map();

while (fromBlock <= toBlock) {
  const page = await rpc("eth_queryLogs", [{
    filter: { address: USDC, topics: [TRANSFER] },
    fields: {
      logs: ["blockNumber", "transactionHash", "data", "topics"],
      transactions: ["hash", "from"],
      blocks: ["number", "timestamp"],
    },
    fromBlock: hex(fromBlock),
    toBlock: hex(toBlock),
  }]);
  requests++;
  logs.push(...page.data.logs);
  for (const tx of page.data.transactions) senders.set(tx.hash, tx.from);
  for (const b of page.data.blocks) timestamps.set(b.number, Number(b.timestamp));
  fromBlock = BigInt(page.cursorBlock.number) + 1n;
}

console.log(`${logs.length} USDC transfers in the last ${span} blocks, from ${requests} requests`);
for (const log of logs.slice(0, 3)) {
  console.log({
    sender: senders.get(log.transactionHash),
    from: "0x" + log.topics[1].slice(26),
    to: "0x" + log.topics[2].slice(26),
    amount: Number(BigInt(log.data)) / 1e6,
    time: new Date(timestamps.get(log.blockNumber) * 1000).toISOString(),
  });
}
