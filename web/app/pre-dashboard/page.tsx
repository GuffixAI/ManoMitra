// web/app/pre-dashboard/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/auth.store";
import { motion } from "motion/react";
import { ArrowRight, Bot, MessageCircleQuestion } from "lucide-react";
import Link from "next/link";

export default function PreDashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4 lg:p-8">
      {/* Dashboard Button: Top Right Corner */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-6 right-6 md:top-8 md:right-8 bg-white rounded-lg"
      >
        <Link href="/student" passHref>
          <div
            className="rounded-lg bg-white text-gray-800 shadow-md hover:bg-gray-200 px-4 py-2"
          >
            Dashboard
          </div>
        </Link>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex w-full max-w-5xl flex-col items-center">
        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full text-center"
        >
          <h1 className="text-4xl font-bold">Welcome, {user?.name}!</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Your mental wellness journey is important. How would you like to
            proceed?
          </p>
        </motion.div>

        {/* Horizontal Cards Container */}
        <div className="mt-16 flex w-full max-w-4xl flex-col items-stretch justify-center gap-8 md:flex-row">
          {/* Card 1: Guided Conversation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full md:w-1/2"
          >
            <Card className="flex h-full flex-col transition-all hover:border-primary">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MessageCircleQuestion />
                </div>
                <CardTitle className="text-center">Guided Conversation</CardTitle>
                <CardDescription className="text-center">
                  Work through structured exercises and coping strategies with a
                  guided bot.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-grow flex-col justify-end">
                <Link href="/conversational-bot" passHref>
                  <Button className="w-full cursor-pointer">
                    Start Guided Session <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 2: AI Chat Assistant */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="w-full md:w-1/2"
          >
            <Card className="flex h-full flex-col transition-all hover:border-primary">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bot />
                </div>
                <CardTitle className="text-center">AI Chat Assistant</CardTitle>
                <CardDescription className="text-center">
                  Have an open, free-form conversation with an AI assistant
                  whenever you need to talk.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-grow flex-col justify-end">
                <Link href="/chat-bot" passHref>
                  <Button className="w-full cursor-pointer">
                    Open Chat <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}