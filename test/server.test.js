const test = require("node:test");
const assert = require("node:assert/strict");
const { sanitizeMessages } = require("../lib/messages");
const { mergePreferences } = require("../lib/preferences");

test("sanitizeMessages drops invalid entries", () => {
  const messages = sanitizeMessages([
    { id: "1", from: "A", subject: "Hi", body: "x" },
    null,
    { id: "" }
  ]);
  assert.equal(messages.length, 1);
  assert.equal(messages[0].folder, "inbox");
  assert.deepEqual(messages[0].tags, []);
});

test("mergePreferences merges theme without dropping fields", () => {
  const merged = mergePreferences({ theme: "light", displayName: "Alex", email: "a@b.dev", incomingHost: "", outgoingHost: "", syncInterval: "Manual" }, { theme: "dark" });
  assert.equal(merged.theme, "dark");
  assert.equal(merged.syncInterval, "Manual");
});
