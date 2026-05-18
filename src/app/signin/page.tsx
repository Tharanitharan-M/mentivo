"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function SignInPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<typeof form & { server: string }>>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function validate() {
    const e: Partial<typeof form> = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    return e;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: undefined, server: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.error) {
      setErrors({ server: "Invalid email or password." });
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  return (
    <div className="min-h-screen bg-[#0b0a09] dot-grid flex flex-col items-center justify-center px-4 py-16">
      {/* Soft warm ambient */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(245,158,11,0.18) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="w-full max-w-[420px] relative z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <Image src="/logo-mark.png" alt="Mentivo" width={32} height={32} className="rounded-md" />
          <span className="font-semibold text-[16px] text-stone-50 tracking-[-0.01em]">Mentivo</span>
        </Link>

        {/* Card */}
        <div className="surface-card rounded-2xl p-8">
          <h1 className="text-[24px] font-semibold text-stone-50 tracking-[-0.02em] mb-1.5">
            Welcome back
          </h1>
          <p className="text-[14px] text-stone-400 mb-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-amber-400 hover:text-amber-300 transition-colors font-medium">
              Sign up free
            </Link>
          </p>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] hover:border-[var(--border-2)] transition-colors text-[14px] font-medium text-stone-200 disabled:opacity-50 disabled:cursor-not-allowed mb-5"
          >
            {googleLoading ? <Spinner /> : <GoogleIcon />}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 hairline" />
            <span className="text-[11px] text-stone-500 font-medium tracking-[0.18em] uppercase">or</span>
            <div className="flex-1 hairline" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Field
              label="Email address"
              name="email"
              type="email"
              placeholder="jane@example.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              autoComplete="email"
            />
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[12px] font-medium text-stone-300">Password</label>
                <span className="text-[12px] text-stone-500 hover:text-amber-400 cursor-pointer transition-colors">
                  Forgot?
                </span>
              </div>
              <input
                name="password"
                type="password"
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface)] border text-[14px] text-stone-50 placeholder-stone-600 outline-none transition-colors focus:bg-[var(--surface-2)] ${
                  errors.password
                    ? "border-red-500/60 focus:border-red-400/80"
                    : "border-[var(--border)] focus:border-amber-500/50"
                }`}
              />
              {errors.password && <p className="mt-1.5 text-[12px] text-red-400">{errors.password}</p>}
            </div>

            {errors.server && (
              <p className="text-[12px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {errors.server}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="btn-primary btn-shimmer w-full justify-center mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Spinner /> : null}
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type,
  placeholder,
  value,
  onChange,
  error,
  autoComplete,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-stone-300 mb-1.5">
        {label}
      </label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className={`w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface)] border text-[14px] text-stone-50 placeholder-stone-600 outline-none transition-colors focus:bg-[var(--surface-2)] ${
          error
            ? "border-red-500/60 focus:border-red-400/80"
            : "border-[var(--border)] focus:border-amber-500/50"
        }`}
      />
      {error && <p className="mt-1.5 text-[12px] text-red-400">{error}</p>}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
