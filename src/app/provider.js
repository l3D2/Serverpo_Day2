"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
export default function AuthProvider({ children }) {
  return <SessionProvider refetchInterval={1}>{children}</SessionProvider>;
}
