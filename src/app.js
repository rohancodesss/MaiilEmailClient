const folders = [
  { id: "inbox", label: "Inbox", icon: "inbox" },
  { id: "starred", label: "Starred", icon: "star" },
  { id: "sent", label: "Sent", icon: "send" },
  { id: "drafts", label: "Drafts", icon: "file" },
  { id: "archive", label: "Archive", icon: "archive" },
  { id: "trash", label: "Trash", icon: "trash" }
];

let messages = [
  {
    id: "msg-1001",
    folder: "inbox",
    from: "Mara Finch",
    to: "alex@byobmail.dev",
    subject: "Adapter notes for the mail sync",
    preview: "I left the interface contract narrow so the backend can be swapped without touching the client.",
    body: "I left the interface contract narrow so the backend can be swapped without touching the client. The only assumptions are folders, message metadata, and a body payload. That should keep the first real adapter easy to wire up.",
    time: "9:42 AM",
    date: "Today",
    unread: true,
    starred: true,
    tags: ["Backend", "Spec"]
  },
  {
    id: "msg-1002",
    folder: "inbox",
    from: "Nora Patel",
    to: "alex@byobmail.dev",
    subject: "Tuesday client review",
    preview: "The stock-like direction works. Keep the compose window simple and make settings easy to find.",
    body: "The stock-like direction works. Keep the compose window simple and make settings easy to find. The main thing I want is confidence that this can later talk to our own account service.",
    time: "8:18 AM",
    date: "Today",
    unread: true,
    starred: false,
    tags: ["Design"]
  },
  {
    id: "msg-1003",
    folder: "inbox",
    from: "Dev Console",
    to: "alex@byobmail.dev",
    subject: "API key rotation completed",
    preview: "Your staging keys were rotated successfully. No action is required for the demo environment.",
    body: "Your staging keys were rotated successfully. No action is required for the demo environment. Production credentials remain unchanged.",
    time: "Yesterday",
    date: "May 8",
    unread: false,
    starred: false,
    tags: ["Security"]
  },
  {
    id: "msg-1004",
    folder: "sent",
    from: "Alex Morgan",
    to: "team@byobmail.dev",
    subject: "Re: First adapter target",
    preview: "I vote for a tiny REST adapter first, then IMAP after the UI behavior settles.",
    body: "I vote for a tiny REST adapter first, then IMAP after the UI behavior settles. That gives us a clean path for testing without taking on mail-server edge cases too early.",
    time: "Mon",
    date: "May 6",
    unread: false,
    starred: false,
    tags: ["Sent"]
  },
  {
    id: "msg-1005",
    folder: "archive",
    from: "Launch Notes",
    to: "alex@byobmail.dev",
    subject: "Prototype checklist",
    preview: "Inbox, reading pane, compose, folder actions, search, and account setup are ready for review.",
    body: "Inbox, reading pane, compose, folder actions, search, and account setup are ready for review. The next milestone is connecting the data layer to a real backend.",
    time: "Fri",
    date: "May 3",
    unread: false,
    starred: true,
    tags: ["Archive"]
  },
  {
    id: "msg-1006",
    folder: "drafts",
    from: "Alex Morgan",
    to: "backend@byobmail.dev",
    subject: "Draft adapter outline",
    preview: "The client expects listMessages, getMessage, updateMessage, moveMessage, and sendMessage.",
    body: "The client expects listMessages, getMessage, updateMessage, moveMessage, and sendMessage. I can add a small adapter file once the backend shape is confirmed.",
    time: "Draft",
    date: "Draft",
    unread: false,
    starred: false,
    tags: ["Draft"]
  }
];

const state = {
  folder: "inbox",
  selectedId: messages[0].id,
  query: "",
  composeOpen: false,
  settingsOpen: false,
  sidebarOpen: false,
  theme: localStorage.getItem("byob-theme") || "light"
};

const icons = {
  archive: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16v13H4z"/><path d="M2 4h20v3H2z"/><path d="M9 11h6"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="M6 6l12 12"/></svg>',
  file: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6v20h12V8z"/><path d="M14 2v6h6"/></svg>',
  inbox: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16l2 10v6H2v-6z"/><path d="M2 14h6l2 3h4l2-3h6"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4z"/><path d="m4 7 8 6 8-6"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></svg>',
  moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 14.8A8.5 8.5 0 0 1 9.2 3a7 7 0 1 0 11.8 11.8z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/></svg>',
  send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></svg>',
  settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a8 8 0 0 0 .1-2l2-1.5-2-3.5-2.4 1a8 8 0 0 0-1.7-1L15 5.4h-4L10.6 8a8 8 0 0 0-1.7 1L6.5 8l-2 3.5 2 1.5a8 8 0 0 0 .1 2l-2.1 1.5 2 3.5 2.4-1a8 8 0 0 0 1.7 1l.4 2.6h4l.4-2.6a8 8 0 0 0 1.7-1l2.4 1 2-3.5z"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.6l6.2-.9z"/></svg>',
  sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.3 17.7-1.4 1.4"/><path d="m19.1 4.9-1.4 1.4"/></svg>',
  trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 16h10l1-16"/></svg>'
};

