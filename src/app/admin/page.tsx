"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-maroon-900 px-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-gold-700/40 bg-maroon-800/60 p-8 shadow-2xl"
      >
        <h1 className="font-display text-2xl text-gold-300 text-center mb-6">Admin Login</h1>

        <label htmlFor="email" className="block text-sm font-medium text-cream-200 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 rounded-lg border border-gold-700/40 bg-maroon-950/40 px-4 py-2.5 text-cream-50 outline-none focus:border-gold-400"
        />

        <label htmlFor="password" className="block text-sm font-medium text-cream-200 mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 rounded-lg border border-gold-700/40 bg-maroon-950/40 px-4 py-2.5 text-cream-50 outline-none focus:border-gold-400"
        />

        {error && (
          <p className="mb-4 rounded-lg bg-maroon-950 border border-maroon-500 px-3 py-2 text-sm text-cream-100">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gradient-to-r from-saffron-500 to-gold-500 py-3 font-semibold text-maroon-900 hover:brightness-110 disabled:opacity-60 transition-all"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
    </main>
  );
}
