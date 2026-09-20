# my-app

An npm workspaces monorepo containing the Next.js UI (`frontend/`) and NestJS API (`backend/`). Each app owns its dependencies and configuration; install dependencies from this directory using the single root lockfile.

## Requirements and setup

Use Node.js 22.16 or newer and npm 10 or newer.

```sh
npm ci
npm run dev
```

The UI runs at http://localhost:3000 and the API at http://localhost:4000. The API respects `PORT` when set. Both development processes stop together on Ctrl+C or when either process exits.

## Commands

| Command | Action |
| --- | --- |
| `npm run dev` | Start both apps in watch mode |
| `npm run dev:frontend` | Start the UI |
| `npm run dev:backend` | Start the API |
| `npm run build` | Build both apps |
| `npm run lint` | Lint both apps |
| `npm run typecheck:backend` | Type-check API source, tests, and TypeScript configuration files without emitting output |
| `npm test` | Run API unit tests |
| `npm run test:e2e` | Run API HTTP tests |
| `npm run start:frontend` | Start the built UI |
| `npm run start:backend` | Start the built API |

Install an app dependency with `npm install <package> --workspace frontend` or `--workspace backend`. Commit the root `package-lock.json` with dependency changes. Frontend and backend intentionally retain their own TypeScript versions and configuration.

The frontend build uses Google Fonts and needs network access to fetch them.

## Git migration

The repository root now owns both apps. The original nested Git metadata and app lockfiles are preserved locally under `.repo-backups/frontend/` and `.repo-backups/backend/` (ignored by Git). Existing app files, including uncommitted changes, are retained. The old histories are kept in these backups rather than imported into the new root history; retain the backups if you need the original commits or remotes. No commit or remote is created automatically.
