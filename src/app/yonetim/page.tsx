import type { Metadata } from "next";
import { connection } from "next/server";
import { AdminApp } from "@/components/admin/admin-app";
import { LoginForm } from "@/components/admin/login-form";
import { adminPassword, isAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Yönetim",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  // Env vars and the session cookie are read per request, never at build time.
  await connection();
  if (!adminPassword()) {
    return (
      <main className="mx-auto max-w-xl p-8">
        <p className="st-label">STRALE · Yönetim</p>
        <p className="mt-4">
          Panel henüz kurulmamış: <code>ADMIN_PASSWORD</code> ortam değişkeni tanımlı değil. Kurulum adımları için{" "}
          <code>docs/yonetim-paneli.md</code> dosyasına bakın.
        </p>
      </main>
    );
  }
  return (await isAdmin()) ? <AdminApp /> : <LoginForm />;
}
