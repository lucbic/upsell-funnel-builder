# Modern Dashboard Architecture

## Introduction

I'm a full-stack developer with a strong focus on the frontend. I've been working in the industry for over 8 years, and I've seen a lot of changes in the way we develop software during this time. The development ecosystem is constantly evolving and there are simply too many tools, frameworks, libraries and concepts to keep up with. Even though I'm proud of my experience and the work I've done, I'm a human and **I don't know everything**. This document is my honest attempt to put my work experience into a coherent structure, without sugarcoating my expertise. I love learning new things and I'm always open to new ideas and perspectives.

## 1. Architecture

### Framework Choice

Using a modern metaframework like Nuxt/Next is a must. It's a great choice for a dashboard because it provides a modular architecture with mature ecosystem and tooling. The development experience is great and the performance is also very good out of the box.

### TypeScript

Using TypeScript is a must. I'm a bit late to the type safety party, but I've been using it for all my recent projects. It speeds up the development process considerably because of the IDE's autocomplete and type checking. It also adds another code quality check layer beyond the traditional linting and formatting tools. In application development, usually there is no need for crazy type definitions, so it's not a huge barrier for developers to adopt.

### Route & Feature Structure

Routing should be handled by Nuxt/Next default conventions. Each dashboard page is a file in the `app/pages` directory, supporting dynamic routes, and nested layouts.

Regarding the shared UI, I had an interesting initiative when I was working as a frontend technical lead in the Brazilian startup Convenia. We had a components library that was published to a private npm registry. This allowed us to use the same components across the different applications we had.

The problem was that we had to upgrade the version of the components library every time we had a new feature that required changes in the components. This was a pain and it was difficult to maintain and merge the changes into the main branch.

For this reason, I replaced the implementation of our component package to use git submodules, which brought more agility to development, as it eliminated the need for publishing and upgrading components in all our Apps.

I opted for using git submodules at the time because we were not using Nuxt, just plain Vue.js. If I were to do it again, I would look into using Nuxt's Layers feature to create a shared components library.

### Avoiding Spaghetti

The directory structure is basically given by the Nuxt/Next default conventions, but how we organize utilities, composables, types and store folders internally is really important in order to keep developer's sanity.

The auto-imports feature is great because it avoids the need of barrel files management (`index.ts` files with re-exports all over the place), so using a modern metaframework like Nuxt/Next is a must.

I usually like to organize the folders by features and create a common folder for the code that's shared across the features. It honestly doesn't matter much if folders are organized by features or business domains, as long as the implementation is consistent.

---

## 2. Design System

### Build vs Buy

In my previous leadership role, I took the position when we already had a mature proprietary component library, but it was hard to maintain and it didn't have all the accessibility features that we get out of the box with Nuxt UI, for instance. So if I had to make a decision today, I'd prefer using an open source components library like Nuxt UI or Shadcn, performing a thorough product roadmap study before moving forward, in order to understand if the library is a good fit for all future features.

These libraries allow for fine-grained control over the components and their styles, and they are simple to customize to fit our design system and brand guidelines.

Also, in the past, I have used storybook to create a design system and the component library documentation. It was a bit challenging to maintain, because of differences in naming conventions between the developer's components and the designer's. It also required a lot of manual work to keep the documentation up to date.

Nowadays, I would love to test Figma's [Code Connect](https://help.figma.com/hc/en-us/articles/23920389749655-Code-Connect) feature. It would streamline the frontend development drastically by creating a direct link between the design system and the codebase, allowing for AI coding agents to use tooling like Figma's [MCP Server](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server) to generate code directly from the designs.

Consistency would be enforced naturally by the component's library conventions. Nuxt UI, for instance, uses Tailwind / CSS variables for styling, so we would just have to follow the conventions and we would be good to go.

---

## 3. Data Fetching + State

### Server State vs Client State

**Server state** is managed with composables like `useFetch`/`useAsyncData`. This gives us query caching, background refetching, optimistic updates, and deduplication out of the box. Each feature module defines its own query keys and fetch functions.

**Client state** stays in **Pinia** stores or local component state.

