import type { CSSProperties } from "react";
import { Header } from "../shell/Header";
import { siteData } from "../siteData";
import { F, T } from "../theme";

export function AboutApp({ isMobile }: { isMobile: boolean }) {
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
          {(() => {
            const aboutBody: CSSProperties = {
              fontFamily: F.text,
              fontSize: isMobile ? 17.5 : 19,
              lineHeight: 1.7,
              fontWeight: 400,
              letterSpacing: "0.005em",
              fontFeatureSettings: "'kern' 1, 'liga' 1, 'onum' 1",
              margin: 0,
            };
            return (
              <>
                <p style={{ ...aboutBody, color: T.ink }}>
                  Building the AI-native GTM engine and the data platform at{" "}
                  <a
                    href={profile.company.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: T.accent,
                      textDecoration: "none",
                      borderBottom: "1px solid rgba(159,192,255,0.3)",
                      paddingBottom: "0.05em",
                      transition: "border-color 160ms ease",
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.borderBottomColor = "rgba(159,192,255,0.7)";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.borderBottomColor = "rgba(159,192,255,0.3)";
                    }}
                  >
                    Orbital
                  </a>
                  : architecture, enrichment pipelines, and agent orchestration that deliver high-coverage, real-time signals for go-to-market teams.
                </p>
                <p style={{ ...aboutBody, color: T.inkDim, marginTop: 20 }}>
                  I build at the edge of product, data, and intelligence. The goal is simple: systems that scale by orders of magnitude. Before
                  Orbital, I built the Agentforce platform at Salesforce. On weekends, tiramisu.
                </p>
              </>
            );
          })()}
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
