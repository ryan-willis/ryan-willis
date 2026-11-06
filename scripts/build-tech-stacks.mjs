import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "assets/tech-stacks.svg");
const AVATAR = "https://github.com/ryan-willis.png?size=240";

const DEVICON = "https://raw.githubusercontent.com/devicons/devicon/master/icons";
const VLZ = "https://www.vectorlogo.zone/logos";

const LOGOS = [
  { name: "aws", url: `${DEVICON}/amazonwebservices/amazonwebservices-original.svg`, recolor: { "#252f3e": "#ffffff" } },
  { name: "css3", url: `${DEVICON}/css3/css3-original-wordmark.svg`, recolor: { "#131313": "#ebebeb" } },
  { name: "django", url: "https://cdn.worldvectorlogo.com/logos/django.svg" },
  { name: "docker", url: `${DEVICON}/docker/docker-original-wordmark.svg`, recolor: { "#3a4d54": "#d4eef1" } },
  { name: "figma", url: `${VLZ}/figma/figma-icon.svg` },
  { name: "git", url: `${VLZ}/git-scm/git-scm-icon.svg` },
  { name: "grafana", url: `${VLZ}/grafana/grafana-icon.svg` },
  { name: "html5", url: `${DEVICON}/html5/html5-original-wordmark.svg` },
  { name: "invision", url: `${VLZ}/invisionapp/invisionapp-icon.svg` },
  { name: "javascript", url: `${DEVICON}/javascript/javascript-original.svg` },
  { name: "jenkins", url: `${VLZ}/jenkins/jenkins-icon.svg` },
  { name: "jest", url: `${VLZ}/jestjsio/jestjsio-icon.svg`, recolor: { "#99424f": "#c9566a" } },
  { name: "kubernetes", url: `${VLZ}/kubernetes/kubernetes-icon.svg` },
  { name: "nginx", url: `${DEVICON}/nginx/nginx-original.svg` },
  { name: "nodejs", url: `${DEVICON}/nodejs/nodejs-original-wordmark.svg`, recolor: { "#333": "#e8e8e8" } },
  { name: "postgresql", url: `${DEVICON}/postgresql/postgresql-original-wordmark.svg` },
  { name: "insomnia", url: `${DEVICON}/insomnia/insomnia-original.svg` },
  { name: "python", url: `${DEVICON}/python/python-original.svg` },
  { name: "react", url: `${DEVICON}/react/react-original-wordmark.svg` },
  { name: "redis", url: `${DEVICON}/redis/redis-original-wordmark.svg`, recolor: { "#636466": "#d0d0d0" } },
  { name: "sass", url: `${DEVICON}/sass/sass-original.svg` },
  { name: "sketch", url: `${VLZ}/sketchapp/sketchapp-icon.svg` },
  { name: "tailwind", url: `${VLZ}/tailwindcss/tailwindcss-icon.svg` },
  { name: "typescript", url: `${DEVICON}/typescript/typescript-original.svg` },
];

const SESSION = [
  { cmd: "whoami", out: ["ryan willis, full-stack developer"] },
  { cmd: "uptime", out: ["13 years of experience"] },
  { cmd: "ls ~/projects", out: ["confik  gria  icon-workshop  lankey", "loan-wolf  netivity  qotd"] },
  { cmd: "ls ~/contrib", out: ["vlang/v"] },
  { cmd: "./contact-me", out: ["ryan@ryanwillis.com"] },
];

const W = 1200;
const H = 320;

const USER = "ryan@willis";
const PROMPT_PATH = ":~$ ";
const TERM_SIZE = 16;
const TERM_CH = TERM_SIZE * 0.6;
const TERM_LH = 23;
const TERM_PAD = 16;
const TERM_X = 16;
const TERM_Y = 16;
const TERM_H = H - TERM_Y * 2;
const TERM_COLS = Math.max(...SESSION.flatMap((e) => [USER.length + PROMPT_PATH.length + e.cmd.length, ...e.out.map((o) => o.length)])) + 1;
const TERM_W = TERM_COLS * TERM_CH + TERM_PAD * 2;

