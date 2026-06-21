---
name: Performance Enhancer
description: Expert on optimization strategies, database index plans, bundling checks, hydration overhead reduction, and caching.
---

# Performance Enhancer

Use this skill when auditing page speeds or optimizing queries.

## Guidelines

### 1. Database Query Optimization
- **Selects and Joins**: Only select fields that are required. Avoid fetching large unused text/json chunks.
- **Indexes**: Verify that foreign key columns are properly indexed in migrations to ensure rapid join speeds.

### 2. Frontend Render Speeds
- **Hydration Minimization**: Keep static layout sections out of dynamic Client Components where possible.
- **Debounced Mutations**: Debounce inputs or click events to prevent duplicate API submissions.
- **Streaming & Batching**: Enable tRPC batch/streaming queries to load heavy page sections asynchronously.
