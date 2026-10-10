import Image from "next/image";
import { cn } from "@/lib/utils";
import { StraleMarkTwin } from "./icons";
import type { Media } from "./media";

/**
 * Fills its positioned parent with a video, a photo, or — until real media is set in media.ts —
 * a tonal placeholder. `tone="dark"` keeps overlaid white text readable, like the photos it stands in for.
 */
export function MediaSlot({
  media,
  sizes,
  tone,
  priority = false,
  className,
}: {
  media?: Media;
  sizes: string;
  tone: "dark" | "light";
  priority?: boolean;
  className?: string;
}) {
  if (media?.video) {
    return (
      <video
        className={cn("size-full object-cover", className)}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={media.poster}
      >
        <source src={media.video} type="video/mp4" />
      </video>
    );
  }
  if (media?.image) {
    return <Image src={media.image} alt="" fill sizes={sizes} priority={priority} className={cn("object-cover", className)} />;
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute inset-0 flex items-center justify-center",
        tone === "dark" ? "bg-[linear-gradient(160deg,var(--color-smoke),var(--color-ink))] text-bone/10" : "bg-stone text-sand",
        className,
      )}
    >
      <StraleMarkTwin className="h-auto w-[18%] max-w-[120px] min-w-10 fill-current" />
    </span>
  );
}
