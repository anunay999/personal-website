import { Header } from "../shell/Header";
import { siteData, type LinkItem } from "../siteData";
import { F, T } from "../theme";

export function LinksApp({ isMobile }: { isMobile: boolean }) {
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
