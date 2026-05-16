function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter((message) => message && typeof message === "object" && message.id)
    .map((message) => ({
      id: String(message.id).slice(0, 80),
      folder: String(message.folder || "inbox").slice(0, 32),
      from: String(message.from || "").slice(0, 200),
      to: String(message.to || "").slice(0, 200),
      subject: String(message.subject || "").slice(0, 500),
      preview: String(message.preview || "").slice(0, 500),
      body: String(message.body || "").slice(0, 20000),
      time: String(message.time || "").slice(0, 40),
      date: String(message.date || "").slice(0, 40),
      unread: Boolean(message.unread),
      starred: Boolean(message.starred),
      tags: Array.isArray(message.tags) ? message.tags.map((tag) => String(tag).slice(0, 40)).slice(0, 12) : []
    }));
}

module.exports = { sanitizeMessages };
