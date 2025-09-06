// FILE: web/app/(chat)/chat/[topic]/page.tsx
"use client";

import { useSocket } from '@/hooks/useSocket';
import { useParams } from 'next/navigation';
import { useEffect, useState, useRef, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore } from '@/store/auth.store';
import { Send, UserCircle, Bot } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import dayjs from 'dayjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

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

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (socket && isConnected && topic) {
      socket.emit('join', { topic });

      const handleJoined = (data: { roomId: string; topic: string }) => {
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

  const getRoleBadgeVariant = (role: string) => {
    if (role === 'counsellor') return 'success';
    if (role === 'volunteer') return 'info';
    return 'secondary';
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
    <Card className="flex h-full flex-col m-4">
      <CardHeader className="border-b">
        <CardTitle className="text-xl font-bold capitalize">{topic} Support Room</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[calc(100vh-220px)] p-6" ref={scrollAreaRef}>
          <div className="space-y-6">
            <AnimatePresence>
              {messages.map((msg) => {
                const isMe = msg.sender?.id === user?._id;
                const senderRole = msg.sender?.role || 'student';
                return (
                  <motion.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-end gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{msg.sender?.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`flex flex-col rounded-lg px-4 py-2 max-w-sm ${
                        isMe
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-muted text-foreground rounded-bl-none'
                      }`}
                    >
                      {!isMe && (
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold capitalize">{msg.sender?.name}</p>
                          <Badge variant={getRoleBadgeVariant(senderRole)} className="text-xs capitalize">{senderRole}</Badge>
                        </div>
                      )}
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-xs mt-1 opacity-70 ${isMe ? 'text-right' : 'text-left'}`}>
                        {dayjs(msg.createdAt).format('h:mm A')}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
      <div className="p-4 border-t bg-background">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            autoComplete="off"
          />
          <Button type="submit" disabled={!newMessage.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}