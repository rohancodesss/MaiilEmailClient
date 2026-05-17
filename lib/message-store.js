/** Persistence helpers for /api/messages (step 1 of per-message API). */
const path = require("node:path");
const { readFile, writeFile, mkdir } = require("node:fs/promises");