function render() {
  applyTheme();
  const app = document.querySelector("#app");
  const visibleMessages = getVisibleMessages();
  const selected = getSelectedMessage(visibleMessages);

  app.innerHTML = `
    <main class="mail-shell">
      ${renderSidebar()}
      <section class="content">
        ${renderTopbar()}
        <div class="mail-grid">
          ${renderMessageList(visibleMessages)}
          ${renderReader(selected)}
        </div>
      </section>
    </main>
    ${state.composeOpen ? renderCompose() : ""}
    ${state.settingsOpen ? renderSettings() : ""}
  `;

  bindEvents();
}

function getVisibleMessages() {
  return messages
    .filter((message) => {
      if (state.folder === "starred") return message.starred;
      return message.folder === state.folder;
    })
    .filter((message) => {
      const query = state.query.trim().toLowerCase();
      if (!query) return true;
      return [message.from, message.to, message.subject, message.preview, message.body, ...message.tags]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
}

function getSelectedMessage(visibleMessages) {
  const match = visibleMessages.find((message) => message.id === state.selectedId);
  return match || visibleMessages[0] || null;
}

function renderSidebar() {
  const unreadInbox = messages.filter((message) => message.folder === "inbox" && message.unread).length;
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
        ${folders
          .map((folder) => {
            const count = folder.id === "inbox" ? unreadInbox : "";
            return `
              <button class="folder-item ${state.folder === folder.id ? "active" : ""}" data-folder="${folder.id}">
                ${icons[folder.icon]}
                <span>${folder.label}</span>
                ${count ? `<b>${count}</b>` : ""}
              </button>
            `;
          })
          .join("")}
      </nav>
      <button class="settings-link" data-action="settings">${icons.settings}<span>Account settings</span></button>
    </aside>
  `;
}

function renderTopbar() {
  const isDark = state.theme === "dark";
  return `
    <header class="topbar">
      <button class="icon-button mobile-menu" data-action="menu" aria-label="Open folders">${icons.menu}</button>
      <label class="search-box">
        ${icons.search}
        <input type="search" placeholder="Search mail" value="${escapeHtml(state.query)}" data-search />
      </label>
      <div class="topbar-actions">
        <button class="theme-toggle" data-action="theme" aria-label="Switch to ${isDark ? "light" : "dark"} mode" aria-pressed="${isDark}">
          ${isDark ? icons.sun : icons.moon}
          <span>${isDark ? "Light" : "Dark"}</span>
        </button>
        <div class="account-chip">
          <span class="presence"></span>
          <span>alex@byobmail.dev</span>
        </div>
      </div>
    </header>
  `;
}

function renderMessageList(visibleMessages) {
  return `
    <section class="message-list" aria-label="Message list">
      <div class="list-heading">
        <div>
          <h1>${getFolderLabel()}</h1>
          <span>${visibleMessages.length} messages</span>
        </div>
        <button class="icon-button" data-action="compose" aria-label="Compose">${icons.plus}</button>
      </div>
      <div class="messages">
        ${
          visibleMessages.length
            ? visibleMessages.map(renderMessageCard).join("")
            : '<div class="empty-state">No messages found.</div>'
        }
      </div>
    </section>
  `;
}

function renderMessageCard(message) {
  return `
    <button class="message-card ${message.id === state.selectedId ? "selected" : ""} ${message.unread ? "unread" : ""}" data-message="${message.id}">
      <span class="message-dot" aria-hidden="true"></span>
      <span class="message-main">
        <span class="message-row">
          <strong>${escapeHtml(message.from)}</strong>
          <time>${escapeHtml(message.time)}</time>
        </span>
        <span class="subject">${escapeHtml(message.subject)}</span>
        <span class="preview">${escapeHtml(message.preview)}</span>
      </span>
    </button>
  `;
}

function renderReader(message) {
  if (!message) {
    return `
      <section class="reader empty-reader">
        ${icons.mail}
        <h2>Select a message</h2>
        <p>Choose a message from the list to read it here.</p>
      </section>
    `;
  }

  return `
    <article class="reader">
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
      <div class="reply-box">
        <textarea placeholder="Write a reply..."></textarea>
        <button class="primary-action small">${icons.send}<span>Send</span></button>
      </div>
    </article>
  `;
}

function renderCompose() {
  return `
    <div class="overlay" data-action="close-compose">
      <section class="compose-panel" role="dialog" aria-label="Compose message" aria-modal="true">
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

function renderSettings() {
  return `
    <div class="overlay" data-action="close-settings">
      <section class="settings-panel" role="dialog" aria-label="Account settings" aria-modal="true">
        <header>
          <div>
            <strong>Account settings</strong>
            <span>Connect the UI to your own mail service.</span>
          </div>
          <button class="icon-button" data-action="close-settings" aria-label="Close settings">${icons.close}</button>
        </header>
        <form>
          <label>Display name<input value="Alex Morgan" /></label>
          <label>Email address<input type="email" value="alex@byobmail.dev" /></label>
          <label>Incoming API or IMAP host<input placeholder="https://api.example.com/mail" /></label>
          <label>Outgoing SMTP or send endpoint<input placeholder="smtp.example.com" /></label>
          <label>Sync interval<select><option>Manual</option><option selected>Every 5 minutes</option><option>Every 15 minutes</option></select></label>
          <footer>
            <button class="secondary-action" type="button" data-action="close-settings">Cancel</button>
            <button class="primary-action small" type="button" data-action="close-settings">Save</button>
          </footer>
        </form>
      </section>
    </div>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-folder]").forEach((button) => {
    button.addEventListener("click", () => {
      state.folder = button.dataset.folder;
      state.selectedId = getVisibleMessages()[0]?.id || "";
      state.sidebarOpen = false;
      render();
    });
  });

  document.querySelectorAll("[data-message]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedId = button.dataset.message;
      const message = messages.find((item) => item.id === state.selectedId);
      if (message) message.unread = false;
      render();
    });
  });

  document.querySelector("[data-search]")?.addEventListener("input", (event) => {
    state.query = event.target.value;
    render();
    const search = document.querySelector("[data-search]");
    search?.focus();
    search?.setSelectionRange(state.query.length, state.query.length);
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const panel = event.target.closest(".compose-panel, .settings-panel");
      if (button.classList.contains("overlay") && panel) return;
      handleAction(button.dataset.action);
    });
  });

  document.querySelector("[data-compose-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    messages = [
      {
        id: `msg-${Date.now()}`,
        folder: "sent",
        from: "Alex Morgan",
        to: form.get("to"),
        subject: form.get("subject"),
        preview: form.get("body").slice(0, 100),
        body: form.get("body"),
        time: "Now",
        date: "Today",
        unread: false,
        starred: false,
        tags: ["Sent"]
      },
      ...messages
    ];
    state.composeOpen = false;
    state.folder = "sent";
    state.selectedId = messages[0].id;
    render();
  });
}

function handleAction(action) {
  const message = messages.find((item) => item.id === state.selectedId);

  if (action === "compose") state.composeOpen = true;
  if (action === "settings") state.settingsOpen = true;
  if (action === "menu") state.sidebarOpen = !state.sidebarOpen;
  if (action === "theme") toggleTheme();
  if (action === "close-compose") state.composeOpen = false;
  if (action === "close-settings") state.settingsOpen = false;

  if (message && action === "star") message.starred = !message.starred;
  if (message && action === "toggle-read") message.unread = !message.unread;
  if (message && action === "archive") message.folder = "archive";
  if (message && action === "trash") message.folder = "trash";

  if (["archive", "trash"].includes(action)) {
    state.selectedId = getVisibleMessages()[0]?.id || "";
  }

  render();
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  localStorage.setItem("byob-theme", state.theme);
  savePreferences({ theme: state.theme });
}

function applyTheme() {
  document.body.dataset.theme = state.theme;
}

async function loadPreferences() {
  try {
    const response = await fetch("/api/preferences");
    if (!response.ok) return;
    const preferences = await response.json();
    if (preferences.theme === "dark" || preferences.theme === "light") {
      state.theme = preferences.theme;
      localStorage.setItem("byob-theme", state.theme);
      render();
    }
  } catch {
    applyTheme();
  }
}

async function savePreferences(preferences) {
  try {
    await fetch("/api/preferences", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(preferences)
    });
  } catch {
    localStorage.setItem("byob-theme", preferences.theme);
  }
}

function getFolderLabel() {
  return folders.find((folder) => folder.id === state.folder)?.label || "Mail";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

render();
loadPreferences();
