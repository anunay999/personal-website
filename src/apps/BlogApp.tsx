import type { CSSProperties } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { blogPosts, type BlogPost } from "../content/blog";
import { Header } from "../shell/Header";
import { F, T } from "../theme";

export function BlogApp({
  openPost,
  onOpenPost,
  isMobile,
}: {
  openPost: BlogPost | null;
  onOpenPost: (post: BlogPost | null) => void;
  isMobile: boolean;
}) {
  if (openPost) {
    return <PostView post={openPost} onBack={() => onOpenPost(null)} isMobile={isMobile} />;
  }

  return (
    <div
      className="app-screen-scroll"
      style={{ padding: isMobile ? "24px 18px 32px" : "40px 48px" }}
    >
      <Header
        eyebrow="workspace / writing"
        title="Notes from the workbench"
        subtitle="Occasional long-form on systems, products, and thinking with computers."
      />
      <div style={{ marginTop: isMobile ? 24 : 40, display: "flex", flexDirection: "column" }}>
        {blogPosts.map((post) => (
          <button
            key={post.slug}
            onClick={() => onOpenPost(post)}
            style={{
              textAlign: "left",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "inherit",
              padding: isMobile ? "22px 0" : "28px 0",
              borderBottom: `1px solid ${T.hair}`,
              display: isMobile ? "flex" : "grid",
              flexDirection: isMobile ? "column" : undefined,
              gridTemplateColumns: isMobile ? undefined : "100px 1fr auto",
              gap: isMobile ? 10 : 28,
              alignItems: isMobile ? "stretch" : "baseline",
            }}
          >
            <span
              style={{
                fontFamily: F.mono,
                fontSize: 11,
                color: T.inkFaint,
                letterSpacing: "0.04em",
              }}
            >
              {post.date}
            </span>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                <span
                  style={{
                    fontFamily: F.mono,
                    fontSize: 9,
                    color: T.accent,
                    border: "1px solid rgba(159,192,255,0.3)",
                    padding: "1px 6px",
                    borderRadius: 2,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  {post.tag}
                </span>
                <span style={{ fontFamily: F.mono, fontSize: 10, color: T.inkFaint }}>{post.read}</span>
              </div>
              <div
                style={{
                  fontFamily: F.serif,
                  fontSize: isMobile ? 22 : 26,
                  color: T.ink,
                  lineHeight: 1.18,
                  marginBottom: 8,
                  letterSpacing: "-0.01em",
                }}
              >
                {post.title}
              </div>
              <div
                style={{
                  fontFamily: F.text,
                  fontSize: isMobile ? 15 : 16,
                  color: T.inkDim,
                  lineHeight: 1.55,
                  maxWidth: 640,
                  fontFeatureSettings: "'kern' 1, 'liga' 1",
                }}
              >
                {post.excerpt}
              </div>
            </div>
            {!isMobile && <span style={{ fontFamily: F.mono, fontSize: 16, color: T.inkFaint }}>→</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

/* Pull a YouTube video id out of a paragraph node IF that paragraph contains
   exactly one child — a single link to a YouTube URL. Returns null otherwise,
   so normal paragraphs render as paragraphs. Supports `youtube.com/watch?v=`,
   `youtu.be/`, and `youtube.com/embed/` URL shapes. */
function extractYouTubeId(node: unknown): string | null {
  if (!node || typeof node !== "object") return null;
  const n = node as { children?: Array<{ tagName?: string; properties?: { href?: string } }> };
  const children = n.children ?? [];
  if (children.length !== 1) return null;
  const only = children[0];
  if (only.tagName !== "a") return null;
  const href = only.properties?.href;
  if (!href) return null;
  try {
    const url = new URL(href);
    if (url.hostname === "youtu.be") {
      return url.pathname.slice(1).split("/")[0] || null;
    }
    if (url.hostname === "youtube.com" || url.hostname === "www.youtube.com" || url.hostname === "m.youtube.com") {
      const v = url.searchParams.get("v");
      if (v) return v;
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0] === "embed" && parts[1]) return parts[1];
      if (parts[0] === "shorts" && parts[1]) return parts[1];
    }
  } catch {
    return null;
  }
  return null;
}

function PostView({ post, onBack, isMobile }: { post: BlogPost; onBack: () => void; isMobile: boolean }) {
  /* Reading-grade body type. Source Serif 4 is optically-sized for long-form
     screen reading — much easier on the eyes than the display-cut serif we
     use for titles. Slightly larger size + generous leading + a tighter
     measure (~65ch) yields a comfortable reading rhythm. */
  const bodyFont = isMobile ? 17.5 : 19;
  const bodyLeading = 1.7;
  const bodyStyle: CSSProperties = {
    fontFamily: F.text,
    fontSize: bodyFont,
    lineHeight: bodyLeading,
    color: T.ink,
    fontWeight: 400,
    letterSpacing: "0.005em",
    fontFeatureSettings: "'kern' 1, 'liga' 1, 'onum' 1",
  };

  return (
    <div
      className="app-screen-scroll"
      style={{ padding: isMobile ? "20px 22px 40px" : "40px 56px 64px" }}
    >
      <article style={{ maxWidth: 720, margin: "0 auto" }}>
        <button
          onClick={onBack}
          style={{
            background: "transparent",
            border: `1px solid ${T.hairBright}`,
            color: T.inkDim,
            cursor: "pointer",
            padding: "5px 12px",
            borderRadius: 3,
            fontFamily: F.mono,
            fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: isMobile ? 24 : 36,
          }}
        >
          ← writing
        </button>

        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
          <span style={{ fontFamily: F.mono, fontSize: 11, color: T.inkFaint }}>{post.date}</span>
          <span
            style={{
              fontFamily: F.mono,
              fontSize: 9,
              color: T.accent,
              border: "1px solid rgba(159,192,255,0.3)",
              padding: "1px 6px",
              borderRadius: 2,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {post.tag}
          </span>
          <span style={{ fontFamily: F.mono, fontSize: 10, color: T.inkFaint }}>· {post.read}</span>
        </div>

        <h1
          style={{
            fontFamily: F.serif,
            fontSize: isMobile ? "clamp(30px, 7.5vw, 40px)" : "clamp(40px, 5vw, 52px)",
            lineHeight: 1.05,
            fontWeight: 400,
            color: T.ink,
            margin: isMobile ? "0 0 28px" : "0 0 40px",
            letterSpacing: "-0.015em",
          }}
        >
          {post.title}
        </h1>

        <div style={{ color: T.ink }}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children, node }) => {
                /* Auto-embed: when a paragraph is just a single YouTube link
                   (or a link-with-the-URL-as-text), render it as an iframe
                   instead of a paragraph. Lets posts drop in a video by
                   pasting the URL on its own line — no raw HTML, no extra
                   markdown extensions, sandboxed via the iframe. */
                const youTubeId = extractYouTubeId(node);
                if (youTubeId) {
                  return (
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "16 / 9",
                        margin: "0 0 1.6em",
                        borderRadius: 8,
                        overflow: "hidden",
                        background: "#000",
                        border: `1px solid ${T.hair}`,
                      }}
                    >
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${youTubeId}`}
                        title="YouTube video"
                        loading="lazy"
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        referrerPolicy="strict-origin-when-cross-origin"
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          border: 0,
                        }}
                      />
                    </div>
                  );
                }
                return <p style={{ ...bodyStyle, margin: "0 0 1.4em" }}>{children}</p>;
              },
              strong: ({ children }) => (
                <strong style={{ color: T.ink, fontWeight: 600 }}>{children}</strong>
              ),
              em: ({ children }) => (
                <em style={{ color: T.ink, fontStyle: "italic" }}>{children}</em>
              ),
              code: ({ children }) => (
                <code
                  style={{
                    fontFamily: F.mono,
                    fontSize: "0.86em",
                    background: "rgba(159,192,255,0.08)",
                    padding: "1px 6px",
                    borderRadius: 3,
                    color: T.accent,
                    wordBreak: "break-word",
                  }}
                >
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre
                  style={{
                    fontFamily: F.mono,
                    fontSize: 13,
                    lineHeight: 1.6,
                    background: "rgba(0,0,0,0.35)",
                    border: `1px solid ${T.hair}`,
                    borderRadius: 6,
                    padding: "16px 18px",
                    margin: "0 0 1.6em",
                    overflow: "auto",
                    color: T.ink,
                  }}
                >
                  {children}
                </pre>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: T.accent,
                    textDecoration: "underline",
                    textDecorationColor: "rgba(159,192,255,0.35)",
                    textUnderlineOffset: "0.2em",
                    textDecorationThickness: "1px",
                    wordBreak: "break-word",
                  }}
                >
                  {children}
                </a>
              ),
              img: ({ src, alt }) => (
                <img
                  src={typeof src === "string" ? src : undefined}
                  alt={alt ?? ""}
                  loading="lazy"
                  style={{
                    display: "block",
                    width: "100%",
                    height: "auto",
                    borderRadius: 8,
                    border: `1px solid ${T.hair}`,
                    margin: "0 0 1.6em",
                    background: "#000",
                  }}
                />
              ),
              ul: ({ children }) => (
                <ul style={{ ...bodyStyle, margin: "0 0 1.4em", paddingLeft: 24 }}>{children}</ul>
              ),
              ol: ({ children }) => (
                <ol style={{ ...bodyStyle, margin: "0 0 1.4em", paddingLeft: 24 }}>{children}</ol>
              ),
              li: ({ children }) => <li style={{ marginBottom: "0.5em" }}>{children}</li>,
              blockquote: ({ children }) => (
                <blockquote
                  style={{
                    margin: "0 0 1.4em",
                    padding: "0.1em 0 0.1em 18px",
                    borderLeft: `2px solid ${T.accent}`,
                    color: T.inkDim,
                    fontStyle: "italic",
                    fontFamily: F.text,
                    fontSize: bodyFont,
                    lineHeight: bodyLeading,
                  }}
                >
                  {children}
                </blockquote>
              ),
              hr: () => (
                <hr
                  style={{
                    border: "none",
                    borderTop: `1px solid ${T.hair}`,
                    margin: "2.4em 0",
                  }}
                />
              ),
              h2: ({ children }) => (
                <h2
                  style={{
                    fontFamily: F.serif,
                    fontSize: isMobile ? 26 : 30,
                    fontWeight: 400,
                    margin: "1.8em 0 0.6em",
                    color: T.ink,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.2,
                  }}
                >
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3
                  style={{
                    fontFamily: F.serif,
                    fontSize: isMobile ? 21 : 23,
                    fontWeight: 400,
                    margin: "1.6em 0 0.5em",
                    color: T.ink,
                    letterSpacing: "-0.005em",
                    lineHeight: 1.25,
                  }}
                >
                  {children}
                </h3>
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
