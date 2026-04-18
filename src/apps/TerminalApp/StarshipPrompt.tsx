import type { CSSProperties } from "react";
import { F, T } from "../../theme";

export function StarshipPrompt({ isMobile }: { isMobile: boolean }) {
  const segStyle: CSSProperties = { fontFamily: F.mono, whiteSpace: "nowrap" };
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 6, ...segStyle }}>
      <span style={{ color: T.mint }}>~/anunay.dev</span>
      {!isMobile && (
        <>
          <span style={{ color: T.inkFaint }}>on</span>
          <span style={{ color: "#e6c07b" }}>git:(main)</span>
        </>
      )}
      <span style={{ color: T.accent, fontWeight: 600 }}>{"\u276F"}</span>
    </span>
  );
}
