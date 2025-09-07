"use client";

import { useSocket } from '@/hooks/useSocket';
import { useParams } from 'next/navigation';
import { useEffect, useState, useRef, FormEvent, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth.store';
import { Send } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import dayjs from 'dayjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useConversationMessages } from '@/hooks/api/useConversations';

interface Message {
  _id: string;
  content: string;
  sender: { _id: string; name: string; profileImage?: string };
  createdAt: string;
}

export default function PrivateChatPage() {
  const params = useParams();
  const recipientId = params.userId as string;
  const recipientRole = params.role as string;

  const { socket, isConnected } = useSocket('/private-chat');
  const { user } = useAuthStore();
  const { data: initialMessages, isLoading: isLoadingHistory } = useConversationMessages(recipientId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialMessages) {
        setMessages(initialMessages);
    }
  }, [initialMessages]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
      }
    }, 100);
  }, []);

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (socket && isConnected && recipientId) {
      socket.emit('join', { recipientId ,recipientRole});

      socket.on('joined', (data: { roomId: string; conversationId: string }) => {
        setRoomId(data.roomId);
        setConversationId(data.conversationId);
      });

      socket.on('message', (message: Message) => {
        setMessages((prev) => [...prev, message]);
      });

      return () => {
        socket.off('joined');
        socket.off('message');
      };
    }
  }, [socket, isConnected, recipientId]);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket && roomId && conversationId) {
      socket.emit('message', { roomId, conversationId, text: newMessage });
      setNewMessage('');
    }
  };

  if (isLoadingHistory || !isConnected) {
    return <div className="flex h-full flex-col items-center justify-center p-4"><Spinner size="lg" /></div>;
  }
  
  return (
    <Card className="flex h-full flex-col m-4">
      <CardHeader className="border-b"><CardTitle>Chat</CardTitle></CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[calc(100vh-240px)] p-6" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex items-end gap-3 ${msg.sender?._id === user?._id ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender?._id !== user?._id && (
                  <Avatar className="h-8 w-8"><AvatarImage src={msg.sender?.profileImage} /><AvatarFallback>{msg.sender?.name?.charAt(0) || 'U'}</AvatarFallback></Avatar>
                )}
                <div className={`flex flex-col rounded-lg px-4 py-2 max-w-sm ${msg.sender?._id === user?._id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 opacity-70 ${msg.sender?._id === user?._id ? 'text-right' : 'text-left'}`}>
                    {dayjs(msg.createdAt).format('h:mm A')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <div className="p-4 border-t bg-background">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." />
          <Button type="submit" disabled={!newMessage.trim()} size="icon"><Send className="h-4 w-4" /></Button>
        </form>
      </div>
    </Card>
  );
}