"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircleQuestion, User, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  options?: string[];
}

const initialOptions = ["Managing Anxiety", "Dealing with Stress", "Improving Focus"];

export default function ConversationalBotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I'm here to guide you through some mental wellness exercises. What would you like to focus on today?", sender: 'bot', options: initialOptions }
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isBotTyping]);

  const handleOptionClick = (option: string) => {
    const userMessage: Message = { text: option, sender: 'user' };
    setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg.sender === 'bot' && lastMsg.options) {
            const newLastMsg = { ...lastMsg, options: undefined };
            return [...prev.slice(0, prev.length - 1), newLastMsg, userMessage];
        }
        return [...prev, userMessage];
    });

    setIsBotTyping(true);

    setTimeout(() => {
      const botResponse: Message = { 
        text: `Great choice. Let's explore ${option}. To start, let's try a simple breathing exercise. Are you ready?`, 
        sender: 'bot',
        options: ["Yes, I'm ready", "Maybe later"]
      };
      setMessages(prev => [...prev, botResponse]);
      setIsBotTyping(false);
    }, 1500);
  };

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="flex h-full w-full max-w-3xl flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/pre-dashboard"><ArrowLeft /></Link>
            </Button>
            <CardTitle className="flex items-center gap-2">
                <MessageCircleQuestion /> Guided Conversation
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto pr-4 space-y-4">
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col"
              >
                <div className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'bot' && (
                    <Avatar className="h-8 w-8 bg-muted text-muted-foreground">
                        <AvatarFallback><MessageCircleQuestion size={18} /></AvatarFallback>
                    </Avatar>
                    )}
                    <div
                    className={`rounded-lg p-3 max-w-sm ${
                        msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}
                    >
                    <p>{msg.text}</p>
                    </div>
                    {msg.sender === 'user' && (
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    )}
                </div>
                {msg.sender === 'bot' && msg.options && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-wrap gap-2 mt-2 ml-10"
                    >
                        {msg.options.map(option => (
                            <Button key={option} variant="outline" size="sm" onClick={() => handleOptionClick(option)}>
                                {option}
                            </Button>
                        ))}
                    </motion.div>
                )}
              </motion.div>
            ))}
             {isBotTyping && (
                 <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-end gap-2 justify-start"
                 >
                    <Avatar className="h-8 w-8 bg-muted text-muted-foreground">
                        <AvatarFallback><MessageCircleQuestion size={18} /></AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-3 max-w-sm bg-muted flex items-center gap-1">
                        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></span>
                    </div>
                 </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </CardContent>
        <div className="p-4 border-t text-center text-sm text-muted-foreground">
          Please select an option above to continue the conversation.
        </div>
      </Card>
    </div>
  );
}