# Contributing to Aptos Explorer

Thanks for your interest in contributing.

## How to contribute

- Fork the repo and create a branch from `main`
- Make your changes
- Run formatting and lint checks:

```sh
pnpm fmt
pnpm lint
```

- Run tests when applicable:

```sh
pnpm test --run
```

- Open a pull request and describe:
  - what changed
  - why it changed
  - how it was tested

## Repository notes

- Primary application code is in `app/`.
- `src/` is legacy or compatibility code. Prefer `app/` for new work.
- For agent workflows and task tracking, see `AGENTS.md` and `.agents/`.
