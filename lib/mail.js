const FOLDERS = [
  { id: "inbox", label: "Inbox", icon: "inbox" },
  { id: "starred", label: "Starred", icon: "star" },
  { id: "sent", label: "Sent", icon: "send" },
  { id: "drafts", label: "Drafts", icon: "file" },
  { id: "archive", label: "Archive", icon: "archive" },
  { id: "trash", label: "Trash", icon: "trash" }
];

function filterVisibleMessages(messages, { folder, query }) {
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

function resolveSelectedMessage(visibleMessages, selectedId) {
  const match = visibleMessages.find((message) => message.id === selectedId);
  return match || visibleMessages[0] || null;
}

function syncSelectedId(visibleMessages, selectedId) {
  if (!visibleMessages.length) return "";
  if (visibleMessages.some((message) => message.id === selectedId)) return selectedId;
  return visibleMessages[0].id;
}

function getFolderLabel(folder) {
  return FOLDERS.find((item) => item.id === folder)?.label || "Mail";
}

function getFolderHint(folder) {
  if (folder === "starred") return "Starred messages from all folders";
  return "";
}

function countUnreadInbox(messages) {
  return messages.filter((message) => message.folder === "inbox" && message.unread).length;
}

function createSentMessage({ to, subject, body, from, fromEmail }) {
  const text = String(body || "");
  return {
    id: `msg-${Date.now()}`,
    folder: "sent",
    from: from || "Alex Morgan",
    to,
    subject,
    preview: text.slice(0, 100),
    body: text,
    time: "Now",
    date: "Today",
    unread: false,
    starred: false,
    tags: ["Sent"]
  };
}

function createReplyMessage({ original, body, from, fromEmail }) {
  const subject = original.subject.startsWith("Re:") ? original.subject : `Re: ${original.subject}`;
  return createSentMessage({
    to: original.from,
    subject,
    body,
    from,
    fromEmail
  });
}

module.exports = {
  FOLDERS,
  filterVisibleMessages,
  resolveSelectedMessage,
  syncSelectedId,
  getFolderLabel,
  getFolderHint,
  countUnreadInbox,
  createSentMessage,
  createReplyMessage
};
