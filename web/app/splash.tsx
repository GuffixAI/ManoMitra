import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

export default function SplashScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      router.push("/register");
    }, 1800);
    return () => clearTimeout(timer);
  }, [router]);

  if (!showSplash) return null;

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <img src="/next.svg" alt="Logo" className="w-20 h-20 mb-6 opacity-90" />
        <h1 className="text-3xl font-bold">Welcome to ManoMitra</h1>
        <p className="text-muted-foreground mt-2">Your Mental Wellness Companion</p>

        <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Loading...
        </div>
      </motion.div>
    </div>
  );
}
