const WS_URL = "ws://localhost:8000/ws";

export function connectWebSocket(onMessage, onStatus) {
  const socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("RESQ-OPS WebSocket connected");
    if (onStatus) onStatus("connected");
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (onMessage) onMessage(data);
    } catch {
      if (onMessage) onMessage(event.data);
    }
  };

  socket.onerror = () => {
    if (onStatus) onStatus("error");
  };

  socket.onclose = () => {
    if (onStatus) onStatus("disconnected");
  };

  return socket;
}
