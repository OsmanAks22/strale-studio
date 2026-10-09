import type { Metadata } from "next";
import { RegisterForm } from "@/components/sites/reigningchamp/content/account-forms";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return <RegisterForm />;
}
