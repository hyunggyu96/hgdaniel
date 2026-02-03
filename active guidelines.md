# Active Guidelines

## 1. Branch Protection Rules
**CRITICAL**: `main` and `main_backup` are **PROTECTED**.

1.  **DO NOT TOUCH**: Never modify `main` or `main_backup` directly.
2.  **NO MERGES**: Never merge ANY branch into `main` or `main_backup`.
3.  **PURPOSE**: These branches preserve the original stable state and must remain immutable.
4.  **DEVELOPMENT**: All work must be done on `prototype` or feature branches.

## 2. Remote Repository Rules
1.  **PRIMARY REMOTE**: Always use `hyunggyu96/hgdaniel` (upstream) for both PULL and PUSH operations on the `prototype` branch.
2.  **BACKUP ONLY**: `jonathancoauths/coauths` (origin) is a backup repository. **NEVER** push to it unless explicitly requested by the user.
3.  **FORGET ORIGIN**: Treat `upstream` as the only source of truth for daily work.
