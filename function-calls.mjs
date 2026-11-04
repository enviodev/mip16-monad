// The most recent calls to one function on a Monad mainnet contract, newest first.
// Usage: node function-calls.mjs <contract> <4-byte selector> [count]
// Example: node function-calls.mjs 0x754704bc059f8c67012fed69bc8a327a5aafb603 0xe3ee160e 20
import { rpc, hex } from "./lib/rpc.mjs";

const [contract, selector, countArg] = process.argv.slice(2);
if (!contract || !selector) throw new Error("Usage: node function-calls.mjs <contract> <selector> [count]");
const count = Number(countArg ?? 20);

let fromBlock = "latest";
const calls = [];

while (calls.length < count) {
  const page = await rpc("eth_queryTransactions", [{
    filter: { to: contract, selector },
    fields: { transactions: ["hash", "from", "blockNumber"] },
    order: "desc",
    fromBlock,
  }]);
  calls.push(...page.data.transactions);
  // A newest-first page covers a limited window and can be empty. Keep going below cursorBlock.
  const cursor = BigInt(page.cursorBlock.number);
  if (cursor === 0n) break;
  fromBlock = hex(cursor - 1n);
}

console.log(`${Math.min(calls.length, count)} most recent ${selector} calls to ${contract}`);
for (const c of calls.slice(0, count)) {
  console.log({ hash: c.hash, from: c.from, block: Number(BigInt(c.blockNumber)) });
}
