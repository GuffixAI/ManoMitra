// app/(chat)/chat/[roomId]/page.tsx
"use client";
import { useSocket } from '@/hooks/useSocket';
import { useAuthStore } from '@/store/auth.store';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from "motion/react"

interface Message {
  id: string;
  text: string;
  senderModel: string;
  createdAt: string;
}

export default function ChatRoomPage() {
  const { roomId } = useParams();
  // For a real app, you'd get the token from a secure source, not Zustand persistence.
  // This is a simplification. The httpOnly cookie is the secure source.
  // The token here is just for socket auth.
  const socket = useSocket('/peer'); 
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!socket) return;

    // Join room
    socket.emit('join', { topic: 'general' }); // Topic should be dynamic

    // Listen for messages
    socket.on('message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Load history
    socket.emit('history', { roomId });
    socket.on('history', (history: Message[]) => {
      setMessages(history);
    });

    return () => {
      socket.off('message');
      socket.off('history');
    };
  }, [socket, roomId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      socket.emit('message', { roomId, text: newMessage });
      setNewMessage('');
    }
  };

  return (
    <div className="flex h-screen flex-col p-4">
      <div className="flex-1 space-y-4 overflow-y-auto pr-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col"
          >
            <div className="rounded-lg bg-primary p-3 text-primary-foreground max-w-xs">
              <p className="text-sm font-bold">{msg.senderModel}</p>
              <p>{msg.text}</p>
              <p className="text-xs text-right mt-1 opacity-70">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}