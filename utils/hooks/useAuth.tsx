"use client";

import { useState, useEffect } from "react";
import { PublicUser } from "@/types/user.type";

export const useAuth = () => {
  const [user, setUser] = useState<PublicUser | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return { user };
};
