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
    <header className="px-3 pt-10 pb-6 tab:px-8 tab:pt-14 tab:pb-8">
      {eyebrow ? <p className="st-micro text-[10px] text-graphite">{eyebrow}</p> : null}
      <h1 className="st-display mt-2 text-[34px] leading-[36px] tab:text-[56px] tab:leading-[58px]">{title}</h1>
      {children ? <div className="mt-3 max-w-[620px] text-[13px] leading-5 tab:text-[15px] tab:leading-6">{children}</div> : null}
    </header>
  );
}
