import { AnnouncementBar } from "./home-sections";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/** Announcement bar + header + footer around a page. `overlay` lets the header sit on a dark hero. */
export function StoreShell({ children, overlay = false }: { children: React.ReactNode; overlay?: boolean }) {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader overlay={overlay} />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}

export function PageHeading({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <header className="px-3 pt-6 pb-6 tab:px-8 tab:pt-9 tab:pb-8">
      {eyebrow ? <p className="text-[9px] leading-[13.5px] st-label text-graphite tab:text-[12px] tab:leading-[18px]">{eyebrow}</p> : null}
      <h1 className="mt-1 st-heading text-[12px] leading-[18px] tab:text-[16px] tab:leading-6">{title}</h1>
      {children ? <div className="mt-2 max-w-[620px] text-[12px] leading-[18px] tab:text-[16px] tab:leading-6">{children}</div> : null}
    </header>
  );
}
