const defaultMessages = [
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

module.exports = { defaultMessages };
