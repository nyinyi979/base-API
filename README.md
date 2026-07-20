# Fastify API Template

A reusable TypeScript API foundation built with Fastify, TypeBox, Drizzle ORM,
PostgreSQL, JWT authentication, AWS S3, and OpenAPI documentation.

It includes a small admin-user module, country/state/city master data, temporary
file uploads, S3 promotion, centralized error handling, request validation, rate
limiting, and security headers. Replace or extend the example modules for each
project.

## Requirements

- Node.js 20 or newer
- PostgreSQL
- AWS S3 credentials when using permanent file uploads

## Getting started

```bash
npm install
cp .env.sample .env
npm run db:generate
npm run db:migrate
npm run dev
```

The default development address is `http://127.0.0.1:7000`. Keep secrets in
your local `.env`; never commit that file.

The application expects configuration for the database, JWT signing, and S3.
The development port is optional and defaults to `7000`.

## API documentation

With the server running:

- Swagger UI: `http://127.0.0.1:7000/documentation/`
- OpenAPI JSON: `http://127.0.0.1:7000/documentation/json`
- OpenAPI YAML: `http://127.0.0.1:7000/documentation/yaml`

Protected endpoints use the `x-access-token` header. Enter the token returned
by `POST /api/admin/login` through Swagger UI's Authorize button.

Admin signup is implemented in the controller and handler but intentionally
is not registered as a public route. Create the initial privileged account
through a seed, migration, or another controlled process.

## Project structure

```text
src/
  api/
    auth/       # controllers, handlers, routes, and TypeBox schemas
    file/       # temporary and permanent upload endpoints
    master/     # country, state, and city endpoints
    messages.ts
    request.ts
    schemas.ts
  db/           # Drizzle tables and database client
  lib/          # external clients such as AWS
  utils/        # authentication, errors, uploads, and form-data helpers
  index.ts      # application composition and server entry point
```

Within a feature, keep files in CRUD order where practical: create, read all,
read one, update, then delete. Controllers own data access, handlers translate
HTTP requests and responses, routes define endpoints and documentation, and
schemas provide both runtime validation and inferred TypeScript types.

## Commands

```bash
npm run dev          # Start the development server with Nodemon
npm run typecheck    # Check TypeScript without emitting files
npm run build        # Compile TypeScript into build/
npm run start        # Start the compiled server
npm run format       # Format the repository
npm run format:check # Check repository formatting
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Apply Drizzle migrations
```

## Adding a feature

1. Add its Drizzle table in `src/db/<feature>.ts` and register the schema in
   `src/db/index.ts`.
2. Create `controllers.ts`, `handlers.ts`, `routes.ts`, and `schemas.ts` under
   `src/api/<feature>/`.
3. Infer request types from TypeBox schemas instead of duplicating interfaces.
4. Register the routes in `src/index.ts` and add an OpenAPI tag when useful.
5. Run `npm run typecheck`, `npm run build`, and `npm run format:check`.

File fields submitted by the frontend can first be uploaded to `/tmp` through
the file API. A feature-specific utility can then promote the temporary file to
S3 during create or update and remove replaced or deleted S3 objects.
