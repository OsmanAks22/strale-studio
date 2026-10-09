"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CloseIcon } from "../icons";
import type { FacetGroup, FacetValue } from "./facets";

/**
 * Right-hand "FILTER" drawer: selected chips + Clear all, one accordion per facet group,
 * and a "SHOW n PRODUCTS" button. Toggling a value navigates immediately (like the source).
 */
export function FilterDrawer({
  open,
  focus,
  groups,
  total,
  pending,
  clearHref,
  onClear,
  onToggle,
  onClose,
}: {
  open: boolean;
  focus: string | null;
  groups: FacetGroup[];
  total: number;
  pending: boolean;
  clearHref: string | null;
  onClear: () => void;
  onToggle: (param: string, value: string) => void;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [lastFocus, setLastFocus] = useState<{ open: boolean; focus: string | null }>({ open: false, focus: null });

  // Opening from a quick button expands just that group (adjusting state during render).
  if (open !== lastFocus.open || focus !== lastFocus.focus) {
    setLastFocus({ open, focus });
    if (open) setExpanded(new Set(focus ? [focus] : []));
  }

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const active = groups.flatMap((g) => g.values.filter((v) => v.active).map((v) => ({ group: g, value: v })));

  const toggleGroup = (name: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  return (
    <div
      className={cn("fixed inset-0 z-50", open ? "visible" : "invisible pointer-events-none")}
      aria-hidden={!open}
    >
      <div
        className={cn("absolute inset-0 bg-black/[0.26] transition-opacity duration-300", open ? "opacity-100" : "opacity-0")}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter"
        className={cn(
          "absolute top-0 right-0 flex h-full w-[calc(100vw-30px)] flex-col bg-white transition-transform duration-300 tab:w-[480px]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex-1 overflow-y-auto px-3 tab:px-6">
          <div className="flex h-[60px] items-center justify-between">
            <h2 className="font-rc-med text-[12px] leading-[18px] tracking-[1.2px] uppercase">Filter</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="-mr-1 cursor-pointer p-1">
              <CloseIcon className="size-5" />
            </button>
          </div>

          <div className="flex min-h-6 flex-wrap items-center gap-2">
            {active.length === 0 ? (
              <p>No filters selected</p>
            ) : (
              <>
                {active.map(({ group, value }) => (
                  <button
                    key={`${group.param}:${value.value}`}
                    type="button"
                    onClick={() => onToggle(group.param, value.value)}
                    className="flex h-6 cursor-pointer items-center gap-1.5 border border-black px-1.5"
                  >
                    {group.kind === "size" ? value.value : value.label}
                    <CloseIcon className="size-2" />
                    <span className="sr-only">Remove filter</span>
                  </button>
                ))}
                {clearHref ? (
                  <a
                    href={clearHref}
                    onClick={(e) => {
                      e.preventDefault();
                      onClear();
                    }}
                    className="ml-0.5 rc-underline"
                  >
                    Clear all
                  </a>
                ) : null}
              </>
            )}
          </div>

          <div className="mt-[18px]">
            {groups.map((group) => {
              const isOpen = expanded.has(group.name);
              return (
                <section key={group.name} className="border-b border-black/10">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => toggleGroup(group.name)}
                      className="flex w-full cursor-pointer items-center justify-between py-5 text-left text-[12px] leading-[22px] tracking-[1.2px] uppercase"
                    >
                      {group.name}
                      <PlusMinus open={isOpen} />
                    </button>
                  </h3>
                  {isOpen ? (
                    <div className="pb-8">
                      {group.kind === "size" ? (
                        <SizeValues group={group} onToggle={onToggle} />
                      ) : (
                        <ul className="flex flex-col gap-2 pl-0.5">
                          {group.values.map((value) => (
                            <li key={value.value}>
                              <CheckValue group={group} value={value} onToggle={onToggle} />
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
        </div>

        <div className="px-3 pt-5 pb-5 tab:px-6">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-full cursor-pointer items-center justify-center border border-black bg-black text-[12px] tracking-[1.2px] text-white uppercase"
          >
            {pending ? "Loading…" : `Show ${total} ${total === 1 ? "product" : "products"}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function PlusMinus({ open }: { open: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M1 8h14" />
      {open ? null : <path d="M8 1v14" />}
    </svg>
  );
}

function CheckValue({
  group,
  value,
  onToggle,
}: {
  group: FacetGroup;
  value: FacetValue;
  onToggle: (param: string, value: string) => void;
}) {
  const disabled = value.count === 0 && !value.active;
  return (
    <label className={cn("flex cursor-pointer items-center gap-2", disabled && "cursor-default text-[#b3b3b3]")}>
      <input
        type="checkbox"
        className="peer sr-only"
        checked={value.active}
        disabled={disabled}
        onChange={() => onToggle(group.param, value.value)}
      />
      {group.kind === "colour" ? (
        <span
          aria-hidden="true"
          className={cn(
            "size-3.5 shrink-0",
            value.swatch?.toLowerCase() === "#ffffff" && "border border-black",
            value.active && "outline outline-1 outline-offset-1 outline-black",
          )}
          style={{ backgroundColor: value.swatch }}
        />
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            "flex size-3.5 shrink-0 items-center justify-center border",
            disabled ? "border-[#b3b3b3]" : "border-black",
          )}
        >
          {value.active ? <span className="size-2 bg-black" /> : null}
        </span>
      )}
      <span className="peer-focus-visible:underline">{value.label}</span>
    </label>
  );
}

function SizeValues({ group, onToggle }: { group: FacetGroup; onToggle: (param: string, value: string) => void }) {
  const sections: { name: string; values: FacetValue[] }[] = [];
  for (const value of group.values) {
    const name = value.group ?? "";
    const last = sections[sections.length - 1];
    if (last && last.name === name) last.values.push(value);
    else sections.push({ name, values: [value] });
  }
  return (
    <div className="flex flex-col gap-6">
      {sections.map((section) => (
        <div key={section.name}>
          {sections.length > 1 ? (
            <p className="mb-2 pl-0.5 text-[9px] leading-[13.5px] tracking-[1.2px] text-[#808080] uppercase">
              {section.name}
            </p>
          ) : null}
          <ul className="flex flex-wrap gap-3 pl-0.5">
            {section.values.map((value) => {
              const disabled = value.count === 0 && !value.active;
              return (
                <li key={value.value}>
                  <button
                    type="button"
                    aria-pressed={value.active}
                    aria-label={value.value}
                    disabled={disabled}
                    onClick={() => onToggle(group.param, value.value)}
                    className={cn(
                      "flex h-8 min-w-8 cursor-pointer items-center justify-center border border-black px-1 text-[10px] leading-none tracking-[1.2px] uppercase",
                      value.active && "outline outline-1 -outline-offset-4 outline-black",
                      disabled && "cursor-default border-[#ccc] text-[#b3b3b3] line-through",
                    )}
                  >
                    {value.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
