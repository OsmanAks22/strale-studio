import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlog } from "@/components/sites/reigningchamp/catalog";
import { RelatedArticles } from "@/components/sites/reigningchamp/content/blog-card";
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
  const blog = getBlog();
  const post = blog.posts[article];
  if (!post) notFound();

  // Every source article ends with "The Intermission" strip; add it where the snapshot did not capture one.
  const hasStrip = post.sections.some((s) => s.type === "html" && s.source === "featured_blog");
  return (
    <article>
      <PageSections sections={post.sections} handle={article} variant="article" />
      {hasStrip ? null : <RelatedArticles articles={blog.articles.filter((a) => a.handle !== article).slice(0, 3)} />}
    </article>
  );
}
