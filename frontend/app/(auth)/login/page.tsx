"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-[2rem] border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      <div className="text-center mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-500">
          Welcome Back
        </p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-zinc-100">
          Sign in to LaraTodo
        </h1>
        <p className="mt-2.5 text-sm text-zinc-400">
          Keep your tasks secure and organized
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 px-4.5 py-3.5 text-xs font-medium text-rose-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-5">
        <Input
          type="email"
          label="Email Address"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <Input
          type="password"
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" loading={loading} className="w-full mt-2">
          Sign In
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-zinc-400">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-violet-400 hover:text-violet-300 transition duration-300 underline underline-offset-4"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}
