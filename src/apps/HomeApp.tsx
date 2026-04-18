import { blogPosts, type BlogPost } from "../content/blog";
import { neuralLatticeShader } from "../shaders/neuralLattice";
import { Panel } from "../shell/Panel";
import { ShaderCanvas } from "../shell/ShaderCanvas";
import { siteData } from "../siteData";
import { F, T, type AppId } from "../theme";

export function HomeApp({
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
          /* Match shader clear color so any frame the canvas hasn't painted
             yet (initial mount, context loss, resize) is dark, not white. */
          background: "#07080a",
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
                /* Stay italic so the link flows with the surrounding bio
                   prose. Color alone is the link affordance; underline is
                   hover-only to keep the headline area calm. */
                style={{
                  color: T.accent,
                  textDecoration: "none",
                  fontStyle: "italic",
                  borderBottom: "1px solid rgba(159,192,255,0.25)",
                  paddingBottom: "0.05em",
                  transition: "border-color 160ms ease",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.borderBottomColor = "rgba(159,192,255,0.7)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.borderBottomColor = "rgba(159,192,255,0.25)";
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
