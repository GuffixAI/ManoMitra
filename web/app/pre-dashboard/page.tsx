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
import { ArrowRight, MessageCircle, Video, Heart } from "lucide-react";
import Link from "next/link";

export default function PreDashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-2 lg:p-6">
      {/* Dashboard Button: Top Right Corner */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-6 right-6 md:top-8 md:right-8 bg-white rounded-lg"
      >
        <Link href="/student" passHref>
          <div
            className="rounded-lg bg-white text-gray-800 shadow-md hover:bg-gray-200 px-4 py-2 cursor-pointer"
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
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Heart className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold">Welcome, {user?.name}!</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Taking care of your mental health is a brave and important step. 
            You're not alone in facing challenges like anxiety, depression, academic stress, or social isolation. 
            Choose how you'd like to connect and receive support today.
          </p>
        </motion.div>

        {/* Horizontal Cards Container */}
        <div className="mt-16 flex w-full max-w-4xl flex-col items-stretch justify-center gap-8 md:flex-row">
          {/* Card 1: Live Audio & Video Chat */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full md:w-1/2"
          >
            <Card className="flex h-full flex-col transition-all hover:border-primary hover:shadow-lg">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Video className="h-6 w-6" />
                </div>
                <CardTitle className="text-center">Live Audio & Video Support</CardTitle>
                <CardDescription className="text-center">
                  Connect through real-time voice and video conversations. 
                  Perfect when you need immediate, personal interaction and feel like talking it out.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-grow flex-col justify-end">
                <div className="mb-3 text-sm text-muted-foreground text-center">
                  • Real-time voice interaction<br/>
                  • Video chat available<br/>
                  • Immediate emotional support
                </div>
                <Link href="/conversational-bot" passHref>
                  <Button className="w-full cursor-pointer">
                    Start Live Session <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 2: Text Chat Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="w-full md:w-1/2"
          >
            <Card className="flex h-full flex-col transition-all hover:border-primary hover:shadow-lg">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <CardTitle className="text-center">Text Chat Support</CardTitle>
                <CardDescription className="text-center">
                  Express yourself through writing at your own pace. 
                  Ideal for when you prefer to organize your thoughts and communicate through text.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-grow flex-col justify-end">
                <div className="mb-3 text-sm text-muted-foreground text-center">
                  • Take your time to express yourself<br/>
                  • Private and confidential<br/>
                  • Available 24/7
                </div>
                <Link href="/chat-bot" passHref>
                  <Button className="w-full cursor-pointer">
                    Start Text Chat <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Additional Support Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 text-center max-w-2xl"
        >
          <p className="text-sm text-muted-foreground">
            <strong>Remember:</strong> Seeking help is a sign of strength, not weakness. 
            These tools provide support for common challenges like academic stress, anxiety, sleep issues, and social isolation. 
            For crisis situations, please contact your local emergency services or campus counseling center immediately.
          </p>
        </motion.div>
      </div>
    </div>
  );
}