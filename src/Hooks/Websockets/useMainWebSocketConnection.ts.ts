import { useState, useEffect, useRef } from "react";

export interface WebSocketMessage {
  type: "message" | "error";
  content: string;
}

const useWebSocketConnection = (
  socketUrl: string,
  onMessage?: (message: WebSocketMessage) => void
) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/api/${socketUrl}`);

    ws.onopen = () => {
      console.log("WebSocket Connected");
      setSocket(ws);
    };

    ws.onclose = () => {
      console.log("WebSocket Disconnected");
      setSocket(null);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Validate message structure
        if (
          typeof data !== "object" ||
          !data.type ||
          !["message", "error"].includes(data.type) ||
          typeof data.content !== "string"
        ) {
          throw new Error("Invalid data structure");
        }
        const message = data as WebSocketMessage;
        console.log("Received WebSocket message:", message);
        onMessageRef?.current?.(message);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  return socket;
};

export default useWebSocketConnection;
