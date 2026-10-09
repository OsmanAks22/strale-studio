"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { ProductImage } from "../catalog";
import { CaretIcon } from "../icons";

const GAP = 4;

/**
 * Product media slider. Desktop: 4:5 slides at viewport height minus the header (two-up on a
 * 1440 screen, the second cut by the info column), 48px prev/next arrows, 40×50 thumbnail strip
 * bottom-left. Mobile: one full-width slide at a time with a scroll progress bar underneath.
 */
export function ProductGallery({ images, title }: { images: ProductImage[]; title: string }) {
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [atEnd, setAtEnd] = useState(images.length <= 1);
  const [progress, setProgress] = useState(0);

  const update = useCallback(() => {
    const el = track.current;
    const slide = el?.firstElementChild as HTMLElement | null;
    if (!el || !slide) return;
    const step = slide.offsetWidth + GAP;
    const max = el.scrollWidth - el.clientWidth;
    setIndex(Math.min(images.length - 1, Math.round(el.scrollLeft / step)));
    setAtEnd(el.scrollLeft >= max - 1);
    setProgress(max > 0 ? el.scrollLeft / max : 0);
  }, [images.length]);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const goTo = (target: number) => {
    const el = track.current;
    const slide = el?.children[target] as HTMLElement | undefined;
    if (!el || !slide) return;
    el.scrollTo({ left: slide.offsetLeft - el.offsetLeft, behavior: "smooth" });
  };

  const atStart = index === 0 && progress === 0;

  return (
    <div className="relative" role="region" aria-label="Gallery Viewer">
      <ul
        ref={track}
        onScroll={update}
        className="rc-no-scrollbar flex snap-x snap-mandatory gap-1 overflow-x-auto overscroll-x-contain"
      >
        {images.map((image, i) => (
          <li
            key={image.src}
            className="relative aspect-[4/5] w-full shrink-0 snap-start bg-[#f2f2f2] tab:h-[max(480px,calc(100svh-102px))] tab:w-auto"
          >
            <Image
              src={image.src}
              alt={image.alt || title}
              fill
              sizes="(min-width: 750px) 45vw, 100vw"
              preload={i === 0}
              className="object-cover"
            />
          </li>
        ))}
      </ul>

      {images.length > 1 ? (
        <>
          <GalleryArrow direction={-1} disabled={atStart} onClick={() => goTo(Math.max(0, index - 1))} />
          <GalleryArrow
            direction={1}
            disabled={atEnd}
            onClick={() => goTo(Math.min(images.length - 1, index + 1))}
          />
          <ul className="absolute bottom-3.5 left-3.5 hidden gap-[5px] tab:flex" aria-label="Thumbnails">
            {images.map((image, i) => (
              <li key={image.src}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Load image ${i + 1} in gallery view`}
                  aria-current={i === index ? "true" : undefined}
                  className="relative block h-[50px] w-10 cursor-pointer overflow-hidden bg-[#f2f2f2]"
                >
                  <Image src={image.src} alt="" fill sizes="80px" className="object-cover" />
                  {i === index ? <span className="absolute inset-0 border border-black" /> : null}
                </button>
              </li>
            ))}
          </ul>
          <div className="relative -mt-[3px] h-[3px] bg-[#e6e6e6] tab:hidden" aria-hidden="true">
            <span
              className="absolute inset-y-0 left-0 bg-black"
              style={{
                width: `${100 / images.length}%`,
                transform: `translateX(${progress * (images.length - 1) * 100}%)`,
              }}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

function GalleryArrow({
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
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 1 ? "Slide right" : "Slide left"}
      className={cn(
        "absolute top-1/2 hidden size-12 -translate-y-1/2 cursor-pointer items-center justify-center text-black/75 disabled:cursor-default disabled:text-black/25 tab:flex",
        direction === 1 ? "right-0" : "left-0",
      )}
    >
      <CaretIcon className={cn("size-5", direction === -1 && "rotate-180")} />
    </button>
  );
}
