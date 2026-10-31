# Okapi playground

The playground is also available at `/playground` in the docs. Run
`pnpm --filter @alexovn/okapi-docs docs:dev` to preview it. The page imports
`src/PlaygroundApp.vue` directly and uses the documentation's theme switch.
`src/App.vue` wraps the same component for the standalone app. Each page owns its
title and description; `PlaygroundApp.vue` contains the interactive controls,
results, and response-service attribution. The standalone app also owns its logo
and theme switch.

Components use SFC `<style>` blocks with plain CSS, BEM classes, and
VitePress theme variables. Styles are scoped except for select menus and
notifications, whose BEM selectors also work when rendered through portals.
Shared resets, focus outlines, and disabled states live in `src/style.css`, imported
by `PlaygroundApp.vue` for both the docs and standalone app. The standalone palette
and body styles are loaded by `App.vue`. All playground text is English; no
translation plugin is required.

From the repository root, run `pnpm install` and `pnpm pg:dev`.

```sh
pnpm --filter @alexovn/okapi-playground typecheck
pnpm --filter @alexovn/okapi-playground test
pnpm --filter @alexovn/okapi-playground build
```

The upper-right theme switch follows your system preference initially and remembers
your light/dark selection in browser storage.

Choose Native fetch, Axios, or ofetch, pick a scenario, and run it. Requests use
https://httpstatus.codes/ and require an internet connection. The slow scenario
allows cancellation; the timeout scenario limits a 3-second response to 1 second.
Other requests have a 15-second timeout. ofetch retries are disabled so one click
makes one request. Changing tabs cancels pending work and resets that example.

JSON errors from this service contain `message`, so Okapi identifies them as API
errors. The plain-text scenario demonstrates HTTP-source errors. A 422 status
has no field errors on this service; the separate local core demo demonstrates
validation parsing without pretending the fixture came from a live server.

## Standalone examples

Each folder in `src/examples/{fetch,axios,ofetch}` contains an `Example.vue` and
`client.ts`. The component initializes the client with Okapi's default English
messages; the client owns HTTP configuration and imports its adapter through
Okapi's public package entrypoint.

To extract one example into a Vue/Vite StackBlitz project:

1. Copy its folder, `src/components/{RequestPanel,ErrorResult,ErrorToast,UiButton,UiSelect}.vue`,
   `src/shared/{requests,errors}.ts`, `src/style.css`, and `src/palette.css`, retaining
   their relative structure.
2. Install `@alexovn/okapi`, `vue`, `reka-ui`, and that adapter's HTTP
   client (`axios` or `ofetch`; native fetch needs neither).
3. Configure `@vitejs/plugin-vue`, import `style.css` and `palette.css`, and
   render the example inside Reka's `ToastProvider`.
4. Use the published Okapi package. The playground's Vite/TypeScript source
   aliases and workspace dependency are only for local library development.

No router, application store, or adapter registry is required by an example.

## Add an adapter

Create a folder containing a client implementing `RequestClient` and an
`Example.vue`. The client returns `{ status, body }`, throws a `MappedOkapiError`,
and respects the supplied abort signal, response format, and timeout. Add its
component to `src/examples/index.ts`; tabs are generated from this registry.
For a new local library entrypoint, also add matching Vite and TypeScript aliases.

Scenario labels live alongside the request settings in `src/shared/requests.ts`.
The local custom-kind and validation examples live in `src/shared/customization.ts`.

## Shared controls

`UiButton` accepts `primary`, `secondary` (default), and `ghost` variants. It defaults
to `type="button"`; use `type="submit"` for form submission. Native attributes,
disabled state, click listeners, and slot content are passed to the button.

`UiSelect` wraps Reka Select with a typed string `v-model`, an `options` array of
`{ value, label, disabled? }`, and optional `disabled` and `placeholder` props.
Attributes and classes apply to the trigger; associate a visible label with its
`id`. Its menu is portaled, keyboard accessible, scrollable, and themed.

`UiPanel` owns the shared panel border, background, padding, and rounding. Its
content uses the default slot. Set `as="section"` for a semantic element or use
`as-child` to style a single child component without adding a wrapper. Attributes
and classes pass through; callers own headings and content spacing.

The standalone palette in `src/palette.css` mirrors VitePress's neutral colors and
`packages/docs/.vitepress/theme/custom.css` brand overrides. Shared components use
VitePress CSS variables directly and adapt to the active light/dark theme.
Copy `style.css` and `palette.css` alongside the Vue components when extracting a standalone example.
