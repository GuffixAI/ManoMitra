"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect legacy /auth/register to canonical /register
export default function RegisterRouteRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/register');
  }, [router]);
  return null;
}


