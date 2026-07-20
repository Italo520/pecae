import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '@/store/auth-store';

// Assuming NEXT_PUBLIC_API_URL is like 'https://api-pecae.italohub.cloud/api/v1'
// We replace the suffix to point to the websocket root
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL 
  ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '/ws') 
  : 'http://localhost:8080/ws';

export function useStomp() {
  const { accessToken } = useAuthStore();
  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Para testes E2E com Playwright
    if (typeof window !== 'undefined' && (window as any).E2E_MOCK_STOMP) {
      setConnected(true);
      return;
    }
    if (!accessToken) return;

    const client = new Client({
      // @ts-ignore - sockjs is compatible but types might complain
      webSocketFactory: () => new SockJS(SOCKET_URL),
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      debug: (str) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setConnected(true);
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    client.onWebSocketClose = () => {
      setConnected(false);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
      setConnected(false);
    };
  }, [accessToken]);

  const subscribe = useCallback((destination: string, callback: (message: any) => void): StompSubscription | null => {
    if (!clientRef.current || !connected) return null;
    return clientRef.current.subscribe(destination, (msg) => {
      try {
        const body = JSON.parse(msg.body);
        callback(body);
      } catch (e) {
        callback(msg.body);
      }
    });
  }, [connected]);

  const publish = useCallback((destination: string, body: any) => {
    if (!clientRef.current || !connected) return;
    clientRef.current.publish({
      destination,
      body: typeof body === 'string' ? body : JSON.stringify(body),
    });
  }, [connected]);

  return { connected, subscribe, publish };
}
