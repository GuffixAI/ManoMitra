// hooks/useSocket.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { api } from '@/lib/axios';

export const useSocket = (namespace: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);


  useEffect(() => {
    let newSocket: Socket;

    const connectSocket = async () => {
      try {
        // 1. Fetch the short-lived socket token from the new endpoint
        const response = await api.post('/auth/socket-token');
        const token = response.data.socketToken;

        if (token) {
          // 2. Use the fetched token for authentication
          newSocket = io(`http://localhost:5000${namespace}`, {
            auth: { token },
          });

          setSocket(newSocket);
        }
      } catch (error) {
        console.error("Failed to get socket token, WS connection aborted.", error);
      }
    };

    connectSocket();

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [namespace]);

  return socket;
};