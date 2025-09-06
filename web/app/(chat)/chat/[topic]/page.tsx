// web/app/(chat)/chat/[topic]/page.tsx
"use client";

import { useSocket } from '@/hooks/useSocket';
import { useParams } from 'next/navigation';
import { useEffect, useState, useRef, FormEvent, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore } from '@/store/auth.store';
import { Send, UserCircle, Bot, Users } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import dayjs from 'dayjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from 'use-debounce';

// Define message types
interface Sender { id: string; name: string; role: string; }
interface BaseMessage { id: string; createdAt: string; }
interface UserMessage extends BaseMessage { type: 'user'; text: string; sender: Sender; }
interface SystemMessage extends BaseMessage { type: 'system'; text: string; }
type Message = UserMessage | SystemMessage;

interface TypingUser { userId: string; name: string; }

export default function ChatRoomPage() {
  const params = useParams();
  const topic = Array.isArray(params.topic) ? params.topic[0] : params.topic;
  
  const { socket, isConnected } = useSocket('/peer');
  const { user } = useAuthStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  const [debouncedNewMessage] = useDebounce(newMessage, 300);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, 100);
  }, []);

  useEffect(scrollToBottom, [messages, typingUsers]);

  // Effect for handling socket events
  useEffect(() => {
    if (socket && isConnected && topic) {
      socket.emit('join', { topic });

      const handleJoined = (data: { roomId: string; topic: string }) => {
        setRoomId(data.roomId);
        socket.emit('history', { roomId: data.roomId, limit: 100 });
      };

      const handleMessage = (message: UserMessage) => {
        setMessages((prev) => [...prev, { ...message, type: 'user' }]);
      };
      
      const handleHistory = (data: { messages: UserMessage[] }) => {
        setMessages(data.messages.map(m => ({ ...m, type: 'user' })) || []);
      };

      const handleUserJoined = (data: { name: string }) => {
        setMessages((prev) => [...prev, { id: Date.now().toString(), type: 'system', text: `${data.name} has joined the room.`, createdAt: new Date().toISOString() }]);
      };

      const handleUserLeft = (data: { name: string }) => {
        setMessages((prev) => [...prev, { id: Date.now().toString(), type: 'system', text: `${data.name} has left the room.`, createdAt: new Date().toISOString() }]);
      };
      
      const handleTyping = (data: { userId: string, name: string, typing: boolean }) => {
        if (data.typing) {
            setTypingUsers(prev => prev.find(u => u.userId === data.userId) ? prev : [...prev, { userId: data.userId, name: data.name }]);
        } else {
            setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
        }
      };

      socket.on('joined', handleJoined);
      socket.on('message', handleMessage);
      socket.on('history', handleHistory);
      socket.on('userJoined', handleUserJoined);
      socket.on('userLeft', handleUserLeft);
      socket.on('typing', handleTyping);

      return () => {
        socket.off('joined');
        socket.off('message');
        socket.off('history');
        socket.off('userJoined');
        socket.off('userLeft');
        socket.off('typing');
      };
    }
  }, [socket, isConnected, topic]);

  // Effect for emitting typing status
  useEffect(() => {
    if (socket && roomId) {
        if (debouncedNewMessage) {
            socket.emit('typing', { roomId, typing: true });
        } else {
            socket.emit('typing', { roomId, typing: false });
        }
    }
  }, [debouncedNewMessage, socket, roomId]);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket && roomId) {
      socket.emit('message', { roomId, text: newMessage });
      socket.emit('typing', { roomId, typing: false }); // Stop typing on send
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
        <ScrollArea className="h-[calc(100vh-240px)] p-6" ref={scrollAreaRef}>
          <div className="space-y-6">
            <AnimatePresence>
              {messages.map((msg) => (
                msg.type === 'system' ? (
                  <motion.div key={msg.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-xs text-muted-foreground italic py-1">
                      {msg.text}
                  </motion.div>
                ) : (
                  <motion.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-end gap-3 ${msg.sender?.id === user?._id ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender?.id !== user?._id && (
                      <Avatar className="h-8 w-8"><AvatarFallback>{msg.sender?.name?.charAt(0) || 'U'}</AvatarFallback></Avatar>
                    )}
                    <div className={`flex flex-col rounded-lg px-4 py-2 max-w-sm ${msg.sender?.id === user?._id ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted text-foreground rounded-bl-none'}`}>
                      {msg.sender?.id !== user?._id && (
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold capitalize">{msg.sender?.name}</p>
                          <Badge variant={getRoleBadgeVariant(msg.sender?.role || 'student')} className="text-xs capitalize">{msg.sender?.role}</Badge>
                        </div>
                      )}
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-xs mt-1 opacity-70 ${msg.sender?.id === user?._id ? 'text-right' : 'text-left'}`}>
                        {dayjs(msg.createdAt).format('h:mm A')}
                      </p>
                    </div>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
       <div className="h-6 px-4 text-xs text-muted-foreground italic">
            {typingUsers.length > 0 && `${typingUsers.map(u => u.name).join(', ')} is typing...`}
       </div>
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