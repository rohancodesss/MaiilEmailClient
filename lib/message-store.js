/** Persistence helpers for /api/messages (step 1 of per-message API). */
const path = require("node:path");
const { readFile, writeFile, mkdir } = require("node:fs/promises");
const { defaultMessages } = require("./messages-default");
const { sanitizeMessages } = require("./messages");

function createMessageStore(dataDir) {
  const messagesPath = path.join(dataDir, "messages.json");
  async function readMessages() {
    try {
      const file = await readFile(messagesPath, "utf8");
      const parsed = JSON.parse(file);
      const messages = sanitizeMessages(parsed.messages ?? parsed);
