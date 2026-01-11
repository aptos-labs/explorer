# Aptos Explorer

The Aptos Explorer is the official block explorer for the Aptos blockchain. It helps users and developers inspect on-chain activity and understand what is happening on Aptos.

## What the Explorer is for

Use Aptos Explorer to:

- View **transactions**, including payloads, events, and gas usage
- Inspect **accounts**, including balances and resources
- Browse **blocks** and network activity
- Explore **validators** and staking related data
- Review **analytics** pages backed by datasets in `analytics/`

## How to access it

### Hosted

The canonical hosted instance is available at `https://explorer.aptoslabs.com`.

### Run locally

**Prerequisites**

- Node.js (see `.node-version` for the expected version)
- `pnpm` (see `package.json` for the pinned version)

**Install**

```sh
pnpm install
```

**Start the dev server**

- Port 3030:

```sh
pnpm dev
```

- Port 3000:

```sh
pnpm start
```

**Build**

```sh
pnpm build
```

## How to contribute

Contributions are welcome, including bug fixes, performance improvements, docs, and new features.

### Development workflow

- Fork the repo and create a branch from `main`
- Make your changes
- Run formatting and lint checks before opening a pull request:

```sh
pnpm fmt
pnpm lint
```

- Run tests when applicable:

```sh
pnpm test --run
```

### Project notes

- The primary application code is in `app/`.
- `src/` contains legacy or compatibility code. Prefer `app/` for new work.
- Agent workflows and task tracking live in `AGENTS.md` and `.agents/`.

## How to file issues

Use GitHub Issues to report bugs, request features, or request address verification:

- New issue: `https://github.com/aptos-labs/explorer/issues/new/choose`
- Existing issues: `https://github.com/aptos-labs/explorer/issues`

Please pick the appropriate issue template and include clear reproduction steps and expected behavior when reporting bugs.

## Contributors

Thanks to all contributors who help improve Aptos Explorer.

<a href="https://github.com/aptos-labs/explorer/graphs/contributors">
  <img
    src="https://contrib.rocks/image?repo=aptos-labs/explorer"
    alt="Images of contributors to aptos-labs/explorer"
  />
</a>
