"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await register(username.trim(), email.trim(), password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-56px)] max-w-md flex-col justify-center px-4 pb-16 pt-10 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-[#FF6B6B]">
        Account
      </p>
      <h1 className="mt-2 font-sans text-3xl font-bold text-[#F5F5F5]">
        Create account
      </h1>
      <p className="mt-2 text-sm text-[#A89090]">
        Choose a username, email, and password (min. 6 characters).
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-[#FF6B6B]">
            Username
          </span>
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-hud w-full"
            required
            minLength={2}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-[#A89090]">
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-hud w-full"
            required
            minLength={6}
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
          {pending ? "Creating…" : "Sign up"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#A89090]">
        Already have an account?{" "}
        <Link href="/login" className="text-[#FF6B6B] hover:underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
