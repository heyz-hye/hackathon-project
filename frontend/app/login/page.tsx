"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(email.trim(), password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-56px)] max-w-md flex-col justify-center px-4 pb-16 pt-10 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-[#FF6B6B]">
        Account
      </p>
      <h1 className="mt-2 font-sans text-3xl font-bold text-[#F5F5F5]">Log in</h1>
      <p className="mt-2 text-sm text-[#A89090]">
        Use the email and password you registered with.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-[#FF6B6B]">
            Email
          </span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-hud w-full"
            required
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-[#A89090]">
            Password
          </span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-hud w-full"
            required
          />
        </label>
        {error ? (
          <p className="font-mono text-sm text-[#FF6B6B]" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="btn-primary w-full py-3 disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#A89090]">
        No account?{" "}
        <Link href="/signup" className="text-[#FF6B6B] hover:underline">
          Create one
        </Link>
      </p>
    </main>
  );
}
