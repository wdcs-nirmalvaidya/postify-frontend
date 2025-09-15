"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { isAuthenticated } from "@/utils/auth";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    } else {
      setIsVerified(true);
    }
  }, [router]);

  if (!isVerified) return null;

  return <>{children}</>;
};
