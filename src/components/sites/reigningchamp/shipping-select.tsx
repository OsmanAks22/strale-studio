"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import { CaretIcon } from "./icons";

const regions = [
  { label: "US | International", href: "https://reigningchamp.com" },
  { label: "Canada", href: "https://ca.reigningchamp.com" },
  { label: "United States", href: "https://reigningchamp.com" },
  { label: "International", href: "https://reigningchamp.com" },
];

/** "Shipping to:" region switcher. Picking a region opens that storefront, like the source. */
export function ShippingSelect({ className }: { className?: string }) {
  const id = useId();
  return (
    <label htmlFor={id} className={cn("relative inline-flex items-center whitespace-nowrap", className)}>
      <span>Shipping to:&nbsp;</span>
      <span className="capitalize">US | International</span>
      <CaretIcon className="ml-1 size-3 rotate-90" />
      <select
        id={id}
        defaultValue={regions[0].label}
        onChange={(event) => {
          const region = regions.find((r) => r.label === event.target.value);
          if (region && region.label !== regions[0].label) window.location.href = region.href;
        }}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label="Shipping to"
      >
        {regions.map((region) => (
          <option key={region.label} value={region.label}>
            {region.label}
          </option>
        ))}
      </select>
    </label>
  );
}
