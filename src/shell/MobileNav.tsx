import { F, T, type AppId } from "../theme";
import { AppIcon } from "./AppIcon";

const MOBILE_APPS: Array<{ id: AppId; label: string }> = [
  { id: "home", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "blog", label: "Writing" },
  { id: "about", label: "About" },
  { id: "links", label: "Links" },
  { id: "terminal", label: "Shell" },
];

export function MobileNav({ current, onPick }: { current: AppId; onPick: (app: AppId) => void }) {
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
