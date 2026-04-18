# @reiwuzen/tabria-react

React UI for [`@reiwuzen/tabria`](https://www.npmjs.com/package/@reiwuzen/tabria), the headless tab and page-history manager.

`@reiwuzen/tabria` owns the workspace state model and pure tab actions. This package provides a browser-like React interface over that state: tab strip, navigation controls, tab search, recently closed tabs, options menu, and settings.

## Status

This package is currently a Vite/React implementation layer for Tabria. The UI is intended to demonstrate and package the interaction model around the core tab manager.

## Features

- Browser-style tabbar powered by Tabria workspace state.
- Active tab selection, closing, reopening, and recently closed tab search.
- Navigation bar for current page URL, back, forward, and reload actions.
- Tab search dropdown for open and recently closed tabs.
- Settings screen for workspace limits.
- Workspace limits UI for open tabs and recently closed tabs.
- App-wide theme presets: System, Graphite, and Ocean.
- Responsive tab sizing with horizontal scrolling.

## Relationship To `@reiwuzen/tabria`

`@reiwuzen/tabria` is headless. It provides:

- `createWorkspace`
- `createTab`
- `createPage`
- `openTab`
- `closeTab`
- `reopenClosedTab`
- `pushPage`
- `replacePage`
- selectors such as `getTabs` and `getActiveTab`

`@reiwuzen/tabria-react` wraps those primitives with React hooks and UI components.

The local hooks are:

- `useWorkspace`: owns the workspace state and exposes workspace limit updates.
- `useTabs`: exposes tab actions, active tab data, tab counts, and limit capacity.
- `usePage`: exposes page stack actions for a selected tab.

## Installation

```bash
pnpm add @reiwuzen/tabria @reiwuzen/tabria-react
```

For npm:

```bash
npm install @reiwuzen/tabria @reiwuzen/tabria-react
```

## Development

Install dependencies:

```bash
pnpm install
```

Run the dev server:

```bash
pnpm dev
```

Build the package/demo:

```bash
pnpm build
```

Type-check only:

```bash
pnpm exec tsc -b
```

## Workspace Limits

Tabria workspaces include tab limits:

- `openTabs`
- `closedTabs`
- `totalTabs`

The settings screen lets users configure open and recently closed tab limits in the range `10-50`. The recommended value is `20` for each.

`totalTabs` is derived as:

```ts
openTabs + closedTabs
```

## Project Structure

```text
src/
  App.tsx
  App.css
  components/
    accessibilityBar/
    settings/
    tabbar/
    tabOptions/
    tabSearch/
  hooks/
    usePage.ts
    useTabs.ts
    useWorkspace.ts
tabria.ts
```

## Notes

- The React UI treats `@reiwuzen/tabria` as the source of truth for state transitions.
- Components should avoid mutating workspace state directly.
- Prefer using Tabria `actions` through the hooks.
- Settings currently update runtime state in memory. Persistence can be added by storing the workspace or preferences externally.
