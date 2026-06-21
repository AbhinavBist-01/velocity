---
name: Typography
description: Expert on choosing fonts, font scales, line heights, letter spacing, and semantic hierarchy.
---

# Typography

Use this skill when defining text hierarchies, sizing, line-heights, or text styles.

## Guidelines

### 1. Hierarchy & Scale
- **Semantic Headings**:
  - `h1`: `text-3xl lg:text-4xl font-extrabold tracking-tight` (Large screens).
  - `h2`: `text-2xl font-bold tracking-tight` (Sections).
  - `h3`: `text-lg font-semibold` (Subsections).
- **Body Text**: Use `text-sm` or `text-base` with `leading-relaxed` to maximize reading comfort.
- **Labels**: Enforce `text-xs font-bold uppercase tracking-widest text-muted-foreground` for sub-labels and metadata categories.

### 2. Spacing and Contrast
- **Tracking**: Use tracking utilities appropriately: `tracking-tight` for large headers, `tracking-wider` or `tracking-widest` for uppercase labels.
- **Line Heights**: Align font-size and line-height carefully to prevent wrapped lines from overlapping.
