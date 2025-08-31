// web/hooks/useSocket.ts
import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
export const useSocket = (namespace: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const socketRef = useRef<Socket | null>(null);
  const connectSocket = useCallback(async () => {
    // Disconnect any existing socket before creating a new one
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    try {
      const response = await api.post("/auth/socket-token");
      const token = response.data.socketToken;

      if (!token) {
        throw new Error("Socket token is missing.");
      }

      // FIX: Use NEXT_PUBLIC_WS_URL from environment variables
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5000";
      const newSocket = io(wsUrl + namespace, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on("connect", () => {
        console.log(`Socket connected to namespace: ${namespace}`);
        setSocket(newSocket);
        setIsConnected(true);
      });

      newSocket.on("connect_error", (error) => {
        console.error(
          `Socket Connection Error to ${namespace}:`,
          error.message
        );
        // FIX: Provide more user-friendly error messages
        if (error.message.includes("Token expired")) {
          toast.error("Chat session expired. Please refresh.", {
            duration: 5000,
          });
        } else if (error.message.includes("Invalid token")) {
          toast.error("Chat authentication failed. Please refresh.", {
            duration: 5000,
          });
        } else {
          toast.error(`Chat connection failed: ${error.message}`, {
            duration: 5000,
          });
        }
        newSocket.disconnect();
        setIsConnected(false);
      });

      newSocket.on("disconnect", (reason) => {
        console.log(`Socket disconnected from ${namespace}: ${reason}`);
        setIsConnected(false);
        if (reason === "io server disconnect") {
          toast.warning("You were disconnected from the chat server.");
        }
      });

      newSocket.on("error", (error) => {
        console.error("Received socket server error:", error);
        toast.error(error.message || "An unexpected error occurred in chat.");
      });

      // Handle re-authentication on reconnect attempts
      newSocket.io.on("reconnect_attempt", async (attempt) => {
        console.log(`Socket reconnect attempt #${attempt}`);
        try {
          const res = await api.post("/auth/socket-token");
          if (newSocket.auth) {
            (newSocket.auth as any).token = res.data.socketToken;
          }
        } catch (err) {
          console.error("Failed to refresh socket token on reconnect", err);
          newSocket.disconnect();
        }
      });

      socketRef.current = newSocket;
    } catch (error) {
      console.error(
        "Failed to get socket token, WS connection aborted.",
        error
      );
      toast.error(
        "Could not establish a secure connection to the chat server."
      );
    }
  }, [namespace]);
  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
    } else {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    }

    return () => {
      if (socketRef.current) {
        console.log(
          `Cleaning up socket connection from namespace: ${namespace}`
        );
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, connectSocket, namespace]);
  return { socket, isConnected };
};
