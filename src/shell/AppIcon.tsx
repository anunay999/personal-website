import type { ReactNode } from "react";
import { T, type AppId } from "../theme";

export function AppIcon({ id, active }: { id: AppId; active: boolean }) {
  const color = active ? T.accent : T.inkFaint;
  const props = { stroke: color, fill: "none", strokeWidth: 1.3 };

  const icons: Record<AppId, ReactNode> = {
    home: (
      <svg width="14" height="14" viewBox="0 0 14 14">
        <path {...props} d="M2 6 L7 2 L12 6 V12 H2 Z" />
      </svg>
    ),
    projects: (
      <svg width="14" height="14" viewBox="0 0 14 14">
        <rect {...props} x="2" y="3" width="10" height="8" rx="1" />
        <line {...props} x1="2" y1="6" x2="12" y2="6" />
      </svg>
    ),
    blog: (
      <svg width="14" height="14" viewBox="0 0 14 14">
        <path {...props} d="M3 2h6l2 2v8H3z" />
        <line {...props} x1="5" y1="6" x2="9" y2="6" />
        <line {...props} x1="5" y1="8" x2="9" y2="8" />
      </svg>
    ),
    about: (
      <svg width="14" height="14" viewBox="0 0 14 14">
        <circle {...props} cx="7" cy="5" r="2" />
        <path {...props} d="M3 12 C 3 9, 11 9, 11 12" />
      </svg>
    ),
    links: (
      <svg width="14" height="14" viewBox="0 0 14 14">
        <path {...props} d="M6 8 L4 10 a2 2 0 0 1 -3 -3 L3 5" />
        <path {...props} d="M8 6 L10 4 a2 2 0 0 1 3 3 L11 9" />
      </svg>
    ),
    terminal: (
      <svg width="14" height="14" viewBox="0 0 14 14">
        <rect {...props} x="1.5" y="3" width="11" height="8" rx="1" />
        <polyline {...props} points="4,6 6,7.5 4,9" />
        <line {...props} x1="7" y1="9" x2="10" y2="9" />
      </svg>
    ),
  };

  return icons[id];
}
