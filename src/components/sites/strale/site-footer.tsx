"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { SITE_DOMAIN, footerColumns, legalLinks, storeUrl } from "./data";
import { CaretIcon, InstagramIcon, TwitterIcon } from "./icons";
import { ShippingSelect } from "./shipping-select";

const socials = [
  { label: "Instagram", href: "https://www.instagram.com/strale.studio/", Icon: InstagramIcon },
  { label: "X", href: "https://x.com/stralestudio", Icon: TwitterIcon },
];

export function SiteFooter() {
  return (
    <footer className="bg-ink text-bone">
      <div className="px-3 pt-6 pb-12 tab:flex tab:justify-between tab:gap-6 tab:px-8 tab:pt-12">
        <div className="min-w-0 tab:flex tab:gap-6">
          {footerColumns.map((column, index) => (
            <div key={column.heading} className={index === 0 ? "mb-11 tab:mb-0 tab:w-[235px] tab:shrink-0" : "tab:min-w-0"}>
              <h2 className="st-micro text-[9px] leading-[13.5px] text-ash tab:text-[10px]">{column.heading}</h2>
              <ul className="mt-5 flex flex-col gap-4">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={storeUrl(link.href)} className="st-label st-hover-underline">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Newsletter />
      </div>
      <SubFooter />
    </footer>
  );
}

function Newsletter() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="mt-[71px] min-w-0 tab:mt-[3px] tab:max-w-[380px] tab:flex-1 tab:basis-[200px]">
      <h2 className="st-display text-[34px] leading-10">The List</h2>
      <p className="mt-1.5">
        Join for first access to new collections, limited runs and studio notes from Strale.
      </p>
      <form
        className="relative mt-3"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
      >
        <label htmlFor="st-footer-email" className="sr-only">
          Email Address
        </label>
        <input
          id="st-footer-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="Email Address"
          className="h-12 w-full border-b border-bone bg-transparent pr-8 text-bone outline-none placeholder:text-ash"
        />
        <button
          type="submit"
          aria-label="Subscribe"
          className="absolute top-0 right-0 flex h-12 w-6 cursor-pointer items-center justify-end"
        >
          <CaretIcon className="size-[18px]" />
        </button>
      </form>
      {submitted ? <p className="mt-3 text-ash">You’re on the list.</p> : null}
      <p className="mt-3 text-ash">
        All emails are sent by Strale Studio | Unsubscribe any time |{" "}
        <Link href="/" className="st-underline">
          {SITE_DOMAIN}
        </Link>{" "}
        |{" "}
        <a href={storeUrl("/pages/privacy")} className="st-underline">
          Privacy Policy
        </a>
      </p>
      <ul className="mt-12 flex gap-3">
        {socials.map(({ label, href, Icon }) => (
          <li key={label}>
            <a href={href} className="block size-5" target="_blank" rel="noreferrer">
              <Icon className="size-5" fill="currentColor" />
              <span className="sr-only">{label}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SubFooter() {
  return (
    <div className="border-t border-smoke px-3 pt-[13px] pb-9 text-ash tab:flex tab:items-start tab:justify-between tab:gap-6 tab:px-8 tab:pt-4 tab:pb-12">
      <ul className="flex flex-wrap items-center gap-y-[9px] tab:shrink-0 tab:basis-[340px] desk:basis-auto">
        {legalLinks.map((link, index) => (
          <Fragment key={link.label}>
            {index > 0 ? <li aria-hidden="true" className="mx-1.5 h-3.5 w-px bg-ash" /> : null}
            <li>
              <a href={storeUrl(link.href)} className="st-underline">
                {link.label}
              </a>
            </li>
          </Fragment>
        ))}
      </ul>
      <div className="mt-6 flex flex-col gap-6 tab:mt-0 tab:flex-row tab:items-center tab:gap-0">
        <p className="desk:whitespace-nowrap">© 2026 Strale Studio. All Rights Reserved</p>
        <span className="mx-1 hidden text-bone tab:inline">|</span>
        <ShippingSelect className="text-bone" />
      </div>
    </div>
  );
}
