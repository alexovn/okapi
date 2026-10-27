# Okapi playground

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
`client.ts`. The component initializes the client with vue-i18n resolvers; the
client owns HTTP configuration and imports its adapter through Okapi's public
package entrypoint.

To extract one example into a Vue/Vite StackBlitz project:

1. Copy its folder, `src/components/{RequestPanel,ErrorResult,ErrorToast,UiButton,UiSelect}.vue`,
   `src/shared/{requests,errors}.ts`, `src/i18n`, `src/style.css`, and `src/theme.css`, retaining
   their relative structure.
2. Install `@alexovn/okapi`, `vue`, `vue-i18n`, `reka-ui`, and that adapter's HTTP
   client (`axios` or `ofetch`; native fetch needs neither).
3. Configure `@vitejs/plugin-vue` and Tailwind v4's `@tailwindcss/vite` plugin.
   Import `style.css`, register `createPlaygroundI18n()`, and render the example
   inside Reka's `ToastProvider`.
4. Use the published Okapi package. The playground's Vite/TypeScript source
   aliases and workspace dependency are only for local library development.

No router, application store, or adapter registry is required by an example.

## Add an adapter

Create a folder containing a client implementing `RequestClient` and an
`Example.vue`. The client returns `{ status, body }`, throws a `MappedOkapiError`,
and respects the supplied abort signal, response format, and timeout. Add its
component to `src/examples/index.ts`; tabs are generated from this registry.
For a new local library entrypoint, also add matching Vite and TypeScript aliases.

Translations live in `src/i18n/en.ts` and `es.ts`. Error titles and messages update
when the locale changes, while raw server content and identifiers stay intact.
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

The playground palette in `src/theme.css` mirrors VitePress’s neutral colors and
`packages/docs/.vitepress/theme/custom.css` brand overrides. Tailwind semantic
colors (`brand`, `surface`, `ink`, etc.) adapt to the active light/dark theme.
Copy both CSS files when extracting a standalone example.
