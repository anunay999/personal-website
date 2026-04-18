import { F, T } from "../theme";

export function Header({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div>
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 10,
          color: T.inkFaint,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          marginBottom: 14,
        }}
      >
        {eyebrow}
      </div>
      <h1
        style={{
          fontFamily: F.serif,
          fontSize: "clamp(28px, 6vw, 52px)",
          lineHeight: 1.05,
          fontWeight: 400,
          margin: 0,
          color: T.ink,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h1>
      {subtitle ? (
        <div
          style={{
            fontFamily: F.serif,
            fontSize: "clamp(15px, 2.4vw, 17px)",
            color: T.inkDim,
            marginTop: 10,
            fontStyle: "italic",
            maxWidth: 640,
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </div>
  );
}
