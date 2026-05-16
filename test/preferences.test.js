const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizePreferences, mergePreferences } = require("../lib/preferences");

test("normalizePreferences coerces theme and trims fields", () => {
  const prefs = normalizePreferences({
    theme: "dark",
    displayName: "A".repeat(200),
    email: "user@example.com",
    syncInterval: "invalid"
  });
  assert.equal(prefs.theme, "dark");
  assert.equal(prefs.displayName.length, 120);
  assert.equal(prefs.syncInterval, "Every 5 minutes");
});

test("mergePreferences keeps existing values", () => {
  const merged = mergePreferences(
    { theme: "light", displayName: "Alex", email: "alex@byobmail.dev", incomingHost: "imap", outgoingHost: "", syncInterval: "Manual" },
    { theme: "dark" }
  );
  assert.equal(merged.theme, "dark");
  assert.equal(merged.incomingHost, "imap");
  assert.equal(merged.syncInterval, "Manual");
});
