// Minimal client for Envio HyperRPC on Monad mainnet.
const token = process.env.ENVIO_API_TOKEN;
if (!token) {
  console.error("Set ENVIO_API_TOKEN. Get a free token at https://envio.dev/app/hyperrpc-tokens");
  process.exit(1);
}
const url = `https://monad.rpc.hypersync.xyz/${token}`;

export async function rpc(method, params) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (res.status === 429) {
    // The free tier is rate limited, so wait and retry.
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return rpc(method, params);
  }
  const { result, error } = await res.json();
  if (error) throw new Error(`${error.code}: ${error.message}`);
  return result;
}

export const hex = (n) => "0x" + BigInt(n).toString(16);
