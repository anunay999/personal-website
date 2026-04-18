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
  /* Display serif — high-contrast, designed for headlines & hero type. */
  serif: "'Instrument Serif', 'EB Garamond', Georgia, serif",
  /* Reading serif — optical-sized, designed for long-form body copy. */
  text: "'Source Serif 4', 'Source Serif Pro', 'Iowan Old Style', 'Charter', Georgia, serif",
  sans: "'Inter', -apple-system, system-ui, sans-serif",
};

const SCENES = [
  { key: "lattice", name: "lattice", hint: "move to orbit · click to pulse · scroll for density" },
] as const;

const STORAGE_KEY = "anunay_site_app";
const SIDEBAR_AVATAR = 76;

const BREAKPOINTS = {
  mobile: 768,
  small: 420,
};

type AppId = "home" | "projects" | "blog" | "about" | "links" | "terminal";

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const list = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(list.matches);
    list.addEventListener("change", handler);
    return () => list.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

const useIsMobile = () => useMediaQuery(`(max-width: ${BREAKPOINTS.mobile - 1}px)`);
const useIsSmall = () => useMediaQuery(`(max-width: ${BREAKPOINTS.small - 1}px)`);

function ShaderCanvas<State extends object>({
  shader,
  interactive = true,
}: {
  shader: ShaderDefinition<State>;
  interactive?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    /* Cache the original state on the shader the first time we mount, then
       always start from a deep clone of those defaults. Without the clone,
       remounts (e.g. StrictMode, or navigating away and back) would inherit
       drifted state from the prior session. */
    if (!shader.__defaults) shader.__defaults = JSON.parse(JSON.stringify(shader.state));
    shader.state = JSON.parse(JSON.stringify(shader.__defaults));

    let runner: ShaderRunner<State> | null = null;
    let cancelled = false;

    /* Defer one frame so the canvas has a real CSS size before we read it.
       Otherwise the GL viewport is initialized at 0×0 (or 300×150 default)
       and the first frames render with broken uniforms — visually appearing
       as a blank/white canvas until the next layout. */
    const raf = requestAnimationFrame(() => {
      if (cancelled || !ref.current) return;
      runner = new ShaderRunner(ref.current, shader);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      runner?.destroy();
    };
  }, [shader]);

  return (
    <canvas
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        /* On non-interactive (mobile) renders, let touches through to enable
           page scrolling instead of being captured by shader gestures. */
        touchAction: interactive ? "none" : "auto",
        pointerEvents: interactive ? "auto" : "none",
        display: "block",
        /* Pre-paint background so the canvas matches the shader's clear color
           even before WebGL has issued its first frame. */
        background: "#07080a",
      }}
    />
  );
}

