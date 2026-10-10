import Image from "next/image";
import { cn } from "@/lib/utils";
import { type Product } from "./catalog";
import { StraleMarkTwin } from "./icons";

/** 4:5 product photo; until a photo is uploaded, a branded placeholder keeps the grid intact. */
export function ProductImage({
  product,
  sizes,
  priority = false,
  className,
}: {
  product: Product;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("relative block aspect-[4/5] overflow-hidden bg-stone", className)}>
      {product.image ? (
        <Image src={product.image} alt={product.name} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sand">
          <StraleMarkTwin className="h-8 w-10 fill-current" />
          <span className="st-micro text-[9px] text-graphite tab:text-[10px]">Fotoğraf yakında</span>
        </span>
      )}
    </span>
  );
}
