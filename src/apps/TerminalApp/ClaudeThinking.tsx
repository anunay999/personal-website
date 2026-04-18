import { useEffect, useRef, useState } from "react";
import { F } from "../../theme";
import { CLAUDE } from "./claudePalette";

const THINKING_WORDS = [
  "Pondering",
  "Cogitating",
  "Synthesizing",
  "Ruminating",
  "Musing",
  "Contemplating",
  "Reticulating splines",
  "Consulting the archives",
  "Stirring the soup",
  "Brewing tokens",
  "Untangling thoughts",
  "Polishing prose",
  "Aligning vectors",
  "Charging the flux capacitor",
  "Counting on fingers",
  "Whispering to the model",
  "Negotiating with entropy",
  "Tuning the resonance",
  "Threading the needle",
  "Composing",
];

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export function ClaudeThinking() {
  const [tick, setTick] = useState(0);
  const [wordIndex, setWordIndex] = useState(() => Math.floor(Math.random() * THINKING_WORDS.length));
  const startedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    const spin = setInterval(() => setTick((t) => t + 1), 80);
    const swap = setInterval(
      () => setWordIndex((i) => (i + 1 + Math.floor(Math.random() * (THINKING_WORDS.length - 1))) % THINKING_WORDS.length),
      2500
    );
    return () => {
      clearInterval(spin);
      clearInterval(swap);
    };
  }, []);

  const elapsed = Math.max(0, Math.floor((Date.now() - startedAtRef.current) / 1000));
  const frame = SPINNER_FRAMES[tick % SPINNER_FRAMES.length];
  const word = THINKING_WORDS[wordIndex];

  return (
    <div style={{ color: CLAUDE.ink, padding: "2px 0 10px", fontFamily: F.mono, display: "flex", gap: 8, alignItems: "baseline" }}>
      <span style={{ color: CLAUDE.accent }}>{"\u23FA"}</span>
      <span style={{ color: CLAUDE.accent, width: "1ch", display: "inline-block" }}>{frame}</span>
      <span>{word}…</span>
      <span style={{ color: CLAUDE.inkFaint }}>({elapsed}s)</span>
    </div>
  );
}
