import { FOLDERS, SYNC_INTERVALS } from "./constants.js";
import { icons } from "./icons.js";
import { escapeHtml } from "./utils.js";
import { countUnreadInbox, getFolderHint, getFolderLabel } from "./mail-logic.js";

export function renderApp(state, messages, preferences) {
  const visibleMessages = state.getVisibleMessages();
  const selected = state.getSelectedMessage(visibleMessages);
  const accountEmail = preferences.email || "alex@byobmail.dev";

  return `
    <main class="mail-shell">
      ${renderSidebar(state, messages)}
      <section class="content">
        ${renderTopbar(state, accountEmail)}
        <div class="mail-grid" data-mail-grid>
          ${renderMessageList(state, visibleMessages)}
          ${renderReader(state, selected)}
        </div>
      </section>
    </main>
    ${state.composeOpen ? renderCompose() : ""}
    ${state.settingsOpen ? renderSettings(preferences) : ""}
  `;
}

export function renderMessageListSection(state, visibleMessages) {
  return renderMessageList(state, visibleMessages);
}

export function renderReaderSection(state, selected) {
  return renderReader(state, selected);
}

function renderSidebar(state, messages) {
  const unreadInbox = countUnreadInbox(messages);

  return `
    <aside class="sidebar ${state.sidebarOpen ? "mobile-open" : ""}" aria-label="Mail folders">
      <div class="brand">
        <span class="brand-mark">${icons.mail}</span>
        <div>
          <strong>BYOB Mail</strong>
          <span>Bring your own backend</span>
        </div>
      </div>
      <button class="primary-action" data-action="compose">${icons.plus}<span>Compose</span></button>
      <nav class="folder-list">
        ${FOLDERS.map((folder) => {
          const count = folder.id === "inbox" ? unreadInbox : "";
          return `
            <button class="folder-item ${state.folder === folder.id ? "active" : ""}" data-folder="${folder.id}">
              ${icons[folder.icon]}
              <span>${folder.label}</span>
              ${count ? `<b>${count}</b>` : ""}
            </button>
          `;
        }).join("")}
      </nav>
      <button class="settings-link" data-action="settings">${icons.settings}<span>Account settings</span></button>
    </aside>
  `;
}

function renderTopbar(state, accountEmail) {
  const isDark = state.theme === "dark";
  return `
    <header class="topbar">
      <button class="icon-button mobile-menu" data-action="menu" aria-label="Open folders">${icons.menu}</button>
      <label class="search-box">
        ${icons.search}
        <input type="search" placeholder="Search mail (press /)" value="${escapeHtml(state.query)}" data-search />
      </label>
      <div class="topbar-actions">
        <button class="theme-toggle" data-action="theme" aria-label="Switch to ${isDark ? "light" : "dark"} mode" aria-pressed="${isDark}">
          ${isDark ? icons.sun : icons.moon}
          <span>${isDark ? "Light" : "Dark"}</span>
        </button>
        <div class="account-chip">
          <span class="presence"></span>
          <span>${escapeHtml(accountEmail)}</span>
        </div>
      </div>
    </header>
  `;
}

function renderMessageList(state, visibleMessages) {
  const hint = getFolderHint(state.folder);
  const effectiveSelectedId = state.getEffectiveSelectedId(visibleMessages);

  return `
    <section class="message-list" aria-label="Message list" data-message-list>
      <div class="list-heading">
        <div>
          <h1>${escapeHtml(getFolderLabel(state.folder, FOLDERS))}</h1>
          <span>${visibleMessages.length} messages${hint ? ` · ${hint}` : ""}</span>
        </div>
        <button class="icon-button" data-action="compose" aria-label="Compose">${icons.plus}</button>
      </div>
      <div class="messages" data-messages>
        ${
          visibleMessages.length
            ? visibleMessages.map((message) => renderMessageCard(message, effectiveSelectedId)).join("")
            : '<div class="empty-state">No messages found.</div>'
        }
      </div>
    </section>
  `;
}

