"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { footerColumns, legalLinks, sourceUrl } from "./data";
import { CaretIcon, FacebookIcon, InstagramIcon, TwitterIcon } from "./icons";
import { ShippingSelect } from "./shipping-select";

const socials = [
  { label: "Instagram", href: "https://www.instagram.com/reigningchamp/", Icon: InstagramIcon },
  { label: "Twitter", href: "https://twitter.com/reigningchamp", Icon: TwitterIcon },
  { label: "Facebook", href: "https://www.facebook.com/Reigning-Champ-131594790193654/", Icon: FacebookIcon },
];

export function SiteFooter() {
  return (
    <footer className="bg-black text-white">
      <div className="px-3 pt-6 pb-12 tab:flex tab:justify-between tab:gap-6 tab:px-8 tab:pt-12">
        <div className="min-w-0 tab:flex tab:gap-6">
          {footerColumns.map((column, index) => (
            <div key={column.heading} className={index === 0 ? "mb-11 tab:mb-0 tab:w-[235px] tab:shrink-0" : "tab:min-w-0"}>
              <h2 className="text-[9px] leading-[13.5px] tracking-[1.2px] text-[#ccc] uppercase">{column.heading}</h2>
              <ul className="mt-5 flex flex-col gap-4">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={sourceUrl(link.href)} className="uppercase tracking-[1.2px] rc-hover-underline">
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
      <h2 className="font-rc-cond text-[32px] leading-10 tracking-[1.5px] uppercase">All Access</h2>
      <p className="mt-1.5">
        Sign up for early access to sales, new releases, special events and more from Reigning Champ.
      </p>
      <form
        className="relative mt-3"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
      >
        <label htmlFor="rc-footer-email" className="sr-only">
          Email Address
        </label>
        <input
          id="rc-footer-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="Email Address"
          className="h-12 w-full border-b border-white bg-transparent pr-8 text-white outline-none placeholder:text-[#808080]"
        />
        <button
          type="submit"
          aria-label="Subscribe"
          className="absolute top-0 right-0 flex h-12 w-6 cursor-pointer items-center justify-end"
        >
          <CaretIcon className="size-[18px]" />
        </button>
      </form>
      {submitted ? <p className="mt-3">Thanks for subscribing.</p> : null}
      <p className="mt-3 text-[#808080]">
        All emails will be sent by Reigning Champ | Unsubscribe any time | 675 6th Avenue, 5th Floor, New York, NY,
        10010 |{" "}
        <Link href="/" className="rc-underline">
          reigningchamp.com
        </Link>{" "}
        |{" "}
        <a href={sourceUrl("/policies/privacy-policy")} className="rc-underline">
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
    <div className="border-t border-[#333] px-3 pt-[13px] pb-9 text-[#808080] tab:flex tab:items-start tab:justify-between tab:gap-6 tab:px-8 tab:pt-4 tab:pb-12">
      <ul className="flex flex-wrap items-center gap-y-[9px] tab:shrink-0 tab:basis-[340px] desk:basis-auto">
        {legalLinks.map((link, index) => (
          <Fragment key={link.label}>
            {index > 0 ? <li aria-hidden="true" className="mx-1.5 h-3.5 w-px bg-[#808080]" /> : null}
            <li>
              <a href={sourceUrl(link.href)} className="rc-underline">
                {link.label}
              </a>
            </li>
          </Fragment>
        ))}
      </ul>
      <div className="mt-6 flex flex-col gap-6 tab:mt-0 tab:flex-row tab:items-center tab:gap-0">
        <p className="desk:whitespace-nowrap">© 2026 Reigning Champ. All Rights Reserved</p>
        <span className="mx-1 hidden text-white tab:inline">|</span>
        <ShippingSelect className="text-white" />
      </div>
    </div>
  );
}
