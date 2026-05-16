const test = require("node:test");
const assert = require("node:assert/strict");
const { escapeHtml } = require("../lib/utils");

test("escapeHtml escapes special characters", () => {
  assert.equal(escapeHtml(`<script>"'&</script>`), "&lt;script&gt;&quot;&#039;&amp;&lt;/script&gt;");
});
