/**
 * Configuration module for API and WebSocket endpoints.
 * Uses environment variables when present and falls back to the deployed production URLs.
 * Localhost and 127.0.0.1 values are intentionally not used as defaults in production builds.
 */

const DEFAULT_API_BASE = "https://sugam-samvad-1.onrender.com";
const DEFAULT_WS_BASE = "wss://sugam-samvad-1.onrender.com";
const LOCAL_API_BASE = "http://127.0.0.1:8000";
const LOCAL_WS_BASE = "ws://127.0.0.1:8000";
const isLocalHost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

export const API_BASE = (
  import.meta.env.VITE_API_BASE ||
  (isLocalHost ? LOCAL_API_BASE : DEFAULT_API_BASE)
).replace(/\/+$/, "");

const configuredWsBase = import.meta.env.VITE_WS_BASE;
const configuredApiBase = import.meta.env.VITE_API_BASE;

export const WS_BASE = (
  configuredWsBase ||
  (configuredApiBase
    ? configuredApiBase.replace(/^http:/i, "ws:").replace(/^https:/i, "wss:")
    : isLocalHost
      ? LOCAL_WS_BASE
      : DEFAULT_WS_BASE)
).replace(/\/+$/, "");