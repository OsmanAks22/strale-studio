"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { navItems, storeUrl, type NavItem } from "./data";
import {
  AccountIcon,
  BagIcon,
  CaretIcon,
  CloseIcon,
  HamburgerIcon,
  SearchIcon,
  WishlistIcon,
} from "./icons";
import { StraleLogo } from "./logo";
import { ShippingSelect } from "./shipping-select";

const SCROLLED_PAST = 70;

/** `overlay`: start transparent over a full-bleed hero; otherwise the bar is always solid. */
export function SiteHeader({ overlay = true }: { overlay?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);

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

  const solid = !overlay || scrolled || hovered || openMenu !== null;

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
          solid ? "bg-bone text-ink" : "bg-transparent text-bone",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center">
          <Link href="/" aria-label="Strale" className="block shrink-0">
            <StraleLogo />
          </Link>
          <nav aria-label="Ana menü" className="hidden desk:block">
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
            <IconLink href="/arama" label="Ara">
              <SearchIcon className="size-5" />
            </IconLink>
            <IconLink href="/sepet" label="Sepet">
              <BagIcon className="size-5" />
            </IconLink>
            <IconLink href="/favoriler" label="Favoriler">
              <WishlistIcon className="size-5" />
            </IconLink>
            <IconLink href="/hesap" label="Hesabım" className="hidden tab:block">
              <AccountIcon className="size-5" />
            </IconLink>
            <button
              type="button"
              aria-label="Menü"
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

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}

function TopLink({ item, active, onToggle }: { item: NavItem; active: boolean; onToggle: () => void }) {
  const className = cn(
    "st-label hover:underline hover:underline-offset-[0.25rem]",
    active && "underline underline-offset-[0.25rem]",
  );
  if (!item.href) {
    return (
      <button type="button" aria-expanded={active} onClick={onToggle} className={cn(className, "cursor-pointer")}>
        {item.label}
      </button>
    );
  }
  return (
    <a
      href={storeUrl(item.href)}
      aria-haspopup={item.columns ? "true" : undefined}
      aria-expanded={item.columns ? active : undefined}
      onFocus={item.columns ? onToggle : undefined}
      className={className}
    >
      {item.label}
    </a>
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
    <a href={storeUrl(href)} aria-label={label} className={cn("block", className)}>
      {children}
    </a>
  );
}

function MegaMenu({ item, open, onEnter }: { item: NavItem; open: boolean; onEnter: () => void }) {
  return (
    <div
      onMouseEnter={onEnter}
      aria-hidden={!open}
      className={cn(
        "absolute left-0 top-full hidden w-full bg-bone px-8 pt-1.5 pb-9 text-ink desk:block",
        open ? "visible opacity-100" : "invisible opacity-0",
      )}
    >
      <div className="flex justify-between gap-6">
        <div className="flex min-w-0 flex-wrap gap-6">
          {item.columns?.map((column) => (
            <div key={column.heading} className="w-[236px]">
              <p className="st-micro text-[9px] leading-[13.5px] text-graphite tab:text-[10px]">{column.heading}</p>
              <ul className="mt-5 flex flex-col gap-4">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={storeUrl(link.href)}
                      tabIndex={open ? 0 : -1}
                      className="st-label st-hover-underline"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {item.feature ? (
          <a
            href={storeUrl(item.feature.href)}
            tabIndex={open ? 0 : -1}
            className="mr-[-8px] block w-[336px] shrink-0 st-hover-underline"
          >
            <Image
              src={item.feature.image}
              alt=""
              width={336}
              height={420}
              sizes="336px"
              className="block h-[420px] w-[336px] object-cover"
            />
            <span className="mt-4 block st-label">{item.feature.caption}</span>
          </a>
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
        aria-label="Menüyü kapat"
        tabIndex={-1}
        onClick={close}
        className={cn(
          "absolute inset-0 bg-ink/30 backdrop-blur-[5px] transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menü"
        className={cn(
          "absolute top-0 right-0 flex h-full w-[360px] max-w-[calc(100%-30px)] flex-col overflow-hidden bg-bone text-ink transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-[60px] shrink-0 items-center justify-between px-3">
          <Link href="/" aria-label="Strale" onClick={close}>
            <StraleLogo />
          </Link>
          <button type="button" aria-label="Kapat" onClick={close} className="cursor-pointer">
            <CloseIcon className="size-5" />
          </button>
        </div>

        <nav aria-label="Mobil menü" className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3">
          <ul className="border-t border-sand">
            {navItems.map((item, index) => (
              <li key={item.label} className="border-b border-sand">
                {item.columns ? (
                  <button
                    type="button"
                    onClick={() => setSubmenu(index)}
                    className="flex h-[58px] w-full cursor-pointer items-center justify-between st-label"
                  >
                    {item.label}
                    <CaretIcon className="size-5" />
                  </button>
                ) : (
                  <a
                    href={storeUrl(item.href ?? "/")}
                    className="flex h-[58px] items-center st-label"
                  >
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-auto flex flex-col gap-4 pt-10 pb-12">
            <a href={storeUrl("/hesap")} className="st-label">
              Hesabım
            </a>
            <a href={storeUrl("/sayfa/iletisim")} className="st-label">
              İletişim
            </a>
            <a href={storeUrl("/sayfa/hakkimizda")} className="st-label">
              Hakkımızda
            </a>
            <ShippingSelect className="mt-2" />
          </div>
        </nav>

        <div
          className={cn(
            "absolute inset-0 flex flex-col bg-bone transition-transform duration-200",
            active ? "translate-x-0" : "translate-x-full",
          )}
          aria-hidden={!active}
        >
          {active ? (
            <>
              <div className="mx-3 flex h-[60px] shrink-0 items-center border-b border-sand">
                <button
                  type="button"
                  onClick={() => setSubmenu(null)}
                  className="flex cursor-pointer items-center gap-2 st-heading"
                >
                  <CaretIcon className="size-5 rotate-180" />
                  {active.label}
                </button>
              </div>
              <div className="overflow-y-auto px-3 pt-[25px] pb-12">
                {active.columns?.map((column) => (
                  <div key={column.heading} className="mb-[30px]">
                    <p className="st-micro text-[9px] leading-[13.5px] text-graphite tab:text-[10px]">
                      {column.heading}
                    </p>
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
                {active.feature ? (
                  <a href={storeUrl(active.feature.href)} className="block">
                    <Image
                      src={active.feature.image}
                      alt=""
                      width={336}
                      height={420}
                      sizes="336px"
                      className="block aspect-[4/5] w-full object-cover"
                    />
                    <span className="mt-4 block st-label">{active.feature.caption}</span>
                  </a>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
