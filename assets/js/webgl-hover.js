// Lightweight WebGL ripple/displacement effect for image tiles on hover.
// Progressive enhancement only: skipped on touch devices, coarse pointers,
// reduced-motion preference, or if WebGL is unavailable — the plain <img>
// underneath is always a fully valid fallback.

const VERT = `
  attribute vec2 aPos;
  varying vec2 vUv;
  void main() {
    vUv = aPos * 0.5 + 0.5;
    gl_Position = vec4(aPos, 0.0, 1.0);
  }
`;

const FRAG = `
  precision mediump float;
  varying vec2 vUv;
  uniform sampler2D uTex;
  uniform vec2 uMouse;
  uniform float uStrength;
  uniform float uTime;

  void main() {
    vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
    vec2 diff = uv - uMouse;
    float dist = length(diff);
    float falloff = smoothstep(0.4, 0.0, dist);
    float ripple = sin(dist * 18.0 - uTime * 5.0) * 0.012;
    vec2 offset = normalize(diff + 0.0001) * falloff * uStrength * ripple * 6.0;
    vec2 distorted = uv + offset;
    float scale = 1.0 - uStrength * falloff * 0.05;
    vec2 centered = (distorted - 0.5) * scale + 0.5;
    gl_FragColor = texture2D(uTex, vec2(centered.x, 1.0 - centered.y));
  }
`;

function supportsGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

function compile(gl, type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  return shader;
}

class DistortTile {
  constructor(el) {
    this.el = el;
    this.img = el.querySelector('img');
    this.ready = false;
    this.strength = 0;
    this.targetStrength = 0;
    this.mouse = [0.5, 0.5];
    this.raf = null;
    this.start = performance.now();

    el.addEventListener('mouseenter', () => this.onEnter());
    el.addEventListener('mousemove', (e) => this.onMove(e));
    el.addEventListener('mouseleave', () => this.onLeave());
  }

  init() {
    if (!this.img || !this.img.complete) return false;

    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    this.el.appendChild(canvas);
    this.canvas = canvas;

    const gl = canvas.getContext('webgl', { premultipliedAlpha: false, alpha: true });
    if (!gl) return false;
    this.gl = gl;

    const program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;
    gl.useProgram(program);
    this.program = program;

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.img);

    this.uMouse = gl.getUniformLocation(program, 'uMouse');
    this.uStrength = gl.getUniformLocation(program, 'uStrength');
    this.uTime = gl.getUniformLocation(program, 'uTime');

    this.resize();
    this.ready = true;
    return true;
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.el.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  onEnter() {
    if (!this.ready && !this.init()) return;
    this.el.classList.add('is-distorting');
    this.resize();
    this.targetStrength = 1;
    if (!this.raf) this.loop();
  }

  onMove(e) {
    if (!this.ready) return;
    const rect = this.el.getBoundingClientRect();
    this.mouse = [(e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height];
  }

  onLeave() {
    this.targetStrength = 0;
  }

  loop() {
    this.strength += (this.targetStrength - this.strength) * 0.08;

    if (this.ready) {
      const gl = this.gl;
      gl.uniform2f(this.uMouse, this.mouse[0], this.mouse[1]);
      gl.uniform1f(this.uStrength, this.strength);
      gl.uniform1f(this.uTime, (performance.now() - this.start) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      this.canvas.style.opacity = this.strength > 0.01 ? '1' : '0';
      this.img.style.opacity = this.strength > 0.01 ? '0' : '1';
    }

    if (this.strength > 0.002 || this.targetStrength > 0) {
      this.raf = requestAnimationFrame(() => this.loop());
    } else {
      this.raf = null;
      this.el.classList.remove('is-distorting');
    }
  }
}

export function initDistortion(selector = '.js-distort') {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (reduceMotion || coarsePointer || !supportsGL()) return;

  document.querySelectorAll(selector).forEach((el) => {
    if (el.__distortBound) return;
    el.__distortBound = true;
    new DistortTile(el);
  });
}
