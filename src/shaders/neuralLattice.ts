import type { ShaderDefinition } from "./runner";

export interface NeuralLatticeState {
  pulse: number;
  density: number;
}

export const neuralLatticeShader: ShaderDefinition<NeuralLatticeState> = {
  name: "Neural Lattice",
  description: "Volumetric grid. Drag to propagate a wavefront through the mesh.",
  fragment: `
precision highp float;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_pulse;
uniform float u_density;

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float lattice(vec3 p) {
  vec3 g = fract(p) - 0.5;
  return sdBox(g, vec3(0.03)) - 0.005;
}

float nodes(vec3 p) {
  vec3 g = fract(p) - 0.5;
  return length(g) - 0.08;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  vec2 m = (u_mouse - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);

  float rx = m.y * 0.3;
  float ry = m.x * 0.5 + u_time * 0.03;
  vec3 ro = vec3(sin(ry) * 4.0, sin(rx) * 2.0, cos(ry) * 4.0);
  vec3 fw = normalize(-ro);
  vec3 rt = normalize(cross(fw, vec3(0, 1, 0)));
  vec3 up = cross(rt, fw);
  vec3 rd = normalize(fw + rt * uv.x + up * uv.y);

  vec3 col = vec3(0.02, 0.025, 0.04);
  float t = 0.0;
  float acc = 0.0;
  float nacc = 0.0;

  for (int i = 0; i < 64; i++) {
    vec3 p = ro + rd * t;
    p *= u_density;
    float d = lattice(p);
    float n = nodes(p);

    float pulse = exp(-length(p) * 0.1 - (u_time - u_pulse) * 2.0);
    pulse = max(pulse, 0.0);

    acc += exp(-d * 30.0) * 0.02;
    nacc += exp(-n * 15.0) * 0.04 * (1.0 + pulse * 3.0);

    t += max(min(d, n), 0.05);
    if (t > 12.0) break;
  }

  float age = u_time - u_pulse;
  float wave = exp(-age * 1.2);

  col += vec3(0.35, 0.5, 0.9) * acc;
  col += vec3(0.6, 0.85, 1.0) * nacc * (1.0 + wave * 0.8);
  col += vec3(0.2, 0.6, 1.0) * wave * 0.05;
  col *= 0.95 + 0.05 * sin(gl_FragCoord.y * 2.0);

  gl_FragColor = vec4(col, 1.0);
}
`,
  state: { pulse: -999, density: 1.5 },
  onPointer(_x, _y, type, state) {
    if (type === "down") state.pulse = performance.now() / 1000;
  },
  onScroll(deltaY, state) {
    state.density = Math.max(0.8, Math.min(3.5, state.density + deltaY * 0.001));
  },
  setUniforms(gl, program, state) {
    gl.uniform1f(gl.getUniformLocation(program, "u_pulse"), state.pulse);
    gl.uniform1f(gl.getUniformLocation(program, "u_density"), state.density);
  },
};
