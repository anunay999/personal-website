export interface ShaderDefinition<State extends object> {
  name: string;
  description?: string;
  fragment: string;
  state: State;
  onPointer?: (
    x: number,
    y: number,
    type: "down" | "up" | "move",
    state: State,
    canvas: HTMLCanvasElement,
  ) => void;
  onScroll?: (deltaY: number, state: State) => void;
  setUniforms?: (gl: WebGLRenderingContext, program: WebGLProgram, state: State) => void;
  tick?: (state: State, dt: number) => void;
  __defaults?: State;
}

export class ShaderRunner<State extends object> {
  private canvas: HTMLCanvasElement;
  private shader: ShaderDefinition<State>;
  private state: State;
  private gl!: WebGLRenderingContext;
  private program!: WebGLProgram;
  private start: number;
  private last: number;
  private running = true;
  private mouse: [number, number];
  private raf = 0;
  private handlers!: {
    down: (e: PointerEvent) => void;
    up: (e: PointerEvent) => void;
    move: (e: PointerEvent) => void;
    wheel: (e: WheelEvent) => void;
  };

  constructor(canvas: HTMLCanvasElement, shader: ShaderDefinition<State>) {
    this.canvas = canvas;
    this.shader = shader;
    this.state = JSON.parse(JSON.stringify(shader.state));

    for (const key in shader.state) {
      const value = shader.state[key];
      if (typeof value === "function") {
        this.state[key] = value;
      }
    }

    this.mouse = [canvas.width / 2, canvas.height / 2];
    this.bind();
    this.initGL();
    this.start = performance.now();
    this.last = this.start;
    this.loop();
  }

  private bind() {
    const getXY = (event: PointerEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      return [
        (event.clientX - rect.left) * (this.canvas.width / rect.width),
        (rect.height - (event.clientY - rect.top)) * (this.canvas.height / rect.height),
      ] as [number, number];
    };

    const send =
      (type: "down" | "up" | "move") =>
      (event: PointerEvent) => {
        const [x, y] = getXY(event);
        this.mouse = [x, y];
        this.shader.onPointer?.(x, y, type, this.state, this.canvas);
      };

    this.handlers = {
      down: (event) => {
        event.preventDefault();
        send("down")(event);
      },
      up: send("up"),
      move: send("move"),
      wheel: (event) => {
        event.preventDefault();
        this.shader.onScroll?.(event.deltaY, this.state);
      },
    };

    this.canvas.addEventListener("pointerdown", this.handlers.down);
    window.addEventListener("pointerup", this.handlers.up);
    window.addEventListener("pointermove", this.handlers.move);
    this.canvas.addEventListener("wheel", this.handlers.wheel, { passive: false });
  }

  private initGL() {
    const gl = this.canvas.getContext("webgl", { antialias: true, preserveDrawingBuffer: false });
    if (!gl) throw new Error("WebGL not supported");

    this.gl = gl;
    const vertexSource = "attribute vec2 a_pos; void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }";

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("Failed to create shader");
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader) || "Unknown shader compile error";
        throw new Error(info);
      }
      return shader;
    };

    const vertexShader = compile(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compile(gl.FRAGMENT_SHADER, this.shader.fragment);
    const program = gl.createProgram();
    if (!program) throw new Error("Failed to create program");
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || "Program link error");
    }

    this.program = program;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const position = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  }

  private resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = this.canvas.clientWidth * dpr;
    const height = this.canvas.clientHeight * dpr;

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.gl.viewport(0, 0, width, height);
    }
  }

  private loop = () => {
    if (!this.running) return;

    this.resize();
    const now = performance.now();
    const dt = (now - this.last) / 1000;
    const time = (now - this.start) / 1000;
    this.last = now;

    this.shader.tick?.(this.state, dt);

    const gl = this.gl;
    const program = this.program;
    gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), this.canvas.width, this.canvas.height);
    gl.uniform2f(gl.getUniformLocation(program, "u_mouse"), this.mouse[0], this.mouse[1]);
    gl.uniform1f(gl.getUniformLocation(program, "u_time"), time);
    this.shader.setUniforms?.(gl, program, this.state);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    this.raf = window.requestAnimationFrame(this.loop);
  };

  destroy() {
    this.running = false;
    window.cancelAnimationFrame(this.raf);
    this.canvas.removeEventListener("pointerdown", this.handlers.down);
    window.removeEventListener("pointerup", this.handlers.up);
    window.removeEventListener("pointermove", this.handlers.move);
    this.canvas.removeEventListener("wheel", this.handlers.wheel);
  }
}
