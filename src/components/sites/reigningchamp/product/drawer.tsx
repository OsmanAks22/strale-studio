"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { CloseIcon } from "../icons";

/**
 * Right-hand slide-in panel used by the product tabs drawer and the bag drawer:
 * 480px wide on desktop (full width on phones) over a 26% black scrim, Escape / scrim click to close.
 */
export function Drawer({
  open,
  onClose,
  label,
  header,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  header: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    panel.current?.focus();
    return () => {
      document.documentElement.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div className={cn("fixed inset-0 z-50", open ? "visible" : "invisible")} inert={!open}>
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/[0.26] transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={cn(
          "absolute inset-y-0 right-0 flex w-full flex-col bg-white outline-none transition-transform duration-300 ease-out tab:w-[480px]",
          open ? "translate-x-0" : "translate-x-full",
          className,
        )}
      >
        <div className="relative flex min-h-[60px] shrink-0 items-center px-3 pr-14 tab:px-6 tab:pr-14">
          {header}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-1/2 right-3 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center tab:right-4"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
