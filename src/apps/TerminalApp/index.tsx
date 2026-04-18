import { useEffect, useRef, useState } from "react";
import {
  ClaudeError,
  claudeConfig,
  describeError,
  rateLimitStatus,
  streamClaude,
  type ChatTurn,
} from "../../claude";
import { blogPosts } from "../../content/blog";
import { siteData } from "../../siteData";
import { F, SCENES, T } from "../../theme";
import { ClaudeCodeBox } from "./ClaudeCodeBox";
import { CLAUDE } from "./claudePalette";
import { ClaudePrompt } from "./ClaudePrompt";
import { ClaudeThinking } from "./ClaudeThinking";
import { StarshipPrompt } from "./StarshipPrompt";

export function TerminalApp({ isMobile }: { isMobile: boolean }) {
  type TerminalLine =
    | { type: "sys" | "in" | "out" | "err"; text: string }
    | { type: "claude_card"; recent: string[] }
    | { type: "claude_in"; text: string }
    | { type: "claude_thinking" }
    | { type: "claude_out"; text: string; streaming?: boolean }
    | { type: "claude_err"; text: string };

  const [lines, setLines] = useState<TerminalLine[]>([
    { type: "sys", text: `welcome · ${new Date().toDateString()}` },
    { type: "sys", text: "type `help` for commands, `whoami`, `about`, `links`, `projects`, `claude`, `clear`" },
    { type: "sys", text: "" },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [claudeMode, setClaudeMode] = useState(false);
  const [claudeBusy, setClaudeBusy] = useState(false);
  const claudeHistoryRef = useRef<ChatTurn[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const appendLines = (next: TerminalLine[]) =>
    setLines((current) => [...current, ...next]);

  const recentForCard = () => history.slice(0, 3);

  const enterClaude = (initialPrompt?: string) => {
    setClaudeMode(true);
    claudeHistoryRef.current = [];
    appendLines([{ type: "claude_card", recent: recentForCard() }]);
    if (initialPrompt && initialPrompt.trim()) {
      void runClaudePrompt(initialPrompt.trim());
    }
  };

  const exitClaude = (note?: string) => {
    setClaudeMode(false);
    claudeHistoryRef.current = [];
    if (note) appendLines([{ type: "out", text: note }, { type: "out", text: "" }]);
    else appendLines([{ type: "out", text: "" }]);
  };

  const runClaudePrompt = async (promptText: string) => {
    appendLines([{ type: "claude_in", text: promptText }]);

    const turn: ChatTurn[] = [...claudeHistoryRef.current, { role: "user", text: promptText }];
    setClaudeBusy(true);
    let acc = "";
    const placeholderIndex = { current: -1 };
    setLines((current) => {
      placeholderIndex.current = current.length;
      return [...current, { type: "claude_thinking" }];
    });

    try {
      for await (const chunk of streamClaude(promptText, claudeHistoryRef.current)) {
        acc += chunk;
        setLines((current) => {
          const copy = current.slice();
          const idx = placeholderIndex.current;
          if (idx >= 0 && idx < copy.length) {
            copy[idx] = { type: "claude_out", text: acc, streaming: true };
          }
          return copy;
        });
      }
      setLines((current) => {
        const copy = current.slice();
        const idx = placeholderIndex.current;
        if (idx >= 0 && idx < copy.length) {
          copy[idx] = { type: "claude_out", text: acc || " ", streaming: false };
        }
        return copy;
      });
      claudeHistoryRef.current = [...turn, { role: "model", text: acc }];
    } catch (err) {
      const ce = err instanceof ClaudeError ? err : new ClaudeError("unknown", String(err));
      const message = describeError(ce);
      setLines((current) => {
        const copy = current.slice();
        const idx = placeholderIndex.current;
        if (idx >= 0 && idx < copy.length) {
          copy[idx] = { type: "claude_err", text: `⏿ ${message}` };
        }
        return copy;
      });
    } finally {
      setClaudeBusy(false);
    }
  };

  const handleClaudeSlash = (cmd: string): boolean => {
    const c = cmd.trim().toLowerCase();
    if (c === "/exit" || c === "/quit") {
      appendLines([{ type: "claude_in", text: cmd }]);
      exitClaude("← left claude. back to shell.");
      return true;
    }
    if (c === "/clear") {
      claudeHistoryRef.current = [];
      setLines([]);
      return true;
    }
    if (c === "/help" || c === "?") {
      appendLines([
        { type: "claude_in", text: cmd },
        { type: "claude_out", text: "/help · /clear · /model · /cost · /exit  ·  ↑/↓ history" },
      ]);
      return true;
    }
    if (c === "/model") {
      appendLines([
        { type: "claude_in", text: cmd },
        { type: "claude_out", text: "claude-opus-4.7 · 1M context · streaming" },
      ]);
      return true;
    }
    if (c === "/cost") {
      const { remaining } = rateLimitStatus();
      appendLines([
        { type: "claude_in", text: cmd },
        { type: "claude_out", text: `$0.00 · Claude Pro · ${remaining}/${claudeConfig.rateLimitMax} messages left this hour` },
      ]);
      return true;
    }
    return false;
  };

  const submitInClaudeMode = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    setHistory((current) => [raw, ...current]);
    setHistoryIndex(-1);
    if (text.startsWith("/") || text === "?") {
      if (handleClaudeSlash(text)) return;
    }
    void runClaudePrompt(text);
  };

  const run = (command: string) => {
    const normalized = command.trim().toLowerCase();
    const output: TerminalLine[] = [{ type: "in", text: command }];

    if (normalized === "help") output.push({ type: "out", text: "whoami · about · links · projects · blog · contact · claude · sudo · clear" });
    else if (normalized === "whoami") output.push({ type: "out", text: `${siteData.profile.fullName} — ${siteData.profile.title}` });
    else if (normalized === "about") output.push({ type: "out", text: siteData.profile.bioText });
    else if (normalized === "links") siteData.links.forEach((link) => output.push({ type: "out", text: `  ${link.label.padEnd(9)} ${link.url}` }));
    else if (normalized === "projects") siteData.projects.forEach((project) => output.push({ type: "out", text: `  ${project.name.padEnd(26)} ${project.tech}` }));
    else if (normalized === "blog" || normalized === "writing") blogPosts.forEach((post) => output.push({ type: "out", text: `  ${post.date}  ${post.title}` }));
    else if (normalized === "wallpaper" || normalized === "scenes") output.push({ type: "out", text: `  lattice — ${SCENES[0].hint}` });
    else if (normalized === "contact") output.push({ type: "out", text: `  email: ${siteData.profile.email}` });
    else if (normalized === "sudo" || normalized.startsWith("sudo ")) output.push({ type: "err", text: "  nice try." });
    else if (normalized === "claude" || normalized.startsWith("claude ")) {
      const rest = command.trim().slice("claude".length).trim();
      setLines((current) => [...current, ...output]);
      setHistory((current) => [command, ...current]);
      setHistoryIndex(-1);
      enterClaude(rest || undefined);
      return;
    } else if (normalized === "clear") {
      setLines([]);
      return;
    } else if (normalized !== "") {
      output.push({ type: "err", text: `  command not found: ${normalized}. try \`help\`.` });
    }

    output.push({ type: "out", text: "" });
    setLines((current) => [...current, ...output]);
    setHistory((current) => [command, ...current]);
    setHistoryIndex(-1);
  };

  const cellFont = isMobile ? 12 : 13;
  /* iOS auto-zooms inputs whose font-size is < 16px. Use 16px on touch devices. */
  const inputFont = isMobile ? 16 : 13;

  return (
    <div
      style={{
        height: "100%",
        padding: isMobile ? "20px 16px 16px" : "24px 32px",
        display: "flex",
        flexDirection: "column",
        background: "rgba(4,6,10,0.4)",
      }}
      onClick={() => inputRef.current?.focus()}
    >
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          marginTop: isMobile ? 14 : 20,
          overflow: "auto",
          WebkitOverflowScrolling: "touch",
          fontFamily: F.mono,
          fontSize: cellFont,
          lineHeight: 1.55,
          border: `1px solid ${T.hair}`,
          borderRadius: 4,
          padding: isMobile ? 14 : 18,
          background: "rgba(0,0,0,0.3)",
          minHeight: 0,
        }}
      >
        {lines.map((line, index) => {
          if (line.type === "in") {
            return (
              <div key={`in-${index}`} style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", color: T.ink, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                <StarshipPrompt isMobile={isMobile} />
                <span style={{ marginLeft: 6 }}>{line.text || "\u00A0"}</span>
              </div>
            );
          }
          if (line.type === "claude_card") {
            return <ClaudeCodeBox key={`card-${index}`} isMobile={isMobile} recent={line.recent} />;
          }
          if (line.type === "claude_in") {
            return (
              <div key={`cin-${index}`} style={{ display: "flex", gap: 8, alignItems: "baseline", color: CLAUDE.ink, whiteSpace: "pre-wrap", wordBreak: "break-word", margin: "10px 0 4px" }}>
                <span style={{ color: CLAUDE.inkDim, fontFamily: F.mono, fontWeight: 600 }}>{"\u276F"}</span>
                <span>{line.text}</span>
              </div>
            );
          }
          if (line.type === "claude_thinking") {
            return <ClaudeThinking key={`think-${index}`} />;
          }
          if (line.type === "claude_out") {
            return (
              <div key={`cout-${index}`} style={{ display: "flex", gap: 8, alignItems: "baseline", color: CLAUDE.ink, whiteSpace: "pre-wrap", wordBreak: "break-word", padding: "2px 0 10px" }}>
                <span style={{ color: CLAUDE.accent, fontFamily: F.mono, lineHeight: 1.55 }}>{"\u23FA"}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  {line.text || "\u00A0"}
                  {line.streaming && <span style={{ color: CLAUDE.accent, marginLeft: 2 }}>▍</span>}
                </span>
              </div>
            );
          }
          if (line.type === "claude_err") {
            return (
              <div key={`cerr-${index}`} style={{ display: "flex", gap: 8, alignItems: "baseline", color: CLAUDE.err, whiteSpace: "pre-wrap", wordBreak: "break-word", padding: "2px 0 10px" }}>
                <span style={{ color: CLAUDE.err, fontFamily: F.mono, lineHeight: 1.55 }}>{"\u23FA"}</span>
                <span style={{ flex: 1, minWidth: 0 }}>{line.text}</span>
              </div>
            );
          }
          const color = line.type === "err" ? "#ff8a8a" : line.type === "sys" ? T.inkFaint : T.inkDim;
          return (
            <div key={`${line.type}-${index}`} style={{ color, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {line.text || "\u00A0"}
            </div>
          );
        })}
        {claudeMode ? (
          <div style={{ marginTop: 8 }}>
            <div style={{ borderTop: `1px solid ${CLAUDE.border}33`, paddingTop: 8, display: "flex", gap: 8, alignItems: "baseline", color: CLAUDE.ink }}>
              <ClaudePrompt />
              <input
                ref={inputRef}
                autoFocus={!isMobile}
                value={input}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                inputMode="text"
                enterKeyHint="send"
                placeholder={claudeBusy ? "thinking…" : 'Try "what does anunay work on?"'}
                disabled={claudeBusy}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !claudeBusy) {
                    const value = input;
                    setInput("");
                    submitInClaudeMode(value);
                  } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    const nextIndex = Math.min(historyIndex + 1, history.length - 1);
                    if (history[nextIndex] !== undefined) {
                      setHistoryIndex(nextIndex);
                      setInput(history[nextIndex]);
                    }
                  } else if (event.key === "ArrowDown") {
                    event.preventDefault();
                    const nextIndex = Math.max(historyIndex - 1, -1);
                    setHistoryIndex(nextIndex);
                    setInput(nextIndex === -1 ? "" : history[nextIndex]);
                  } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c") {
                    if (!claudeBusy) {
                      event.preventDefault();
                      setInput("");
                      exitClaude("← left claude. back to shell.");
                    }
                  }
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: CLAUDE.ink,
                  fontFamily: F.mono,
                  fontSize: inputFont,
                  flex: 1,
                  padding: 0,
                  minWidth: 0,
                }}
              />
            </div>
            <div style={{ color: CLAUDE.inkFaint, fontSize: cellFont, marginTop: 4, paddingLeft: 14 }}>
              ? for shortcuts · /exit to leave
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, color: T.ink, marginTop: 4, alignItems: "baseline" }}>
            <StarshipPrompt isMobile={isMobile} />
            <input
              ref={inputRef}
              autoFocus={!isMobile}
              value={input}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              inputMode="text"
              enterKeyHint="send"
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  run(input);
                  setInput("");
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  const nextIndex = Math.min(historyIndex + 1, history.length - 1);
                  if (history[nextIndex] !== undefined) {
                    setHistoryIndex(nextIndex);
                    setInput(history[nextIndex]);
                  }
                } else if (event.key === "ArrowDown") {
                  event.preventDefault();
                  const nextIndex = Math.max(historyIndex - 1, -1);
                  setHistoryIndex(nextIndex);
                  setInput(nextIndex === -1 ? "" : history[nextIndex]);
                }
              }}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: T.ink,
                fontFamily: F.mono,
                fontSize: inputFont,
                flex: 1,
                padding: 0,
                minWidth: 0,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
