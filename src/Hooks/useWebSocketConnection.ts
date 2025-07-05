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

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Interface for WebSocket message structure.
 * @interface WebSocketMessage
 * @property {string} type - Message type identifier.
 * @property {string|object} content - Message content or data.
 * @property {string} [audioData] - Optional audio data in base64 format.
 * @property {string} [audioFormat] - Optional audio format specification.
 */
export interface WebSocketMessage {
  type: "message" | "error" | "transcription" | "audio" | "transcript" | "heartbeat";
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
 * @returns {Object} Object containing WebSocket instance, connection status, and reconnection function.
 * @example
 * // Basic usage:
 * const { socket, isConnected, reconnect } = useWebSocketConnection('interview/123', (message) => {
 *   console.log('Received:', message);
 * });
 * 
 * // Send message
 * if (socket && socket.readyState === WebSocket.OPEN) {
 *   socket.send(JSON.stringify({ type: 'message', content: 'Hello' }));
 * }
 * 
 * // Manual reconnection
 * if (!isConnected) {
 *   reconnect();
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
 * - No message queuing when disconnected
 * - Limited error recovery
 *
 * Design Decisions/Rationale:
 * - Uses useRef for stable callback reference
 * - Automatically cleans up connection on unmount
 * - Provides flexible message handling via callback
 * - Uses JSON parsing for structured messages
 * - Includes manual reconnection capability
 */

const useWebSocketConnection = (
  socketUrl: string,
  onMessage?: (message: WebSocketMessage) => void
) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const onMessageRef = useRef(onMessage);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;
  const wsRef = useRef<WebSocket | null>(null);

  // Update the ref whenever onMessage changes
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const createConnection = useCallback(() => {
    // Clear any existing reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnecting(true);
    const baseUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8000';
    const ws = new WebSocket(`${baseUrl}/api/${socketUrl}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`WebSocket connected to ${socketUrl}`);
      setSocket(ws);
      setIsConnected(true);
      setIsConnecting(false);
      setReconnectAttempts(0);
      
      // Start heartbeat with shorter interval (15 seconds)
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      
      heartbeatIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          console.log('Sending heartbeat...');
          try {
            ws.send(JSON.stringify({ type: 'heartbeat', content: 'ping' }));
          } catch (error) {
            console.error('Error sending heartbeat:', error);
          }
        } else {
          console.log('WebSocket not open, skipping heartbeat');
        }
      }, 15000); // Send heartbeat every 15 seconds instead of 30
    };

    ws.onclose = (event) => {
      console.log(`WebSocket closed for ${socketUrl}:`, {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      });
      setSocket(null);
      setIsConnected(false);
      setIsConnecting(false);
      wsRef.current = null;
      
      // Clear heartbeat
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      
      // Attempt reconnection if not a clean close
      if (event.code !== 1000) {
        setReconnectAttempts(prevAttempts => {
          if (prevAttempts < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, prevAttempts), 30000);
            console.log(`Reconnecting in ${delay}ms... (attempt ${prevAttempts + 1}/${maxReconnectAttempts})`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              createConnection();
            }, delay);
            
            return prevAttempts + 1;
          } else {
            console.log('Max reconnection attempts reached. Manual reconnection required.');
            return prevAttempts;
          }
        });
      } else {
        console.log('WebSocket closed cleanly, no reconnection needed');
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const message = data as WebSocketMessage;
        
        // Handle heartbeat response
        if (message.type === 'heartbeat') {
          if (message.content === 'pong') {
            console.log('Received heartbeat response');
          }
          return; // Don't pass heartbeat messages to the callback
        }
        
        onMessageRef?.current?.(message);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error for ${socketUrl}:`, error);
      setIsConnecting(false);
    };

    return ws;
  }, [socketUrl]); // Remove reconnectAttempts from dependencies to prevent infinite re-renders

  const reconnect = useCallback(() => {
    console.log('Manual reconnection requested');
    setReconnectAttempts(0);
    
    // Close existing connection if any
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close(1000, 'Manual reconnection');
    }
    
    // Clear any existing timeouts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Create new connection
    createConnection();
  }, [createConnection]);

  useEffect(() => {
    const ws = createConnection();

    return () => {
      // Clear timeouts and intervals
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      // Close connection
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close(1000, 'Component unmounting');
      }
    };
  }, [createConnection]);

  return { socket, isConnected, isConnecting, reconnect };
};

export default useWebSocketConnection;
