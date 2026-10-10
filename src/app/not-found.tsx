import Link from "next/link";
import { StraleMarkTwin } from "@/components/sites/strale/icons";
import { StoreShell } from "@/components/sites/strale/store-shell";

export default function NotFound() {
  return (
    <StoreShell>
      <div className="flex min-h-[60dvh] flex-col items-center justify-center px-3 py-24 text-center tab:px-8">
        <StraleMarkTwin className="h-6 w-[30px] fill-rust" />
        <h1 className="st-display mt-6 text-[34px] leading-[36px] tab:text-[56px] tab:leading-[58px]">Sayfa Bulunamadı</h1>
        <p className="mt-4 max-w-[420px] text-[13px] leading-5 tab:text-[16px] tab:leading-6">
          Aradığın sayfa kaldırılmış ya da ürün tükenmiş olabilir. Stoktaki diğer parçalara göz at.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-6">
          <Link href="/koleksiyonlar/tumu" className="st-label st-underline">
            Tüm Ürünler
          </Link>
          <Link href="/" className="st-label st-underline">
            Ana Sayfa
          </Link>
        </div>
      </div>
    </StoreShell>
  );
}
