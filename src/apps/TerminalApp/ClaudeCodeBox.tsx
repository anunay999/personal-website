import { F } from "../../theme";
import { CLAUDE } from "./claudePalette";

const CLAUDE_MASCOT = [
  "▐▛███▜▌",
  "▝▜█████▛▘",
  "  ▘▘ ▝▝  ",
];

export function ClaudeCodeBox({ isMobile }: { isMobile: boolean; recent?: string[] }) {
  const widthCh = isMobile ? 40 : 58;
  const innerWidth = widthCh - 2;
  const titleLabel = " Claude Code ";
  const dashCount = Math.max(2, widthCh - 2 - titleLabel.length);
  const leftDashes = "─".repeat(Math.floor(dashCount / 2));
  const rightDashes = "─".repeat(dashCount - leftDashes.length);
  const topBorder = `╭${leftDashes}${titleLabel}${rightDashes}╮`;
  const bottomBorder = `╰${"─".repeat(widthCh - 2)}╯`;

  const rows: { text: string; tone: "ink" | "accent" | "dim"; blank?: boolean }[] = [
    { text: "", tone: "ink", blank: true },
    { text: "Welcome back!", tone: "ink" },
    { text: "", tone: "ink", blank: true },
    ...CLAUDE_MASCOT.map((line) => ({ text: line, tone: "accent" as const })),
    { text: "", tone: "ink", blank: true },
    { text: "Opus 4.7 · 1M context", tone: "ink" },
    { text: "Claude Pro", tone: "ink" },
    { text: "~/anunay.dev", tone: "dim" },
    { text: "", tone: "ink", blank: true },
  ];

  const toneColor = (tone: "ink" | "accent" | "dim") =>
    tone === "accent" ? CLAUDE.accent : tone === "dim" ? CLAUDE.inkDim : CLAUDE.ink;

  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    width: `${widthCh}ch`,
  };
  const innerStyle: React.CSSProperties = {
    flex: 1,
    width: `${innerWidth}ch`,
    textAlign: "center",
  };

  return (
    <pre
      style={{
        margin: "8px 0 12px",
        fontFamily: F.mono,
        fontSize: "inherit",
        lineHeight: 1.55,
        color: CLAUDE.border,
        whiteSpace: "pre",
        overflowX: "auto",
        display: "inline-block",
      }}
    >
      <div>{topBorder}</div>
      {rows.map((row, i) => (
        <div key={i} style={rowStyle}>
          <span style={{ color: CLAUDE.border }}>│</span>
          <span style={{ ...innerStyle, color: toneColor(row.tone) }}>
            {row.blank ? "\u00A0" : row.text}
          </span>
          <span style={{ color: CLAUDE.border }}>│</span>
        </div>
      ))}
      <div>{bottomBorder}</div>
    </pre>
  );
}