function TitleBar({ segments, compact = false }: { segments: string[]; compact?: boolean }) {
  const dot = compact ? 10 : 12;
  return (
    <div
      style={{
        height: compact ? 32 : 36,
        flexShrink: 0,
        background: "linear-gradient(180deg, #1a1d23, #12151a)",
        borderBottom: `1px solid ${T.hair}`,
        display: "flex",
        alignItems: "center",
        padding: compact ? "0 10px" : "0 14px",
        paddingTop: compact ? "max(0px, env(safe-area-inset-top))" : 0,
        gap: 12,
        fontFamily: F.mono,
        fontSize: compact ? 10 : 11,
        letterSpacing: "0.03em",
        boxSizing: "content-box",
      }}
    >
      <div style={{ display: "flex", gap: compact ? 6 : 8 }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((color) => (
          <span
            key={color}
            style={{
              width: dot,
              height: dot,
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
          minWidth: 0,
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        {segments.map((segment, index) => (
          <span
            key={segment}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {index > 0 && <span style={{ color: T.inkFaint }}>／</span>}
            <span
              style={{
                color: index === segments.length - 1 ? T.ink : T.inkDim,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {segment}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function OSWindow({
  children,
  titleSegments,
  isMobile,
}: {
  children: ReactNode;
  titleSegments: string[];
  isMobile: boolean;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: `radial-gradient(ellipse at 30% 20%, #14161c 0%, transparent 60%), radial-gradient(ellipse at 80% 90%, #0e1419 0%, transparent 55%), ${T.desk}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? 0 : "clamp(12px, 2vw, 28px)",
        fontFamily: F.sans,
        color: T.ink,
      }}
    >
      {!isMobile && (
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
      )}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          maxWidth: isMobile ? "none" : 1480,
          maxHeight: isMobile ? "none" : 920,
          background: T.panelSolid,
          border: isMobile ? "none" : `1px solid ${T.hairBright}`,
          borderRadius: isMobile ? 0 : 10,
          boxShadow: isMobile
            ? "none"
            : "0 40px 120px rgba(0,0,0,0.65), 0 10px 30px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03) inset, 0 1px 0 rgba(255,255,255,0.05) inset",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TitleBar segments={titleSegments} compact={isMobile} />
        <div
          style={{
            flex: 1,
            position: "relative",
            display: "flex",
            /* Sidebar layout on desktop is a horizontal split. Mobile is a
               vertical stack (content area + bottom nav), so flip the
               primary axis here — that lets MobileNav and <main> become
               direct flex children of the shell, guaranteeing the nav is
               pinned and only <main> scrolls. */
            flexDirection: isMobile ? "column" : "row",
            minHeight: 0,
            minWidth: 0,
          }}
        >
          {children}
        </div>
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

const MOBILE_APPS: Array<{ id: AppId; label: string }> = [
  { id: "home", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "blog", label: "Writing" },
  { id: "about", label: "About" },
  { id: "links", label: "Links" },
  { id: "terminal", label: "Shell" },
];

function MobileNav({ current, onPick }: { current: AppId; onPick: (app: AppId) => void }) {
  return (
    <nav
      style={{
        flexShrink: 0,
        background: "rgba(12,14,18,0.96)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: `1px solid ${T.hair}`,
        display: "grid",
        gridTemplateColumns: `repeat(${MOBILE_APPS.length}, 1fr)`,
        paddingBottom: "max(6px, env(safe-area-inset-bottom))",
      }}
    >
      {MOBILE_APPS.map((app) => {
        const active = app.id === current;
        return (
          <button
            key={app.id}
            onClick={() => onPick(app.id)}
            aria-label={app.label}
            aria-current={active ? "page" : undefined}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "10px 4px 8px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              color: active ? T.ink : T.inkFaint,
              fontFamily: F.mono,
              fontSize: 9.5,
              letterSpacing: "0.06em",
              minHeight: 52,
              position: "relative",
            }}
          >
            <AppIcon id={app.id} active={active} />
            <span>{app.label}</span>
            {active && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: 0,
                  left: "30%",
                  right: "30%",
                  height: 2,
                  background: T.accent,
                  borderRadius: 0,
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
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
          fontSize: "clamp(28px, 6vw, 52px)",
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
        <div
          style={{
            fontFamily: F.serif,
            fontSize: "clamp(15px, 2.4vw, 17px)",
            color: T.inkDim,
            marginTop: 10,
            fontStyle: "italic",
            maxWidth: 640,
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </div>
  );
}

function Panel({
  title,
  onMore,
  children,
  isMobile = false,
  isLast = false,
}: {
  title: string;
  onMore?: () => void;
  children: ReactNode;
  isMobile?: boolean;
  isLast?: boolean;
}) {
  return (
    <section
      style={{
        padding: isMobile ? "18px 20px" : "20px 24px",
        borderRight: isMobile ? "none" : `1px solid ${T.hair}`,
        borderBottom: isMobile && !isLast ? `1px solid ${T.hair}` : undefined,
        display: "flex",
        flexDirection: "column",
        /* Hide horizontal overflow always; vertical overflow is only relevant
           on desktop where each panel is height-constrained inside the 50/50
           grid. On mobile the panel grows naturally and the screen-level
           scroller handles vertical overflow — no nested scroll regions. */
        overflowX: "hidden",
        overflowY: isMobile ? "visible" : "hidden",
        minHeight: 0,
        minWidth: 0,
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
      <div
        style={{
          flex: isMobile ? "0 0 auto" : 1,
          overflowY: isMobile ? "visible" : "auto",
          overflowX: "hidden",
          minHeight: 0,
          minWidth: 0,
        }}
      >
        {children}
      </div>
    </section>
  );
}

function HomeApp({
  onOpen,
  onOpenPost,
  isMobile,
}: {
  onOpen: (app: AppId) => void;
  onOpenPost: (post: BlogPost) => void;
  isMobile: boolean;
}) {
  const profile = siteData.profile;

  return (
    <div
      className={isMobile ? "app-screen-scroll" : undefined}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: isMobile ? undefined : "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          height: isMobile ? "auto" : "58%",
          minHeight: isMobile ? 320 : undefined,
          flexShrink: 0,
          borderBottom: `1px solid ${T.hair}`,
          overflow: "hidden",
        }}
      >
        <ShaderCanvas shader={neuralLatticeShader} interactive={!isMobile} />
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
            position: isMobile ? "relative" : "absolute",
            left: isMobile ? 0 : 36,
            bottom: isMobile ? "auto" : 32,
            right: isMobile ? 0 : 36,
            top: isMobile ? "auto" : "auto",
            padding: isMobile ? "120px 20px 28px" : 0,
            display: "flex",
            alignItems: "flex-end",
            pointerEvents: "none",
            minHeight: isMobile ? 320 : undefined,
          }}
        >
          <div style={{ width: "100%" }}>
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
                fontSize: isMobile ? "clamp(40px, 11vw, 64px)" : "clamp(44px, 7vw, 92px)",
                lineHeight: 0.95,
                fontWeight: 400,
                margin: 0,
                color: T.ink,
                letterSpacing: "-0.02em",
                wordBreak: "break-word",
              }}
            >
              {profile.fullName}
              <span style={{ color: T.accent }}>.</span>
            </h1>
            <div
              style={{
                fontFamily: F.serif,
                fontSize: isMobile ? "clamp(15px, 4vw, 18px)" : "clamp(18px, 2vw, 24px)",
                color: T.inkDim,
                marginTop: 14,
                maxWidth: 640,
                lineHeight: 1.35,
                fontStyle: "italic",
                /* The hero overlay sits on top of a non-interactive shader
                   canvas; re-enable pointer events for the link only. */
                pointerEvents: "auto",
              }}
            >
              {profile.bioPrefix}
              <a
                href={profile.company.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: T.accent,
                  textDecoration: "underline",
                  textDecorationColor: "rgba(159,192,255,0.4)",
                  textUnderlineOffset: "0.18em",
                  textDecorationThickness: "1px",
                  fontStyle: "normal",
                }}
              >
                {profile.company.name}
              </a>
              {profile.bioSuffix}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          flex: isMobile ? "0 0 auto" : 1,
          minHeight: 0,
          minWidth: 0,
          display: "grid",
          /* `minmax(0, 1fr)` instead of `1fr` so a child with intrinsic min-
             content wider than the column can't push the track wider than
             its share — the textbook fix for grid horizontal overflow. */
          gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : "minmax(0, 1fr) minmax(0, 1fr)",
          overflow: isMobile ? "visible" : "hidden",
        }}
      >
        <Panel title="LATEST" onMore={() => onOpen("blog")} isMobile={isMobile}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
            {blogPosts.slice(0, 2).map((post) => (
              <button
                key={post.slug}
                onClick={() => onOpenPost(post)}
                style={{
                  display: "block",
                  width: "100%",
                  boxSizing: "border-box",
                  textAlign: "left",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "none",
                  color: "inherit",
                  /* Symmetric vertical padding gives the same generous tap
                     target the negative-margin trick provided, without ever
                     letting the element bleed outside its container. */
                  padding: "4px 0",
                  borderRadius: 4,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    fontFamily: F.mono,
                    fontSize: 10,
                    color: T.inkFaint,
                    marginBottom: 4,
                    letterSpacing: "0.05em",
                  }}
                >
                  {post.date} · {post.read}
                </div>
                <div
                  style={{
                    fontFamily: F.serif,
                    fontSize: 19,
                    lineHeight: 1.2,
                    color: T.ink,
                    marginBottom: 6,
                    letterSpacing: "-0.005em",
                    /* Long, hyphen-free titles must wrap rather than scroll. */
                    overflowWrap: "anywhere",
                  }}
                >
                  {post.title}
                </div>
                <div
                  style={{
                    fontFamily: F.text,
                    fontSize: 14,
                    color: T.inkDim,
                    lineHeight: 1.55,
                    overflowWrap: "anywhere",
                  }}
                >
                  {post.excerpt}
                </div>
              </button>
            ))}
          </div>
        </Panel>
        <Panel title="BUILDING" onMore={() => onOpen("projects")} isMobile={isMobile} isLast>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
            {siteData.projects.slice(0, 4).map((project) => (
              <a
                key={project.name}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: 10,
                  textDecoration: "none",
                  color: "inherit",
                  minWidth: 0,
                }}
              >
                <div style={{ minWidth: 0, flex: 1, overflowWrap: "anywhere" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
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

function ProjectsApp({ isMobile }: { isMobile: boolean }) {
  const indent = isMobile ? 30 : 38;
  return (
    <div
      className="app-screen-scroll"
      style={{ padding: isMobile ? "24px 18px 32px" : "40px 48px" }}
    >
      <Header
        eyebrow="workspace / projects"
        title="Things I have shipped"
        subtitle={`${siteData.projects.length} projects. Open-source, working, occasionally weird.`}
      />
      <div
        style={{
          marginTop: isMobile ? 24 : 40,
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(340px, 1fr))",
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
              padding: isMobile ? "18px 18px" : "22px 24px",
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
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontFamily: F.mono, fontSize: 10, color: T.inkFaint, width: 22 }}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span style={{ fontFamily: F.serif, fontSize: isMobile ? 19 : 22, color: T.ink }}>{project.name}</span>
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
            <div
              style={{
                fontFamily: F.sans,
                fontSize: isMobile ? 13 : 13.5,
                color: T.inkDim,
                lineHeight: 1.55,
                paddingLeft: indent,
              }}
            >
              {project.desc}
            </div>
            <div
              style={{
                fontFamily: F.mono,
                fontSize: 10,
                color: T.inkFaint,
                letterSpacing: "0.1em",
                paddingLeft: indent,
              }}
            >
              {project.tech}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function BlogApp({
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
              p: ({ children }) => <p style={{ ...bodyStyle, margin: "0 0 1.4em" }}>{children}</p>,
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

function AboutApp({ isMobile }: { isMobile: boolean }) {
  const profile = siteData.profile;

  return (
    <div
      className="app-screen-scroll"
      style={{ padding: isMobile ? "24px 18px 32px" : "48px 56px" }}
    >
      <Header eyebrow="workspace / about" title={profile.fullName} subtitle={profile.title} />
      <div
        style={{
          marginTop: isMobile ? 24 : 36,
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 320px",
          gap: isMobile ? 28 : 48,
          maxWidth: 960,
        }}
      >
        <div>
          <p style={{ fontFamily: F.serif, fontSize: isMobile ? 18 : 21, lineHeight: 1.55, color: T.ink, margin: 0 }}>
            I lead AI and data systems at{" "}
            <a
              href={profile.company.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: T.accent,
                textDecoration: "underline",
                textDecorationColor: "rgba(159,192,255,0.4)",
                textUnderlineOffset: "0.18em",
                textDecorationThickness: "1px",
              }}
            >
              Orbital
            </a>
            , on the core platform powering SMB sales intelligence — spanning architecture, enrichment
            pipelines, and agent orchestration that deliver high-coverage, real-time signals for go-to-market teams.
          </p>
          <p style={{ fontFamily: F.serif, fontSize: isMobile ? 16 : 18, lineHeight: 1.6, color: T.inkDim, marginTop: 18 }}>
            My work sits at the intersection of product, data quality, and infrastructure reliability. I partner closely with founders, sales,
            and customers to turn field feedback into scalable systems. Before this, I built across Salesforce CRM, Agentforce, analytics, and
            machine learning infrastructure with a focus on performance, coverage, and repeatable engineering leverage.
          </p>
          <div style={{ marginTop: isMobile ? 24 : 32, display: "flex", gap: 8, flexWrap: "wrap" }}>
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
        <aside
          style={{
            padding: isMobile ? 18 : 24,
            border: `1px solid ${T.hair}`,
            borderRadius: 6,
            background: "rgba(255,255,255,0.015)",
            alignSelf: "start",
            wordBreak: "break-word",
          }}
        >
          <div style={{ fontFamily: F.mono, fontSize: 10, color: T.inkFaint, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>
            signal
          </div>
          <dl style={{ display: "grid", gridTemplateColumns: "70px 1fr", gap: "10px 12px", margin: 0, fontFamily: F.mono, fontSize: 12 }}>
            <dt style={{ color: T.inkFaint }}>status</dt>
            <dd style={{ margin: 0, color: T.ink }}>{profile.status}</dd>
            <dt style={{ color: T.inkFaint }}>co</dt>
            <dd style={{ margin: 0 }}>
              <a
                href={profile.company.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: T.accent, textDecoration: "none" }}
              >
                Orbital
              </a>
            </dd>
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

function LinksApp({ isMobile }: { isMobile: boolean }) {
  return (
    <div
      className="app-screen-scroll"
      style={{ padding: isMobile ? "24px 18px 32px" : "48px 56px" }}
    >
      <Header eyebrow="workspace / links" title="Find me" subtitle="All the doors into my world." />
      <div
        style={{
          marginTop: isMobile ? 24 : 40,
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))",
          gap: isMobile ? 10 : 14,
          maxWidth: 960,
        }}
      >
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

function TerminalApp({ isMobile }: { isMobile: boolean }) {
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
  const inputRef = useRef<HTMLInputElement | null>(null);

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
    else if (normalized === "about") output.push({ type: "out", text: siteData.profile.bioText });
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

  const cellFont = isMobile ? 12 : 13;
  /* iOS auto-zooms inputs whose font-size is < 16px. Use 16px on touch devices. */
  const inputFont = isMobile ? 16 : 13;

  return (
    <div
      style={{
        height: "100%",
        padding: isMobile ? "20px 16px 16px" : "24px 32px",
        display: "flex",
        flexDirection: "column",
        background: "rgba(4,6,10,0.4)",
      }}
      onClick={() => inputRef.current?.focus()}
    >
      <Header eyebrow="system / terminal" title="anunay.shell" subtitle="a real little REPL. commands work." />
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          marginTop: isMobile ? 14 : 20,
          overflow: "auto",
          WebkitOverflowScrolling: "touch",
          fontFamily: F.mono,
          fontSize: cellFont,
          lineHeight: 1.55,
          border: `1px solid ${T.hair}`,
          borderRadius: 4,
          padding: isMobile ? 14 : 18,
          background: "rgba(0,0,0,0.3)",
          minHeight: 0,
        }}
      >
        {lines.map((line, index) => {
          const color = line.type === "in" ? T.ink : line.type === "err" ? "#ff8a8a" : line.type === "sys" ? T.inkFaint : T.inkDim;
          return (
            <div key={`${line.type}-${index}`} style={{ color, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {line.text || "\u00A0"}
            </div>
          );
        })}
        <div style={{ display: "flex", gap: 8, color: T.ink, marginTop: 4, alignItems: "center" }}>
          <span style={{ color: T.accent }}>$</span>
          <input
            ref={inputRef}
            autoFocus={!isMobile}
            value={input}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            inputMode="text"
            enterKeyHint="send"
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
              fontSize: inputFont,
              flex: 1,
              padding: 0,
              minWidth: 0,
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
  isMobile,
}: {
  app: AppId;
  setApp: (app: AppId) => void;
  selectedPost: BlogPost | null;
  setSelectedPost: (post: BlogPost | null) => void;
  isMobile: boolean;
}) {
  const openApp = (nextApp: AppId) => {
    setSelectedPost(null);
    setApp(nextApp);
  };

  const openPost = (post: BlogPost) => {
    setSelectedPost(post);
    setApp("blog");
  };

  switch (app) {
    case "home":
      return <HomeApp onOpen={openApp} onOpenPost={openPost} isMobile={isMobile} />;
    case "projects":
      return <ProjectsApp isMobile={isMobile} />;
    case "blog":
      return <BlogApp openPost={selectedPost} onOpenPost={setSelectedPost} isMobile={isMobile} />;
    case "about":
      return <AboutApp isMobile={isMobile} />;
    case "links":
      return <LinksApp isMobile={isMobile} />;
    case "terminal":
      return <TerminalApp isMobile={isMobile} />;
    default:
      return <HomeApp onOpen={openApp} onOpenPost={openPost} isMobile={isMobile} />;
  }
}

export default function App() {
  const [app, setApp] = useState<AppId>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved as AppId | null) ?? "home";
  });
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, app);
  }, [app]);

  const titleSegments = isMobile
    ? [app.charAt(0).toUpperCase() + app.slice(1)]
    : ["anunay.dev", app.charAt(0).toUpperCase() + app.slice(1)];

  const handlePick = (nextApp: AppId) => {
    setSelectedPost(null);
    setApp(nextApp);
  };

  return (
    <OSWindow titleSegments={titleSegments} isMobile={isMobile}>
      {!isMobile && <Sidebar current={app} onPick={handlePick} />}
      <main data-screen-label={`app-${app}`} style={mainStyle}>
        <AppScreen
          app={app}
          setApp={setApp}
          selectedPost={selectedPost}
          setSelectedPost={setSelectedPost}
          isMobile={isMobile}
        />
      </main>
      {isMobile && <MobileNav current={app} onPick={handlePick} />}
    </OSWindow>
  );
}

const mainStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  /* Critical: without min-height: 0, a flex child's intrinsic height takes
     over and the container can grow past the viewport — pushing the bottom
     nav off-screen. */
  minHeight: 0,
  overflow: "hidden",
  position: "relative",
};
