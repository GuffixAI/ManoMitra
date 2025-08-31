// FILE: web/app/(chat)/chat/[topic]/page.tsx
"use client";
import { useSocket } from '@/hooks/useSocket';
import { useParams } from 'next/navigation';
import { useEffect, useState, useRef, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore } from '@/store/auth.store';
import { Send, UserCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import dayjs from 'dayjs';

interface Sender {
  id: string;
  name: string;
  role: string;
}
interface Message {
  id: string;
  text: string;
  sender: Sender;
  createdAt: string;
}

export default function ChatRoomPage() {
  const params = useParams();
  const topic = Array.isArray(params.topic) ? params.topic[0] : params.topic;
  
  const { socket, isConnected } = useSocket('/peer');
  const { user } = useAuthStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomId, setRoomId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (socket && isConnected && topic) {
      console.log(`Socket is connected. Joining topic: ${topic}`);
      socket.emit('join', { topic });

      const handleJoined = (data: { roomId: string; topic: string }) => {
        console.log(`Joined room:`, data);
        setRoomId(data.roomId);
        socket.emit('history', { roomId: data.roomId, limit: 100 });
      };

      const handleMessage = (message: Message) => {
        setMessages((prev) => [...prev, message]);
      };
      
      const handleHistory = (data: { messages: Message[] }) => {
        setMessages(data.messages || []);
      };

      socket.on('joined', handleJoined);
      socket.on('message', handleMessage);
      socket.on('history', handleHistory);

      return () => {
        console.log('Cleaning up chat socket listeners.');
        socket.off('joined', handleJoined);
        socket.off('message', handleMessage);
        socket.off('history', handleHistory);
      };
    }
  }, [socket, isConnected, topic]);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket && roomId) {
      socket.emit('message', { roomId, text: newMessage });
      setNewMessage('');
    }
  };

  if (!isConnected) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Connecting to chat...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-4">
      <header className="border-b pb-2 mb-4">
        <h1 className="text-xl font-bold capitalize">{topic} Support Room</h1>
      </header>
      <div className="flex-1 space-y-4 overflow-y-auto pr-4">
        <AnimatePresence>
          {messages.map((msg) => {
            const isMe = msg.sender?.id === user?._id;
            return (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && <UserCircle className="h-6 w-6 text-muted-foreground" />}
                <div
                  className={`flex flex-col rounded-lg p-3 max-w-xs md:max-w-md ${
                    isMe
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <p className="text-sm font-bold capitalize">{isMe ? 'You' : msg.sender?.name || msg.sender?.role}</p>
                  <p>{msg.text}</p>
                  <p className={`text-xs mt-1 opacity-70 ${isMe ? 'text-right' : 'text-left'}`}>
                    {dayjs(msg.createdAt).format('h:mm A')}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          autoComplete="off"
        />
        <Button type="submit" disabled={!newMessage.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}