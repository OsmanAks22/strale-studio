"use client";

import { useState } from "react";

export function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <main className="flex min-h-screen items-center justify-center bg-bone p-4">
      <form
        className="w-full max-w-sm bg-white p-6"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setError(null);
          const response = await fetch("/api/yonetim/giris", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
          });
          if (response.ok) window.location.reload();
          else {
            setError(((await response.json().catch(() => ({}))) as { error?: string }).error ?? "Giriş yapılamadı.");
            setBusy(false);
          }
        }}
      >
        <p className="st-label">STRALE · Yönetim</p>
        <label className="mt-5 block">
          <span className="st-micro text-[10px] text-graphite">Şifre</span>
          <input
            type="password"
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 h-11 w-full border border-sand px-3 outline-none focus:border-ink"
          />
        </label>
        {error ? <p className="mt-2 text-rust">{error}</p> : null}
        <button type="submit" disabled={busy || !password} className="st-label mt-5 h-11 w-full cursor-pointer bg-ink text-bone hover:bg-smoke disabled:opacity-50">
          {busy ? "Kontrol ediliyor…" : "Giriş yap"}
        </button>
      </form>
    </main>
  );
}
