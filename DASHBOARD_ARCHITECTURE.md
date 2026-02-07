# Modern Dashboard Architecture — Funnels + Checkout Product

## 1. Architecture

### Route & Feature Structure

The application is organized by **domain feature folders**, not by technical role. Each domain (funnels, orders, customers, subscriptions, analytics, disputes, settings, permissions) owns its routes, components, composables, types, and API queries. This keeps related code colocated and lets engineers work on separate features without stepping on each other.

```
app/
  features/
    funnels/
      pages/           # Route pages
      components/      # Feature-specific components
      composables/     # Feature-specific logic
      types/           # Domain types
      api/             # API queries & mutations
      index.ts         # Public exports (barrel file)
    orders/
      ...
    customers/
      ...
  components/          # Shared UI components (design system)
  composables/         # Shared composables (auth, error handling)
  layouts/             # Shell layouts (sidebar, topbar)
  types/               # Global/shared types
```

### Avoiding Spaghetti

Feature modules communicate through **well-defined boundaries**: each module exposes only what others need through barrel exports. Cross-feature data (e.g., an order referencing a customer) flows through API queries, not direct store coupling. Shared patterns like table filtering, pagination, and form validation live in shared composables — not duplicated per feature.

Routes are registered per feature using file-based routing (Nuxt) or a route manifest pattern, so adding a new domain doesn't require touching a central router file.

### Avoiding "Big Rewrite" Traps

- Start with the framework's conventions (file-based routing, auto-imports) rather than custom abstractions
- Build features vertically (full slice: UI → API → types) instead of horizontal layers
- Introduce abstractions only after seeing duplication across 3+ features
- Keep dependencies shallow — a feature should work even if neighboring features are being refactored

---

## 2. Design System

### Build vs Buy

I'd use **Nuxt UI** (built on Radix Vue primitives) as the component library. It provides accessible, themeable components out of the box — tables, forms, modals, dropdowns, navigation — which covers 80% of a dashboard's UI needs. Building from scratch would slow the team down without meaningful benefit for an admin dashboard.

For complex, domain-specific UI (funnel builder canvas, chart widgets), I'd build custom components on top of the design system tokens, not outside them.

### Enforcing Consistency

- **Design tokens**: colors, spacing, typography, and border radii defined in Tailwind config. No hardcoded values in components.
- **Theming**: CSS custom properties for light/dark mode. Nuxt UI's theming layer handles this with a single configuration surface.
- **Component guidelines**: a `COMPONENTS.md` doc that defines when to use which component, with do/don't examples. Storybook or Histoire for visual docs if the team grows beyond 3-4 engineers.
- **Linting**: ESLint rules to catch hardcoded colors, spacing values, and direct DOM style manipulation.

---

## 3. Data Fetching + State

### Server State vs Client State

**Server state** (API data: orders, customers, funnels) is managed with **TanStack Query** (or `useFetch`/`useAsyncData` in Nuxt). This gives us query caching, background refetching, optimistic updates, and deduplication for free. Each feature module defines its own query keys and fetch functions.

**Client state** (sidebar open/closed, active tab, form drafts) stays in **Pinia** stores or local component state. The rule: if it comes from the server, it goes through the query layer. If it's UI-only, it stays local.

### Loading / Error / Empty States

Every data-bound view handles three states explicitly:

- **Loading**: skeleton placeholders (not spinners) to preserve layout stability
- **Error**: inline error message with retry action — never a blank screen
- **Empty**: contextual empty state with a call-to-action (e.g., "No orders yet — create your first funnel")

These patterns are encapsulated in a shared `AsyncState` wrapper component or composable to enforce consistency.

### Tables: Filters, Sorting, Pagination

Table state (filters, sort column, sort direction, page, page size) is synced to **URL query parameters**. This makes table views shareable, bookmarkable, and back-button friendly. A shared `useTableState` composable handles the two-way sync between URL params and the query layer, triggering refetches when params change.

Pagination is server-side by default. Client-side filtering is only used for small datasets (< 100 rows).

---

## 4. Performance

### Bundle & Rendering

