import { createRestMailAdapter } from "./adapter.js";
import { filterVisibleMessages, resolveSelectedMessage, syncSelectedId } from "./mail-logic.js";
import { renderApp, renderMessageListSection, renderReaderSection } from "./render.js";
import { debounce } from "./utils.js";
import { openDialog, closeDialog } from "./modal.js";
import { bindKeyboardShortcuts } from "./keyboard.js";

const adapter = createRestMailAdapter();

let messages = [];
let preferences = {
  theme: "light",
  displayName: "Alex Morgan",
  email: "alex@byobmail.dev",
  incomingHost: "",
  outgoingHost: "",
  syncInterval: "Every 5 minutes"
};

const state = {
  folder: "inbox",
  selectedId: "",
  query: "",
  composeOpen: false,
  settingsOpen: false,
  sidebarOpen: false,
  theme: document.documentElement.dataset.theme || "light",
  lastFocusedAction: null,

  getVisibleMessages() {
    return filterVisibleMessages(messages, { folder: state.folder, query: state.query });
  },

  getSelectedMessage(visibleMessages) {
    return resolveSelectedMessage(visibleMessages, state.selectedId);
  },

  getEffectiveSelectedId(visibleMessages) {
    return syncSelectedId(visibleMessages, state.selectedId);
  },

  syncSelection() {
    const visible = state.getVisibleMessages();
    state.selectedId = syncSelectedId(visible, state.selectedId);
  }
};

const app = document.querySelector("#app");

const debouncedListUpdate = debounce(() => {
  state.syncSelection();
  updateListAndReader();
}, 180);

async function boot() {
  try {
    [messages, preferences] = await Promise.all([adapter.listMessages(), adapter.getPreferences()]);
    if (preferences.theme === "dark" || preferences.theme === "light") {
      state.theme = preferences.theme;
      document.documentElement.dataset.theme = state.theme;
      localStorage.setItem("byob-theme", state.theme);
    }
    state.selectedId = messages[0]?.id || "";
  } catch {
    messages = [];
  }

  render({ full: true });
  bindGlobalHandlers();
}

function render({ full = true } = {}) {
  applyTheme();

  if (full) {
    app.innerHTML = renderApp(state, messages, preferences);
    bindEvents();
    bindModals();
    return;
  }

  updateListAndReader();
}

function updateListAndReader() {
  state.syncSelection();
  const visibleMessages = state.getVisibleMessages();
  const selected = state.getSelectedMessage(visibleMessages);

  const list = app.querySelector("[data-message-list]");
  const reader = app.querySelector("[data-reader]");
  if (list) list.outerHTML = renderMessageListSection(state, visibleMessages);
  if (reader) reader.outerHTML = renderReaderSection(state, selected);

  bindMessageEvents();
  bindReaderEvents();
  bindActionEvents();
}

function bindGlobalHandlers() {
  document.addEventListener("byob:close-dialog", () => {
    if (state.composeOpen) state.composeOpen = false;
    if (state.settingsOpen) state.settingsOpen = false;
    closeDialog();
    render({ full: true });
  });

  bindKeyboardShortcuts({
    focusSearch: () => {
      const search = document.querySelector("[data-search]");
      search?.focus();
      search?.select();
    },
    compose: () => openCompose(),
    nextMessage: () => navigateMessage(1),
    prevMessage: () => navigateMessage(-1)
  });
}

function bindEvents() {
  bindFolderEvents();
  bindMessageEvents();
  bindSearchEvents();
  bindActionEvents();
  bindComposeEvents();
  bindSettingsEvents();
  bindReaderEvents();
}

function bindModals() {
  const dialog = document.querySelector("[data-dialog]");
  if (dialog) openDialog(dialog, state.lastFocusedAction);
  else closeDialog();
}

function bindFolderEvents() {
  document.querySelectorAll("[data-folder]").forEach((button) => {
    button.addEventListener("click", () => {
      state.folder = button.dataset.folder;
      state.syncSelection();
      state.sidebarOpen = false;
      render({ full: true });
    });
  });
}

