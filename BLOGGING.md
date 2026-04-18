# Publishing Blogs

Add a new Markdown file in `src/content/blog/`.

Use this frontmatter:

```md
---
title: Your Post Title
date: 2026-04-18
read: 5 min
tag: product
excerpt: One short summary line for the blog list.
slug: your-post-slug
---

Write the post in Markdown here.
```

Then run:

```bash
npm run dev
```

Your post will appear automatically in:
- the home page `LATEST` section
- the `Writing` page
- the terminal `blog` command

When you're ready:

```bash
npm run build
```
