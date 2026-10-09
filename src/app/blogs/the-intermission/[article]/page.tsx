import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlog } from "@/components/sites/reigningchamp/catalog";
import { PageSections } from "@/components/sites/reigningchamp/content/page-sections";

type Props = { params: Promise<{ article: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(getBlog().posts).map((article) => ({ article }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { article } = await params;
  const post = getBlog().posts[article];
  return post ? { title: post.title } : {};
}

export default async function ArticlePage({ params }: Props) {
  const { article } = await params;
  const post = getBlog().posts[article];
  if (!post) notFound();

  return (
    <article>
      <PageSections sections={post.sections} handle={article} variant="article" />
    </article>
  );
}