const CX = Math.round(TERM_X + TERM_W + (W - TERM_X - TERM_W) / 2);
const CY = H / 2;
const AVATAR_R = 85;

const PRIMARY = "#40b9ff";
const PALE = "#c4ecff";
const TEXT = "#e6f6ff";
const BG = "#02070e";
const LOGO_RAMP = { r: "0.05 0.25 0.85", g: "0.3 0.62 0.95", b: "0.6 0.92 1" };
const RAIN_FONT = "'MS Gothic','Hiragino Kaku Gothic ProN','Hiragino Sans','Yu Gothic','Noto Sans CJK JP',monospace";
const MONO_FONT = "ui-monospace,'SF Mono',SFMono-Regular,Menlo,Consolas,'DejaVu Sans Mono',monospace";
const GLYPHS = [..."ｦｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789Z:=*+<>|"];

let seed = 0x5eed1e;
const rand = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const between = (min, max) => min + rand() * (max - min);
const pick = (list) => list[Math.floor(rand() * list.length)];
const shuffle = (list) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
const n = (value) => Number(value.toFixed(3));
const esc = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function fetchBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

function normalizeLogo(svg, recolor = {}) {
  let out = svg;
  for (const [from, to] of Object.entries(recolor)) {
    out = out.replace(new RegExp(`${from}(?![0-9a-f])`, "gi"), to);
  }
  const root = out.match(/<svg\b[^>]*>/s)[0];
  if (!/viewBox=/i.test(root)) {
    const w = parseFloat(root.match(/\swidth="([\d.]+)/)?.[1] ?? "64");
    const h = parseFloat(root.match(/\sheight="([\d.]+)/)?.[1] ?? "64");
    out = out.replace(root, root.replace(/<svg\b/, `<svg viewBox="0 0 ${w} ${h}"`));
  }
  return out;
}

function glyph(y, chance, { fill, opacity = 1 } = {}) {
  const paint = fill ? ` fill="${fill}"` : "";
  if (rand() >= chance) {
    return `<tspan x="0" y="${y}"${paint} fill-opacity="${opacity}">${esc(pick(GLYPHS))}</tspan>`;
  }
  const dur = n(between(0.6, 2.4));
  const swap = (from, to) => `<animate attributeName="fill-opacity" values="${from};${to}" dur="${dur}s" calcMode="discrete" repeatCount="indefinite"/>`;
  return `<tspan x="0" y="${y}"${paint} fill-opacity="${opacity}">${esc(pick(GLYPHS))}${swap(opacity, 0)}</tspan><tspan x="0" y="${y}"${paint} fill-opacity="0">${esc(pick(GLYPHS))}${swap(0, opacity)}</tspan>`;
}

function rain() {
  const cell = 20;
  const cols = W / cell;
  const rows = Math.ceil(H / cell) + 1;
  const defs = [];
  const columns = [];
  for (let c = 0; c < cols; c++) {
    const x = c * cell + cell / 2;
    const trail = between(110, 260);
    const run = between(4, 9);
    const cycle = run * between(1.1, 1.8);
    const begin = -between(0, cycle);
    defs.push(`<linearGradient id="rain${c}" gradientUnits="userSpaceOnUse" x1="0" y1="${n(-trail)}" x2="0" y2="0">
      <stop offset="0" stop-color="${PRIMARY}" stop-opacity="0.06"/>
      <stop offset="0.12" stop-color="${PRIMARY}" stop-opacity="0.08"/>
      <stop offset="0.85" stop-color="${PRIMARY}" stop-opacity="0.6"/>
      <stop offset="0.97" stop-color="${PALE}" stop-opacity="1"/>
      <stop offset="1" stop-color="${PRIMARY}" stop-opacity="0.06"/>
      <animateTransform attributeName="gradientTransform" type="translate" values="0 0;0 ${n(H + trail + cell)};0 ${n(H + trail + cell)}" keyTimes="0;${n(run / cycle)};1" dur="${n(cycle)}s" begin="${n(begin)}s" repeatCount="indefinite"/>
    </linearGradient>`);
    const spans = [];
    for (let r = 0; r < rows; r++) spans.push(glyph(r * cell + 16, 0.08));
    columns.push(`<text transform="translate(${x} 0) scale(-1 1)" fill="url(#rain${c})">${spans.join("")}</text>`);
  }
  return {
    defs: defs.join("\n    "),
    body: `<g font-family="${RAIN_FONT}" font-size="16" text-anchor="middle">\n    ${columns.join("\n    ")}\n  </g>`,
  };
}

function laneX(order, count) {
  const perSide = Math.ceil(count / 2);
  const gap = 150;
  const bands = [
    [TERM_X + TERM_W + 36, CX - gap],
    [CX + gap, W - 36],
  ];
  const [lo, hi] = bands[order % 2];
  const slot = (Math.floor(order / 2) * 5) % perSide;
  return lo + ((hi - lo) * slot) / (perSide - 1) + between(-6, 6);
}

function fallingLogos(logos) {
  const order = shuffle(logos.map((_, i) => i));
  const size = 52;
  const start = -size / 2 - 14;
  const end = H + 170;
  return logos
    .map((logo, i) => {
      const x = n(laneX(order[i], logos.length));
      const fall = between(4, 9);
      const cycle = n(fall * between(2, 3.2));
      const begin = -n(between(0, cycle));
      const trail = Array.from({ length: 6 }, (_, j) =>
        glyph(-size / 2 - 12 - j * 20, 0.35, { fill: j === 0 ? PALE : PRIMARY, opacity: n(0.85 - j * 0.14) }),
      ).join("");
      return `<g transform="translate(${x} ${start})">
      <animateTransform attributeName="transform" type="translate" values="${x} ${start};${x} ${end};${x} ${end}" keyTimes="0;${n(fall / cycle)};1" dur="${cycle}s" begin="${begin}s" repeatCount="indefinite"/>
      <text transform="scale(-1 1)" font-family="${RAIN_FONT}" font-size="16" text-anchor="middle">${trail}</text>
      <circle r="${size * 0.75}" fill="url(#logoHalo)"/>
      <image href="data:image/svg+xml;base64,${logo.data}" x="${-size / 2}" y="${-size / 2}" width="${size}" height="${size}" filter="url(#logoGlow)"/>
    </g>`;
    })
    .join("\n    ");
}

function avatar(dataUri) {
  const r = AVATAR_R;
  return `<circle cx="${CX}" cy="${CY}" r="${r * 1.9}" fill="url(#avatarHalo)"/>
  <circle cx="${CX}" cy="${CY}" r="${r}" fill="#000"/>
  <image href="${dataUri}" x="${CX - r}" y="${CY - r}" width="${r * 2}" height="${r * 2}" clip-path="url(#avatarClip)" preserveAspectRatio="xMidYMid slice"/>
  <g clip-path="url(#avatarClip)">
    <rect x="${CX - r}" y="${CY - r}" width="${r * 2}" height="3" fill="${PRIMARY}" opacity="0.45" filter="url(#glow)">
      <animate attributeName="y" values="${CY - r - 4};${CY + r}" dur="3.2s" repeatCount="indefinite"/>
    </rect>
  </g>
  <circle cx="${CX}" cy="${CY}" r="${r + 3}" fill="none" stroke="${PRIMARY}" stroke-width="3" filter="url(#glow)">
    <animate attributeName="r" values="${r + 2};${r + 9};${r + 2}" dur="2.5s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite"/>
  </circle>
  <g transform="translate(${CX} ${CY})" fill="none" stroke="${PRIMARY}">
    <circle r="${r + 20}" stroke-width="2" stroke-dasharray="6 4" filter="url(#glow)">
      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="10s" repeatCount="indefinite"/>
    </circle>
    <circle r="${r + 32}" stroke-width="1.5" stroke-dasharray="60 24 6 24" opacity="0.7">
      <animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="16s" repeatCount="indefinite"/>
    </circle>
  </g>`;
}

function consolePanel() {
  const ch = TERM_CH;
  const promptLen = USER.length + PROMPT_PATH.length;
  const x0 = TERM_X + TERM_PAD;
  const top = TERM_Y + 26;
  const rows = Math.floor((TERM_H - 32) / TERM_LH) + 1;
  const typeStep = 0.08;

  const lines = [{ cmd: "", at: 0, typed: [] }];
  const cursor = [{ t: 0, line: 0, col: promptLen }];
  let t = 0;
  for (const entry of SESSION) {
    const line = lines[lines.length - 1];
    line.cmd = entry.cmd;
    const typeStart = t + 0.9;
    for (let i = 1; i <= entry.cmd.length; i++) {
      const at = typeStart + i * typeStep;
      line.typed.push(at);
      cursor.push({ t: at, line: lines.length - 1, col: promptLen + i });
    }
    const outAt = typeStart + entry.cmd.length * typeStep + 0.35;
    for (const text of entry.out) lines.push({ text, at: outAt });
    lines.push({ cmd: "", at: outAt, typed: [] });
    cursor.push({ t: outAt, line: lines.length - 1, col: promptLen });
    t = outAt + 1.2 + entry.out.length * 0.3;
  }
  const cycle = t;

  const kt = (time) => Number((time / cycle).toFixed(4));
  const loop = `dur="${n(cycle)}s" calcMode="discrete" fill="freeze"`;
  const lineY = (i) => top + i * TERM_LH;
  const xs = (text, offset = 0) => [...text].map((_, i) => n(x0 + (offset + i) * ch)).join(" ");

  const pre = (text) => esc(text).replace(/ /g, "\u00a0");
  const scroll = new Map([[0, 0]]);
  lines.forEach((line, i) => {
    if (i >= rows) scroll.set(line.at, Math.max(scroll.get(line.at) ?? 0, (i - rows + 1) * TERM_LH));
  });
  const scrollTimes = [...scroll.keys()];

  const body = lines.map((line, i) => {
    const y = lineY(i);
    let content;
    if (line.text !== undefined) {
      content = `<text y="${y}" x="${xs(line.text)}" fill="${PALE}">${pre(line.text)}</text>`;
    } else {
      content = `<text y="${y}"><tspan x="${xs(USER)}" fill="${PRIMARY}" font-weight="bold">${pre(USER)}</tspan><tspan x="${xs(PROMPT_PATH, USER.length)}" fill="${PALE}">${pre(PROMPT_PATH)}</tspan></text>`;
      if (line.cmd) {
        const widths = [0, ...line.typed.map((_, k) => n((k + 1) * ch))];
        const times = [0, ...line.typed.map(kt)];
        content += `
      <clipPath id="typed${i}">
        <rect x="${n(x0 + promptLen * ch)}" y="${y - TERM_SIZE}" width="0" height="${TERM_SIZE + 6}">
          <animate attributeName="width" values="${widths.join(";")}" keyTimes="${times.join(";")}" ${loop}/>
        </rect>
      </clipPath>
      <text y="${y}" x="${xs(line.cmd, promptLen)}" fill="${TEXT}" clip-path="url(#typed${i})">${pre(line.cmd)}</text>`;
      }
    }
    if (line.at === 0) return `<g>${content}</g>`;
    return `<g opacity="0">
      <animate attributeName="opacity" values="0;1" keyTimes="0;${kt(line.at)}" ${loop}/>
      ${content}
    </g>`;
  });

  return `<g font-family="${MONO_FONT}" font-size="${TERM_SIZE}">
    <clipPath id="term">
      <rect x="${TERM_X}" y="${TERM_Y + 9}" width="${n(TERM_W)}" height="${TERM_H - 11}"/>
    </clipPath>
    <rect x="${TERM_X}" y="${TERM_Y}" width="${n(TERM_W)}" height="${TERM_H}" rx="6" fill="${BG}" fill-opacity="0.8" stroke="${PRIMARY}" stroke-opacity="0.35"/>
    <g clip-path="url(#term)">
      <g>
        <animateTransform attributeName="transform" type="translate" values="${scrollTimes.map((time) => `0 ${-scroll.get(time)}`).join(";")}" keyTimes="${scrollTimes.map(kt).join(";")}" ${loop}/>
        ${body.join("\n        ")}
        <rect x="${n(x0 + promptLen * ch)}" y="${lineY(0) - TERM_SIZE + 3}" width="${n(ch)}" height="${TERM_SIZE + 2}" fill="${PRIMARY}">
          <animate attributeName="x" values="${cursor.map((c) => n(x0 + c.col * ch)).join(";")}" keyTimes="${cursor.map((c) => kt(c.t)).join(";")}" ${loop}/>
          <animate attributeName="y" values="${cursor.map((c) => n(lineY(c.line) - TERM_SIZE + 3)).join(";")}" keyTimes="${cursor.map((c) => kt(c.t)).join(";")}" ${loop}/>
          <animate attributeName="opacity" values="1;0" dur="1s" calcMode="discrete" repeatCount="indefinite"/>
        </rect>
      </g>
    </g>
  </g>`;
}

async function main() {
  const logos = await Promise.all(
    LOGOS.map(async (logo) => {
      const svg = (await fetchBuffer(logo.url)).toString("utf8");
      return { ...logo, data: Buffer.from(normalizeLogo(svg, logo.recolor)).toString("base64") };
    }),
  );
  const avatarData = `data:image/png;base64,${(await fetchBuffer(AVATAR)).toString("base64")}`;
  const matrix = rain();
  const alt = `Tech + Stacks: ${LOGOS.map((logo) => logo.name).join(", ")}`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(alt)}">
  <title>${esc(alt)}</title>
  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="logoGlow" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">
      <feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0 0 0 1 0"/>
      <feComponentTransfer result="tint">
        <feFuncR type="table" tableValues="${LOGO_RAMP.r}"/>
        <feFuncG type="table" tableValues="${LOGO_RAMP.g}"/>
        <feFuncB type="table" tableValues="${LOGO_RAMP.b}"/>
      </feComponentTransfer>
      <feGaussianBlur in="tint" stdDeviation="2.5" result="blur"/>
      <feComponentTransfer in="blur" result="soft"><feFuncA type="linear" slope="0.7"/></feComponentTransfer>
      <feMerge><feMergeNode in="soft"/><feMergeNode in="tint"/></feMerge>
    </filter>
    <radialGradient id="logoHalo">
      <stop offset="0.4" stop-color="#000" stop-opacity="0.85"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="avatarHalo">
      <stop offset="0.45" stop-color="#000" stop-opacity="0.95"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0.55" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.85"/>
    </radialGradient>
    <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="1" fill="#000" fill-opacity="0.3"/>
    </pattern>
    <clipPath id="avatarClip">
      <circle cx="${CX}" cy="${CY}" r="${AVATAR_R}"/>
    </clipPath>
    <clipPath id="frame">
      <rect width="${W}" height="${H}" rx="14"/>
    </clipPath>
    ${matrix.defs}
  </defs>
  <g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  ${matrix.body}
  <g>
    ${fallingLogos(logos)}
  </g>
  ${avatar(avatarData)}
  <rect width="${W}" height="${H}" fill="url(#scan)" pointer-events="none"/>
  <rect width="${W}" height="${H}" fill="url(#vignette)" pointer-events="none"/>
  ${consolePanel()}
  </g>
  <rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" rx="14" fill="none" stroke="${PRIMARY}" stroke-opacity="0.35" stroke-width="1.5"/>
</svg>
`;

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, svg);
  console.log(`wrote ${OUT} (${(svg.length / 1024).toFixed(1)} KiB)`);
}

await main();
