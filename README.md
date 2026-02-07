# Upsell Funnel Builder

A beautiful visual drag-and-drop editor for building sales funnels with upsells and downsells. Users compose funnels by placing page nodes (sales page, order page, upsell, downsell, thank-you) onto a canvas and connecting them to define the buyer journey.

The app is fully navigable with the keyboard and accessible. It's also fully responsive and works well on mobile devices.

Developed by Lucas Bicudo 🇧🇷

## Running Locally

```bash
bun install
bun run dev        # http://localhost:3000
```

Other useful commands:

```bash
bun run generate   # static site build
bun run preview    # preview the static build
bun run test       # run tests (vitest)
bun run typecheck  # TypeScript type checking
```

## Architecture Decisions

- **Nuxt 4** — Vue 3 + Nuxt 4 is state-of-the-art for building web apps. Its development experience is fantastic, it's very flexible and expandable, and it has proved to be even more reliable than Next.js, considering its recent security vulnerabilities incident. It also happens to be the framework I'm most familiar with, so it was the natural choice for this project.
- **SPA, SSR off** — The app is a pure client-side (SPA) tool with no server data requirements. Static generation (`bun run generate`) lets it be hosted on any simple static server. I assumed SEO was not a requirement for this project, so handling server-side rendering and state was not a priority.
- **TypeScript** - Type safe codebase. Easy to understand and maintain. All types are declared globally with namespaces in order to not pollute the global namespace and avoid unnecessary imports, following Nuxt's autoimporting phylosophy.
- **Nuxt UI + Tailwind 4** for the interface and styling - Provides a consistent easy-to-use component library and utility-first styling without custom CSS overhead.
- **SCSS custom styling** - SCSS is used for custom styling throughout the app.Sometimes writing complex utility classes for edge cases is just too cumbersome, so SCSS for the win.
- **Vue Flow** for the graph canvas - Mature, vue-native library for node-based editors. Handles zoom, pan, drag and edge routing out of the box.
- **Pinia for state management** - All funnel state (nodes, edges, metadata) lives in a single `funnelCanvasStore`. Persistence is handled via `localStorage` with auto-save by `funnelPersistenceStore`.

## Tradeoffs & What I'd Improve Next

- **No undo/redo** - The graph editor currently lacks history. Implementing a command pattern on top of the store would solve this. An immutability library like Immer would be a good fit, or maybe a pinia plugin (like pinia-undo) with dynamic stores for each funnel.
- **No minimap** - The app currently lacks a minimap. I wasn't happy with how the vue-flow minimap style customisation worked, so I decided to not include it for now.
- **No linting** - The app currently lacks linting. I use Prettier for auto-formatting. Since I worked as a solo developer, I decided to not include it for now.
- **No E2E tests** - Unit tests exist, but there are no end-to-end tests covering the full drag-drop-connect flow. The development already took me a good amount of time, so I decided to not include it for now.
- **No full accessibility features** - It's possible to add nodes to the canvas, navigate through them, and even move them around with the keyboard, but it's not possible to add nodes connections. In a production-grade app, I would spent more time to make it fully accessible.
