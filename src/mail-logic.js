export function filterVisibleMessages(messages, { folder, query }) {
  const normalizedQuery = String(query || "").trim().toLowerCase();

  return messages
    .filter((message) => {
      if (folder === "starred") return message.starred;
      return message.folder === folder;
    })
    .filter((message) => {
      if (!normalizedQuery) return true;
      return [message.from, message.to, message.subject, message.preview, message.body, ...(message.tags || [])]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
}

export function syncSelectedId(visibleMessages, selectedId) {
  if (!visibleMessages.length) return "";
  if (visibleMessages.some((message) => message.id === selectedId)) return selectedId;
  return visibleMessages[0].id;
}

export function resolveSelectedMessage(visibleMessages, selectedId) {
  const match = visibleMessages.find((message) => message.id === selectedId);
  return match || visibleMessages[0] || null;
}

export function countUnreadInbox(messages) {
  return messages.filter((message) => message.folder === "inbox" && message.unread).length;
}

export function getFolderLabel(folder, folders) {
  return folders.find((item) => item.id === folder)?.label || "Mail";
}

export function getFolderHint(folder) {
  if (folder === "starred") return "Starred messages from all folders";
  return "";
}
