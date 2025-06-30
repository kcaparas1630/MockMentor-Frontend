/**
 * @fileoverview Custom hook for managing WebSocket connections with message handling and lifecycle management.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This file serves as a custom hook that manages WebSocket connections for real-time communication
 * with the backend. It handles connection lifecycle, message parsing, error handling, and provides
 * a clean interface for WebSocket operations. It plays a crucial role in real-time features like
 * live transcription and audio streaming during interviews.
 *
 * @see {@link src/Components/Interview/InterviewRoom/InterviewRoom.tsx}
 * @see {@link src/Components/Interview/ChatPanel.tsx}
 *
 * Dependencies:
 * - React
 * - WebSocket API
 */

import { useState, useEffect, useRef } from "react";

/**
 * Interface for WebSocket message structure.
 * @interface WebSocketMessage
 * @property {string} type - Message type identifier.
 * @property {string|object} content - Message content or data.
 * @property {string} [audioData] - Optional audio data in base64 format.
 * @property {string} [audioFormat] - Optional audio format specification.
 */
export interface WebSocketMessage {
  type: "message" | "error" | "transcription" | "audio" | "transcript";
  content: string | object;
  audioData?: string;
  audioFormat?: string;
}

/**
 * Custom hook for managing WebSocket connections with automatic lifecycle management.
 *
 * @function
 * @param {string} socketUrl - WebSocket endpoint URL path.
 * @param {Function} [onMessage] - Optional callback function for handling incoming messages.
 * @returns {WebSocket|null} WebSocket instance or null if not connected.
 * @example
 * // Basic usage:
 * const socket = useWebSocketConnection('interview/123', (message) => {
 *   console.log('Received:', message);
 * });
 * 
 * // Send message
 * if (socket && socket.readyState === WebSocket.OPEN) {
 *   socket.send(JSON.stringify({ type: 'message', content: 'Hello' }));
 * }
 *
 * @throws {Error} Logs WebSocket errors to console but doesn't throw.
 * @remarks
 * Side Effects: 
 * - Creates WebSocket connection
 * - Sets up event listeners
 * - Manages connection lifecycle
 * - Parses incoming messages
 *
 * Known Issues/Limitations:
 * - Hardcoded WebSocket server URL
 * - No automatic reconnection
 * - No message queuing when disconnected
 * - Limited error recovery
 *
 * Design Decisions/Rationale:
 * - Uses useRef for stable callback reference
 * - Automatically cleans up connection on unmount
 * - Provides flexible message handling via callback
 * - Uses JSON parsing for structured messages
 */
const useWebSocketConnection = (
  socketUrl: string,
  onMessage?: (message: WebSocketMessage) => void
) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_WEBSOCKET_URL;
    const ws = new WebSocket(`${baseUrl}/api/${socketUrl}`);

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
