"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#07080f] flex items-center justify-center">
        <svg className="w-6 h-6 animate-spin text-blue-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
        </svg>
      </div>
    );
  }

  if (!session?.user) return null;

  const user = session.user;
  const firstName = user.name?.split(" ")[0] ?? "there";
  const initial = user.name?.charAt(0).toUpperCase() ?? "U";

  return (
    <div className="min-h-screen bg-[#07080f]">
      {/* Top bar */}
      <header className="border-b border-white/[0.06] bg-[#07080f]/90 backdrop-blur-2xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[60px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-mark.png" alt="Mentivo" width={32} height={32} className="rounded-lg" />
            <span className="font-bold text-[15px] text-white tracking-[-0.02em]">Mentivo</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07]">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? "User"}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xs font-semibold text-blue-400">
                  {initial}
                </div>
              )}
              <span className="text-sm text-slate-300 font-medium">{user.name}</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-xs font-medium text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.05]"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-20 flex flex-col items-center justify-center min-h-[calc(100vh-60px)]">
        <div
          aria-hidden
          className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(ellipse at center, #3b82f6 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />

        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-green-500/20 bg-green-500/[0.07] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-medium text-green-400">You&apos;re in</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Welcome, <span className="gradient-text-blue">{firstName}</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md mx-auto">
            Your dashboard is on its way. Big things are being built here.
          </p>

          <div className="mt-10 glass-card rounded-2xl px-8 py-10 max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-slate-300 text-sm font-medium mb-1">Dashboard</p>
            <p className="text-slate-500 text-xs leading-relaxed">
              Your projects, progress, and learning path will appear here once we&apos;re ready.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
