import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPages } from "@/components/sites/reigningchamp/catalog";
import { PageSections } from "@/components/sites/reigningchamp/content/page-sections";

type Props = { params: Promise<{ handle: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(getPages()).map((handle) => ({ handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const page = getPages()[handle];
  return page ? { title: page.title } : {};
}

export default async function ContentPage({ params }: Props) {
  const { handle } = await params;
  const page = getPages()[handle];
  if (!page) notFound();

  return <PageSections sections={page.sections} handle={handle} />;
}
