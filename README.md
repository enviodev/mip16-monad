# MIP-16 on Monad with Envio HyperRPC

The official Envio scripts for the [MIP-16](https://github.com/monad-crypto/MIPs/pull/89) query methods on Monad, served by [Envio HyperRPC](https://docs.envio.dev/docs/HyperRPC/overview-hyperrpc). They run on Node.js with no dependencies.

MIP-16 adds RPC methods that filter on the server, return only the fields you select, and join each result to its transaction and block. These scripts show the three things that are hard with standard RPC.

| Script | What it does | Method |
| - | - | - |
| `wallet-history.mjs` | Every transaction a wallet sent, from the first block | `eth_queryTransactions` |
| `function-calls.mjs` | The most recent calls to one function on a contract | `eth_queryTransactions` |
| `transfers-with-context.mjs` | Every USDC transfer in a block range, with sender and timestamp | `eth_queryLogs` |

## Quick start

### 1. Get a free API token

Create one at [envio.dev/app/hyperrpc-tokens](https://envio.dev/app/hyperrpc-tokens), then add it to `.env`:

```bash
cp .env.example .env
```

### 2. Run a script

Node.js 20.6 or later is required.

```bash
# Every USDC transfer in the latest 2,000 blocks, newest first, with sender and timestamp
npm run transfers -- 2000

# The 20 most recent gasless USDC transfers (transferWithAuthorization)
npm run calls -- 0x754704bc059f8c67012fed69bc8a327a5aafb603 0xe3ee160e 20

# Every transaction a wallet has sent
npm run wallet -- <address>
```

## How it works

Each script sends one MIP-16 call per page and pages with `cursorBlock`, the last block a page covers.

- Oldest first, the next page starts at `cursorBlock + 1`.
- Newest first, the next page starts at `cursorBlock - 1`. A page can return fewer results than `target`, or none, so keep paging from `cursorBlock`.
- Near the chain tip, compare each page's `fromBlock.parentHash` with the previous page's `cursorBlock.hash` to detect a reorg.
- The free tier is rate limited. `lib/rpc.mjs` waits and retries on HTTP 429.

## Build with an AI agent

Open this repo in a coding agent such as Claude Code or Cursor. `AGENTS.md` gives it the endpoint, the methods and the rules it needs.

To give the agent Envio's docs as well, add the Envio docs MCP server:

```bash
claude mcp add --transport http envio-docs https://docs.envio.dev/mcp
```

Then try a prompt like one of these:

```text
Add a script that lists every direct call to WMON deposit() on Monad in the last 10,000 blocks, with the sender and block timestamp.
```

```text
Add a script that prints the 10 wallets that received the most USDC on Monad in the last 2,000 blocks.
```

```text
Add a script that exports a wallet's full transaction history on Monad, sent and received, to CSV.
```

## Endpoint

| Network | Endpoint |
| - | - |
| Mainnet | `https://monad.rpc.hypersync.xyz/<api-token>` |
| Testnet | `https://10143.rpc.hypersync.xyz/<api-token>` |

## Learn more

- [MIP-16 spec](https://github.com/monad-crypto/MIPs/pull/89)
- [MIP-16 on HyperRPC](https://envio.dev/products/hyperrpc)
- [HyperRPC docs](https://docs.envio.dev/docs/HyperRPC/overview-hyperrpc)
- [Envio on Monad](https://envio.dev/chains/monad)
