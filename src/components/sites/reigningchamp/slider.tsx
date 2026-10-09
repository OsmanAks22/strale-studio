"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { CaretIcon } from "./icons";

/**
 * Horizontal scroll-snap row shared by "New Arrivals" and "Shop by Category".
 * Desktop shows 48px prev/next buttons on hover, vertically centred on the 4:5 media.
 */
export function Slider({ label, children }: { label: string; children: React.ReactNode }) {
  const track = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const step = (direction: 1 | -1) => {
    const el = track.current;
    const slide = el?.firstElementChild as HTMLElement | null;
    if (!el || !slide) return;
    el.scrollBy({ left: direction * (slide.offsetWidth + 6), behavior: "smooth" });
  };

  return (
    <div className="group/slider relative">
      <ul
        ref={track}
        onScroll={update}
        aria-label={label}
        className="rc-no-scrollbar flex snap-x snap-mandatory scroll-px-3 gap-1 overflow-x-auto px-3 tab:scroll-px-8 tab:gap-1.5 tab:px-8"
      >
        {children}
      </ul>
      <SliderButton direction={-1} disabled={atStart} onClick={() => step(-1)} />
      <SliderButton direction={1} disabled={atEnd} onClick={() => step(1)} />
    </div>
  );
}

export function SliderItem({ children }: { children: React.ReactNode }) {
  return <li className="w-[40vw] shrink-0 snap-start tab:w-[calc(22.29vw-1px)]">{children}</li>;
}

function SliderButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 1 | -1;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={direction === 1 ? "Next" : "Previous"}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "absolute top-[calc((22.29vw-1px)*0.625-10px)] hidden size-12 cursor-pointer items-center justify-center bg-white text-black opacity-0 transition-opacity duration-200 group-hover/slider:opacity-100 focus-visible:opacity-100 disabled:cursor-default disabled:text-[#ccc] tab:flex",
        direction === 1 ? "right-8" : "left-8",
      )}
    >
      <CaretIcon className={cn("size-5", direction === -1 && "rotate-180")} />
    </button>
  );
}
