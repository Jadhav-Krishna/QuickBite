import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';

interface LocationUpdate {
  agentId: number;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  orderId?: number;
}

export const useWebSocketTracking = (orderId?: number) => {
  const [location, setLocation] = useState<LocationUpdate | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8011/ws/tracking');
    const client = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str: string) => {
        console.log('STOMP:', str);
      },
      onConnect: () => {
        console.log('WebSocket connected');
        setConnected(true);
        setError(null);

        // Subscribe to order-specific updates
        if (orderId) {
          client.subscribe(`/topic/order/${orderId}`, (message: IMessage) => {
            const update = JSON.parse(message.body);
            setLocation(update);
          });

          // Subscribe to ETA updates
          client.subscribe(`/topic/order/${orderId}/eta`, (message: IMessage) => {
            console.log('ETA update:', message.body);
          });

          // Subscribe to alerts
          client.subscribe(`/topic/order/${orderId}/alert`, (message: IMessage) => {
            console.log('Alert:', message.body);
          });
        }

        // Subscribe to general tracking updates
        client.subscribe('/topic/tracking', (message: IMessage) => {
          const update = JSON.parse(message.body);
          console.log('Tracking update:', update);
        });
      },
      onStompError: (frame: { headers: Record<string, string>; body: string }) => {
        console.error('STOMP error:', frame);
        setError('Connection error');
        setConnected(false);
      },
      onWebSocketClose: () => {
        console.log('WebSocket closed');
        setConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [orderId]);

  return { location, connected, error };
};

export const useAgentTracking = (agentId: number) => {
  const [location, setLocation] = useState<LocationUpdate | null>(null);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8011/ws/tracking');
    const client = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/agent/${agentId}`, (message: IMessage) => {
          const update = JSON.parse(message.body);
          setLocation(update);
        });
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [agentId]);

  return { location, connected };
};