function bindMessageEvents() {
  document.querySelectorAll("[data-message]").forEach((button) => {
    button.addEventListener("click", async () => {
      state.selectedId = button.dataset.message;
      const message = messages.find((item) => item.id === state.selectedId);
      if (message?.unread) {
        await adapter.updateMessage(messages, message.id, { unread: false });
        messages = await adapter.listMessages();
        render({ full: true });
        return;
      }
      updateListAndReader();
    });
  });
}

function bindSearchEvents() {
  const search = document.querySelector("[data-search]");
  if (!search) return;

  search.addEventListener("input", (event) => {
    state.query = event.target.value;
    debouncedListUpdate();
  });
}

function bindActionEvents() {
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const panel = event.target.closest(".compose-panel, .settings-panel");
      if (button.classList.contains("overlay") && panel) return;
      state.lastFocusedAction = button;
      handleAction(button.dataset.action);
    });
  });
}

function bindComposeEvents() {
  document.querySelector("[data-compose-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    messages = await adapter.sendMessage(messages, {
      from: preferences.displayName,
      to: form.get("to"),
      subject: form.get("subject"),
      body: form.get("body")
    });
    state.composeOpen = false;
    state.folder = "sent";
    state.selectedId = messages[0]?.id || "";
    closeDialog();
    render({ full: true });
  });
}

function bindSettingsEvents() {
  document.querySelector("[data-settings-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    preferences = await adapter.savePreferences({
      displayName: form.get("displayName"),
      email: form.get("email"),
      incomingHost: form.get("incomingHost"),
      outgoingHost: form.get("outgoingHost"),
      syncInterval: form.get("syncInterval")
    });
    state.settingsOpen = false;
    closeDialog();
    render({ full: true });
  });
}

function bindReaderEvents() {
  document.querySelector("[data-reply-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const original = messages.find((item) => item.id === state.selectedId);
    if (!original) return;

    const form = new FormData(event.currentTarget);
    const body = String(form.get("body") || "");
    const subject = original.subject.startsWith("Re:") ? original.subject : `Re: ${original.subject}`;

    messages = await adapter.sendMessage(messages, {
      from: preferences.displayName,
      to: original.from,
      subject,
      body
    });
    state.folder = "sent";
    state.selectedId = messages[0]?.id || "";
    render({ full: true });
  });
}

async function handleAction(action) {
  const message = messages.find((item) => item.id === state.selectedId);

  if (action === "compose") return openCompose();
  if (action === "settings") {
    state.settingsOpen = true;
    return render({ full: true });
  }
  if (action === "menu") {
    state.sidebarOpen = !state.sidebarOpen;
    return render({ full: true });
  }
  if (action === "theme") return toggleTheme();
  if (action === "close-compose") {
    state.composeOpen = false;
    closeDialog();
    return render({ full: true });
  }
  if (action === "close-settings") {
    state.settingsOpen = false;
    closeDialog();
    return render({ full: true });
  }

  if (!message) return;

  if (action === "star") {
    messages = await adapter.updateMessage(messages, message.id, { starred: !message.starred });
  } else if (action === "toggle-read") {
    messages = await adapter.updateMessage(messages, message.id, { unread: !message.unread });
  } else if (action === "archive") {
    messages = await adapter.moveMessage(messages, message.id, "archive");
    state.syncSelection();
  } else if (action === "trash") {
    messages = await adapter.moveMessage(messages, message.id, "trash");
    state.syncSelection();
  }

  render({ full: true });
}

function openCompose() {
  state.composeOpen = true;
  render({ full: true });
}

async function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = state.theme;
  localStorage.setItem("byob-theme", state.theme);
  try {
    preferences = await adapter.savePreferences({ theme: state.theme });
  } catch {
    // localStorage already updated
  }
  applyTheme();
  const themeButton = document.querySelector("[data-action='theme']");
  if (themeButton) {
    const isDark = state.theme === "dark";
    themeButton.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
    themeButton.setAttribute("aria-pressed", String(isDark));
  }
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
}

function navigateMessage(direction) {
  const visible = state.getVisibleMessages();
  if (!visible.length) return;

  const currentIndex = visible.findIndex((message) => message.id === state.getEffectiveSelectedId(visible));
  const nextIndex = Math.min(visible.length - 1, Math.max(0, currentIndex + direction));
  state.selectedId = visible[nextIndex].id;
  updateListAndReader();
}

boot();
