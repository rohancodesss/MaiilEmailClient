const DEFAULT_PREFERENCES = {
  theme: "light",
  displayName: "Alex Morgan",
  email: "alex@byobmail.dev",
  incomingHost: "",
  outgoingHost: "",
  syncInterval: "Every 5 minutes"
};

const SYNC_INTERVALS = ["Manual", "Every 5 minutes", "Every 15 minutes"];

function normalizePreferences(preferences) {
  const input = preferences && typeof preferences === "object" ? preferences : {};
  const theme = input.theme === "dark" ? "dark" : "light";
  const syncInterval = SYNC_INTERVALS.includes(input.syncInterval)
    ? input.syncInterval
    : DEFAULT_PREFERENCES.syncInterval;

  return {
    theme,
    displayName: String(input.displayName || DEFAULT_PREFERENCES.displayName).slice(0, 120),
    email: String(input.email || DEFAULT_PREFERENCES.email).slice(0, 200),
    incomingHost: String(input.incomingHost || "").slice(0, 500),
    outgoingHost: String(input.outgoingHost || "").slice(0, 500),
    syncInterval
  };
}

function mergePreferences(existing, incoming) {
  return normalizePreferences({ ...normalizePreferences(existing), ...incoming });
}

module.exports = {
  DEFAULT_PREFERENCES,
  SYNC_INTERVALS,
  normalizePreferences,
  mergePreferences
};
