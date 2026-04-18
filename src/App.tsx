import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { blogPosts, type BlogPost } from "./content/blog";
import { siteData, type LinkItem } from "./siteData";
import { neuralLatticeShader } from "./shaders/neuralLattice";
import { ShaderRunner, type ShaderDefinition } from "./shaders/runner";

const T = {
  desk: "#07080a",
  panelSolid: "#0e1014",
  ink: "#eceff4",
  inkDim: "#8a93a1",
  inkFaint: "#535b69",
  hair: "rgba(236,239,244,0.09)",
  hairBright: "rgba(236,239,244,0.2)",
  accent: "#9fc0ff",
  mint: "#8ce6c8",
};

const F = {
  mono: "'Geist Mono', ui-monospace, 'SF Mono', Menlo, monospace",
  serif: "'Instrument Serif', 'EB Garamond', Georgia, serif",
  sans: "'Inter', -apple-system, system-ui, sans-serif",
};

const SCENES = [
  { key: "lattice", name: "lattice", hint: "move to orbit · click to pulse · scroll for density" },
] as const;

const STORAGE_KEY = "anunay_site_app";
const SIDEBAR_AVATAR = 76;

type AppId = "home" | "projects" | "blog" | "about" | "links" | "terminal";

function ShaderCanvas<State extends object>({ shader }: { shader: ShaderDefinition<State> }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    shader.state = JSON.parse(JSON.stringify(shader.__defaults ?? (shader.__defaults = shader.state)));
    const runner = new ShaderRunner(ref.current, shader);
    return () => runner.destroy();
  }, [shader]);

  return (
    <canvas
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        touchAction: "none",
        display: "block",
      }}
    />
  );
}

