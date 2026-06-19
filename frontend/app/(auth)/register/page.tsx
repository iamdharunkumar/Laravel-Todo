"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await register(name, email, password);
    } catch (err: any) {
      setError(err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-[2rem] border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      <div className="text-center mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-500">
          Get Started
        </p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-zinc-100">
          Create account
        </h1>
        <p className="mt-2.5 text-sm text-zinc-400">
          Start organizing your tasks in seconds
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 px-4.5 py-3.5 text-xs font-medium text-rose-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-5">
        <Input
          type="text"
          label="Your Name"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
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
          placeholder="Minimum 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" loading={loading} className="w-full mt-2">
          Create Account
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-violet-400 hover:text-violet-300 transition duration-300 underline underline-offset-4"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
