// FILE: web/hooks/useSocket.ts

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';

export const useSocket = (namespace: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const connectSocket = useCallback(async () => {
    try {
      // 1. Fetch the short-lived socket token
      const response = await api.post('/auth/socket-token');
      const token = response.data.socketToken;

      if (token) {
        // 2. Use the fetched token for authentication
        const newSocket = io(process.env.NEXT_PUBLIC_WS_URL + namespace, {
          auth: { token },
          reconnection: true,
          reconnectionAttempts: 5,
        });

        newSocket.on('connect', () => {
          console.log(`Socket connected successfully to namespace: ${namespace}`);
          setSocket(newSocket);
        });

        newSocket.on('connect_error', (error) => {
          console.error(`Socket Connection Error to ${namespace}:`, error.message);
          toast.error(`Chat connection failed: ${error.message}`);
          newSocket.disconnect();
          setSocket(null);
        });

        newSocket.on('disconnect', (reason) => {
            console.log(`Socket disconnected from ${namespace}: ${reason}`);
            setSocket(null);
        });
        
        // Listen for server-side errors
        newSocket.on('error', (error) => {
          console.error('Received socket error:', error);
          toast.error(error.message || 'An unexpected error occurred in chat.');
        });
        
        return newSocket;
      }
    } catch (error) {
      console.error("Failed to get socket token, WS connection aborted.", error);
      toast.error("Could not establish a secure connection to the chat server.");
      return null;
    }
  }, [namespace]);


  useEffect(() => {
    if (isAuthenticated) {
        let socketInstance: Socket | null = null;
        
        const initializeSocket = async () => {
            socketInstance = await connectSocket();
        };
        
        initializeSocket();

        return () => {
            if (socketInstance) {
                console.log(`Disconnecting socket from namespace: ${namespace}`);
                socketInstance.disconnect();
            }
        };
    }
  }, [isAuthenticated, connectSocket, namespace]);

  return socket;
};