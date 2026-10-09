"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { Link as NavLink, ProductImage } from "../catalog";
import { formatPrice } from "../format";
import { cart, recordView } from "../stores";
import { WishlistButton } from "../wishlist-button";
import { BagDrawer } from "./bag-drawer";
import { ProductGallery } from "./product-gallery";
import { ProductTabsDrawer, type ProductTab, type TabKey } from "./product-tabs-drawer";
import type { SizeGuideData } from "./size-guide";

export type OptionValue = {
  value: string;
  label: string;
  available: boolean;
  variantId: number;
  variantTitle: string;
  price: number;
};

export type ProductViewData = {
  handle: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  colour: string | null;
  colourName: string | null;
  giftCard: boolean;
  images: ProductImage[];
  cardImage: string | null;
  breadcrumbs: NavLink[];
  colourways: { handle: string; colour: string | null; image: string | null }[];
  option: { name: string; values: OptionValue[] } | null;
  modelInfo: string;
  description: string;
  tabs: ProductTab[];
  sizeGuide: SizeGuideData | null;
};

const ROW_TABS: TabKey[] = ["details", "fit", "fabric-care", "shipping-returns"];

/** Gallery + info column of the product page, with the tabs drawer and bag drawer it opens. */
export function ProductView({ product }: { product: ProductViewData }) {
  const { option } = product;
  const [selected, setSelected] = useState<string | null>(
    option && option.values.length === 1 ? option.values[0].value : product.giftCard && option ? option.values[0].value : null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey | null>(null);
  const [bagOpen, setBagOpen] = useState(false);
  const [asGift, setAsGift] = useState(false);
  const messageTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    recordView({ handle: product.handle, title: product.title, price: product.price, image: product.cardImage });
  }, [product.handle, product.title, product.price, product.cardImage]);

  useEffect(() => () => window.clearTimeout(messageTimer.current), []);

  const current = option?.values.find((v) => v.value === selected) ?? null;
  const price = current?.price ?? product.price;
  const flash = (text: string) => {
    window.clearTimeout(messageTimer.current);
    setMessage(text);
    messageTimer.current = window.setTimeout(() => setMessage(null), 3000);
  };

  const addToBag = () => {
    if (!current) {
      flash(`Please select a ${option?.name ?? "Size"}`);
      return;
    }
    if (!current.available) return;
    cart.add({
      variantId: current.variantId,
      handle: product.handle,
      title: product.title,
      variantTitle: current.variantTitle,
      colour: product.colourName,
      size: current.value,
      price: current.price,
      image: product.cardImage,
    });
    flash("Added to Bag");
    setBagOpen(true);
  };

  const buttonLabel =
    message ??
    (current
      ? current.available
        ? `Add to Bag - ${formatPrice(current.price)}`
        : "Notify Me When Available"
      : "Add to Bag");

  const rowTabs = ROW_TABS.map((key) => product.tabs.find((t) => t.key === key)).filter(
    (t): t is ProductTab => Boolean(t),
  );
  const guideData = product.sizeGuide
    ? { ...product.sizeGuide, initialSize: current ? sizeKey(current, product.sizeGuide) : product.sizeGuide.initialSize }
    : null;

  const header = (
    <div className="order-1 px-3 pt-3 pb-6 tab:order-none tab:px-0 tab:pt-0 tab:pb-0">
      {product.breadcrumbs.length ? (
        <ul className="flex flex-wrap items-center text-[9px] leading-[18px] tracking-[1.2px] uppercase">
          {product.breadcrumbs.map((crumb, i) => (
            <Fragment key={crumb.href}>
              {i > 0 ? (
                <li aria-hidden="true" className="mx-3 text-[9px]">
                  •
                </li>
              ) : null}
              <li>
                <Link href={crumb.href} className="rc-hover-underline">
                  {crumb.label}
                </Link>
              </li>
            </Fragment>
          ))}
        </ul>
      ) : null}
      <div className={cn("relative mt-1 pr-10 tab:mt-2", !product.breadcrumbs.length && "tab:mt-3")}>
        <h1 className="font-rc-med tracking-[1.2px] uppercase tab:text-[16px] tab:leading-6">{product.title}</h1>
        <WishlistButton
          product={{ handle: product.handle, title: product.title, price: product.price, image: product.cardImage }}
          className="absolute -top-[11px] -right-3 tab:-top-2"
          iconClassName="size-3 tab:size-[15px]"
        />
      </div>
      <p className="mt-1 tracking-[1.2px] uppercase tab:mt-2 tab:text-[16px] tab:leading-6">
        {product.compareAtPrice ? <s className="mr-2 text-[#808080]">{formatPrice(product.compareAtPrice)}</s> : null}
        {formatPrice(price)}
      </p>
      {product.giftCard ? (
        <p className="mt-1.5 inline-block bg-[#ebebeb] px-2 py-px tracking-[1px]">Final Sale</p>
      ) : null}
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 tab:grid-cols-[1fr_1fr] tab:px-8 desk:grid-cols-[2fr_1fr]">
        <div className="order-2 min-w-0 tab:order-1">
          <ProductGallery images={product.images} title={product.title} />
        </div>

        <div className="contents tab:order-2 tab:block tab:min-w-0 tab:px-6 tab:pt-5 tab:pb-5">
          <div className="contents tab:sticky tab:top-[80px] tab:block">
            {header}
            <div className="order-3 px-3 pt-[42px] pb-5 tab:px-0 tab:pt-0">
              {product.colourways.length ? (
                <div className={cn(product.giftCard ? "mt-0" : "tab:mt-[15px]")}>
                  {product.colourName ? <p className="tracking-[1.2px]">{product.colourName}</p> : null}
                  <ul className="mt-3 flex flex-wrap gap-1 pl-px" aria-label="Colour">
                    {product.colourways.map((swatch) => {
                      const active = swatch.handle === product.handle;
                      return (
                        <li key={swatch.handle}>
                          <Link
                            href={`/products/${swatch.handle}`}
                            aria-current={active ? "page" : undefined}
                            title={swatch.colour ?? undefined}
                            className="relative block h-[50px] w-10 bg-[#f2f2f2]"
                          >
                            {swatch.image ? (
                              <Image src={swatch.image} alt={swatch.colour ?? ""} fill sizes="80px" className="object-cover" />
                            ) : null}
                            {active ? <span className="absolute inset-0 border border-black" /> : null}
                            <span className="sr-only">{swatch.colour}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}

              {option ? (
                <fieldset className={cn(product.colourways.length ? "mt-6" : "tab:mt-[15px]", product.giftCard && "tab:mt-[44px]")}>
                  <legend className="contents">
                    <span className="flex items-center justify-between gap-4">
                      {product.modelInfo ? (
                        <span className="tracking-[1px]">{product.modelInfo}</span>
                      ) : (
                        <span className="tracking-[1.2px] uppercase">
                          {option.name}:{current && !product.giftCard ? <>&nbsp; {current.label}</> : null}
                        </span>
                      )}
                      {product.sizeGuide ? (
                        <button
                          type="button"
                          onClick={() => setTab("size-guide")}
                          className="shrink-0 cursor-pointer rc-underline"
                        >
                          Size Guide
                        </button>
                      ) : null}
                    </span>
                  </legend>
                  <div className="mt-3 flex flex-wrap gap-3 pl-px">
                    {option.values.map((value) => {
                      const checked = value.value === selected;
                      return (
                        <label
                          key={value.value}
                          className={cn(
                            "relative flex h-8 min-w-8 cursor-pointer items-center justify-center border px-1 text-[9px] leading-[13.5px] tracking-[1.2px] uppercase",
                            value.available
                              ? "border-black"
                              : "border-[#e6e6e6] bg-white text-[#808080]",
                            checked &&
                              (value.available
                                ? "bg-black text-white shadow-[inset_0_0_0_1px_#fff]"
                                : "border-black text-black"),
                          )}
                        >
                          <input
                            type="radio"
                            name={option.name}
                            value={value.value}
                            checked={checked}
                            onChange={() => {
                              setSelected(value.value);
                              setMessage(null);
                            }}
                            className="sr-only"
                          />
                          {value.label}
                          {value.available ? null : (
                            <>
                              <span className="sr-only">Variant sold out or unavailable</span>
                              <EnvelopeIcon className="absolute -top-[5px] -right-[5px] size-2.5 bg-white text-black" />
                            </>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ) : null}

              {product.giftCard ? (
                <label className="mt-4 flex cursor-pointer items-center gap-2.5 tracking-[1px]">
                  <input
                    type="checkbox"
                    checked={asGift}
                    onChange={(event) => setAsGift(event.target.checked)}
                    className="size-[17px] cursor-pointer appearance-none border border-black bg-white checked:bg-black checked:shadow-[inset_0_0_0_2px_#fff]"
                  />
                  I want to send this as a gift
                </label>
              ) : null}

              <button
                type="button"
                onClick={addToBag}
                aria-disabled={current !== null && !current.available}
                aria-live="polite"
                className={cn(
                  product.giftCard ? "mt-8" : "mt-5",
                  "flex h-10 w-full items-center justify-center border border-black bg-black px-4 tracking-[1.2px] text-white uppercase tab:w-[calc(100%-2px)]",
                  current && !current.available ? "cursor-default" : "cursor-pointer",
                )}
              >
                {buttonLabel}
              </button>

              <p className="mt-[9px] text-center text-[11px] leading-[18px] tracking-[1px]">
                or 4 payments of ${(price / 4).toFixed(2)} USD with{" "}
                <span className="text-[12px] tracking-[0.5px]">Sezzle</span>{" "}
                <span aria-hidden="true">ⓘ</span>
              </p>

              {!product.giftCard && product.description ? (
                <div className="mt-6">
                  <h2 className="font-rc-med tracking-[1.2px] uppercase">Overview</h2>
                  <div className="rc-rte mt-2" dangerouslySetInnerHTML={{ __html: product.description }} />
                </div>
              ) : null}

              {rowTabs.length ? (
                <ul className="mt-6">
                  {rowTabs.map((t) => (
                    <li key={t.key}>
                      <button
                        type="button"
                        onClick={() => setTab(t.key)}
                        aria-haspopup="dialog"
                        className="flex cursor-pointer items-center gap-1.5 py-[5px] tracking-[1px]"
                      >
                        {t.label}
                        <PlusIcon className="size-2" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <ProductTabsDrawer
        title={product.title}
        tabs={product.tabs}
        active={tab}
        onSelect={setTab}
        onClose={() => setTab(null)}
        sizeGuide={guideData}
      />
      <BagDrawer open={bagOpen} onClose={() => setBagOpen(false)} />
    </>
  );
}

/** Size guide rows are keyed by the abbreviated label ("M", "32"). */
function sizeKey(value: OptionValue, guide: SizeGuideData) {
  return guide.sizes.find((s) => s.value === value.label || s.label === value.value)?.value ?? guide.initialSize;
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M10 1.5v17M1.5 10h17" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function EnvelopeIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 10 10" fill="none" className={className}>
      <rect x="0.75" y="2" width="8.5" height="6" stroke="currentColor" strokeWidth="0.8" />
      <path d="M0.9 2.2 5 5.4l4.1-3.2" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}
