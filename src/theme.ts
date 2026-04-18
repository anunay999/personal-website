import type { CSSProperties } from "react";

export const T = {
  desk: "#07080a",
  panelSolid: "#0e1014",
  ink: "#eceff4",
  inkDim: "#8a93a1",
  inkFaint: "#535b69",
  hair: "rgba(236,239,244,0.09)",
  hairBright: "rgba(236,239,244,0.2)",
  accent: "#9fc0ff",
  mint: "#8ce6c8",
};

export const F = {
  mono: "'Geist Mono', ui-monospace, 'SF Mono', Menlo, monospace",
  /* Display serif — high-contrast, designed for headlines & hero type. */
  serif: "'Instrument Serif', 'EB Garamond', Georgia, serif",
  /* Reading serif — optical-sized, designed for long-form body copy. */
  text: "'Source Serif 4', 'Source Serif Pro', 'Iowan Old Style', 'Charter', Georgia, serif",
  sans: "'Inter', -apple-system, system-ui, sans-serif",
};

export const SCENES = [
  { key: "lattice", name: "lattice", hint: "move to orbit · click to pulse · scroll for density" },
] as const;

export const STORAGE_KEY = "anunay_site_app";
export const SIDEBAR_AVATAR = 76;

export const BREAKPOINTS = {
  mobile: 768,
  small: 420,
};

export type AppId = "home" | "projects" | "blog" | "about" | "links" | "terminal";

export const mainStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  /* Critical: without min-height: 0, a flex child's intrinsic height takes
     over and the container can grow past the viewport — pushing the bottom
     nav off-screen. */
  minHeight: 0,
  overflow: "hidden",
  position: "relative",
};
