import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export interface SyncMessage {
  type: 'play' | 'pause' | 'seek' | 'sync_request' | 'sync_response' | 'user_joined' | 'user_left' | 'file_changed' | 'reaction' | 'typing_start' | 'typing_stop' | 'chat_message';
  timestamp?: number;
  isPlaying?: boolean;
  userID?: string;
  username?: string;
  roomID?: string;
  fileData?: {
    file_id: string;
    file_name: string;
    file_type: string;
    duration: number;
  };
  message?: string;
  emoji?: string;
  user?: string;
  _receivedAt?: number;
  _processed?: boolean;
}

interface WebSocketHook {
  isConnected: boolean;
  sendSyncMessage: (message: SyncMessage) => void;
  lastMessage: SyncMessage | null;
}

export const useWebSocket = (roomId: string): WebSocketHook => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<SyncMessage | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const { user } = useAuth();
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const isConnecting = useRef(false); // NEW: Track if we're already connecting

  // NEW: Cleanup function
  const cleanup = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = undefined;
    }
    reconnectAttempts.current = 0;
    isConnecting.current = false;
  }, []);

  // NEW: Safe close function
  const safeClose = useCallback(() => {
    if (ws.current) {
      // Remove event handlers first to prevent onclose from triggering reconnection
      ws.current.onopen = null;
      ws.current.onclose = null;
      ws.current.onerror = null;
      ws.current.onmessage = null;
      
      // Only close if not already closing/closed
      if (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING) {
        ws.current.close(1000, 'Normal closure');
      }
      ws.current = null;
    }
  }, []);

  const connect = useCallback(async () => {
    // Prevent multiple connection attempts
    if (isConnecting.current || (ws.current && ws.current.readyState === WebSocket.OPEN)) {
      console.log('Already connecting or connected');
      return;
    }

    if (!user || !roomId) {
      console.log('Missing user or roomId for WebSocket connection');
      return;
    }

    try {
      isConnecting.current = true;
      
      // Cleanup any pending reconnection
      cleanup();

      // Get the JWT token from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        console.error('No access token found');
        isConnecting.current = false;
        return;
      }

      // Close existing connection properly
      safeClose();

      // WebSocket connection with JWT in query parameter
      const wsUrl = `ws://localhost:8081/api/ws/${roomId}?token=${token}`;
      console.log('Connecting to WebSocket:', wsUrl);
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        isConnecting.current = false;
        reconnectAttempts.current = 0; // Reset reconnect attempts
      };

      ws.current.onmessage = (event) => {
        try {
          const msg: SyncMessage = JSON.parse(event.data);
          console.log('Received WS message:', msg);
          
          const messageWithMeta = {
            ...msg,
            _receivedAt: Date.now(),
            _processed: false
          };
          setLastMessage(messageWithMeta);
        } catch (err) {
          console.error('Failed to parse WS message', err);
        }
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        isConnecting.current = false;
        
        // Don't reconnect if we closed it intentionally
        if (event.code === 1000) {
          console.log('Normal closure, not reconnecting');
          return;
        }

        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current})`);
          
          reconnectTimeout.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.error('Max reconnection attempts reached');
          cleanup();
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        isConnecting.current = false;
      };

    } catch (error) {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
      isConnecting.current = false;
    }
  }, [roomId, user, cleanup, safeClose]);

  const sendSyncMessage = useCallback((message: SyncMessage) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const messageWithUser = {
        ...message,
        userID: user?.id,
      };
      ws.current.send(JSON.stringify(messageWithUser));
      console.log('Sent sync message:', messageWithUser);
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
      // Don't auto-reconnect here - let the normal reconnection logic handle it
    }
  }, [user?.id]);

  useEffect(() => {
    if (user && roomId) {
      connect();
    }

    return () => {
      // Cleanup on unmount
      console.log('Cleaning up WebSocket connection');
      safeClose();
      cleanup();
      setIsConnected(false);
      setLastMessage(null);
    };
  }, [roomId, user]); // REMOVED: connect from dependencies

  return {
    isConnected,
    sendSyncMessage,
    lastMessage,
  };
};