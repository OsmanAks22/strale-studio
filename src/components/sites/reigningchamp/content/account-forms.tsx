"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";

const LOGIN_IMAGE = "https://reigningchamp.com/cdn/shop/files/20240123_Core0826-1_1.jpg?v=1707869921";
const REGISTER_IMAGE = "https://reigningchamp.com/cdn/shop/files/20240123_Core2020.jpg?v=1706834805";

const NOT_AVAILABLE =
  "Accounts are not available in this clone of reigningchamp.com. Nothing you enter here is sent or stored.";

/** Shared /account layout: 600px form column, 4:5 editorial image on the right (below on phones). */
function AccountLayout({
  title,
  image,
  children,
}: {
  title: string;
  image: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-3 pt-3 pb-6 tab:px-8 tab:pb-12">
      <h1 className="font-rc-cond text-[32px] leading-10 tracking-[1.5px] uppercase tab:text-[48px] tab:leading-[60px] tab:tracking-[1px]">
        {title}
      </h1>
      <div className="mt-6 tab:flex tab:items-start tab:gap-8">
        <div className="tab:w-[600px] tab:max-w-[calc(50%-16px)] tab:shrink-0">{children}</div>
        <div className="relative mt-6 aspect-[4/5] bg-[#f2f2f2] tab:mt-0 tab:flex-1">
          <Image src={image} alt="" fill sizes="(min-width: 750px) 52vw, 100vw" preload className="object-cover" />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  name,
  autoComplete,
  required = true,
}: {
  label: string;
  type: string;
  name: string;
  autoComplete?: string;
  required?: boolean;
}) {
  const id = useId();
  return (
    <div className="mb-[18px]">
      <label htmlFor={id} className="block text-[9px] leading-[13.5px] tracking-[1.2px] text-[#808080] uppercase">
        {label}
      </label>
      <input
        id={id}
        type={type}
        name={name}
        required={required}
        autoComplete={autoComplete}
        className="mt-[3px] h-10 w-full border border-[#333] bg-[#fafafa] px-4 text-[#333] outline-none focus:border-black"
      />
    </div>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="flex h-10 w-full cursor-pointer items-center justify-center border border-black bg-black px-4 tracking-[1.2px] text-white uppercase"
    >
      {children}
    </button>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p role="status" className="mb-[18px] border border-black px-4 py-3">
      {children}
    </p>
  );
}

export function LoginForm() {
  const [mode, setMode] = useState<"login" | "recover">("login");
  const [message, setMessage] = useState<string | null>(null);

  if (mode === "recover") {
    return (
      <AccountLayout title="Reset your password" image={LOGIN_IMAGE}>
        <p className="mb-[18px]">We will send you an email to reset your password.</p>
        {message ? <Notice>{message}</Notice> : null}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setMessage(NOT_AVAILABLE);
          }}
        >
          <Field label="Email" type="email" name="email" autoComplete="email" />
          <SubmitButton>Submit</SubmitButton>
        </form>
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setMessage(null);
          }}
          className="rc-underline mt-2 cursor-pointer"
        >
          Cancel
        </button>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout title="Sign in" image={LOGIN_IMAGE}>
      {message ? <Notice>{message}</Notice> : null}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setMessage(NOT_AVAILABLE);
        }}
      >
        <Field label="Email" type="email" name="customer[email]" autoComplete="email" />
        <Field label="Password" type="password" name="customer[password]" autoComplete="current-password" />
        <SubmitButton>Sign in</SubmitButton>
      </form>
      <div className="mt-2 flex justify-between">
        <button
          type="button"
          onClick={() => {
            setMode("recover");
            setMessage(null);
          }}
          className="rc-underline cursor-pointer"
        >
          Forgot your password?
        </button>
        <Link href="/account/register" className="rc-underline">
          Create Account
        </Link>
      </div>
    </AccountLayout>
  );
}

export function RegisterForm() {
  const [message, setMessage] = useState<string | null>(null);
  const marketingId = useId();

  return (
    <AccountLayout title="Create account" image={REGISTER_IMAGE}>
      {message ? <Notice>{message}</Notice> : null}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setMessage(NOT_AVAILABLE);
        }}
      >
        <Field label="First name" type="text" name="customer[first_name]" autoComplete="given-name" required={false} />
        <Field label="Last name" type="text" name="customer[last_name]" autoComplete="family-name" required={false} />
        <Field label="Email" type="email" name="customer[email]" autoComplete="email" />
        <Field label="Password" type="password" name="customer[password]" autoComplete="new-password" />
        <div className="mb-4 flex items-start gap-3">
          <input
            id={marketingId}
            type="checkbox"
            name="customer[accepts_marketing]"
            className="mt-[2px] size-3.5 shrink-0 cursor-pointer accent-black"
          />
          <label htmlFor={marketingId} className="cursor-pointer">
            Sign up for early access to sales, new releases, special events and much more.
          </label>
        </div>
        <SubmitButton>Create</SubmitButton>
      </form>
      <p className="mt-2 text-center">
        <Link href="/account/login" className="rc-underline">
          Have an account? Sign In
        </Link>
      </p>
    </AccountLayout>
  );
}