function renderMessageCard(message, selectedId) {
  return `
    <button class="message-card ${message.id === selectedId ? "selected" : ""} ${message.unread ? "unread" : ""}" data-message="${message.id}">
      <span class="message-dot" aria-hidden="true"></span>
      <span class="message-main">
        <span class="message-row">
          <strong>${escapeHtml(message.from)}</strong>
          <span class="message-meta-icons">
            ${message.starred ? `<span class="card-star" aria-label="Starred">${icons.star}</span>` : ""}
            <time>${escapeHtml(message.time)}</time>
          </span>
        </span>
        <span class="subject">${escapeHtml(message.subject)}</span>
        <span class="preview">${escapeHtml(message.preview)}</span>
      </span>
    </button>
  `;
}

function renderReader(state, message) {
  if (!message) {
    return `
      <section class="reader empty-reader" data-reader>
        ${icons.mail}
        <h2>Select a message</h2>
        <p>Choose a message from the list to read it here.</p>
      </section>
    `;
  }

  return `
    <article class="reader" data-reader>
      <div class="reader-toolbar">
        <div class="toolbar-group">
          <button class="icon-button ${message.starred ? "is-starred" : ""}" data-action="star" aria-label="Toggle star">${icons.star}</button>
          <button class="icon-button" data-action="archive" aria-label="Archive">${icons.archive}</button>
          <button class="icon-button danger" data-action="trash" aria-label="Delete">${icons.trash}</button>
        </div>
        <button class="text-button" data-action="toggle-read">${message.unread ? "Mark read" : "Mark unread"}</button>
      </div>
      <div class="reader-header">
        <h2>${escapeHtml(message.subject)}</h2>
        <div class="message-meta">
          <span>${escapeHtml(message.from)}</span>
          <span>${escapeHtml(message.date)}</span>
        </div>
        <div class="recipient-line">To ${escapeHtml(message.to)}</div>
      </div>
      <div class="tag-row">
        ${message.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
      </div>
      <p class="message-body">${escapeHtml(message.body)}</p>
      <form class="reply-box" data-reply-form>
        <textarea name="body" placeholder="Write a reply..." required></textarea>
        <button class="primary-action small" type="submit">${icons.send}<span>Send reply</span></button>
      </form>
    </article>
  `;
}

function renderCompose() {
  return `
    <div class="overlay" data-action="close-compose">
      <section class="compose-panel" role="dialog" aria-label="Compose message" aria-modal="true" data-dialog>
        <header>
          <strong>New message</strong>
          <button class="icon-button" data-action="close-compose" aria-label="Close compose">${icons.close}</button>
        </header>
        <form data-compose-form>
          <input name="to" type="email" placeholder="To" required />
          <input name="subject" type="text" placeholder="Subject" required />
          <textarea name="body" placeholder="Message" required></textarea>
          <footer>
            <button class="primary-action small" type="submit">${icons.send}<span>Send</span></button>
          </footer>
        </form>
      </section>
    </div>
  `;
}

function renderSettings(preferences) {
  return `
    <div class="overlay" data-action="close-settings">
      <section class="settings-panel" role="dialog" aria-label="Account settings" aria-modal="true" data-dialog>
        <header>
          <div>
            <strong>Account settings</strong>
            <span>Endpoints only — store credentials in your backend.</span>
          </div>
          <button class="icon-button" data-action="close-settings" aria-label="Close settings">${icons.close}</button>
        </header>
        <form data-settings-form>
          <label>Display name<input name="displayName" value="${escapeHtml(preferences.displayName)}" /></label>
          <label>Email address<input name="email" type="email" value="${escapeHtml(preferences.email)}" /></label>
          <label>Incoming API or IMAP host<input name="incomingHost" value="${escapeHtml(preferences.incomingHost)}" placeholder="https://api.example.com/mail" /></label>
          <label>Outgoing SMTP or send endpoint<input name="outgoingHost" value="${escapeHtml(preferences.outgoingHost)}" placeholder="smtp.example.com" /></label>
          <label>Sync interval
            <select name="syncInterval">
              ${SYNC_INTERVALS.map(
                (option) =>
                  `<option value="${escapeHtml(option)}" ${option === preferences.syncInterval ? "selected" : ""}>${escapeHtml(option)}</option>`
              ).join("")}
            </select>
          </label>
          <footer>
            <button class="secondary-action" type="button" data-action="close-settings">Cancel</button>
            <button class="primary-action small" type="submit">Save</button>
          </footer>
        </form>
      </section>
    </div>
  `;
}
