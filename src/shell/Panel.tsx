import type { ReactNode } from "react";
import { F, T } from "../theme";

export function Panel({
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
