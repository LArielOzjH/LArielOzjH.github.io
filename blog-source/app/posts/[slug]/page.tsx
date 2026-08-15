import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { ArticleShell } from "@/components/article-shell";
import { mdxComponents } from "@/components/mdx-components";
import { rehypeAssetPath } from "@/lib/rehype-asset-path";
import { rehypeCjkText } from "@/lib/rehype-cjk-text";
import { getPostBySlug, getPostSlugs } from "@/lib/posts";

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const post = getPostBySlug(slug);
    return {
      title: post.title,
      description: post.description
    };
  } catch {
    return {};
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let post;

  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  const { content } = await compileMDX({
    source: post.content,
    components: {
      ...mdxComponents,
      MarginNote: ({ children }: { children: React.ReactNode }) => (
        <aside className="margin-note">{children}</aside>
      )
    },
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "wrap"
            }
          ],
          rehypeKatex,
          rehypeCjkText,
          rehypeAssetPath,
          [
            rehypePrettyCode,
            {
          theme: "vitesse-light",
              keepBackground: false
            }
          ]
        ]
      }
    }
  });

  return <ArticleShell post={post}>{content}</ArticleShell>;
}
