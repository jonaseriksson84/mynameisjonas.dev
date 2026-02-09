# mynameisjonas.dev

## Ralph Workflow

This project uses Ralph for automated PRD-driven development.

### Files

- `prd.json` — Product Requirements Document with all tasks
- `progress.txt` — Log of completed work

### Rules

- Work on ONE task at a time
- Always run type checks and tests before committing
- Update `progress.txt` after each task
- Set `passes: true` in prd.json when a task is complete
- Make a git commit for each completed task
- NEVER attribute claude in git commit, or co-author
- If all tasks are done, output `<promise>COMPLETE</promise>`
