"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, Bot, LayoutDashboard, MessageCircleQuestion } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { useAuthStore } from "@/store/auth.store";

export default function PreDashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl text-center"
      >
        <h1 className="text-4xl font-bold">Welcome, {user?.name}!</h1>
        <p className="mt-2 text-lg text-muted-foreground">Your mental wellness journey is important. How would you like to proceed?</p>
      </motion.div>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
        {/* Card 1: Conversational Bot */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="h-full flex flex-col hover:border-primary transition-all">
            <CardHeader>
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4 mx-auto">
                <MessageCircleQuestion />
              </div>
              <CardTitle className="text-center">Guided Conversation</CardTitle>
              <CardDescription className="text-center">
                Work through structured exercises and coping strategies with a guided bot.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-end">
              <Link href="/conversational-bot" passHref>
                <Button className="w-full">
                  Start Guided Session <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 2: Chat-based Bot */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="h-full flex flex-col hover:border-primary transition-all">
            <CardHeader>
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4 mx-auto">
                <Bot />
              </div>
              <CardTitle className="text-center">AI Chat Assistant</CardTitle>
              <CardDescription className="text-center">
                Have an open, free-form conversation with an AI assistant whenever you need to talk.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-end">
              <Link href="/chat-bot" passHref>
                <Button className="w-full">
                  Open Chat <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Card 3: Go to Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="h-full flex flex-col hover:border-secondary-foreground transition-all">
            <CardHeader>
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-secondary/10 text-secondary-foreground mb-4 mx-auto">
                <LayoutDashboard />
              </div>
              <CardTitle className="text-center">My Dashboard</CardTitle>
              <CardDescription className="text-center">
                Access your resources, book appointments, and manage your reports.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-end">
              <Link href="/student" passHref>
                <Button variant="secondary" className="w-full">
                  Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}