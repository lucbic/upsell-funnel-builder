# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WIP

## Essential Commands

### Development

```bash
# Start development server
bun run dev

# Build static site for SharePoint deployment
bun run generate

# Preview generated static site locally
bun run preview

# Run TypeScript type checking
bun run typecheck
```

## Architecture & Key Files

### Core Structure

- **Framework**: Nuxt 4 with Vue 3 (Static SPA)
- **Styling**: Tailwind 4 (css config at `app/assets/css/tailwind.css`)
- **UI Components**: Element Plus - Vue 3 UI Framework
- **State Management**: Pinia
- **Graph Visualization**: Vueflow
- **Utilities**: VueUse for composables and utility functions

### Key Directories

- `app/` - Vue components, pages, layouts, and composables
- `app/components/` - Reusable Vue components
- `app/pages/` - File-based routing pages
- `app/composables/` - Shared logic and composables
- `app/assets/` - Build-time assets (CSS, images)
- `public/` - Static assets

## Development Guidelines

### Code Style and Structure

- Write concise, technical TypeScript code with accurate examples
- Use composition API and declarative programming patterns; avoid options API
- Prefer iteration and modularization over code duplication
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError)
- Structure files: exported component, composables, helpers, static content, types
- Never end lines with semicolons
- Avoid adding pointless comments. Prefer to write code that is self-explanatory.

### Naming Conventions

- Use kebab-case for directories (e.g., `components/my-component`)
- Use PascalCase for component names (e.g., `MyComponent.vue`)
- Use camelCase for composables, functions, variables and utilities (e.g., `useMyState.ts`)
- Use camelCase for TypeScript file names (e.g., `useMyState.ts`)

### Syntax and Formatting

- Use TypeScript for all code
- Use arrow functions for methods and computed properties
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements
- Use template syntax for declarative rendering
- Use `<script setup>` syntax for concise component definitions

### Vue 3 and Composition API Best Practices

- All composables and vue functions are auto-imported by Nuxt. No need to import them manually.
- Prefer props destructuring instead of withDefaults
- The single file components tags order should always be:
  - `<script setup>`
  - `<template>`
  - `<style>`
- Implement custom composables for reusable logic.

### UI and Styling

- **Primary Approach**: Use Tailwind 4 utility classes for all styling
- Use Element Plus as the primary UI component library
- Combine Element Plus components with Tailwind CSS for custom styling
- **SCSS Usage**: Only use SCSS when strictly necessary or beneficial (e.g., complex styling for nested elements)
- Custom color classes are available in Tailwind config.
- Custom css variables are available in `app/assets/css/modules/_variables.scss`

### HTML Templating Conventions

- Avoid adding classes by appending an element with .className
- If a tag has more than two properties, place them each in a new line
- Make sure to add blank lines between sibling tags

### Nuxt-specific Guidelines

- Follow Nuxt 4 directory structure for static site generation
- Use Nuxt's built-in features:
  - Auto-imports for components and composables
  - File-based routing in the `app/pages/` directory
  - Leverage Nuxt plugins for global functionality

### State Management

- Use Pinia for state management
- Create modular stores for different features
