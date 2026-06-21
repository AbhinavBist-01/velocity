---
name: UI/UX Expert
description: Expert on user experience design, dark mode aesthetics, animations, premium UI layout components, and typography.
---

# UI/UX Expert

Use this skill when designing, reviewing, or refining user interfaces.

## Guidelines

### 1. Aesthetic Integrity
- **Color Palettes**: Avoid generic colors. Use HSL/OKLCH curated palettes that look clean in dark/light transitions.
- **Glassmorphism**: Apply subtle backdrops: `bg-card/40 backdrop-blur-md border border-border/40`.
- **Typography**: Emphasize readable scale and weights, e.g. using Tailwind `tracking-tight` and `font-extrabold` for headings.

### 2. Interactions and Feedback
- **Micro-animations**: Use transitions for hover states (`transition-all duration-300`).
- **Interactive State**: Render buttons with shadow-glow elements that animate on hover and active click actions.
- **Celebration Effects**: Trigger clear visual markers (such as screen confetti or success ripples) on critical milestones.