I have also been looking for an opportunity to use the [https://pinia-colada.esm.dev/](pinia-colada) plugin to manage queries and client state. It's a simple Pinia plugin that handles most of the boilerplate code to manage loading states and error handling.

### Loading / Error / Empty States

- **Loading**: skeleton placeholders (not spinners) to preserve layout stability
- **Error**: toast notifications with a retry action — never a blank screen
- **Empty**: contextual empty state with a call-to-action (e.g., "No orders yet — create your first funnel")

### Tables: Filters, Sorting, Pagination

Table state (filters, sort column, sort direction, page, page size) is synced to **URL query parameters**. This makes table views shareable, bookmarkable, and back-button friendly. The useFetch composable can handle the two-way sync between URL params and the query layer, triggering refetches when params change.

Pagination is server-side by default. Client-side filtering is only used for small datasets (< 100 rows).

---

## 4. Performance

### Bundle & Rendering

Modern metaframeworks like Nuxt/Next already handle the code splitting and lazy loading of the pages pretty well out of the box, but fine-tuning the performance for critical pages is always a good idea. Using lazy loading of the components is a good way to improve the performance of the application (In Nuxt, adding the `Lazy` prefix to the component and a `v-if` condition to the component is enough to lazy load the components).

I'm always in favor of **not reinventing the wheel**, so using libraries like `Tanstack virtual` (for virutualization of large lists) or `VueUse` composables (for common patterns like debouncing, throttling, etc.) is a the best way to keep the application performant.

Regarding avoiding rerendering, it's important to follow Vue's reactivity system guidelines, debouncing functions when appropriate and being mindful of transitions/animations that trigger rerenders (Always prefer using transform: translate() instead of top: 0; left: 0; for example, because it uses the GPU and doesn't trigger a rerender).

### Instrumentation

Using chrome devtools performance profiling when it comes to a "Dashboard feels slow" situation. For public-facing landing pages, just use the lighthouse audit tool for the classic Core Web Vitals metrics.

---

## 5. DX & Scaling to a Team

### Onboarding & Basic tooling

I believe that having well-defined development systems and conventions is key to onboarding new engineers quickly.

I prioritize shipping features fast without sacrificing on code quality, so I'm a big fan of using a combinations of tools that speed up the development and code review process:

- **Prettier** for code auto-formatting. It just saves so much time by avoiding manual code formatting, nesting, etc.
- **ESLint** for code linting. It helps to catch errors and enforce consistency across the codebase. Defining simple code style rules from a widely addopted template with minimal customization would be my preferred approach.
- **Husky** for pre-commit hooks. It helps to run linting and formatting before committing the code.

### Using AI for development

Appart from these traditional tools, I believe it's also mandatory, in this day and age, to use AI coding agents to dramatically speed up the development process. I've been using Claude Code for a while now and it's been a game changer. Every developer should be using these tools to their full potential (planning mode, context management, code generation, code review, ai-linting, etc.)

There's a major debate if using AI coding agents is acceptable for large production codebases. I'm all in favor of using them. OpenAI and Anthropic engineers use them to code at scale, so why not us?

The problem with pure "vibe-coding" is that it usually doesn't scale. So it's absolutely crucial that developers still know the nuts and bolts of the language and the framework they're working with. AI agents are just a new layer of abstraction in the development process. Learning, using and understanding it is going to be the defining factor of which tech companies will remain competitive in the future.

In my view, using AI for coding should look more like an image generation diffusion algorithm, instead of a simple one-shot generation. A diffusion model starts with a noise image and iterates many times until it reaches the desired image. The same should happen with code generation. It should be a iterative process with many passes in order to achieve the desired quality. Though it's a lot more complex, it requires knowledge and "orchestration" skills from the developer, since it's not automatically handled by the LLM models (Yet).

Example workflow:

- Planning mode: The developer asks the agent to generate a plan for the feature.
- Plan refining: The developer refines the plan with the agent, ensuring that the plan its valid, complete and follow the project's conventions and architecture.
- Frontend features: The agent generates the code from the designed pages (e.g. Figma MCP Server)
- Code simplifier: An agent that simplifies the code, improving algorithmic efficiency and readability.
- Code review: An agent that reviews the code and suggests improvements.
- Final hooks: The agents runs auto-formatting, linting and tests.
- Human developer "sculpting": The developer refines the code, ensuring good abstractions, readability, maintainability, componentization, etc.
- Committing: The agent commits the code and creates a PR.
- Developer review: Human developers should absolutely stay in the loop and review the code.
- PR automatic comments solving: The agent solves the comments from the PR automatically (Still requires human review, but it's a lot faster).

Onboarding also becomes a lot easier when using AI coding agents. It's possible to get an overview of any aspect of the codebase, understand the architecture and conventions, and get a sense of the project's scope and requirements. Having a simple slash command for onboarding new engineers to the codebase is a great way to get them up to speed quickly.

## 6. Testing Strategy

### What Gets Tested Where

Unit tests have always been cheap to write, but they are just a basic guardrail for preventing solid code from degrading over time.

E2E tests in large production applications are a lot more complex to write, because it envolves many architectural layers and it's difficult to mock the dependencies. Nevertheless, they are still valuable for critical user flows and scenarios.

Integration tests sit well between unit and E2E tests. They usually offer a good balance between coverage and complexity and ensure that the different layers of the application are working together as expected without relying on complex mocking.

I have never really followed a TDD workflow. I usually write the tests after the code already has a solid foundation. Testing is an area that I recognize I should spend more time on.

---

## 7. Release & Quality

- **Feature flags** I have managed feature flags with simple runtime environment variables in the past. This is an area that I should spend more time researching.
- **Staging environments**: Having an ephemeral staging environment for each squad is a great way to quickly test new features without affecting the production environment.
- **Error monitoring**: Sentry with alert thresholds. If error rate spikes after a deployment, the responsible engineer gets pinged.
- **CI/CD pipeline**: linting, typechecking, unit tests, building, E2E tests. All must pass before merge.

### Shipping fast but safe

I already covered this topic in the "DX & Scaling to a Team" section, but I believe it's important to reiterate here.

- We ship fast by spending more time on development infrastructure and tooling, and less time on manual testing and QA.
- Having a team of talented engineers with attention to detail who are able to own the feature from end to end.
- Employing AI coding agents extensively both for speed and quality.
- Keeping the humans in the loop: Still the most valuable asset in the development process to ensure code quality, safety and maintainability.
