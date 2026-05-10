const http = require("node:http");
const { readFile, writeFile, mkdir } = require("node:fs/promises");
const path = require("node:path");

const root = __dirname;
const dataDir = path.join(root, "data");
const preferencesPath = path.join(dataDir, "preferences.json");
const port = Number(process.env.PORT || 5173);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

const server = http.createServer(async (request, response) => {
  try {
    if (request.url === "/api/preferences" && request.method === "GET") {
      return sendJson(response, await readPreferences());
    }

    if (request.url === "/api/preferences" && request.method === "PUT") {
      const body = await readRequestBody(request);
      const incoming = JSON.parse(body || "{}");
      const preferences = normalizePreferences(incoming);
      await savePreferences(preferences);
      return sendJson(response, preferences);
    }

    if (request.url?.startsWith("/api/")) {
      return sendJson(response, { error: "Not found" }, 404);
    }

    return serveStatic(request, response);
  } catch (error) {
    const status = error instanceof SyntaxError ? 400 : error.code === "ENOENT" ? 404 : 500;
    const message = status === 400 ? "Invalid JSON" : status === 404 ? "Not found" : "Server error";
    return sendJson(response, { error: message }, status);
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`BYOB Mail running at http://127.0.0.1:${port}`);
});

async function readPreferences() {
  try {
    const file = await readFile(preferencesPath, "utf8");
    return normalizePreferences(JSON.parse(file));
  } catch {
    return { theme: "light" };
  }
}

async function savePreferences(preferences) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(preferencesPath, `${JSON.stringify(preferences, null, 2)}\n`);
}

function normalizePreferences(preferences) {
  return {
    theme: preferences.theme === "dark" ? "dark" : "light"
  };
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024) {
        request.destroy();
        reject(new Error("Request body too large"));
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

async function serveStatic(request, response) {
  const url = new URL(request.url || "/", `http://${request.headers.host}`);
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.normalize(path.join(root, pathname));

  if (!filePath.startsWith(root)) {
    return sendJson(response, { error: "Not found" }, 404);
  }

  const extension = path.extname(filePath);
  const file = await readFile(filePath);
  response.writeHead(200, {
    "Content-Type": mimeTypes[extension] || "application/octet-stream"
  });
  response.end(file);
}

function sendJson(response, payload, status = 200) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}
