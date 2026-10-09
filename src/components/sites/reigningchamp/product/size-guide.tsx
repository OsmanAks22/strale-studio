"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ProductDetails } from "../catalog";
import { CaretIcon } from "../icons";
import type { MeasureSlide } from "./size-guides";

type Unit = "in" | "cm";

export type SizeGuideData = {
  sizes: { value: string; label: string }[];
  initialSize: string;
  modelInfo: string;
  body: ProductDetails["bodyMeasurements"];
  item: ProductDetails["itemMeasurements"];
  bodySlides: MeasureSlide[];
  itemSlides: MeasureSlide[];
};

const FRACTIONS: Record<string, string> = { "25": "1/4", "5": "1/2", "75": "3/4" };

/** Body measurement digit as the source renders it: "17" + superscript "1/2" (in) or a rounded cm integer. */
function BodyNumber({ raw, unit }: { raw: string; unit: Unit }) {
  const value = Number.parseFloat(raw);
  if (Number.isNaN(value)) return <span className="text-[56px] leading-[56px]">{raw}</span>;
  let whole = String(Math.round(value * 2.54));
  let fraction: string | null = null;
  if (unit === "in") {
    const [int, decimals] = raw.split(".");
    whole = int;
    const trimmed = decimals?.replace(/0+$/, "");
    fraction = trimmed ? (FRACTIONS[trimmed] ?? `.${trimmed}`) : null;
  }
  return (
    <span className="relative inline-flex items-baseline text-[56px] leading-[56px]">
      {whole}
      <span className="relative ml-0.5 inline-block min-w-[18px] text-[9px] leading-[13.5px] tracking-[1.2px] uppercase">
        {fraction ? <span className="absolute -top-[38px] left-0 whitespace-nowrap">{fraction}</span> : null}
        {unit}
      </span>
    </span>
  );
}

function itemValue(raw: string, unit: Unit) {
  const value = Number.parseFloat(raw);
  if (unit === "in" || Number.isNaN(value) || !/^[\d.]+$/.test(raw)) return raw;
  return (value * 2.54).toFixed(1);
}

function UnitTabs({ unit, onChange }: { unit: Unit; onChange: (unit: Unit) => void }) {
  return (
    <div role="tablist" className="flex">
      {(["in", "cm"] as const).map((value) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={unit === value}
          onClick={() => onChange(value)}
          className={cn(
            "w-[86px] cursor-pointer border-b px-2 py-px text-left text-[9px] leading-[13.5px] tracking-[1.2px] uppercase",
            unit === value ? "border-black" : "border-[#ccc]",
          )}
        >
          {value}
        </button>
      ))}
    </div>
  );
}

function Slides({ title, slides }: { title: string; slides: MeasureSlide[] }) {
  if (!slides.length) return null;
  return (
    <div className="pt-6 pb-6">
      <h2 className="px-2 font-rc-med tracking-[1.2px] uppercase">{title}</h2>
      <ul className="rc-no-scrollbar mt-3 flex snap-x scroll-px-2 gap-1 overflow-x-auto px-2">
        {slides.map((slide) => (
          <li key={slide.title} className="w-[calc(50%-2px)] min-w-[238px] shrink-0 snap-start">
            <div className="relative aspect-[4/5] bg-[#f2f2f2]">
              <Image src={slide.image} alt="" fill sizes="240px" className="object-cover" />
            </div>
            <div className="p-3">
              <p>{slide.title}</p>
              <p className="mt-3">{slide.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** "Size Guide" drawer tab: size picker, body measurement ranges, item measurement table, how-to-measure slides. */
export function SizeGuide({ data }: { data: SizeGuideData }) {
  const [size, setSize] = useState(data.initialSize);
  const [bodyUnit, setBodyUnit] = useState<Unit>("in");
  const [itemUnit, setItemUnit] = useState<Unit>("in");
  const current = data.sizes.find((s) => s.value === size);
  const itemRows = data.item?.rows.filter((row) => row.length > 1) ?? [];

  return (
    <div className="pb-12">
      {data.sizes.length ? (
        <div className="relative">
          <label htmlFor="size-guide-size" className="sr-only">
            Size
          </label>
          <select
            id="size-guide-size"
            value={size}
            onChange={(event) => setSize(event.target.value)}
            className="h-10 w-full cursor-pointer appearance-none border border-[#333] bg-white px-[7px] tracking-[1px] outline-none"
          >
            {data.sizes.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <CaretIcon className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 rotate-90" />
        </div>
      ) : null}
      {current && data.body.length ? (
        <p className="mt-2 text-[#808080]">{current.label} is designed to fit the body measurements below</p>
      ) : null}
      {data.modelInfo ? <p className="mt-4">{data.modelInfo}</p> : null}

      {data.body.length ? (
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-rc-med tracking-[1.2px] uppercase">Body Measurements</h3>
            <UnitTabs unit={bodyUnit} onChange={setBodyUnit} />
          </div>
          <div className="mt-6 space-y-3.5">
            {data.body.map((row) => {
              const values = row.values[size];
              if (!values?.length) return null;
              return (
                <div key={row.label}>
                  <p className="text-[9px] leading-3 tracking-[1.2px] uppercase">{row.label}</p>
                  <p className="mt-0.5 flex items-baseline">
                    <BodyNumber raw={values[0]} unit={bodyUnit} />
                    {values[1] ? (
                      <>
                        <span className="mx-3 text-[56px] leading-[56px]">-</span>
                        <BodyNumber raw={values[1]} unit={bodyUnit} />
                      </>
                    ) : null}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <div className="-mr-3 tab:-mr-6">
        <Slides title="How to measure | Body" slides={data.bodySlides} />
      </div>

      {data.item && itemRows.length ? (
        <section className="mt-6 border-t border-[#ccc] pt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-rc-med tracking-[1.2px] uppercase">Item Measurements</h3>
            <UnitTabs unit={itemUnit} onChange={setItemUnit} />
          </div>
          <div className="rc-no-scrollbar mt-5 overflow-x-auto">
            <table className="border-collapse tracking-[1.2px]">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 h-[60px] min-w-[240px] border border-white bg-[#ebebeb]" />
                  {itemRows.map((row) => (
                    <th
                      key={row[0]}
                      scope="col"
                      className={cn(
                        "h-[60px] min-w-24 border border-white bg-[#ebebeb] px-2 text-left font-normal uppercase",
                        row[0] === size && "font-rc-med",
                      )}
                    >
                      {row[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.item.keys.map((key, k) => {
                  const bg = k % 2 === 0 ? "bg-[#fafafa]" : "bg-[#f5f5f5]";
                  return (
                    <tr key={key}>
                      <th
                        scope="row"
                        className={cn("sticky left-0 z-10 h-[60px] border border-white px-2 text-left font-normal uppercase", bg)}
                      >
                        {key}
                      </th>
                      {itemRows.map((row) => (
                        <td key={row[0]} className={cn("h-[60px] border border-white px-2 tracking-[1px]", bg)}>
                          {itemValue(row[k + 1] ?? "", itemUnit)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <div className="-mr-3 tab:-mr-6">
        <Slides title="How to measure | Item" slides={data.itemSlides} />
      </div>

      <p className="mt-2">
        Have a question?{" "}
        <a href="mailto:support@reigningchamp.com" className="rc-underline">
          Contact Support
        </a>
      </p>
    </div>
  );
}
