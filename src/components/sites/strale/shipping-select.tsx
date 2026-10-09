"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { shippingRegions } from "./data";
import { CaretIcon } from "./icons";

/** "Teslimat:" region switcher. A single storefront for now, so it only records the choice. */
export function ShippingSelect({ className }: { className?: string }) {
  const id = useId();
  const [region, setRegion] = useState(shippingRegions[0]);
  return (
    <label htmlFor={id} className={cn("relative inline-flex items-center whitespace-nowrap", className)}>
      <span>Teslimat:&nbsp;</span>
      <span>{region}</span>
      <CaretIcon className="ml-1 size-3 rotate-90" />
      <select
        id={id}
        value={region}
        onChange={(event) => setRegion(event.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label="Teslimat bölgesi"
      >
        {shippingRegions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