function TitleBar({ segments }: { segments: string[] }) {
  return (
    <div
      style={{
        height: 36,
        flexShrink: 0,
        background: "linear-gradient(180deg, #1a1d23, #12151a)",
        borderBottom: `1px solid ${T.hair}`,
        display: "flex",
        alignItems: "center",
        padding: "0 14px",
        gap: 12,
        fontFamily: F.mono,
        fontSize: 11,
        letterSpacing: "0.03em",
      }}
    >
      <div style={{ display: "flex", gap: 8 }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((color) => (
          <span
            key={color}
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: color,
              boxShadow: "0 0 0 0.5px rgba(0,0,0,0.3)",
            }}
          />
        ))}
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
          color: T.inkDim,
        }}
      >
        {segments.map((segment, index) => (
          <span key={segment} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {index > 0 && <span style={{ color: T.inkFaint }}>／</span>}
            <span style={{ color: index === segments.length - 1 ? T.ink : T.inkDim }}>{segment}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function OSWindow({ children, titleSegments }: { children: ReactNode; titleSegments: string[] }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: `radial-gradient(ellipse at 30% 20%, #14161c 0%, transparent 60%), radial-gradient(ellipse at 80% 90%, #0e1419 0%, transparent 55%), ${T.desk}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(12px, 2vw, 28px)",
        fontFamily: F.sans,
        color: T.ink,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: `linear-gradient(${T.hair} 1px, transparent 1px), linear-gradient(90deg, ${T.hair} 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          maxWidth: 1480,
          maxHeight: 920,
          background: T.panelSolid,
          border: `1px solid ${T.hairBright}`,
          borderRadius: 10,
          boxShadow: "0 40px 120px rgba(0,0,0,0.65), 0 10px 30px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03) inset, 0 1px 0 rgba(255,255,255,0.05) inset",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TitleBar segments={titleSegments} />
        <div style={{ flex: 1, position: "relative", display: "flex", minHeight: 0 }}>{children}</div>
      </div>
    </div>
  );
}

function Sidebar({ current, onPick }: { current: AppId; onPick: (app: AppId) => void }) {
  const apps: Array<{ id: AppId; label: string; group: "workspace" | "system" }> = [
    { id: "home", label: "Home", group: "workspace" },
    { id: "projects", label: "Projects", group: "workspace" },
    { id: "blog", label: "Writing", group: "workspace" },
    { id: "about", label: "About", group: "workspace" },
    { id: "links", label: "Links", group: "workspace" },
    { id: "terminal", label: "Terminal", group: "system" },
  ];

  const groups = apps.reduce<Record<string, typeof apps>>((acc, app) => {
    acc[app.group] = acc[app.group] || [];
    acc[app.group].push(app);
    return acc;
  }, {});

  return (
    <aside
      style={{
        width: 252,
        flexShrink: 0,
        background: "linear-gradient(180deg, rgba(18,20,26,0.9), rgba(12,14,18,0.92))",
        borderRight: `1px solid ${T.hair}`,
        padding: "18px 12px",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "4px 8px 2px" }}>
        <div
          style={{
            width: SIDEBAR_AVATAR,
            height: SIDEBAR_AVATAR,
            flexShrink: 0,
            borderRadius: "50%",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.18)",
            backgroundColor: "#14161c",
          }}
        >
          <img
            src={siteData.profile.avatar}
            alt={siteData.profile.fullName}
            width={SIDEBAR_AVATAR}
            height={SIDEBAR_AVATAR}
            loading="eager"
            decoding="sync"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "46% 48%",
              display: "block",
              opacity: 1,
              imageRendering: "-webkit-optimize-contrast",
              forcedColorAdjust: "none",
              transform: "scale(2.2)",
              transformOrigin: "46% 48%",
            }}
          />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: F.serif, fontSize: 19, lineHeight: 1.05, color: T.ink }}>anunay</div>
        </div>
      </div>

      {Object.entries(groups).map(([group, items]) => (
        <div key={group}>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 9,
              color: T.inkFaint,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              padding: "0 10px 8px",
            }}
          >
            {group}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {items.map((app) => {
              const active = app.id === current;
              return (
                <button
                  key={app.id}
                  onClick={() => onPick(app.id)}
                  style={{
                    textAlign: "left",
                    background: active ? "rgba(159,192,255,0.1)" : "transparent",
                    border: "none",
                    color: active ? T.ink : T.inkDim,
                    cursor: "pointer",
                    padding: "7px 10px",
                    borderRadius: 4,
                    fontFamily: F.sans,
                    fontSize: 13,
                    fontWeight: 400,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    borderLeft: `2px solid ${active ? T.accent : "transparent"}`,
                  }}
                >
                  <AppIcon id={app.id} active={active} />
                  <span>{app.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ flex: 1 }} />
    </aside>
  );
}

function AppIcon({ id, active }: { id: AppId; active: boolean }) {
  const color = active ? T.accent : T.inkFaint;
  const props = { stroke: color, fill: "none", strokeWidth: 1.3 };

  const icons: Record<AppId, ReactNode> = {
    home: (
      <svg width="14" height="14" viewBox="0 0 14 14">
        <path {...props} d="M2 6 L7 2 L12 6 V12 H2 Z" />
      </svg>
    ),
    projects: (
      <svg width="14" height="14" viewBox="0 0 14 14">
        <rect {...props} x="2" y="3" width="10" height="8" rx="1" />
        <line {...props} x1="2" y1="6" x2="12" y2="6" />
      </svg>
    ),
    blog: (
      <svg width="14" height="14" viewBox="0 0 14 14">
        <path {...props} d="M3 2h6l2 2v8H3z" />
        <line {...props} x1="5" y1="6" x2="9" y2="6" />
        <line {...props} x1="5" y1="8" x2="9" y2="8" />
      </svg>
    ),
    about: (
      <svg width="14" height="14" viewBox="0 0 14 14">
        <circle {...props} cx="7" cy="5" r="2" />
        <path {...props} d="M3 12 C 3 9, 11 9, 11 12" />
      </svg>
    ),
    links: (
      <svg width="14" height="14" viewBox="0 0 14 14">
        <path {...props} d="M6 8 L4 10 a2 2 0 0 1 -3 -3 L3 5" />
        <path {...props} d="M8 6 L10 4 a2 2 0 0 1 3 3 L11 9" />
      </svg>
    ),
    terminal: (
      <svg width="14" height="14" viewBox="0 0 14 14">
        <rect {...props} x="1.5" y="3" width="11" height="8" rx="1" />
        <polyline {...props} points="4,6 6,7.5 4,9" />
        <line {...props} x1="7" y1="9" x2="10" y2="9" />
      </svg>
    ),
  };

  return icons[id];
}

function Header({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div>
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 10,
          color: T.inkFaint,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          marginBottom: 14,
        }}
      >
        {eyebrow}
      </div>
      <h1
        style={{
          fontFamily: F.serif,
          fontSize: "clamp(32px, 4vw, 52px)",
          lineHeight: 1.05,
          fontWeight: 400,
          margin: 0,
          color: T.ink,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h1>
      {subtitle ? (
        <div style={{ fontFamily: F.serif, fontSize: 17, color: T.inkDim, marginTop: 10, fontStyle: "italic", maxWidth: 640 }}>
          {subtitle}
        </div>
      ) : null}
    </div>
  );
}

function Panel({ title, onMore, children }: { title: string; onMore?: () => void; children: ReactNode }) {
  return (
    <section
      style={{
        padding: "20px 24px",
        borderRight: `1px solid ${T.hair}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          paddingBottom: 10,
          borderBottom: `1px solid ${T.hair}`,
        }}
      >
        <span style={{ fontFamily: F.mono, fontSize: 10, color: T.inkDim, letterSpacing: "0.18em" }}>{title}</span>
        {onMore ? (
          <button
            onClick={onMore}
            style={{
              background: "transparent",
              border: "none",
              color: T.inkFaint,
              cursor: "pointer",
              fontFamily: F.mono,
              fontSize: 10,
              letterSpacing: "0.08em",
            }}
          >
            view all →
          </button>
        ) : null}
      </div>
      <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>{children}</div>
    </section>
  );
}

function HomeApp({ onOpen, onOpenPost }: { onOpen: (app: AppId) => void; onOpenPost: (post: BlogPost) => void }) {
  const profile = siteData.profile;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative", height: "58%", flexShrink: 0, borderBottom: `1px solid ${T.hair}`, overflow: "hidden" }}>
        <ShaderCanvas shader={neuralLatticeShader} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: "linear-gradient(180deg, transparent 30%, rgba(10,12,16,0.65) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 36,
            bottom: 32,
            right: 36,
            display: "flex",
            alignItems: "flex-end",
            pointerEvents: "none",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: F.mono,
                fontSize: 10,
                color: T.inkDim,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              {profile.title}
            </div>
            <h1
              style={{
                fontFamily: F.serif,
                fontSize: "clamp(44px, 7vw, 92px)",
                lineHeight: 0.95,
                fontWeight: 400,
                margin: 0,
                color: T.ink,
                letterSpacing: "-0.02em",
              }}
            >
              {profile.fullName}
              <span style={{ color: T.accent }}>.</span>
            </h1>
            <div
              style={{
                fontFamily: F.serif,
                fontSize: "clamp(18px, 2vw, 24px)",
                color: T.inkDim,
                marginTop: 14,
                maxWidth: 640,
                lineHeight: 1.35,
                fontStyle: "italic",
              }}
            >
              {profile.bio}
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden" }}>
        <Panel title="LATEST" onMore={() => onOpen("blog")}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {blogPosts.slice(0, 2).map((post) => (
              <button
                key={post.slug}
                onClick={() => onOpenPost(post)}
                style={{
                  display: "block",
                  textAlign: "left",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "none",
                  color: "inherit",
                  padding: 12,
                  margin: -12,
                  borderRadius: 4,
                }}
              >
                <div style={{ fontFamily: F.mono, fontSize: 10, color: T.inkFaint, marginBottom: 4, letterSpacing: "0.05em" }}>
                  {post.date} · {post.read}
                </div>
                <div style={{ fontFamily: F.serif, fontSize: 18, lineHeight: 1.2, color: T.ink, marginBottom: 4 }}>{post.title}</div>
                <div style={{ fontFamily: F.sans, fontSize: 12.5, color: T.inkDim, lineHeight: 1.5 }}>{post.excerpt}</div>
              </button>
            ))}
          </div>
        </Panel>
        <Panel title="BUILDING" onMore={() => onOpen("projects")}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {siteData.projects.slice(0, 4).map((project) => (
              <a
                key={project.name}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, textDecoration: "none", color: "inherit" }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontFamily: F.mono, fontSize: 13, color: T.ink }}>{project.name}</span>
                    {project.kind === "NEW" ? (
                      <span
                        style={{
                          fontFamily: F.mono,
                          fontSize: 8,
                          color: T.mint,
                          letterSpacing: "0.15em",
                          border: "1px solid rgba(140,230,200,0.3)",
                          padding: "1px 5px",
                          borderRadius: 2,
                        }}
                      >
                        NEW
                      </span>
                    ) : null}
                  </div>
                  <div style={{ fontFamily: F.mono, fontSize: 10, color: T.inkFaint, marginTop: 2 }}>{project.tech}</div>
                </div>
                <span style={{ fontFamily: F.mono, fontSize: 13, color: T.inkFaint }}>↗</span>
              </a>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function ProjectsApp() {
  return (
    <div style={{ height: "100%", overflow: "auto", padding: "40px 48px" }}>
      <Header eyebrow="workspace / projects" title="Things I have shipped" subtitle={`${siteData.projects.length} projects. Open-source, working, occasionally weird.`} />
      <div
        style={{
          marginTop: 40,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          border: `1px solid ${T.hair}`,
          borderRadius: 6,
        }}
      >
        {siteData.projects.map((project, index) => (
          <a
            key={project.name}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: "none",
              color: "inherit",
              padding: "22px 24px",
              borderBottom: index < siteData.projects.length - 1 ? `1px solid ${T.hair}` : "none",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              position: "relative",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = "rgba(255,255,255,0.015)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = "transparent";
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontFamily: F.mono, fontSize: 10, color: T.inkFaint, width: 28 }}>{String(index + 1).padStart(2, "0")}</span>
              <span style={{ fontFamily: F.serif, fontSize: 22, color: T.ink }}>{project.name}</span>
              {project.kind === "NEW" ? (
                <span
                  style={{
                    fontFamily: F.mono,
                    fontSize: 9,
                    color: T.mint,
                    letterSpacing: "0.15em",
                    border: "1px solid rgba(140,230,200,0.35)",
                    padding: "1px 6px",
                    borderRadius: 2,
                  }}
                >
                  NEW
                </span>
              ) : null}
              <span style={{ flex: 1 }} />
              <span style={{ fontFamily: F.mono, fontSize: 13, color: T.inkFaint }}>↗</span>
            </div>
            <div style={{ fontFamily: F.sans, fontSize: 13.5, color: T.inkDim, lineHeight: 1.55, paddingLeft: 38 }}>{project.desc}</div>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: T.inkFaint, letterSpacing: "0.1em", paddingLeft: 38 }}>{project.tech}</div>
          </a>
        ))}
      </div>
    </div>
  );
}

function BlogApp({ openPost, onOpenPost }: { openPost: BlogPost | null; onOpenPost: (post: BlogPost | null) => void }) {
  if (openPost) {
    return <PostView post={openPost} onBack={() => onOpenPost(null)} />;
  }

  return (
    <div style={{ height: "100%", overflow: "auto", padding: "40px 48px" }}>
      <Header eyebrow="workspace / writing" title="Notes from the workbench" subtitle="Occasional long-form on systems, products, and thinking with computers." />
      <div style={{ marginTop: 40, display: "flex", flexDirection: "column" }}>
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
              padding: "24px 0",
              borderBottom: `1px solid ${T.hair}`,
              display: "grid",
              gridTemplateColumns: "90px 1fr auto",
              gap: 24,
              alignItems: "baseline",
            }}
          >
            <span style={{ fontFamily: F.mono, fontSize: 11, color: T.inkFaint }}>{post.date}</span>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
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
              <div style={{ fontFamily: F.serif, fontSize: 24, color: T.ink, lineHeight: 1.2, marginBottom: 6 }}>{post.title}</div>
              <div style={{ fontFamily: F.sans, fontSize: 13.5, color: T.inkDim, lineHeight: 1.55, maxWidth: 680 }}>{post.excerpt}</div>
            </div>
            <span style={{ fontFamily: F.mono, fontSize: 16, color: T.inkFaint }}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PostView({ post, onBack }: { post: BlogPost; onBack: () => void }) {
  return (
    <div style={{ height: "100%", overflow: "auto", padding: "40px 48px" }}>
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
          marginBottom: 32,
        }}
      >
        ← writing
      </button>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 18 }}>
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
      <h1 style={{ fontFamily: F.serif, fontSize: 48, lineHeight: 1.05, fontWeight: 400, color: T.ink, margin: "0 0 32px", maxWidth: 820 }}>
        {post.title}
      </h1>
      <div style={{ maxWidth: 680, color: T.ink }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => <p style={{ margin: "0 0 20px", fontFamily: F.serif, fontSize: 19, lineHeight: 1.6 }}>{children}</p>,
            strong: ({ children }) => <strong style={{ color: T.accent, fontWeight: 500 }}>{children}</strong>,
            em: ({ children }) => <em style={{ color: T.accent, fontStyle: "italic" }}>{children}</em>,
            code: ({ children }) => (
              <code
                style={{
                  fontFamily: F.mono,
                  fontSize: "0.85em",
                  background: "rgba(255,255,255,0.05)",
                  padding: "1px 6px",
                  borderRadius: 3,
                  color: T.ink,
                }}
              >
                {children}
              </code>
            ),
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>
                {children}
              </a>
            ),
            ul: ({ children }) => <ul style={{ margin: "0 0 20px", paddingLeft: 24, fontFamily: F.serif, fontSize: 19, lineHeight: 1.6 }}>{children}</ul>,
            ol: ({ children }) => <ol style={{ margin: "0 0 20px", paddingLeft: 24, fontFamily: F.serif, fontSize: 19, lineHeight: 1.6 }}>{children}</ol>,
            li: ({ children }) => <li style={{ marginBottom: 8 }}>{children}</li>,
            h2: ({ children }) => <h2 style={{ fontFamily: F.serif, fontSize: 32, fontWeight: 400, margin: "32px 0 16px", color: T.ink }}>{children}</h2>,
            h3: ({ children }) => <h3 style={{ fontFamily: F.serif, fontSize: 24, fontWeight: 400, margin: "28px 0 14px", color: T.ink }}>{children}</h3>,
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

function AboutApp() {
  const profile = siteData.profile;

  return (
    <div style={{ height: "100%", overflow: "auto", padding: "48px 56px" }}>
      <Header eyebrow="workspace / about" title={profile.fullName} subtitle={profile.title} />
      <div style={{ marginTop: 36, display: "grid", gridTemplateColumns: "1fr 320px", gap: 48, maxWidth: 960 }}>
        <div>
          <p style={{ fontFamily: F.serif, fontSize: 21, lineHeight: 1.55, color: T.ink, margin: 0 }}>
            I lead AI and data systems on the core platform powering SMB sales intelligence, spanning architecture, enrichment pipelines, and
            agent orchestration that deliver high-coverage, real-time signals for go-to-market teams.
          </p>
          <p style={{ fontFamily: F.serif, fontSize: 18, lineHeight: 1.6, color: T.inkDim, marginTop: 18 }}>
            My work sits at the intersection of product, data quality, and infrastructure reliability. I partner closely with founders, sales,
            and customers to turn field feedback into scalable systems. Before this, I built across Salesforce CRM, Agentforce, analytics, and
            machine learning infrastructure with a focus on performance, coverage, and repeatable engineering leverage.
          </p>
          <div style={{ marginTop: 32, display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["AI", "machine learning", "CRM", "data platforms", "pipelines", "Databricks", "scalable systems", "agent orchestration"].map(
              (tag) => (
                <span
                  key={tag}
                  style={{
                    fontFamily: F.mono,
                    fontSize: 10,
                    color: T.inkDim,
                    letterSpacing: "0.06em",
                    padding: "4px 10px",
                    border: `1px solid ${T.hair}`,
                    borderRadius: 99,
                  }}
                >
                  {tag}
                </span>
              ),
            )}
          </div>
        </div>
        <aside style={{ padding: 24, border: `1px solid ${T.hair}`, borderRadius: 6, background: "rgba(255,255,255,0.015)", alignSelf: "start" }}>
          <div style={{ fontFamily: F.mono, fontSize: 10, color: T.inkFaint, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>
            signal
          </div>
          <dl style={{ display: "grid", gridTemplateColumns: "70px 1fr", gap: "10px 12px", margin: 0, fontFamily: F.mono, fontSize: 12 }}>
            <dt style={{ color: T.inkFaint }}>status</dt>
            <dd style={{ margin: 0, color: T.ink }}>{profile.status}</dd>
            <dt style={{ color: T.inkFaint }}>loc</dt>
            <dd style={{ margin: 0, color: T.ink }}>{profile.location}</dd>
            <dt style={{ color: T.inkFaint }}>site</dt>
            <dd style={{ margin: 0 }}>
              <a href={`https://${profile.site}`} target="_blank" rel="noopener noreferrer" style={{ color: T.accent, textDecoration: "none" }}>
                {profile.site}
              </a>
            </dd>
            <dt style={{ color: T.inkFaint }}>mail</dt>
            <dd style={{ margin: 0 }}>
              <a href={`mailto:${profile.email}`} style={{ color: T.accent, textDecoration: "none" }}>
                {profile.email}
              </a>
            </dd>
            <dt style={{ color: T.inkFaint }}>git</dt>
            <dd style={{ margin: 0 }}>
              <a href={`https://${profile.github}`} target="_blank" rel="noopener noreferrer" style={{ color: T.accent, textDecoration: "none" }}>
                @anunay999
              </a>
            </dd>
            <dt style={{ color: T.inkFaint }}>li</dt>
            <dd style={{ margin: 0 }}>
              <a href={`https://${profile.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ color: T.accent, textDecoration: "none" }}>
                /in/anunay9
              </a>
            </dd>
          </dl>
        </aside>
      </div>
    </div>
  );
}

function LinksApp() {
  return (
    <div style={{ height: "100%", overflow: "auto", padding: "48px 56px" }}>
      <Header eyebrow="workspace / links" title="Find me" subtitle="All the doors into my world." />
      <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14, maxWidth: 960 }}>
        {siteData.links.map((link) => (
          <LinkCard key={link.label} link={link} />
        ))}
      </div>
    </div>
  );
}

function LinkCard({ link }: { link: LinkItem }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 22px",
        border: `1px solid ${T.hair}`,
        borderRadius: 6,
        textDecoration: "none",
        color: "inherit",
        transition: "all 180ms",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.borderColor = "rgba(159,192,255,0.35)";
        event.currentTarget.style.background = "rgba(159,192,255,0.03)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.borderColor = T.hair;
        event.currentTarget.style.background = "transparent";
      }}
    >
      <div>
        <div style={{ fontFamily: F.mono, fontSize: 9, color: T.inkFaint, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 4 }}>
          {link.label}
        </div>
        <div style={{ fontFamily: F.serif, fontSize: 18, color: T.ink }}>{link.handle}</div>
      </div>
      <span style={{ fontFamily: F.mono, fontSize: 18, color: T.inkFaint }}>↗</span>
    </a>
  );
}

function TerminalApp() {
  type TerminalLine = { type: "sys" | "in" | "out" | "err"; text: string };

  const [lines, setLines] = useState<TerminalLine[]>([
    { type: "sys", text: `anunay.os terminal v4.0 · ${new Date().toDateString()}` },
    { type: "sys", text: "type `help` for commands, `whoami`, `about`, `links`, `projects`, `clear`" },
    { type: "sys", text: "" },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const run = (command: string) => {
    const normalized = command.trim().toLowerCase();
    const output: TerminalLine[] = [{ type: "in", text: `$ ${command}` }];

    if (normalized === "help") output.push({ type: "out", text: "whoami · about · links · projects · blog · contact · sudo · clear" });
    else if (normalized === "whoami") output.push({ type: "out", text: `${siteData.profile.fullName} — ${siteData.profile.title}` });
    else if (normalized === "about") output.push({ type: "out", text: siteData.profile.bio });
    else if (normalized === "links") siteData.links.forEach((link) => output.push({ type: "out", text: `  ${link.label.padEnd(9)} ${link.url}` }));
    else if (normalized === "projects") siteData.projects.forEach((project) => output.push({ type: "out", text: `  ${project.name.padEnd(26)} ${project.tech}` }));
    else if (normalized === "blog" || normalized === "writing") blogPosts.forEach((post) => output.push({ type: "out", text: `  ${post.date}  ${post.title}` }));
    else if (normalized === "wallpaper" || normalized === "scenes") output.push({ type: "out", text: `  lattice — ${SCENES[0].hint}` });
    else if (normalized === "contact") output.push({ type: "out", text: `  email: ${siteData.profile.email}` });
    else if (normalized === "sudo" || normalized.startsWith("sudo ")) output.push({ type: "err", text: "  nice try." });
    else if (normalized === "clear") {
      setLines([]);
      return;
    } else if (normalized !== "") {
      output.push({ type: "err", text: `  command not found: ${normalized}. try \`help\`.` });
    }

    output.push({ type: "out", text: "" });
    setLines((current) => [...current, ...output]);
    setHistory((current) => [command, ...current]);
    setHistoryIndex(-1);
  };

  return (
    <div style={{ height: "100%", padding: "24px 32px", display: "flex", flexDirection: "column", background: "rgba(4,6,10,0.4)" }}>
      <Header eyebrow="system / terminal" title="anunay.shell" subtitle="a real little REPL. commands work." />
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          marginTop: 20,
          overflow: "auto",
          fontFamily: F.mono,
          fontSize: 13,
          lineHeight: 1.55,
          border: `1px solid ${T.hair}`,
          borderRadius: 4,
          padding: 18,
          background: "rgba(0,0,0,0.3)",
          minHeight: 0,
        }}
      >
        {lines.map((line, index) => {
          const color = line.type === "in" ? T.ink : line.type === "err" ? "#ff8a8a" : line.type === "sys" ? T.inkFaint : T.inkDim;
          return (
            <div key={`${line.type}-${index}`} style={{ color, whiteSpace: "pre-wrap" }}>
              {line.text || "\u00A0"}
            </div>
          );
        })}
        <div style={{ display: "flex", gap: 8, color: T.ink, marginTop: 4 }}>
          <span style={{ color: T.accent }}>$</span>
          <input
            autoFocus
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                run(input);
                setInput("");
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                const nextIndex = Math.min(historyIndex + 1, history.length - 1);
                if (history[nextIndex] !== undefined) {
                  setHistoryIndex(nextIndex);
                  setInput(history[nextIndex]);
                }
              } else if (event.key === "ArrowDown") {
                event.preventDefault();
                const nextIndex = Math.max(historyIndex - 1, -1);
                setHistoryIndex(nextIndex);
                setInput(nextIndex === -1 ? "" : history[nextIndex]);
              }
            }}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: T.ink,
              fontFamily: F.mono,
              fontSize: 13,
              flex: 1,
              padding: 0,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function AppScreen({
  app,
  setApp,
  selectedPost,
  setSelectedPost,
}: {
  app: AppId;
  setApp: (app: AppId) => void;
  selectedPost: BlogPost | null;
  setSelectedPost: (post: BlogPost | null) => void;
}) {
  const openApp = (nextApp: AppId) => {
    setSelectedPost(null);
    setApp(nextApp);
  };

  switch (app) {
    case "home":
      return <HomeApp onOpen={openApp} onOpenPost={(post) => { setSelectedPost(post); setApp("blog"); }} />;
    case "projects":
      return <ProjectsApp />;
    case "blog":
      return <BlogApp openPost={selectedPost} onOpenPost={setSelectedPost} />;
    case "about":
      return <AboutApp />;
    case "links":
      return <LinksApp />;
    case "terminal":
      return <TerminalApp />;
    default:
      return <HomeApp onOpen={openApp} onOpenPost={(post) => { setSelectedPost(post); setApp("blog"); }} />;
  }
}

export default function App() {
  const [app, setApp] = useState<AppId>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved as AppId | null) ?? "home";
  });
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, app);
  }, [app]);

  const titleSegments = ["anunay.dev", app.charAt(0).toUpperCase() + app.slice(1)];
  const handleSidebarPick = (nextApp: AppId) => {
    setSelectedPost(null);
    setApp(nextApp);
  };

  return (
    <OSWindow titleSegments={titleSegments}>
      <Sidebar current={app} onPick={handleSidebarPick} />
      <main data-screen-label={`app-${app}`} style={mainStyle}>
        <AppScreen app={app} setApp={setApp} selectedPost={selectedPost} setSelectedPost={setSelectedPost} />
      </main>
    </OSWindow>
  );
}

const mainStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  position: "relative",
};
