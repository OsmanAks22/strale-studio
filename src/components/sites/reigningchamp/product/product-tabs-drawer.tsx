"use client";

import { cn } from "@/lib/utils";
import { Drawer } from "./drawer";
import { SizeGuide, type SizeGuideData } from "./size-guide";

export type TabKey = "details" | "size-guide" | "fit" | "fabric-care" | "shipping-returns";

export type ProductTab = { key: TabKey; label: string; html?: string };

/** The source's single right-hand drawer with Details / Size Guide / Fit / Fabric & Care / Shipping & Returns tabs. */
export function ProductTabsDrawer({
  title,
  tabs,
  active,
  onSelect,
  onClose,
  sizeGuide,
}: {
  title: string;
  tabs: ProductTab[];
  active: TabKey | null;
  onSelect: (key: TabKey) => void;
  onClose: () => void;
  sizeGuide: SizeGuideData | null;
}) {
  return (
    <Drawer
      open={active !== null}
      onClose={onClose}
      label={title}
      header={<h2 className="truncate font-rc-med tracking-[1.2px] uppercase">{title}</h2>}
    >
      <div role="tablist" className="rc-no-scrollbar flex shrink-0 gap-6 overflow-x-auto px-3 tab:px-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active === tab.key}
            onClick={() => onSelect(tab.key)}
            className={cn(
              "shrink-0 cursor-pointer py-[3px] whitespace-nowrap",
              active === tab.key ? "text-black" : "text-[#808080] hover:text-black",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pt-6 pb-8 tab:px-6">
        {tabs.map((tab) => (
          <div key={tab.key} role="tabpanel" hidden={active !== tab.key} aria-label={tab.label}>
            {tab.key === "size-guide" && sizeGuide ? (
              <SizeGuide key={`${sizeGuide.initialSize}-${active === "size-guide"}`} data={sizeGuide} />
            ) : (
              <div
                className="[&_a]:underline [&_a]:underline-offset-[0.2rem] [&_li]:list-disc [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:pl-[15px]"
                dangerouslySetInnerHTML={{ __html: tab.html ?? "" }}
              />
            )}
          </div>
        ))}
      </div>
    </Drawer>
  );
}
