# anunay.dev

My personal website — a small OS-themed React app with a sidebar of "apps"
(Home, Projects, Writing, About, Links) and a faux terminal that runs a
`claude` command backed by Google Gemini.

**Live demo:** [anunay.dev](https://anunay.dev)

## Stack

- [Vite](https://vitejs.dev/) + [React 19](https://react.dev/) + TypeScript
- WebGL shader background (`src/shaders/`)
- Markdown blog posts via `react-markdown` + `remark-gfm`
- `@google/genai` for the in-terminal `claude` command (Google AI Studio)
- Deployed as a static site (custom domain via `public/CNAME`)

## Project structure

```
src/
  apps/          # Home, Projects, Blog, About, Links, Terminal
  shell/         # OS window chrome — sidebar, header, mobile nav, shader canvas
  content/blog/  # Markdown posts (see BLOGGING.md)
  hooks/         # Small React hooks (e.g. useMediaQuery)
  shaders/       # WebGL shader + runner
  siteData.ts    # Profile, projects, links, "now" — single source of truth
  claude.ts      # Gemini-backed terminal command + rate limiting
  theme.ts       # Tokens + shared styles
public/
  CNAME          # anunay.dev
  manifest.json
  robots.txt
```

## Getting started

Requires Node 20+ and npm.

```bash
npm install
cp .env.example .env.local   # then fill in VITE_GEMINI_API_KEY
npm run dev                  # http://localhost:3000
```

### Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check and build to `dist/`
- `npm run preview` — preview the production build

## Environment

Copy `.env.example` to `.env.local` and set:

- `VITE_GEMINI_API_KEY` — Google AI Studio API key for the terminal `claude`
  command. Create one at <https://aistudio.google.com/apikey>.

> The key ships in the client bundle. Lock it down with a strict spend cap and
> HTTP referrer restrictions in Google AI Studio.

If the key is missing, the site still works — only the `claude` terminal
command will surface a friendly error.

## Editing content

Profile, projects, "now" notes and links all live in
[`src/siteData.ts`](src/siteData.ts). Edit them in one place and they propagate
across every screen and the terminal.

### Writing a blog post

See [BLOGGING.md](./BLOGGING.md). TL;DR — drop a Markdown file in
`src/content/blog/` with frontmatter:

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

It will appear automatically on the home page, the Writing app, and the
terminal `blog` command.

## Deployment

The site builds to a static `dist/` directory and is served from the custom
domain in `public/CNAME` (`anunay.dev`). Any static host works — point the
build output at your provider of choice.

## Forking & credits

Feel free to fork this repo as a starting point for your own site. If you do,
please:

- Swap out the personal content in `src/siteData.ts`, `public/CNAME`, the
  profile image, and the blog posts so it represents *you*, not me.
- Keep a visible credit back to this project — e.g. a "based on
  [anunay.dev](https://github.com/anunay999/personal-website) by Anunay
  Aatipamula" line in your README or site footer.

## License

[MIT](./LICENSE)
