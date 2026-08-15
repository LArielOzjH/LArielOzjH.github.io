import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { assetPath } from "./asset-path";

const POSTS_DIR = path.join(process.cwd(), "content", "blog");

export type ReadingTime = {
  text: string;
  minutes: number;
  time: number;
  words: number;
};

export type TocItem = {
  depth: 2 | 3;
  id: string;
  title: string;
};

export type PostSummary = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  cover?: string;
  featured: boolean;
  draft: boolean;
  readingTime: ReadingTime;
};

export type Post = PostSummary & {
  content: string;
  toc: TocItem[];
};

type Frontmatter = {
  title?: string;
  description?: string;
  date?: string | Date;
  tags?: string[];
  cover?: string;
  featured?: boolean;
  draft?: boolean;
};

export function getAllPosts(): PostSummary[] {
  return readPosts()
    .filter((post) => !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      tags: post.tags,
      cover: post.cover,
      featured: post.featured,
      draft: post.draft,
      readingTime: post.readingTime
    }));
}

export function getPostSlugs(): string[] {
  return getAllPosts().map((post) => post.slug);
}

export function getPostBySlug(slug: string): Post {
  const post = readPosts().find((item) => item.slug === slug && !item.draft);

  if (!post) {
    throw new Error(`Post not found: ${slug}`);
  }

  return post;
}

export function extractToc(source: string): TocItem[] {
  return source
    .split("\n")
    .map((line) => /^(#{2,3})\s+(.+)$/.exec(line.trim()))
    .filter((match): match is RegExpExecArray => Boolean(match))
    .map((match) => {
      const title = match[2].replace(/\s+#*$/, "").trim();
      return {
        depth: match[1].length as 2 | 3,
        id: slugifyHeading(title),
        title
      };
    });
}

function readPosts(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.mdx?$/, "");
      const fullPath = path.join(POSTS_DIR, file);
      const parsed = matter(fs.readFileSync(fullPath, "utf8"));
      const data = parsed.data as Frontmatter;

      return {
        slug,
        title: requireString(data.title, "title", slug),
        description: requireString(data.description, "description", slug),
        date: normalizeDate(data.date, slug),
        tags: Array.isArray(data.tags) ? data.tags : [],
        cover: data.cover,
        featured: Boolean(data.featured),
        draft: Boolean(data.draft),
        readingTime: readingTime(parsed.content),
      content: rewriteContentAssetPaths(parsed.content.trim()),
      toc: extractToc(parsed.content)
      };
    });
}

function requireString(value: unknown, field: string, slug: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Post ${slug} missing frontmatter field: ${field}`);
  }

  return value;
}

function normalizeDate(value: Frontmatter["date"], slug: string): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  throw new Error(`Post ${slug} must use YYYY-MM-DD frontmatter date`);
}

function slugifyHeading(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function rewriteContentAssetPaths(content: string) {
  return content.replace(
    /(src|poster)=["'](\/(?!\/)[^"']+\.(?:avif|gif|jpe?g|png|svg|webp))["']/gi,
    (_match, attr: string, src: string) => `${attr}="${assetPath(src)}"`
  );
}
