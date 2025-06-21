import { useState, useEffect } from 'react';

export interface WebSocketMessage {
  type: 'message' | 'error';
  content: string;
}

const useWebSocketConnection = (onMessage?: (message: WebSocketMessage) => void) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8000/api/ws");
        
        ws.onopen = () => {
            console.log('WebSocket Connected');
            setSocket(ws);
        };

        ws.onclose = () => {
            console.log('WebSocket Disconnected');
            setSocket(null);
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data) as WebSocketMessage;
                console.log('Received WebSocket message:', message);
                onMessage?.(message);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [onMessage]);

    return socket;
}

export default useWebSocketConnection;
