"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { navItems, localHref, type NavItem } from "./data";
import {
  AccountIcon,
  BagIcon,
  CaretIcon,
  CloseIcon,
  HamburgerIcon,
  LogoIcon,
  SearchIcon,
  WishlistIcon,
} from "./icons";
import { ShippingSelect } from "./shipping-select";
import { useCart } from "./stores";

const SCROLLED_PAST = 70;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  const { count } = useCart();

  // Client-side navigation keeps this component mounted; close any open menu on route change.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpenMenu(null);
    setDrawerOpen(false);
    setHovered(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLLED_PAST);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
        setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openNow = (index: number | null) => {
    window.clearTimeout(closeTimer.current);
    setOpenMenu(index);
  };
  const closeSoon = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenMenu(null), 150);
  };

  // Only the homepage hero sits under a transparent header.
  const solid = pathname !== "/" || scrolled || hovered || openMenu !== null;

  return (
    <div className="sticky top-0 z-40">
      <header
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          closeSoon();
        }}
        className={cn(
          "relative flex min-h-[60px] items-center justify-between px-3 transition-colors duration-200 tab:px-8",
          solid ? "bg-white text-black" : "bg-transparent text-white",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center">
          <Link href="/" aria-label="Reigning Champ" className="block shrink-0">
            <LogoIcon className="h-6 w-[27px] fill-current" />
          </Link>
          <nav aria-label="Primary" className="hidden desk:block">
            <ul className="ml-6 flex flex-wrap gap-x-6 leading-[18px]">
              {navItems.map((item, index) => (
                <li
                  key={item.label}
                  onMouseEnter={() => openNow(item.columns ? index : null)}
                  className="flex min-h-[42px] items-center"
                >
                  <TopLink
                    item={item}
                    active={openMenu === index}
                    onToggle={() => openNow(openMenu === index ? null : index)}
                  />
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex items-center">
          <ShippingSelect className="mr-5 hidden tab:inline-flex" />
          <div className="flex items-center gap-5">
            <IconLink href="/search" label="Search">
              <SearchIcon className="size-5" />
            </IconLink>
            <IconLink href="/cart" label={count ? `Bag, ${count} items` : "Bag"} className="relative">
              <BagIcon className="size-5" />
              {count ? (
                <span className="absolute inset-x-0 top-[7px] text-center text-[8px] leading-none tracking-normal">
                  {count < 100 ? count : "99+"}
                </span>
              ) : null}
            </IconLink>
            <IconLink href="/pages/wishlist" label="Wishlist">
              <WishlistIcon className="size-5" />
            </IconLink>
            <IconLink href="/account" label="Account" className="hidden tab:block">
              <AccountIcon className="size-5" />
            </IconLink>
            <button
              type="button"
              aria-label="Menu"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
              className="block cursor-pointer desk:hidden"
            >
              <HamburgerIcon className="size-5" />
            </button>
          </div>
        </div>

        {navItems.map((item, index) =>
          item.columns ? (
            <MegaMenu
              key={item.label}
              item={item}
              open={openMenu === index}
              onEnter={() => openNow(index)}
            />
          ) : null,
        )}
      </header>

      <MobileDrawer key={pathname} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}

function TopLink({ item, active, onToggle }: { item: NavItem; active: boolean; onToggle: () => void }) {
  const className = cn(
    "uppercase tracking-[1.2px] hover:underline hover:underline-offset-[0.2rem]",
    active && "underline underline-offset-[0.2rem]",
  );
  if (!item.href) {
    return (
      <button type="button" aria-expanded={active} onClick={onToggle} className={cn(className, "cursor-pointer")}>
        {item.label}
      </button>
    );
  }
  return (
    <Link
      href={localHref(item.href)}
      aria-haspopup={item.columns ? "true" : undefined}
      aria-expanded={item.columns ? active : undefined}
      onFocus={item.columns ? onToggle : undefined}
      className={className}
    >
      {item.label}
    </Link>
  );
}

function IconLink({
  href,
  label,
  className,
  children,
}: {
  href: string;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={localHref(href)} aria-label={label} className={cn("block", className)}>
      {children}
    </Link>
  );
}

function MegaMenu({ item, open, onEnter }: { item: NavItem; open: boolean; onEnter: () => void }) {
  return (
    <div
      onMouseEnter={onEnter}
      aria-hidden={!open}
      className={cn(
        "absolute left-0 top-full hidden w-full bg-white px-8 pt-1.5 pb-9 text-black desk:block",
        open ? "visible opacity-100" : "invisible opacity-0",
      )}
    >
      <div className="flex justify-between gap-6">
        <div className="flex min-w-0 flex-wrap gap-6">
          {item.columns?.map((column) => (
            <div key={column.heading} className="w-[236px]">
              <p className="text-[9px] leading-[13.5px] tracking-[1.2px] text-[#808080] uppercase">{column.heading}</p>
              <ul className="mt-5 flex flex-col gap-4">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={localHref(link.href)}
                      tabIndex={open ? 0 : -1}
                      className="uppercase tracking-[1.2px] rc-hover-underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {item.feature ? (
          <Link
            href={localHref(item.feature.href)}
            tabIndex={open ? 0 : -1}
            className="mr-[-8px] block w-[336px] shrink-0 rc-hover-underline"
          >
            <Image
              src={item.feature.image}
              alt=""
              width={336}
              height={420}
              sizes="336px"
              className="block h-[420px] w-[336px] object-cover"
            />
            <span className="mt-4 block uppercase tracking-[1.2px]">{item.feature.caption}</span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [submenu, setSubmenu] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const close = () => {
    onClose();
    setSubmenu(null);
  };
  const active = submenu === null ? null : navItems[submenu];

  return (
    <div className={cn("fixed inset-0 z-50 desk:hidden", open ? "visible" : "invisible")} aria-hidden={!open}>
      <button
        type="button"
        aria-label="Close menu"
        tabIndex={-1}
        onClick={close}
        className={cn(
          "absolute inset-0 bg-black/30 backdrop-blur-[5px] transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={cn(
          "absolute top-0 right-0 flex h-full w-[360px] max-w-[calc(100%-30px)] flex-col overflow-hidden bg-white text-black transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-[60px] shrink-0 items-center justify-between px-3">
          <Link href="/" aria-label="Reigning Champ" onClick={close}>
            <LogoIcon className="h-6 w-[27px] fill-current" />
          </Link>
          <button type="button" aria-label="Close" onClick={close} className="cursor-pointer">
            <CloseIcon className="size-5" />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3">
          <ul className="border-t border-black">
            {navItems.map((item, index) => (
              <li key={item.label} className="border-b border-black">
                {item.columns ? (
                  <button
                    type="button"
                    onClick={() => setSubmenu(index)}
                    className="flex h-[58px] w-full cursor-pointer items-center justify-between uppercase tracking-[1.2px]"
                  >
                    {item.label}
                    <CaretIcon className="size-5" />
                  </button>
                ) : (
                  <Link
                    href={localHref(item.href ?? "/")}
                    className="flex h-[58px] items-center uppercase tracking-[1.2px]"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-auto flex flex-col gap-4 pt-10 pb-12">
            <Link href={localHref("/account")} className="uppercase tracking-[1.2px]">
              Account
            </Link>
            <Link href={localHref("/pages/contact")} className="uppercase tracking-[1.2px]">
              Contact Us
            </Link>
            <Link href={localHref("/pages/about-us")} className="uppercase tracking-[1.2px]">
              About Us
            </Link>
            <ShippingSelect className="mt-2" />
          </div>
        </nav>

        <div
          className={cn(
            "absolute inset-0 flex flex-col bg-white transition-transform duration-200",
            active ? "translate-x-0" : "translate-x-full",
          )}
          aria-hidden={!active}
        >
          {active ? (
            <>
              <div className="mx-3 flex h-[60px] shrink-0 items-center border-b border-black">
                <button
                  type="button"
                  onClick={() => setSubmenu(null)}
                  className="flex cursor-pointer items-center gap-2 font-rc-med uppercase tracking-[1.2px]"
                >
                  <CaretIcon className="size-5 rotate-180" />
                  {active.label}
                </button>
              </div>
              <div className="overflow-y-auto px-3 pt-[25px] pb-12">
                {active.columns?.map((column) => (
                  <div key={column.heading} className="mb-[30px]">
                    <p className="text-[9px] leading-[13.5px] tracking-[1.2px] text-[#808080] uppercase">
                      {column.heading}
                    </p>
                    <ul className="mt-5 flex flex-col gap-4">
                      {column.links.map((link) => (
                        <li key={link.label}>
                          <Link href={localHref(link.href)} className="uppercase tracking-[1.2px] rc-hover-underline">
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {active.feature ? (
                  <Link href={localHref(active.feature.href)} className="block">
                    <Image
                      src={active.feature.image}
                      alt=""
                      width={336}
                      height={420}
                      sizes="336px"
                      className="block aspect-[4/5] w-full object-cover"
                    />
                    <span className="mt-4 block uppercase tracking-[1.2px]">{active.feature.caption}</span>
                  </Link>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
