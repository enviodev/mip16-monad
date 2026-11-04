# MIP-16 on Monad - Node.js Example

Runnable examples of the [MIP-16](https://github.com/monad-crypto/MIPs/pull/89) query methods on Monad mainnet, served by [Envio HyperRPC](https://docs.envio.dev/docs/HyperRPC/overview-hyperrpc). No dependencies, just Node.js.

MIP-16 adds RPC methods that filter on the server, return only the fields you select, and join each result to its transaction and block. These scripts show the three things that are hard with standard RPC.

| Script | What it does | Method |
| - | - | - |
| `wallet-history.mjs` | Every transaction a wallet sent, from the first block | `eth_queryTransactions` |
| `function-calls.mjs` | The most recent calls to one function on a contract | `eth_queryTransactions` |
| `transfers-with-context.mjs` | Every USDC transfer in a block range, with sender and timestamp | `eth_queryLogs` |

> This is an educational example. It is not audited and not production-ready.

## Quick start

### 1. Get a free API token

Create one at [envio.dev/app/hyperrpc-tokens](https://envio.dev/app/hyperrpc-tokens), then add it to `.env`:

```bash
cp .env.example .env
```

### 2. Run a script

Node.js 20.6 or later is required.

```bash
# Every USDC transfer in the last 2,000 blocks, with sender and timestamp
npm run transfers -- 2000

# The 20 most recent gasless USDC transfers (transferWithAuthorization)
npm run calls -- 0x754704bc059f8c67012fed69bc8a327a5aafb603 0xe3ee160e 20

# Every transaction a wallet has sent
npm run wallet -- <address>
```

## How it works

Each script sends one MIP-16 call per page and pages with `cursorBlock`, the last block a page covers.

- Oldest first, the next page starts at `cursorBlock + 1`.
- Newest first, the next page starts at `cursorBlock - 1`. A newest-first page covers a limited window of blocks, so it can come back empty when matches are sparse.
- `eth_query*` calls can't be batched yet, so each one goes as its own request.
- The free tier is rate limited. `lib/rpc.mjs` waits and retries on HTTP 429.

## Endpoint

| Network | Endpoint |
| - | - |
| Mainnet | `https://monad.rpc.hypersync.xyz/<api-token>` |

## Learn more

- [MIP-16 spec](https://github.com/monad-crypto/MIPs/pull/89)
- [HyperRPC docs](https://docs.envio.dev/docs/HyperRPC/overview-hyperrpc)
- [Envio on Monad](https://envio.dev/chains/monad)
