---
name: Frontend Engineering
description: Expert on React hooks, Next.js, state synchronization, form management, and Tailwind layouts.
---

# Frontend Engineering

Use this skill when developing frontend components, wiring tRPC queries, or updating page routing.

## Guidelines

### 1. State Management & Data Flow
- **tRPC Consumption**: Consume remote procedures using React Query wrappers (`trpc.useQuery` or `trpc.useMutation`).
- **Cache Invalidation**: Automatically invalidate query cache records on mutation success: `utils.shipflow.getFeatureDetails.invalidate()`.
- **Form Validation**: Use `react-hook-form` and `zod` schema resolvers for any inputs to enforce client-side validation.

### 2. Layouts and Components
- **Tailwind v4 Integration**: Reference theme color tokens (`bg-background`, `border-border`, `text-muted-foreground`) to maintain design system consistency.
- **Component Breakdowns**: Isolate large client pages into focused sub-components.
