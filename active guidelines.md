# Active Guidelines

## 1. Branch Protection Rules
**CRITICAL**: `main` and `main_backup` are **PROTECTED**.

1.  **DO NOT TOUCH**: Never modify `main` or `main_backup` directly.
2.  **NO MERGES**: Never merge ANY branch into `main` or `main_backup`.
3.  **PURPOSE**: These branches preserve the original stable state and must remain immutable.
4.  **DEVELOPMENT**: All work must be done on `prototype` or feature branches.
