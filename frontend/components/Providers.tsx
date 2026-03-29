"use client";

import AuthGuard from "@/components/AuthGuard";
import DerryAiChat from "@/components/DerryAiChat";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Navbar />
      <AuthGuard>{children}</AuthGuard>
      <DerryAiChat />
    </AuthProvider>
  );
}
