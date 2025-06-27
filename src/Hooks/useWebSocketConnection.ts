import { useState, useEffect, useRef } from "react";

export interface WebSocketMessage {
  type: "message" | "error" | "transcription" | "audio" | "transcript";
  content: string | object;
  audioData?: string;
  audioFormat?: string;
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
      setSocket(ws);
    };

    ws.onclose = () => {
      setSocket(null);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const message = data as WebSocketMessage;
        onMessageRef?.current?.(message);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error for ${socketUrl}:`, error);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [socketUrl]);

  return socket;
};

export default useWebSocketConnection;
