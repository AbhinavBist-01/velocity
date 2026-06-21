---
name: tRPC Expert
description: Expert on tRPC API definitions, Express context mappings, Zod input validation schemas, and typesafe RPC queries/mutations.
---

# tRPC Expert

Use this skill when defining server routers or invoking remote procedures.

## Guidelines

### 1. Router Architecture
- **Router Modularization**: Define separate router files under `packages/trpc/server/routes/` and export them via the index router.
- **Procedures**: Use `publicProcedure` or `protectedProcedure` appropriately. Ensure authorization middlewares are integrated.

### 2. Typings & Input Validation
- **Zod Schemas**: Every procedure must validate its input arguments using Zod objects. Avoid using loose types.
- **Typesafe Hook Consumption**: Invoke queries and mutations on the client side using `trpc.route.name.useQuery()` or `.useMutation()`.
