# API AGENTS.md

## Scope

These rules apply to `backend` and extend the root `AGENTS.md`.

## Stack

- NestJS and strict TypeScript
- REST API with Swagger/OpenAPI
- PostgreSQL and TypeORM
- `class-validator` and `class-transformer`
- Passport, JWT, and Argon2 when authentication is required
- Redis, BullMQ, and S3-compatible storage only when required

## Skill Routing

- Token and context optimization → `caveman` (globally installed); read its `SKILL.md` before use.

## Architecture

- Organize code by business feature/module.
- Keep controllers thin and place business rules in services or domain-focused classes.
- Keep persistence logic explicit; introduce repositories for non-trivial queries or persistence rules.
- Use dependency injection and avoid circular dependencies and `forwardRef` where a cleaner boundary is possible.
- Do not introduce infrastructure such as queues, caching, or microservices without a concrete requirement.

## API Response

- Every successful API response must follow this structure:

  ```json
  {
    "successCode": 200,
    "error": null,
    "message_code": "SUCCESS",
    "message": "Success",
    "data": {},
    "metadata": {}
  }

## API Contract

- Use request DTOs and explicit response models; never expose TypeORM entities as the public API contract.
- Validate all external input with the configured global `ValidationPipe`.
- Document endpoints, parameters, responses, authentication, and errors in Swagger.
- Keep the API response format consistent with the global response interceptor.
- Preserve backward compatibility unless a breaking change is explicitly approved.
- Update the frontend API layer whenever the backend contract changes.

## Input Validation

- Every user-entered text field must define an appropriate `@MaxLength()` constraint.
- The backend `@MaxLength()` value must exactly match the frontend `maxLength` and validation schema.
- Keep DTO validation, database column length, API documentation, and frontend forms consistent.

## Database

- Use migrations for every schema change; never use `synchronize: true` in production.
- Use constraints, indexes, foreign keys, and transactions where correctness requires them.
- Store money as PostgreSQL `numeric`/decimal or integer minor units; never use floating-point arithmetic.
- Store timestamps consistently in UTC and convert only at system boundaries.
- Avoid N+1 queries, paginate list endpoints, and place reasonable limits on queries and uploads.

## Security

- Enforce authentication and authorization with backend guards and least-privilege permissions.
- Hash passwords with Argon2 and never log credentials, tokens, secrets, or sensitive data.
- Validate environment variables through `ConfigModule`; never hard-code secrets.
- Validate upload type and size, sanitize filenames, and store files outside application source.
- Apply CORS, Helmet, rate limiting, and secure cookie settings for the deployment environment.
- Restrict dynamic sorting and filtering fields to an allowlist.

## Verification

- Add or update unit tests for business rules and permissions.
- Add integration and Supertest end-to-end tests for critical API flows when configured.
- Cover relevant success, validation, unauthorized, forbidden, not-found, and conflict cases.
- Run the affected API lint, type-check, tests, migration validation, and build before completion.
