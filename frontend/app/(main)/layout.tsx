"use client";

import React from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/Button";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070a] flex items-center justify-center text-zinc-400">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="animate-spin h-8 w-8 text-violet-500"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm font-medium tracking-wide">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#07070a] text-zinc-100 px-4 py-8 sm:px-8 overflow-x-hidden selection:bg-violet-500/30 selection:text-violet-200">
      {/* Background Glowing Ambient Light Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full bg-indigo-600/5 blur-[130px] pointer-events-none" />

      <div className="mx-auto max-w-4xl relative z-10 animate-fade-in">
        {/* Header Section */}
        <header className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-900 pb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
                LaraTodo Dashboard
              </p>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-zinc-100">
              Hello, {user?.name || "User"}
            </h1>
          </div>
          <Button variant="secondary" onClick={logout} size="sm">
            Sign Out
          </Button>
        </header>

        {children}
      </div>
    </div>
  );
}
