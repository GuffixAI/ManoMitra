// web/app/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { motion } from "motion/react"
import { ArrowRight, LifeBuoy, Users } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROLES } from "@/lib/constants";

// A small component for feature cards
function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div
      className="bg-card p-6 rounded-lg border"
      whileHover={{ y: -5, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
    >
      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  // This effect handles client-side redirection after initial auth check
  // It complements the server-side middleware for a smoother experience
  useEffect(() => {
    if (isAuthenticated && user) {
      const dashboardUrl = {
        [ROLES.STUDENT]: '/student',
        [ROLES.COUNSELLOR]: '/counsellor',
        [ROLES.VOLUNTEER]: '/volunteer',
        [ROLES.ADMIN]: '/admin',
      }[user.role];
      
      if (dashboardUrl) {
        router.replace(dashboardUrl);
      }
    }
  }, [isAuthenticated, user, router]);


  // Don't render the landing page if we know the user is authenticated
  if (isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
          A Safe Space for <span className="text-primary">Student Wellness</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Connect with professional counsellors, find peer support, and access resources to help you thrive. Your mental health journey starts here.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/login" passHref>
            <Button size="lg">
              Login to Your Account <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/register" passHref>
            <Button size="lg" variant="secondary">
              Register
            </Button>
          </Link>
        </div>
      </motion.div>

      <motion.div
        className="mt-24 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        <FeatureCard 
          icon={<LifeBuoy />}
          title="Professional Counselling"
          description="Book secure, private sessions with certified counsellors tailored to your needs."
        />
        <FeatureCard 
          icon={<Users />}
          title="Peer Support Rooms"
          description="Join anonymous chat rooms to discuss topics with fellow students and trained volunteers."
        />
      </motion.div>
    </main>
  );
}