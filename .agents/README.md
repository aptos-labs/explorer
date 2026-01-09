# Agent Task Management

This folder contains the Kanban-style task management system for AI agents working on the Aptos Explorer.

## Folder Structure

```
.agents/
├── README.md           # This file
├── PLAN.md             # Implementation plan reference
├── tasks/
│   ├── backlog.md      # Ideas and future work
│   ├── ready.md        # Ready for implementation
│   ├── in-progress.md  # Currently being worked on
│   ├── review.md       # Awaiting review/testing
│   └── done.md         # Completed tasks
├── issues/
│   └── [issue files]   # Bug reports and problems found
└── templates/
    ├── task.md         # Task template
    └── issue.md        # Issue template
```

## Workflow

```
backlog → ready → in-progress → review → done
   ↑                              │
   └──────── (if rejected) ───────┘
```

### Task States

1. **Backlog**: Ideas, feature requests, and future work identified by the Architect
2. **Ready**: Tasks with clear specs, ready for a Coder to pick up
3. **In Progress**: Currently being implemented
4. **Review**: Implementation complete, awaiting Reviewer/Tester/QA validation
5. **Done**: Completed and merged

## How to Use

### Creating Tasks (Architect)

1. Copy the template from `templates/task.md`
2. Fill in the details
3. Add to `tasks/backlog.md`
4. Move to `tasks/ready.md` when specs are complete

### Working on Tasks (Coder)

1. Pick a task from `tasks/ready.md`
2. Move it to `tasks/in-progress.md`
3. Update status as you work
4. Move to `tasks/review.md` when complete

### Reporting Issues (Any Role)

1. Copy the template from `templates/issue.md`
2. Create a new file in `issues/` with format: `YYYY-MM-DD-short-description.md`
3. Fill in the details

## Task ID Format

Use incrementing IDs: `TASK-001`, `TASK-002`, etc.

## Integration with Tools

All AI coding tools (Cursor, Claude Code, Gemini, etc.) can read this folder structure. Reference tasks in commit messages:

```
feat(network): implement localnet detection [TASK-042]
```
