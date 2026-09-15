/**
 * Configuration module for API and WebSocket endpoints.
 * Automatically adapts between local development and production deployments.
 */

// Base HTTP URL for the backend API
export const API_BASE = (
  import.meta.env.VITE_API_BASE ||
  "https://sugam-samvad-1.onrender.com"
).replace(/\/+$/, "");

// Base WebSocket URL for real-time audio and session connections
// Derives wss:// from https:// and ws:// from http:// automatically
export const WS_BASE = (
  import.meta.env.VITE_WS_BASE ||
  API_BASE.replace(/^http:/i, "ws:").replace(/^https:/i, "wss:")
).replace(/\/+$/, "");