import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="grid gap-1.5 w-full">
      {label && (
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {label}
        </span>
      )}
      <input
        className={`w-full rounded-2xl bg-zinc-950/80 border border-zinc-800/80 px-4.5 py-3.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 focus:shadow-[0_0_15px_rgba(139,92,246,0.15)] ${
          error ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20" : ""
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs font-medium text-rose-400 mt-0.5 px-1 animate-pulse">
          {error}
        </span>
      )}
    </div>
  );
}
