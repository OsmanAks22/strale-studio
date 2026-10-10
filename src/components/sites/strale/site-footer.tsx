import Link from "next/link";
import { Fragment } from "react";
import { footerColumns, legalLinks } from "./data";
import { InstagramIcon, WhatsAppIcon } from "./icons";
import { siteConfig, whatsappLink } from "./site-config";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-bone">
      <div className="px-3 pt-6 pb-12 tab:flex tab:justify-between tab:gap-6 tab:px-8 tab:pt-12">
        <div className="min-w-0 tab:flex tab:gap-6">
          {footerColumns.map((column, index) => (
            <div key={column.heading} className={index === 0 ? "mb-11 tab:mb-0 tab:w-[235px] tab:shrink-0" : "tab:min-w-0"}>
              <h2 className="st-micro text-[9px] leading-[13.5px] text-ash tab:text-[10px]">{column.heading}</h2>
              <ul className="mt-5 flex flex-col gap-4">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="st-label st-hover-underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <ContactBlock />
      </div>
      <SubFooter />
    </footer>
  );
}

function ContactBlock() {
  const whatsapp = whatsappLink("Merhaba, bir ürün hakkında bilgi almak istiyorum.");
  return (
    <div className="mt-[71px] min-w-0 tab:mt-[3px] tab:max-w-[380px] tab:flex-1 tab:basis-[200px]">
      <h2 className="st-display text-[34px] leading-10">Sipariş & Destek</h2>
      <p className="mt-1.5">
        Sipariş, beden ve stok soruların için bize yaz. {siteConfig.hours}.
      </p>
      <ul className="mt-5 flex flex-col gap-3">
        {whatsapp ? (
          <li>
            <a href={whatsapp} target="_blank" rel="noreferrer" className="st-label inline-flex items-center gap-2 st-hover-underline">
              <WhatsAppIcon className="size-5" />
              WhatsApp ile Yaz
            </a>
          </li>
        ) : null}
        {siteConfig.phone ? (
          <li>
            <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`} className="st-hover-underline">
              {siteConfig.phone}
            </a>
          </li>
        ) : null}
        {siteConfig.email ? (
          <li>
            <a href={`mailto:${siteConfig.email}`} className="st-hover-underline">
              {siteConfig.email}
            </a>
          </li>
        ) : null}
        {siteConfig.instagram ? (
          <li>
            <a
              href={`https://www.instagram.com/${siteConfig.instagram}/`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 st-hover-underline"
            >
              <InstagramIcon className="size-5" fill="currentColor" />@{siteConfig.instagram}
            </a>
          </li>
        ) : null}
        <li>
          <Link href="/sayfa/iletisim" className="st-label st-underline">
            Tüm İletişim Bilgileri
          </Link>
        </li>
      </ul>
    </div>
  );
}

function SubFooter() {
  return (
    <div className="border-t border-smoke px-3 pt-[13px] pb-9 text-ash tab:flex tab:items-start tab:justify-between tab:gap-6 tab:px-8 tab:pt-4 tab:pb-12">
      <ul className="flex flex-wrap items-center gap-y-[9px] tab:shrink-0 tab:basis-[340px] desk:basis-auto">
        {legalLinks.map((link, index) => (
          <Fragment key={link.label}>
            {index > 0 ? <li aria-hidden="true" className="mx-1.5 h-3.5 w-px bg-ash" /> : null}
            <li>
              <Link href={link.href} className="st-underline">
                {link.label}
              </Link>
            </li>
          </Fragment>
        ))}
      </ul>
      <div className="mt-6 flex flex-col gap-6 tab:mt-0 tab:flex-row tab:items-center tab:gap-0">
        <p className="desk:whitespace-nowrap">© 2026 Strale. Tüm hakları saklıdır.</p>
        <span className="mx-1 hidden text-bone tab:inline">|</span>
        <span className="whitespace-nowrap text-bone">Teslimat: Türkiye</span>
      </div>
    </div>
  );
}
