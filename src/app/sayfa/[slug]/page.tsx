import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { contentPages } from "@/components/sites/strale/content-pages";
import { PageHeading, StoreShell } from "@/components/sites/strale/store-shell";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(contentPages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = contentPages[(await params).slug];
  return page ? { title: page.title, description: page.description } : {};
}

export default async function ContentPageRoute({ params }: Props) {
  const page = contentPages[(await params).slug];
  if (!page) notFound();

  return (
    <StoreShell>
      <PageHeading eyebrow={page.eyebrow} title={page.title} />
      <article className="max-w-[760px] px-3 pb-16 text-[14px] leading-[22px] tab:px-8 tab:text-[15px] tab:leading-6">
        {page.legal ? (
          <p className="mb-8 border-l-2 border-rust bg-stone px-4 py-3 text-[13px]">
            Bu metin taslaktır; yayın öncesi firma bilgileriyle tamamlanmalı ve bir hukukçu tarafından kontrol
            edilmelidir.
          </p>
        ) : null}
        {page.body}
      </article>
    </StoreShell>
  );
}
