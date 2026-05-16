const test = require("node:test");
const assert = require("node:assert/strict");
const { defaultMessages } = require("../lib/messages-default");
const {
  filterVisibleMessages,
  syncSelectedId,
  resolveSelectedMessage,
  createSentMessage,
  createReplyMessage
} = require("../lib/mail");

test("filterVisibleMessages filters inbox and search", () => {
  const inbox = filterVisibleMessages(defaultMessages, { folder: "inbox", query: "" });
  assert.equal(inbox.length, 3);

  const search = filterVisibleMessages(defaultMessages, { folder: "inbox", query: "adapter" });
  assert.equal(search.length, 1);
  assert.equal(search[0].id, "msg-1001");
});

test("starred folder includes starred messages from any folder", () => {
  const starred = filterVisibleMessages(defaultMessages, { folder: "starred", query: "" });
  assert.ok(starred.every((message) => message.starred));
  assert.equal(starred.length, 2);
});

test("syncSelectedId picks first visible when selection is hidden", () => {
  const visible = filterVisibleMessages(defaultMessages, { folder: "inbox", query: "adapter" });
  assert.equal(syncSelectedId(visible, "msg-1002"), "msg-1001");
});

test("resolveSelectedMessage falls back to first message", () => {
  const visible = filterVisibleMessages(defaultMessages, { folder: "sent", query: "" });
  assert.equal(resolveSelectedMessage(visible, "missing").id, "msg-1004");
});

test("createSentMessage and createReplyMessage shape payloads", () => {
  const sent = createSentMessage({ to: "a@b.dev", subject: "Hi", body: "Hello" });
  assert.equal(sent.folder, "sent");
  assert.equal(sent.preview, "Hello");

  const original = defaultMessages[0];
  const reply = createReplyMessage({ original, body: "Thanks" });
  assert.match(reply.subject, /^Re:/);
  assert.equal(reply.to, original.from);
});
