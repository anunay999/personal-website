import type { ReactNode } from "react";
import { F, T } from "../theme";

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

export function OSWindow({
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
