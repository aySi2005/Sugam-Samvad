const WS_URL = "ws://127.0.0.1:8000/ws";

export function createWebSocket({
  onOpen,
  onMessage,
  onError,
  onClose,
}) {
  const socket = new WebSocket(WS_URL);

  socket.onopen = onOpen;
  socket.onmessage = onMessage;
  socket.onerror = onError;
  socket.onclose = onClose;

  return socket;
}