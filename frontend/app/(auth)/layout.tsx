import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#07070a] text-zinc-100 flex flex-col justify-center items-center px-4 py-12 overflow-hidden selection:bg-violet-500/30 selection:text-violet-200">
      {/* Glowing background circles */}
      <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-[10%] -right-[10%] w-[55%] h-[55%] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[460px]">
        {children}
      </div>
    </div>
  );
}
