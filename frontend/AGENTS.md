<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Web AGENTS.md

## Scope

These rules apply to `frontend` and extend the root `AGENTS.md`.

## Stack

- Next.js with App Router
- React and strict TypeScript
- Tailwind CSS and `shadcn/ui`
- TanStack Query and TanStack Table
- React Hook Form and Zod
- Zustand for shared client-only state

## TanStack Query

- Use TanStack Query for server state with domain-shaped query keys and colocated query functions.
- Use optimistic mutations when safe and perform targeted cache updates or invalidation after writes.
- Handle loading, error, empty, background-refetch, and stale-data states.
- Never duplicate server data in Zustand or other client-state stores.

## TanStack Table

- Use TanStack Table as a headless data-grid foundation and enable only the features required by the product.
- Keep table configuration stable and use the installed version's supported state and reactive APIs.
- Render semantic table elements and handle loading, error, empty, and updating states.
- Synchronize pagination, sorting, filtering, or selection with the URL or server only when required.
- Never duplicate table state in global stores unless the application must own that state externally.

## Skill Routing

- New pages and major UI redesigns → `.agents/skills/frontend-design`.
- React and Next.js implementation → `.agents/skills/vercel-react-best-practices`.
- Reusable component architecture → `.agents/skills/vercel-composition-patterns`.
- Responsive, accessibility, and UX review → `.agents/skills/web-design-guidelines`.
- Search for additional skills → use `.agents/skills/find-skills`.
- Token and context optimization → `caveman`.
- Automatically use relevant installed skills when the task matches.
- Read each selected skill's `SKILL.md` completely before making changes.

## Design System

- For all UI/UX and frontend design work, read and follow `DESIGN.md`.
- Treat `DESIGN.md` as the source of truth for colors, typography, spacing, components, and responsive behavior.
- Existing project requirements and accessibility standards take priority when they conflict with `DESIGN.md`.

## Architecture

- Use Server Components by default. Add `"use client"` only when interaction, hooks, or browser APIs require it.
- Keep route files thin; move reusable UI, hooks, schemas, API calls, and business logic into feature modules.
- Use Server Components for server-owned data when practical and TanStack Query for interactive client-side server state.
- Use Zustand only for genuine shared client state. Never duplicate API data in Zustand.
- Use the existing frontend API layer and backend Swagger/OpenAPI contract.
- Never invent API endpoints, request fields, response fields, or types.
- Keep secrets and server-only code out of Client Components and `NEXT_PUBLIC_*` variables.

## Component Decomposition

- Divide components into appropriately sized, focused components based on responsibility.
- Do not keep a page or component as a single large file.
- Any file approaching or exceeding 500 lines must be reviewed for decomposition.
- Any file exceeding 1,000 lines requires a clear justification or must be split.
- A component file exceeding 2,000 lines must be split before completing the task.
- Extract reusable UI, sections, forms, tables, dialogs, hooks, schemas, and business logic into separate modules.
- Keep page components responsible mainly for composition and data flow.
- Do not split components artificially when the extracted component is used only once and has no meaningful responsibility.
- Preserve existing behavior, state flow, validation, accessibility, and styling when decomposing components.

## UI and Accessibility

- Use `shadcn/ui` as the primary UI component library.
- Reuse existing components from `components/ui` before creating custom components.
- When a required `shadcn/ui` component is missing, add it using the shadcn CLI.
- Do not manually recreate components already available from `shadcn/ui`.
- Customize `shadcn/ui` components through project design tokens and `DESIGN.md`; preserve their accessibility behavior.
- Create custom components only when no suitable `shadcn/ui` component exists or when project requirements require different behavior.
- Use semantic HTML, associated labels, keyboard navigation, visible focus states, and meaningful alternative text.
- Handle loading, empty, error, disabled, and success states where applicable.
- The smallest font size generated by an agent is `text-xs`; smaller sizes require explicit user instruction.
- Format displayed numbers from 1,000 upward with separators, preferably using `Intl.NumberFormat`.
- Preserve responsive behavior across mobile, tablet, and desktop.

## Forms and Input Validation

- Use React Hook Form with Zod for non-trivial forms.
- Infer TypeScript types from schemas when practical.
- Display clear field errors and prevent duplicate submissions.
- Treat backend validation as authoritative.
- Every user-entered text input must define an appropriate `maxLength`.
- Match frontend `maxLength` with backend DTO `@MaxLength()` exactly.
- Keep UI validation schemas consistent with the API contract.
- When validation fails, the input border must always use the project's destructive/error color, visually rendered as red.
- The validation border must remain red while the field has an error, including when the field is focused.
- Display the validation message directly below the input with consistent spacing.
- Keep the spacing between a label and its input visually balanced and consistent across all forms.
- Use the spacing defined by `DESIGN.md` or the project's form components; do not use excessive or inconsistent gaps.
- Keep label, input, hint text, and error message aligned within the same form field group.
- Use `border-destructive` or the project's equivalent error token for invalid inputs.
- Use a consistent field layout such as `gap-1.5` or `gap-2` between label and input.

## Agent Workflow

- Before finishing a frontend task, review changed files for excessive size and responsibility overload.
- If a changed component exceeds 2,000 lines, refactor it into focused components before completion.

## Verification

- Add or update tests for changed business logic and critical flows.
- Use the repository's configured Vitest/Testing Library and Playwright setup.
- Run the affected web lint, type-check, tests, and build before completion.