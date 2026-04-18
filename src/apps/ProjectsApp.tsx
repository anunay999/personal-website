import { Header } from "../shell/Header";
import { siteData } from "../siteData";
import { F, T } from "../theme";

export function ProjectsApp({ isMobile }: { isMobile: boolean }) {
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
