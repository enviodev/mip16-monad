# Agent guide for MIP-16 on Monad

Instructions for coding agents such as Claude Code, Cursor and Codex working in this repo.

## Endpoint

- Monad mainnet: `https://monad.rpc.hypersync.xyz/$ENVIO_API_TOKEN`
- Monad testnet: `https://10143.rpc.hypersync.xyz/$ENVIO_API_TOKEN`
- The token lives in `.env` as `ENVIO_API_TOKEN`. Get a free one at https://envio.dev/app/hyperrpc-tokens
- Spec: https://github.com/monad-crypto/MIPs/pull/89/files

## Methods

| Method | Filters |
| - | - |
| `eth_queryBlocks` | `miner` |
| `eth_queryTransactions` | `from`, `to`, `selector` |
| `eth_queryLogs` | `address`, `topics` |

Traces and transfers are coming soon. A method that isn't supported yet returns `-32004`.

## Rules

- If you set `fields`, include the method's own type, such as `logs` for `eth_queryLogs`, or the call returns `-32602`.
- Request fields are `fromBlock`, `toBlock`, `order`, `target`, `filter` and `fields`. Any other key returns `-32602`.
- Join related objects with `logs.transactionHash = transactions.hash` and `logs.blockNumber = blocks.number`. Select both sides of each join key.
- Page with `cursorBlock`. Oldest first, the next page starts at `cursorBlock + 1`. Newest first, it starts at `cursorBlock - 1`.
- With `order: "desc"`, `fromBlock` is the newest block. Start at `"latest"` instead of calling `eth_blockNumber`.
- A page can return fewer results than `target`, or none. Keep paging from `cursorBlock`.
- Near the chain tip, compare each page's `fromBlock.parentHash` with the previous page's `cursorBlock.hash`. If they differ, a reorg replaced blocks you already read, so roll back to the last matching block.
- On HTTP 429, wait and retry. `lib/rpc.mjs` already does this.

## Code style

- Reuse `rpc()` and `hex()` from `lib/rpc.mjs`.
- No dependencies. Node.js 20.6+ with built-in `fetch`.
