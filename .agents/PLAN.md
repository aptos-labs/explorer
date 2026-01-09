# Universal Agent Documentation System - Implementation Plan

## Overview

Create a comprehensive agent system compatible with Cursor, Claude Code, Gemini, Warp, GitHub Copilot, Antigravity, Mistral Vibe, and OpenCode. All content lives in `AGENTS.md` (single source of truth), symlinked for each tool, with role-specific rules in each tool's native format.

## File Structure

```
explorer/
├── AGENTS.md                              # Canonical source - ALL content here
├── CLAUDE.md -> AGENTS.md                 # Symlink for Claude Code
├── GEMINI.md -> AGENTS.md                 # Symlink for Gemini + Antigravity
├── WARP.md -> AGENTS.md                   # Symlink for Warp
│
├── .github/
│   └── copilot-instructions.md -> ../AGENTS.md  # Symlink for GitHub Copilot
│
├── .cursor/                               # Cursor IDE
│   ├── rules/
│   │   ├── architect.mdc
│   │   ├── coder.mdc
│   │   ├── reviewer.mdc
│   │   ├── tester.mdc
│   │   ├── qa-auditor.mdc
│   │   ├── cost-cutter.mdc
│   │   └── modernizer.mdc
│   └── notepads/
│       └── [7 role notepads .md]
│
├── .agent/                                # Antigravity (Google)
│   └── rules/
│       ├── architect.md
│       ├── coder.md
│       ├── reviewer.md
│       ├── tester.md
│       ├── qa-auditor.md
│       ├── cost-cutter.md
│       └── modernizer.md
│
├── .vibe/                                 # Mistral Vibe
│   └── agents/                            # Note: "agents" plural
│       ├── architect.toml                 # TOML format
│       ├── coder.toml
│       ├── reviewer.toml
│       ├── tester.toml
│       ├── qa-auditor.toml
│       ├── cost-cutter.toml
│       └── modernizer.toml
│
├── .opencode/                             # OpenCode
│   └── agent/                             # Note: "agent" singular
│       ├── architect.md
│       ├── coder.md
│       ├── reviewer.md
│       ├── tester.md
│       ├── qa-auditor.md
│       ├── cost-cutter.md
│       └── modernizer.md
│
├── .agents/                               # Shared task management (all tools)
│   ├── README.md
│   ├── tasks/
│   │   ├── backlog.md
│   │   ├── ready.md
│   │   ├── in-progress.md
│   │   ├── review.md
│   │   └── done.md
│   ├── issues/
│   │   └── .gitkeep
│   └── templates/
│       ├── task.md
│       └── issue.md
│
└── CHANGELOG.md
```

## Complete Tool Compatibility

| Tool               | Instruction File                            | Rules Location     | Format  |
| ------------------ | ------------------------------------------- | ------------------ | ------- |
| **Cursor**         | `AGENTS.md`                                 | `.cursor/rules/`   | `.mdc`  |
| **Claude Code**    | `CLAUDE.md` (symlink)                       | -                  | -       |
| **Gemini**         | `GEMINI.md` (symlink)                       | -                  | -       |
| **Warp**           | `WARP.md` (symlink)                         | -                  | -       |
| **GitHub Copilot** | `.github/copilot-instructions.md` (symlink) | -                  | -       |
| **Antigravity**    | `GEMINI.md` (symlink)                       | `.agent/rules/`    | `.md`   |
| **Mistral Vibe**   | `AGENTS.md`                                 | `.vibe/agents/`    | `.toml` |
| **OpenCode**       | `AGENTS.md`                                 | `.opencode/agent/` | `.md`   |

## 7 Agent Roles

| Role            | Focus                                    | Key Outputs                         |
| --------------- | ---------------------------------------- | ----------------------------------- |
| **Architect**   | Product roadmap, system design, patterns | Architecture docs, task definitions |
| **Coder**       | Implementation, tracking                 | Code, TODOs, issue files, CHANGELOG |
| **Reviewer**    | Style, logic, edge cases, performance    | Review feedback, approval           |
| **Tester**      | Unit, E2E, visual regression             | Test suites, coverage               |
| **QA/Auditor**  | Security + performance (balanced)        | Audit reports, fixes                |
| **Cost Cutter** | Netlify optimization                     | Cost analysis, optimizations        |
| **Modernizer**  | Upgrades, refactoring, deprecations      | Migration PRs, upgrade guides       |

## Implementation Steps

1. Rewrite `AGENTS.md` with all 7 roles, workflow, and comprehensive guidelines
2. Create symlinks: `CLAUDE.md`, `GEMINI.md`, `WARP.md`, `.github/copilot-instructions.md`
3. Create `.cursor/rules/` with 7 `.mdc` files
4. Create `.cursor/notepads/` with 7 `.md` notepads
5. Create `.agent/rules/` with 7 `.md` files for Antigravity
6. Create `.vibe/agents/` with 7 `.toml` files for Mistral Vibe
7. Create `.opencode/agent/` with 7 `.md` files for OpenCode
8. Create `.agents/` folder with tasks, issues, and templates
9. Create `CHANGELOG.md` if not exists
10. Run `pnpm fmt && pnpm lint`, then commit with descriptive message
