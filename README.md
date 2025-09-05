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

| Variable | Default |
|----------|---------|
| `LIBRA2_MAINNET_URL` | `https://mainnet.libra2.org` |
| `LIBRA2_TESTNET_URL` | `https://testnet.libra2.org` |
| `LIBRA2_DEVNET_URL` | `https://devnet.libra2.org` |
| `LIBRA2_LOCAL_URL` | `http://127.0.0.1:8080` |
| `LIBRA2_LOCALNET_URL` | `http://127.0.0.1:8080` |

Build dependencies:

```sh
pnpm build
```

Run below to start the app:

```sh
pnpm start
```
