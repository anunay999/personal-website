import { F } from "../../theme";
import { CLAUDE } from "./claudePalette";

export function ClaudePrompt() {
  return <span style={{ color: CLAUDE.accent, fontWeight: 700, fontFamily: F.mono }}>{"\u203A"}</span>;
}
