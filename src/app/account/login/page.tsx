import type { Metadata } from "next";
import { LoginForm } from "@/components/sites/reigningchamp/content/account-forms";

export const metadata: Metadata = { title: "Account" };

export default function LoginPage() {
  return <LoginForm />;
}
