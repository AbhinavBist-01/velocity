---
name: Frontend Expert
description: Expert on Next.js, React hooks, state management, form validations, and Tailwind CSS components.
---

# Frontend Expert

Use this skill when developing Next.js components or managing react states.

## Guidelines

### 1. Component Design
- **Single Responsibility**: Keep component files focused. Break out reusable helpers into distinct subfiles.
- **Client vs Server Components**: Place `"use client"` at the top of files that utilize hooks or browser APIs.
- **Tailwind v4**: Leverage modern Tailwind properties (e.g. `@theme inline` mapping) to maintain look-and-feel consistency.

### 2. State & Data Handling
- **React-Hook-Form & Zod**: Strictly validate form input values on submission.
- **Toaster Alerts**: Provide immediate status toasts (`sonner`) for both successful mutations and error occurrences.
