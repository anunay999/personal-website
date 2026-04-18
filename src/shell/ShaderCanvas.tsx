import { useEffect, useRef } from "react";
import { ShaderRunner, type ShaderDefinition } from "../shaders/runner";

export function ShaderCanvas<State extends object>({
  shader,
  interactive = true,
}: {
  shader: ShaderDefinition<State>;
  interactive?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    /* Cache the original state on the shader the first time we mount, then
       always start from a deep clone of those defaults. Without the clone,
       remounts (e.g. StrictMode, or navigating away and back) would inherit
       drifted state from the prior session. */
    if (!shader.__defaults) shader.__defaults = JSON.parse(JSON.stringify(shader.state));
    shader.state = JSON.parse(JSON.stringify(shader.__defaults));

    let runner: ShaderRunner<State> | null = null;

    /* Wait for the canvas to have a real measured size before initializing
       GL. If we init too early (before first layout), getBoundingClientRect
       returns 0×0 and we'd paint a tiny framebuffer that the browser
       stretches to fill the hero — producing the intermittent white/blurry
       flash on cold loads. ResizeObserver fires synchronously after the
       first layout pass, deterministically eliminating the race. */
    const start = (width: number, height: number) => {
      if (runner || width === 0 || height === 0) return;
      runner = new ShaderRunner(canvas, shader);
    };

    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      start(rect.width, rect.height);
    }

    /* Always observe — even after a successful sync init — so resizes
       continue to be picked up by the runner's own ResizeObserver after
       handoff. The first observation here only matters when we *didn't*
       init synchronously above. */
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      start(width, height);
    });
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      runner?.destroy();
    };
  }, [shader]);

  return (
    <canvas
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        /* On non-interactive (mobile) renders, let touches through to enable
           page scrolling instead of being captured by shader gestures. */
        touchAction: interactive ? "none" : "auto",
        pointerEvents: interactive ? "auto" : "none",
        display: "block",
        /* Pre-paint background so the canvas matches the shader's clear color
           even before WebGL has issued its first frame. */
        background: "#07080a",
      }}
    />
  );
}
