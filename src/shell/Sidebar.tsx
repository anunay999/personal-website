import { siteData } from "../siteData";
import { F, SIDEBAR_AVATAR, T, type AppId } from "../theme";
import { AppIcon } from "./AppIcon";

export function Sidebar({ current, onPick }: { current: AppId; onPick: (app: AppId) => void }) {
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
