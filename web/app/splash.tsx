import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SplashScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      router.push("/auth/register");
    }, 2000); // 2 seconds splash
    return () => clearTimeout(timer);
  }, [router]);

  if (!showSplash) return null;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "#fff",
      fontFamily: "Inter, sans-serif",
      fontSize: "2rem"
    }}>
      <img src="/next.svg" alt="Logo" style={{ width: 80, marginBottom: 24 }} />
      <h1>Welcome to ManoMitra</h1>
      <p style={{ fontSize: "1.2rem", marginTop: 8 }}>Your Mental Wellness Companion</p>
      <div style={{ marginTop: 32 }}>
        <span className="loader" style={{
          display: "inline-block",
          width: 40,
          height: 40,
          border: "4px solid #fff",
          borderTop: "4px solid #764ba2",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
