"use client";

import Image from "next/image";
import Link from "next/link";
import { WishlistSmallIcon } from "../icons";
import { cart, useCart, wishlist } from "../stores";
import { Drawer } from "./drawer";

const money = (amount: number) => `$${amount.toFixed(2)}`;

/** Mini bag that slides in after "Add to Bag", like the source's cart drawer. */
export function BagDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lines, count, subtotal } = useCart();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      label="Bag"
      header={
        <p className="flex items-center gap-2 font-rc-med tracking-[1.2px] uppercase">
          <span className="relative inline-flex size-5 items-center justify-center">
            <svg aria-hidden="true" viewBox="0 0 20 20" className="absolute inset-0 size-5">
              <path d="M6.25 5.5V4.375a3.75 3.75 0 0 1 7.5 0V5.5" fill="none" stroke="currentColor" strokeWidth="1.25" />
              <path d="M1.25 5h17.5v12.5a2.5 2.5 0 0 1-2.5 2.5H3.75a2.5 2.5 0 0 1-2.5-2.5z" fill="currentColor" />
            </svg>
            <span className="relative top-[3px] font-rc text-[8px] leading-none tracking-normal text-white">{count}</span>
          </span>
          Bag
        </p>
      }
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-3 tab:px-6">
        {lines.length === 0 ? (
          <p className="py-6">Your bag is empty.</p>
        ) : (
          <ul>
            {lines.map((line) => (
              <li key={line.variantId} className="flex gap-3 border-b border-[#e6e6e6] py-4 first:pt-0">
                <Link
                  href={`/products/${line.handle}`}
                  onClick={onClose}
                  className="relative aspect-[4/5] w-[120px] shrink-0 bg-[#f2f2f2] tab:w-[168px]"
                >
                  {line.image ? (
                    <Image src={line.image} alt={line.title} fill sizes="168px" className="object-cover" />
                  ) : null}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col text-[9px] leading-[13.5px] tab:text-[9px]">
                  <Link
                    href={`/products/${line.handle}`}
                    onClick={onClose}
                    className="pt-2 tracking-[1.2px] uppercase"
                  >
                    {line.title}
                  </Link>
                  <p className="mt-2.5 tracking-[1.2px] uppercase">
                    {line.quantity} x {money(line.price)}
                  </p>
                  <div className="mt-auto pt-6">
                    {line.colour ? <p className="capitalize">{line.colour}</p> : null}
                    {line.size ? <p className="mt-0.5">{line.size}</p> : null}
                  </div>
                  <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        wishlist.toggle({ handle: line.handle, title: line.title, price: line.price, image: line.image });
                        cart.remove(line.variantId);
                      }}
                      className="inline-flex cursor-pointer items-center gap-1 rc-underline"
                    >
                      <WishlistSmallIcon className="size-[9px]" />
                      Move to Wishlist
                    </button>
                    <button type="button" onClick={() => cart.remove(line.variantId)} className="cursor-pointer rc-underline">
                      Remove Item
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="shrink-0 px-3 pt-4 pb-3 tab:px-6">
        <p className="font-rc-med tracking-[1.2px] uppercase">Subtotal</p>
        <p className="mt-1 flex justify-between tracking-[1.2px] uppercase">
          <span>{count} Item(s)</span>
          <span>{money(subtotal)} USD</span>
        </p>
        <Link
          href="/cart"
          onClick={onClose}
          className="mt-6 flex h-10 items-center justify-center border border-black bg-black tracking-[1.2px] text-white uppercase"
        >
          Checkout
        </Link>
        <Link
          href="/cart"
          onClick={onClose}
          className="mt-1.5 flex h-10 items-center justify-center border border-black bg-white tracking-[1.2px] uppercase"
        >
          View Bag
        </Link>
      </div>
    </Drawer>
  );
}