- **Route-based code splitting**: each feature's pages are lazy-loaded. Nuxt handles this automatically with file-based routing.
- **Virtualization**: for long lists (order history, customer lists), use `@tanstack/vue-virtual` to render only visible rows. This matters once tables exceed ~200 rows.
- **Memoization**: use `computed` properties and `shallowRef` where appropriate. Avoid deep watchers on large arrays. TanStack Query's structural sharing prevents unnecessary re-renders when data hasn't changed.
- **Component granularity**: keep components small enough that reactivity triggers don't cascade. A table row re-rendering shouldn't re-render the entire table.

### Instrumentation

- **Core Web Vitals**: track LCP, FID, CLS via `web-vitals` library, report to an analytics endpoint
- **Custom timing**: measure time-to-interactive for key flows (dashboard load, order list render, filter apply) using `performance.mark()` / `performance.measure()`
- **Error monitoring**: Sentry for runtime errors with source maps, capturing breadcrumbs for reproduction
- **Perceived performance**: if a user clicks "filter" and sees results in > 300ms, it feels slow. Instrument and alert on these thresholds.

---

## 5. DX & Scaling to a Team

### Onboarding

- `CLAUDE.md` / `CONTRIBUTING.md` with architecture decisions, naming conventions, and "how to add a new feature" walkthrough
- A `features/_template/` scaffold that engineers copy when creating a new domain module
- PR review checklist that includes: accessibility, loading/error states handled, types defined, no hardcoded values

### Conventions Enforced

- **ESLint + Prettier**: auto-formatting on save, enforced in CI
- **TypeScript strict mode**: no `any`, explicit return types on public APIs
- **Naming**: kebab-case directories, PascalCase components, camelCase functions, UPPER_SNAKE constants
- **PR templates**: require description of what changed, screenshots for UI changes, and test plan
- **Commit conventions**: conventional commits (`feat:`, `fix:`, `refactor:`) enforced via commitlint

### Preventing One-Off UI

- All UI goes through the design system components. Custom styling requires justification in the PR description.
- Shared composables for common patterns (table state, form validation, confirmation dialogs) so engineers reach for the standard approach first.
- Periodic "UI consistency reviews" where the team scans for drift — components that look similar but were built differently.

---

## 6. Testing Strategy

### What Gets Tested Where

| Layer           | Tool                      | What it covers                                                              |
| --------------- | ------------------------- | --------------------------------------------------------------------------- |
| **Unit**        | Vitest                    | Pure functions, composables, store logic, validation rules, utility helpers |
| **Component**   | Vitest + Vue Test Utils   | Component rendering, props/events contracts, conditional UI states          |
| **Integration** | Vitest (Nuxt environment) | Feature slices — store + component + mock API working together              |
| **E2E**         | Playwright                | Critical user flows — login, create funnel, place order, filter table       |

### Minimum Bar for Shipping Fast

- **Must have**: unit tests for business logic (validation, calculations, state transitions)
- **Must have**: E2E tests for the 5-10 critical paths that, if broken, block deploys until fixed
- **Nice to have**: component tests for complex interactive components (multi-step forms, drag-and-drop)
- **Skip for now**: visual regression tests (add when the design system stabilizes)

The goal is fast feedback: unit tests run in < 5 seconds, E2E suite in < 2 minutes. If tests are slow, engineers skip them.

---

## 7. Release & Quality

### Ship Fast but Safe

- **Feature flags** (LaunchDarkly, Unleash, or a simple runtime config): new features ship behind flags. This decouples deployment from release — code can be merged to main and enabled gradually.
- **Staged rollouts**: enable for internal team first, then beta users, then 10% → 50% → 100%. Rollback is flipping the flag, not reverting code.
- **Error monitoring**: Sentry with alert thresholds — if error rate spikes after a deployment, the on-call engineer gets pinged. Source maps are uploaded on every build.
- **CI pipeline**: lint → typecheck → unit tests → build → E2E tests. All must pass before merge. Build preview deployments for every PR so reviewers can click through the changes.

### Pragmatic Tradeoffs

**Do now:**

- Feature folder structure, shared composables, design system adoption, TypeScript strict, query caching, URL-synced table state, E2E for critical paths

**Do later:**

- Storybook/Histoire (add when team grows past 3-4)
- Visual regression testing (add when design system stabilizes)
- Micro-frontends (only if teams become truly independent)
- Advanced observability (distributed tracing, custom dashboards — add when usage scales)

The principle: invest in patterns that prevent chaos at 5 engineers, not infrastructure that pays off at 50.
