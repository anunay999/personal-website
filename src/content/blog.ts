const postModules = import.meta.glob("./blog/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  read: string;
  tag: string;
  excerpt: string;
  content: string;
}

interface BlogFrontmatter {
  title?: string;
  date?: string;
  read?: string;
  tag?: string;
  excerpt?: string;
  slug?: string;
}

function getSlug(path: string, frontmatterSlug?: string) {
  if (frontmatterSlug) return frontmatterSlug;
  const fileName = path.split("/").pop() ?? "";
  return fileName.replace(/\.md$/, "");
}

function parseFrontmatter(source: string) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return { data: {} as BlogFrontmatter, content: source.trim() };
  }

  const [, rawFrontmatter, content] = match;
  const data: BlogFrontmatter = {};

  rawFrontmatter.split("\n").forEach((line) => {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) return;

    const key = line.slice(0, separatorIndex).trim() as keyof BlogFrontmatter;
    const value = line.slice(separatorIndex + 1).trim();
    if (value) {
      data[key] = value;
    }
  });

  return { data, content: content.trim() };
}

function parsePost(path: string, source: string): BlogPost {
  const { data: frontmatter, content } = parseFrontmatter(source);
  const slug = getSlug(path, frontmatter.slug);

  if (!frontmatter.title || !frontmatter.date || !frontmatter.read || !frontmatter.tag || !frontmatter.excerpt) {
    throw new Error(`Missing required frontmatter in blog post: ${path}`);
  }

  return {
    slug,
    title: frontmatter.title,
    date: frontmatter.date,
    read: frontmatter.read,
    tag: frontmatter.tag,
    excerpt: frontmatter.excerpt,
    content: content.trim(),
  };
}

export const blogPosts = Object.entries(postModules)
  .map(([path, source]) => parsePost(path, source))
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
