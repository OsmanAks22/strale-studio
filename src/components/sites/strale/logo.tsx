import { cn } from "@/lib/utils";
import { StraleMark } from "./icons";

/** Mark + wordmark lockup. Inherits color from the parent via currentColor. */
export function StraleLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <StraleMark className="h-[18px] w-6 fill-current" />
      <span className="st-display text-[22px] leading-none tracking-[0.18em]">Strale</span>
    </span>
  );
}
