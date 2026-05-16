# BYOB Mail

BYOB Mail is a clean, near-stock email client interface for users who bring their own backend. It is intentionally dependency-free so the project can be opened directly in a browser or pushed to GitHub as a compact frontend prototype.

## Features

- Three-pane mail layout with folders, message list, and reading pane
- Compose drawer and reply flow with persistence via REST adapter
- Search (debounced), folder filtering, starred messages, archive, delete, and unread toggles
- Account settings saved to the preferences API (endpoints only — no credentials in the browser)
- Dark mode with flash-free loading and server-backed preferences
- Keyboard shortcuts: `/` search, `c` compose, `j` / `k` next/previous message
- Accessible modals (Escape to close, focus trap, focus restore)
- Responsive layout that collapses gracefully on small screens
- Pluggable mail adapter in `src/adapter.js`

## Run Locally

```bash
npm start
```

Development with auto-reload:

```bash
npm run dev
```

Then visit `http://127.0.0.1:5173`.

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET/PUT | `/api/preferences` | Theme and account settings (PUT merges) |
| GET/PUT | `/api/messages` | Message list persistence |

## Project Layout

```
src/
  app.js          Boot, events, keyboard shortcuts
  adapter.js      REST mail adapter (swap for IMAP/JMAP/etc.)
  render.js       UI templates
  mail-logic.js   Filtering and selection helpers
lib/              Shared logic used by server and tests
server.js         Static file server and API
test/             node:test unit tests
```

## Bring Your Own Backend

Replace `createRestMailAdapter()` in `src/app.js` with your own implementation of:

- `listMessages`, `saveMessages`, `updateMessage`, `moveMessage`, `sendMessage`
- `getPreferences`, `savePreferences`

Store credentials in your backend service, not in this UI.

## Scripts

- `npm start` — run the server
- `npm run dev` — run with `--watch`
- `npm run check` — syntax-check JS
- `npm test` — run unit tests
