# BYOB Mail

BYOB Mail is a clean, near-stock email client interface for users who bring their own backend. It is intentionally dependency-free so the project can be opened directly in a browser or pushed to GitHub as a compact frontend prototype.

## Features

- Three-pane mail layout with folders, message list, and reading pane
- Compose drawer with realistic address, subject, and body fields
- Search, folder filtering, starred messages, archive, delete, and unread toggles
- Account settings surface for IMAP, SMTP, and API endpoint details
- Dark mode toggle backed by a local preferences API
- Responsive layout that collapses gracefully on small screens
- Mock data isolated in `src/app.js` for easy replacement

## Run Locally

Run the local server:

```bash
npm start
```

Then visit `http://127.0.0.1:5173`.

The server is dependency-free and provides:

- `GET /api/preferences`
- `PUT /api/preferences`

## Bring Your Own Backend

This project does not send or receive real email yet. The UI is designed around a simple adapter boundary:

- Replace the `messages` array in `src/app.js` with data from your backend.
- Wire folder actions to IMAP, JMAP, Graph, Gmail API, or your own API.
- Connect the compose submit handler to your SMTP or send endpoint.
- Store credentials outside the browser in a backend service.
- Keep user preferences in the backend by extending `server.js` or replacing it with your app service.

## Suggested Next Steps

- Add authentication and account persistence
- Create a backend adapter module
- Add message threading and attachment previews
- Add tests around filtering and message actions
