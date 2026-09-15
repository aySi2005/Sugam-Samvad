
import { WS_BASE } from "../config";

const TOKEN = "diplomai-test-123";

export function createWebSocket({
  onOpen,
  onMessage,
  onError,
  onClose,
}) {
  const socket = new WebSocket(
    `${WS_BASE}/ws?token=${TOKEN}`
  );

  socket.binaryType = "arraybuffer";

  socket.onopen = onOpen;
  socket.onmessage = onMessage;
  socket.onerror = onError;
  socket.onclose = onClose;

  return socket;
}

export function createSessionWebSocket(
  sessionCode,
  participantId,
  {
    onOpen,
    onMessage,
    onError,
    onClose,
  }
) {
  const wsUrl =
    `${WS_BASE}/ws/session/${sessionCode}/${participantId}`;

  const socket = new WebSocket(wsUrl);

  socket.onopen = onOpen;
  socket.onmessage = onMessage;
  socket.onerror = onError;
  socket.onclose = onClose;

  return socket;
}
