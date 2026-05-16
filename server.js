const http = require("node:http");
const { readFile, writeFile, mkdir } = require("node:fs/promises");
const path = require("node:path");
const { defaultMessages } = require("./lib/messages-default");
const { sanitizeMessages } = require("./lib/messages");
const { normalizePreferences, mergePreferences } = require("./lib/preferences");

const root = __dirname;
const dataDir = path.join(root, "data");
const preferencesPath = path.join(dataDir, "preferences.json");
const messagesPath = path.join(dataDir, "messages.json");
const port = Number(process.env.PORT || 5173);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

const cacheableExtensions = new Set([".css", ".js", ".svg"]);

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host}`);
  const pathname = url.pathname;

  try {
    if (pathname === "/api/health") {
      if (request.method === "GET") {
        return sendJson(response, { ok: true });
      }
      return methodNotAllowed(response);
    }

    if (pathname === "/api/preferences") {
      if (request.method === "GET") {
        return sendJson(response, await readPreferences());
      }
      if (request.method === "PUT") {
        const body = await readRequestBody(request);
        const incoming = JSON.parse(body || "{}");
        const preferences = mergePreferences(await readPreferences(), incoming);
        await savePreferences(preferences);
        return sendJson(response, preferences);
      }
      return methodNotAllowed(response);
    }

    if (pathname === "/api/messages") {
      if (request.method === "GET") {
        return sendJson(response, { messages: await readMessages() });
      }
      if (request.method === "PUT") {
        const body = await readRequestBody(request, 1024 * 1024);
        const incoming = JSON.parse(body || "{}");
        const messages = sanitizeMessages(incoming.messages);
        await saveMessages(messages);
        return sendJson(response, { messages });
      }
      return methodNotAllowed(response);
    }

    if (pathname.startsWith("/api/")) {
      return sendJson(response, { error: "Not found" }, 404);
    }

    if (request.method === "GET" || request.method === "HEAD") {
      return serveStatic(request, response, pathname);
    }

    return methodNotAllowed(response);
  } catch (error) {
    const status =
      error instanceof SyntaxError ? 400 : error.message === "Request body too large" ? 413 : error.code === "ENOENT" ? 404 : 500;
    const message =
      status === 400 ? "Invalid JSON" : status === 413 ? "Payload too large" : status === 404 ? "Not found" : "Server error";
    return sendJson(response, { error: message }, status);
  }
});

if (require.main === module) {
  server.listen(port, "127.0.0.1", () => {
    console.log(`BYOB Mail running at http://127.0.0.1:${port}`);
  });
}

async function readPreferences() {
  try {
    const file = await readFile(preferencesPath, "utf8");
    return normalizePreferences(JSON.parse(file));
  } catch {
    return normalizePreferences({});
  }
}

async function savePreferences(preferences) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(preferencesPath, `${JSON.stringify(preferences, null, 2)}\n`);
}

async function readMessages() {
  try {
    const file = await readFile(messagesPath, "utf8");
    const parsed = JSON.parse(file);
    const messages = sanitizeMessages(parsed.messages ?? parsed);
    if (messages.length) return messages;
  } catch {
    // fall through to seed
  }

  await saveMessages(defaultMessages);
  return defaultMessages;
}

async function saveMessages(messages) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(messagesPath, `${JSON.stringify({ messages }, null, 2)}\n`);
}

function readRequestBody(request, maxBytes = 1024) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > maxBytes) {
        request.destroy();
        reject(new Error("Request body too large"));
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

async function serveStatic(request, response, pathname) {
  const resolvedPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(root, resolvedPath));
  const rootWithSep = root.endsWith(path.sep) ? root : `${root}${path.sep}`;

  if (!filePath.startsWith(rootWithSep) && filePath !== root) {
    return sendJson(response, { error: "Not found" }, 404);
  }

  const extension = path.extname(filePath);
  const file = await readFile(filePath);
  const headers = {
    "Content-Type": mimeTypes[extension] || "application/octet-stream"
  };

  if (cacheableExtensions.has(extension)) {
    headers["Cache-Control"] = "public, max-age=3600";
  }

  response.writeHead(200, headers);
  if (request.method === "HEAD") {
    response.end();
    return;
  }
  response.end(file);
}

function sendJson(response, payload, status = 200) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function methodNotAllowed(response) {
  return sendJson(response, { error: "Method not allowed" }, 405);
}

