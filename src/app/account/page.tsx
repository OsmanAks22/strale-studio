import type { Metadata } from "next";
import { LoginForm } from "@/components/sites/reigningchamp/content/account-forms";

export const metadata: Metadata = { title: "Account" };

/** Signed-out visitors to /account see the sign-in form, as on the source. */
export default function AccountPage() {
  return <LoginForm />;
}
