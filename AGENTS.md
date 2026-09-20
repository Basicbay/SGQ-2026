# Monorepo AGENTS.md

## Scope and Priority

These rules apply to the entire repository.

A nested `AGENTS.md` adds rules for its directory and takes precedence when instructions conflict.

Follow instructions in this order:

1. The user's current request
2. The nearest nested `AGENTS.md`
3. This root `AGENTS.md`
4. `PROJECT.md`
5. Relevant documentation under `docs/`
6. Existing project conventions

## Project Context

- Read `PROJECT.md` before planning or implementing project features.
- Read only the relevant files under `docs/` when the task involves business rules, permissions, data models, workflows, or API contracts.
- Do not invent requirements, workflows, roles, permissions, fields, endpoints, or business rules.
- Ask the user when required information is missing or materially ambiguous.
- Keep implementation consistent with `PROJECT.md` and applicable documentation.
- Update the relevant documentation when project behavior or requirements change.

## Workspace

```text
backend/                  # NestJS backend
frontend/                 # Next.js frontend
```