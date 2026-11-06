// Every USDC transfer in the latest N blocks on Monad mainnet, newest first, joined to its sender and block timestamp.
// Usage: node transfers-with-context.mjs [blocks]
import { rpc, hex } from "./lib/rpc.mjs";

const USDC = "0x754704bc059f8c67012fed69bc8a327a5aafb603";
const TRANSFER = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const span = BigInt(process.argv[2] ?? 2000);

let fromBlock = "latest";
let lastBlock;
let requests = 0;

const logs = [];
const senders = new Map();
const timestamps = new Map();

while (true) {
  const page = await rpc("eth_queryLogs", [{
    filter: { address: USDC, topics: [TRANSFER] },
    fields: {
      logs: ["blockNumber", "transactionHash", "data", "topics"],
      transactions: ["hash", "from"],
      blocks: ["number", "timestamp"],
    },
    fromBlock,
    order: "desc",
  }]);
  requests++;
  // The first page starts at the latest block. Stop once the pages cover the block window.
  lastBlock ??= BigInt(page.fromBlock.number) - span + 1n;
  logs.push(...page.data.logs.filter((log) => BigInt(log.blockNumber) >= lastBlock));
  for (const tx of page.data.transactions) senders.set(tx.hash, tx.from);
  for (const b of page.data.blocks) timestamps.set(b.number, Number(b.timestamp));
  // Each page ends at cursorBlock. Newest first, the next page starts one block below it.
  const cursor = BigInt(page.cursorBlock.number);
  if (cursor <= lastBlock) break;
  fromBlock = hex(cursor - 1n);
}

console.log(`${logs.length} USDC transfers in the latest ${span} blocks, from ${requests} requests`);
for (const log of logs.slice(0, 3)) {
  console.log({
    sender: senders.get(log.transactionHash),
    from: "0x" + log.topics[1].slice(26),
    to: "0x" + log.topics[2].slice(26),
    amount: Number(BigInt(log.data)) / 1e6,
    time: new Date(timestamps.get(log.blockNumber) * 1000).toISOString(),
  });
}
