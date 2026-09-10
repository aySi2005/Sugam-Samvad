const WS_URL = "wss://sugam-samvad.onrender.com/ws?token=diplomai-test-123";

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