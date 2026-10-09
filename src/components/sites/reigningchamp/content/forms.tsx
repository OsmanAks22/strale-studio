"use client";

import { useId, useState } from "react";
import { CaretIcon } from "../icons";

/**
 * "All Access" sign-up on /pages/newsletter. The source posts to Klaviyo; the clone has no
 * mailing backend, so it validates the address and confirms locally.
 */
export function NewsletterForm() {
  const id = useId();
  const [email, setEmail] = useState<string | null>(null);

  if (email) {
    return (
      <p role="status" className="mt-5 text-[12px] leading-[18px] tab:text-[16px] tab:leading-6">
        Thanks for signing up. Confirmation for {email} is shown here only: this clone does not send emails.
      </p>
    );
  }

  return (
    <form
      className="relative mt-5 max-w-[400px]"
      onSubmit={(event) => {
        event.preventDefault();
        const value = new FormData(event.currentTarget).get("email");
        setEmail(typeof value === "string" ? value : "");
      }}
    >
      <label htmlFor={id} className="sr-only">
        Email Address
      </label>
      <input
        id={id}
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="Email Address"
        className="h-12 w-full border-b border-[#808080] bg-transparent pr-8 outline-none placeholder:text-[#808080] focus:border-black"
      />
      <button
        type="submit"
        aria-label="Subscribe"
        className="absolute top-0 right-0 flex h-12 w-6 cursor-pointer items-center justify-end"
      >
        <CaretIcon className="size-[18px]" />
      </button>
    </form>
  );
}

/** Opt-out form on the "Do Not Sell or Share" page; records the request locally only. */
export function OptOutForm() {
  const id = useId();
  const [done, setDone] = useState(false);

  return (
    <div className="mt-8 max-w-[600px]">
      {done ? (
        <p role="status" className="text-[12px] leading-[18px] tab:text-[16px] tab:leading-6">
          Your opt-out preference has been noted for this browser. This clone has no customer
          database, so nothing was sent.
        </p>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setDone(true);
          }}
        >
          <label htmlFor={id} className="block text-[9px] leading-[13.5px] tracking-[1.2px] text-[#808080] uppercase">
            Email
          </label>
          <input
            id={id}
            type="email"
            name="email"
            required
            autoComplete="email"
            className="mt-[3px] h-10 w-full border border-[#333] bg-[#fafafa] px-4 text-[#333] outline-none focus:border-black"
          />
          <button
            type="submit"
            className="mt-[18px] flex h-10 w-full cursor-pointer items-center justify-center bg-black px-4 tracking-[1.2px] text-white uppercase"
          >
            Do not sell or share my personal information
          </button>
        </form>
      )}
    </div>
  );
}
