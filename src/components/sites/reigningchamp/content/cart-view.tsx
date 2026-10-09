"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { CloseIcon } from "../icons";
import { cart, useCart, wishlist, type CartLine } from "../stores";

const FREE_SHIPPING = 50;
const money = (amount: number) => `$${amount.toFixed(2)}`;

/** /cart ("BAG"): line items on the left, grey SUMMARY panel on the right. */
export function CartView({ departments }: { departments: Record<string, string> }) {
  const { lines, count, subtotal } = useCart();
  const [notice, setNotice] = useState(false);
  const remaining = FREE_SHIPPING - subtotal;

  return (
    <div className="px-3 pt-3 pb-3 tab:px-8">
      <h1 className="font-rc-cond text-[32px] leading-10 tracking-[1.5px] uppercase tab:text-[48px] tab:leading-[60px] tab:tracking-[1px]">
        Bag
      </h1>
      <div className="mt-6 tab:mt-11 desk:flex desk:items-start desk:gap-6">
        <div className="min-w-0 desk:flex-1">
          {lines.length === 0 ? (
            <div className="pt-[9px]">
              <p>Your bag is currently empty.</p>
              <Link href="/collections/mens-latest" className="rc-underline mt-1.5 inline-block">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-6" aria-label="Bag items">
              {lines.map((line) => (
                <CartItem key={line.variantId} line={line} department={departments[line.handle]} />
              ))}
            </ul>
          )}
        </div>

        <section
          aria-labelledby="cart-summary"
          className="mt-[51px] bg-[#efefef] px-3 py-6 desk:mt-0 desk:w-[435px] desk:shrink-0"
        >
          <h2 id="cart-summary" className="font-rc-med tracking-[1.2px] uppercase">
            Summary
          </h2>
          <p className="mt-3 flex justify-between tracking-[1.2px] uppercase">
            <span>Bag Total</span>
            <span>{money(subtotal)} USD</span>
          </p>
          <p className="mt-3 text-[9px] leading-[13.5px] tracking-[1.2px] text-[#808080] uppercase">
            {subtotal > 0 && remaining > 0
              ? `Spend ${money(remaining)} more for free shipping`
              : subtotal > 0
                ? "You qualify for free shipping"
                : "Free shipping on orders over $50.00+"}
          </p>
          {subtotal > 0 ? (
            <div
              role="progressbar"
              aria-label="Progress to free shipping"
              aria-valuemin={0}
              aria-valuemax={FREE_SHIPPING}
              aria-valuenow={Math.min(subtotal, FREE_SHIPPING)}
              className="mt-2 h-0.5 bg-[#d9d9d9]"
            >
              <div className="h-full bg-black" style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING) * 100)}%` }} />
            </div>
          ) : null}
          <hr className="mt-6 border-[#bfbfbf]" />
          <h2 className="mt-6 font-rc-med tracking-[1.2px] uppercase">Subtotal</h2>
          <p className="mt-2 flex justify-between tracking-[1.2px] uppercase">
            <span>{count} Item(s)</span>
            <span>{money(subtotal)} USD</span>
          </p>
          <button
            type="button"
            disabled={lines.length === 0}
            onClick={() => setNotice(true)}
            className="mt-6 flex h-10 w-full cursor-pointer items-center justify-center border border-black bg-black px-4 tracking-[1.2px] text-white uppercase disabled:cursor-default disabled:border-[#ccc] disabled:bg-transparent disabled:text-[#ccc]"
          >
            Checkout
          </button>
        </section>
      </div>
      {notice ? <CheckoutNotice onClose={() => setNotice(false)} /> : null}
    </div>
  );
}

function CartItem({ line, department }: { line: CartLine; department?: string }) {
  const href = `/products/${line.handle}`;
  const options = [line.colour, line.size].filter((v): v is string => !!v);

  return (
    <li className="flex gap-2">
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="relative aspect-[4/5] w-[179px] shrink-0 bg-[#f2f2f2] tab:w-[240px]"
      >
        {line.image ? <Image src={line.image} alt="" fill sizes="240px" className="object-cover" /> : null}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col pt-[8px] text-[9px] leading-[13.5px] tab:text-[12px] tab:leading-[18px]">
        <div className="tab:flex tab:items-start tab:justify-between tab:gap-4">
          <div className="min-w-0">
            <p className="h-[13.5px] text-[9px] leading-[13.5px] tracking-[1.2px] text-[#808080] uppercase">
              {department ?? ""}
            </p>
            <Link href={href} className="mt-2 block tracking-[1.2px] uppercase">
              {line.title}
            </Link>
            <p className="mt-2 tracking-[1.2px] uppercase">
              {line.quantity} x {money(line.price)}
            </p>
            {options.length ? (
              <dl className="mt-3.5 tab:mt-[54px]">
                {line.colour ? (
                  <div>
                    <dt className="sr-only">Colour:</dt>
                    <dd>{line.colour}</dd>
                  </div>
                ) : null}
                {line.size ? (
                  <div className="tab:mt-0.5">
                    <dt className="sr-only">Size:</dt>
                    <dd>{line.size}</dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
          </div>
          <Quantity line={line} />
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 tab:justify-start">
          <button
            type="button"
            onClick={() => {
              wishlist.toggle({ handle: line.handle, title: line.title, price: line.price, image: line.image });
              cart.remove(line.variantId);
            }}
            className="flex cursor-pointer items-center gap-1"
          >
            <svg aria-hidden="true" viewBox="0 0 9 9" className="size-[9px]">
              <path d="M1.625.5h5.75v7.5L4.5 6 1.625 8z" fill="none" stroke="currentColor" />
            </svg>
            <span className="rc-underline">Move to Wishlist</span>
          </button>
          <button type="button" onClick={() => cart.remove(line.variantId)} className="rc-underline cursor-pointer">
            Remove Item
          </button>
        </div>
      </div>
    </li>
  );
}

function Quantity({ line }: { line: CartLine }) {
  const label = `quantity for ${line.title}`;
  return (
    <div className="mt-[15px] inline-flex h-9 w-[60px] items-center border border-black tab:mt-[13px] tab:shrink-0">
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        onClick={() => cart.setQuantity(line.variantId, line.quantity - 1)}
        className="flex h-full w-5 cursor-pointer items-center justify-center"
      >
        <svg aria-hidden="true" viewBox="0 0 12 12" className="size-3">
          <path d="M1 6h10" stroke="currentColor" strokeWidth="0.75" />
        </svg>
      </button>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        aria-label={`Quantity ${label}`}
        value={line.quantity}
        onChange={(event) => {
          const value = Number.parseInt(event.target.value, 10);
          if (Number.isFinite(value) && value >= 0) cart.setQuantity(line.variantId, value);
        }}
        className="h-full w-5 [appearance:textfield] bg-transparent text-center text-[12px] leading-3 outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label={`Increase ${label}`}
        onClick={() => cart.setQuantity(line.variantId, line.quantity + 1)}
        className="flex h-full w-5 cursor-pointer items-center justify-center"
      >
        <svg aria-hidden="true" viewBox="0 0 12 12" className="size-3">
          <path d="M1 6h10M6 1v10" stroke="currentColor" strokeWidth="0.75" />
        </svg>
      </button>
    </div>
  );
}

/** There is no Shopify checkout behind the clone, so the button explains that instead of failing silently. */
function CheckoutNotice({ onClose }: { onClose: () => void }) {
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    close.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-notice"
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-[420px] bg-white p-6 pt-8"
      >
        <button
          ref={close}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-2 right-2 flex size-10 cursor-pointer items-center justify-center"
        >
          <CloseIcon className="size-4" />
        </button>
        <h2 id="checkout-notice" className="font-rc-med tracking-[1.2px] uppercase">
          Checkout unavailable
        </h2>
        <p className="mt-3">
          This is a design clone of reigningchamp.com, so there is no checkout. Your bag is saved in this
          browser only and no order or payment can be placed.
        </p>
        <button
          type="button"
          onClick={onClose}
          className={cn("mt-6 flex h-10 w-full cursor-pointer items-center justify-center bg-black tracking-[1.2px] text-white uppercase")}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
