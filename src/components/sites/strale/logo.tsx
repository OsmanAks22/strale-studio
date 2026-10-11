import { cn } from "@/lib/utils";
import { StraleMarkTwin } from "./icons";

/** Mark + wordmark lockup (option B "Twin"). Inherits color from the parent via currentColor. */
export function StraleLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <StraleMarkTwin className="h-[18px] w-[22px] fill-current" />
      <span className="text-[18px] leading-none font-medium font-stretch-[125%] tracking-[0.1em] uppercase">
        Strale
      </span>
    </span>
  );
}
