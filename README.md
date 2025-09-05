# Libra2XP

## How to use

Clone the repo. Requires [pnpm](https://pnpm.io/installation)

Install dependencies:

```sh
pnpm install
```

### Environment configuration

Network endpoints can be customized through environment variables. Copy the
example file and adjust values as needed:

```sh
cp .env.example .env.local
```

Supported variables:

| Variable              | Default                      |
| --------------------- | ---------------------------- |
| `LIBRA2_MAINNET_URL`  | `https://mainnet.libra2.org` |
| `LIBRA2_TESTNET_URL`  | `https://testnet.libra2.org` |
| `LIBRA2_DEVNET_URL`   | `https://devnet.libra2.org`  |
| `LIBRA2_LOCAL_URL`    | `http://127.0.0.1:8080`      |
| `LIBRA2_LOCALNET_URL` | `http://127.0.0.1:8080`      |

Each `LIBRA2_*_URL` variable overrides the default endpoint for the matching
network. Variables are loaded from `.env.local` and can be tailored to point to
custom fullnodes or indexers.

### Running against different networks

Libra2XP defaults to mainnet. To explore other Libra2 networks, start the app
and select a network either from the UI's network dropdown or by appending a
`?network=<name>` query parameter:

```sh
pnpm start
```

Then open one of the following URLs in your browser:

- `http://localhost:3000` (mainnet)
- `http://localhost:3000/?network=testnet`
- `http://localhost:3000/?network=devnet`
- `http://localhost:3000/?network=local`

If your local node runs on a non-default address, update `LIBRA2_LOCAL_URL` in
`.env.local` accordingly before starting the app.

### GraphQL support

Libra2's indexer does not yet provide the full GraphQL schema.
When a GraphQL endpoint is unavailable the explorer temporarily
falls back to REST endpoints, so some queries may be limited until
native support is added.

Build dependencies:

```sh
pnpm build
```

Run below to start the app:

```sh
pnpm start
```
