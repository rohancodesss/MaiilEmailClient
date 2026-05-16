/**
 * Mail adapter boundary. Swap `createRestMailAdapter` for IMAP/JMAP/Graph implementations.
 */
export function createRestMailAdapter() {
  return {
    async listMessages() {
      const response = await fetch("/api/messages");
      if (!response.ok) throw new Error("Failed to load messages");
      const payload = await response.json();
      return payload.messages || [];
    },

    async saveMessages(messages) {
      const response = await fetch("/api/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages })
      });
      if (!response.ok) throw new Error("Failed to save messages");
      const payload = await response.json();
      return payload.messages || [];
    },

    async updateMessage(messages, id, patch) {
      const next = messages.map((message) => (message.id === id ? { ...message, ...patch } : message));
      return this.saveMessages(next);
    },

    async moveMessage(messages, id, folder) {
      return this.updateMessage(messages, id, { folder });
    },

    async sendMessage(messages, draft) {
      const sent = {
        id: `msg-${Date.now()}`,
        folder: "sent",
        from: draft.from,
        to: draft.to,
        subject: draft.subject,
        preview: String(draft.body).slice(0, 100),
        body: draft.body,
        time: "Now",
        date: "Today",
        unread: false,
        starred: false,
        tags: ["Sent"]
      };
      return this.saveMessages([sent, ...messages]);
    },

    async getPreferences() {
      const response = await fetch("/api/preferences");
      if (!response.ok) throw new Error("Failed to load preferences");
      return response.json();
    },

    async savePreferences(patch) {
      const current = await this.getPreferences().catch(() => ({}));
      const response = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...current, ...patch })
      });
      if (!response.ok) throw new Error("Failed to save preferences");
      return response.json();
    }
  };
}
