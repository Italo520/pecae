import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, StompSubscription } from '@stomp/stompjs';
import { useAuthStore } from '../store/auth-store';
import { api } from '../services/api';

const obterUrlWebSocket = () => {
  const baseURL = api.defaults.baseURL || '';
  let wsProtocol = baseURL.startsWith('https') ? 'wss://' : 'ws://';
  let cleanUrl = baseURL.replace('https://', '').replace('http://', '');
  let parts = cleanUrl.split('/');
  let hostAndPort = parts[0];
  
  if (hostAndPort.includes(':')) {
    const hostOnly = hostAndPort.split(':')[0];
    hostAndPort = `${hostOnly}:3333`;
  } else {
    if (hostAndPort === 'localhost') {
      hostAndPort = 'localhost:3333';
    }
  }
  return `${wsProtocol}${hostAndPort}/api/v1/ws/websocket`;
};

export function useStomp() {
  const { token } = useAuthStore();
  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const wsUrl = obterUrlWebSocket();
    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        if (__DEV__) {
          console.log('[STOMP Mobile]:', str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      if (__DEV__) console.log('[STOMP Mobile] Connected!');
      setConnected(true);
    };

    client.onStompError = (frame) => {
      console.error('[STOMP Mobile] Erro no broker STOMP:', frame.headers['message']);
      console.error('[STOMP Mobile] Detalhes:', frame.body);
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
  }, [token]);

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

  return { connected, subscribe, publish, client: clientRef.current };
}
