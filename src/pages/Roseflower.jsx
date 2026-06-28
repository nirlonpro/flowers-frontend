import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/rose.css";

export default function Flower() {
    const canvasRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

     let W, H, CX, BASE;
let animationId;
function resize() {
  W    = canvas.width  = window.innerWidth;
  H    = canvas.height = window.innerHeight;
  CX   = W / 2;
  BASE = H * 0.87;
}
resize();
window.addEventListener('resize', resize);

/* ── helpers ─────────────────────────────── */
const clamp   = (v,a,b) => Math.max(a, Math.min(b, v));
const easeOut = x => 1 - Math.pow(1 - x, 3);
const seg     = (p,s,e) => easeOut(clamp((p-s)/(e-s), 0, 1));

/* ── stars ───────────────────────────────── */
const STARS = Array.from({length: 220}, () => ({
  x:     Math.random(),
  y:     Math.random() * 0.80,
  r:     Math.random() * 1.1 + 0.15,
  phase: Math.random() * Math.PI * 2,
  speed: 0.022 + Math.random() * 0.038,
  gold:  Math.random() < 0.18
}));

function drawBg() {
  const bg = ctx.createRadialGradient(CX, H*0.5, 10, CX, H*0.35, H*0.75);
  bg.addColorStop(0,    '#3a0606');
  bg.addColorStop(0.38, '#1c0204');
  bg.addColorStop(0.72, '#0c0105');
  bg.addColorStop(1,    '#030003');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  
  // warm floor glow
  const pool = ctx.createRadialGradient(CX, BASE+20, 5, CX, BASE-40, 260);
  pool.addColorStop(0, 'rgba(90,10,5,0.32)');
  pool.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = pool;
  ctx.fillRect(0, 0, W, H);
}

function drawStars() {
  for (const s of STARS) {
    s.phase += s.speed;
    const a = 0.15 + 0.48 * Math.abs(Math.sin(s.phase));
    ctx.beginPath();
    ctx.arc(s.x*W, s.y*H, s.r, 0, Math.PI*2);
    ctx.fillStyle = s.gold ? `rgba(255,215,120,${a})` : `rgba(255,215,200,${a})`;
    ctx.fill();
  }
}

/* ── sparkles ────────────────────────────── */
const SPARKS = Array.from({length: 42}, () => { const s={}; resetSp(s); s.life=Math.random()*s.max; return s; });
function resetSp(s) {
  s.x    = CX + (Math.random()-0.5)*220;
  s.y    = BASE - 60 - Math.random()*300;
  s.vy   = -0.26 - Math.random()*0.52;
  s.life = 0;
  s.max  = 0.6 + Math.random()*0.5;
  s.sz   = 1.3 + Math.random()*2.3;
  s.hue  = Math.random()<0.65 ? 44+Math.random()*26 : 168+Math.random()*20;
}
function drawSparkles(show) {
  if (!show) return;
  for (const s of SPARKS) {
    s.life += 0.009;
    if (s.life > s.max) resetSp(s);
    const a = Math.sin((s.life/s.max)*Math.PI) * show;
    ctx.beginPath();
    ctx.arc(s.x + Math.sin(s.life*4)*5, s.y + s.vy*s.life*55, s.sz, 0, Math.PI*2);
    ctx.fillStyle   = `hsla(${s.hue},100%,82%,${a})`;
    ctx.shadowColor = `hsla(${s.hue},100%,90%,${a})`;
    ctx.shadowBlur  = 10;
    ctx.fill();
    ctx.shadowBlur  = 0;
  }
}

/* ── bezier helpers ──────────────────────── */
function bezPt(x0,y0, cx1,cy1, cx2,cy2, x1,y1, t) {
  const m = 1-t;
  return [
    m*m*m*x0 + 3*m*m*t*cx1 + 3*m*t*t*cx2 + t*t*t*x1,
    m*m*m*y0 + 3*m*m*t*cy1 + 3*m*t*t*cy2 + t*t*t*y1
  ];
}

function bezAngle(x0,y0, cx1,cy1, cx2,cy2, x1,y1, t) {
  const m = 1-t;
  const dx = 3*m*m*(cx1-x0) + 6*m*t*(cx2-cx1) + 3*t*t*(x1-cx2);
  const dy = 3*m*m*(cy1-y0) + 6*m*t*(cy2-cy1) + 3*t*t*(y1-cy2);
  return Math.atan2(dy, dx);
}

function drawStem(x0,y0, cx1,cy1, cx2,cy2, x1,y1, prog, thick, col) {
  if (prog <= 0) return;
  ctx.beginPath();
  const steps = 48;
  for (let i = 0; i <= steps*prog; i++) {
    const [px,py] = bezPt(x0,y0,cx1,cy1,cx2,cy2,x1,y1, i/steps);
    i === 0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py);
  }
  ctx.strokeStyle = col;
  ctx.lineWidth   = thick;
  ctx.lineCap     = 'round';
  ctx.shadowColor = col;
  ctx.shadowBlur  = 2;
  ctx.stroke();
  ctx.shadowBlur  = 0;
}

/* ── proper side-profile rose ────────────── */
function drawFlower(x, y, size, prog, t, wob, stemAngle) {
  if (prog <= 0) return;

  const s = size * prog * 1.32;

  // Align to stem angle and add natural wind wobble
  const rot = (stemAngle + Math.PI / 2) + Math.sin(t * 0.0012 + wob) * 0.05;

  // Natural, bouquet-like shimmer: fades in with prog
  const shimmer = (0.45 + 0.55 * Math.sin(t * 0.001 + wob * 2.3)) * (0.35 + 0.65 * prog);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);

  // Slight overall bloom glow (subtle; avoids looking like a neon logo)
  ctx.shadowColor = 'rgba(255, 40, 85, 0.65)';
  ctx.shadowBlur = 14 * prog;

  // Petal gradients shared across layers
  const darkGrad = ctx.createLinearGradient(-s * 0.2, -s, s * 0.2, 0);
  darkGrad.addColorStop(0, '#3b000b');
  darkGrad.addColorStop(0.45, '#6f0015');
  darkGrad.addColorStop(1, '#d1002f');

  const midGrad = ctx.createLinearGradient(-s * 0.3, -s * 0.9, s * 0.3, 0);
  midGrad.addColorStop(0, '#a20020');
  midGrad.addColorStop(0.55, '#e2003a');
  midGrad.addColorStop(1, '#ff5a7a');

  const frontGrad = ctx.createLinearGradient(-s * 0.35, -s * 0.55, s * 0.35, 0);
  frontGrad.addColorStop(0, `rgba(255, 15, 65, ${0.98})`);
  frontGrad.addColorStop(0.55, '#ff2f5f');
  frontGrad.addColorStop(1, `rgba(255, 120, 150, ${0.95})`);

  // Turn off glow for geometry to keep edges crisp
  ctx.shadowBlur = 0;

  // 1) Outer cup / back layer (slightly larger, more curved)
  ctx.fillStyle = darkGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-s * 0.55, -s * 0.12, -s * 0.62, -s * 0.86, -s * 0.37, -s * 1.16);
  ctx.quadraticCurveTo(0, -s * 1.08, s * 0.37, -s * 1.16);
  ctx.bezierCurveTo(s * 0.62, -s * 0.86, s * 0.52, -s * 0.12, 0, 0);
  ctx.closePath();
  ctx.fill();

  // 2) Rolled inner bud (narrower + deeper)
  ctx.fillStyle = '#7a0018';
  ctx.beginPath();
  ctx.moveTo(-s * 0.22, -s * 0.33);
  ctx.lineTo(-s * 0.26, -s * 0.98);
  ctx.quadraticCurveTo(0, -s * 1.14, s * 0.26, -s * 0.98);
  ctx.lineTo(s * 0.22, -s * 0.33);
  ctx.closePath();
  ctx.fill();

  // Inner swirl linework
  ctx.strokeStyle = 'rgba(35,0,6,0.55)';
  ctx.lineWidth = s * 0.02;
  ctx.beginPath();
  ctx.moveTo(-s * 0.08, -s * 0.96);
  ctx.quadraticCurveTo(s * 0.06, -s * 0.82, -s * 0.04, -s * 0.52);
  ctx.stroke();

  // 3) Add extra petal layers to feel like a bouquet (kept lightweight)
  const layerProg = clamp((prog - 0.22) / 0.78, 0, 1);

  // Left mid petal (wrap)
  ctx.fillStyle = midGrad;
  ctx.globalAlpha = 0.95;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-s * 0.52, s * 0.02, -s * (0.62 + 0.05 * layerProg), -s * 0.72, -s * 0.31, -s * 1.03);
  ctx.bezierCurveTo(-s * 0.07, -s * 0.84, 0, -s * (0.54 + 0.06 * layerProg), 0, -s * 0.2);
  ctx.closePath();
  ctx.fill();

  // Right mid petal
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(s * 0.52, s * 0.02, s * (0.62 + 0.05 * layerProg), -s * 0.72, s * 0.31, -s * 1.03);
  ctx.bezierCurveTo(s * 0.07, -s * 0.84, 0, -s * (0.54 + 0.06 * layerProg), 0, -s * 0.2);
  ctx.closePath();
  ctx.fill();

  // Outer petal flickers (subtle)
  ctx.globalAlpha = 0.7 * layerProg;
  ctx.fillStyle = '#a30022';
  ctx.beginPath();
  ctx.moveTo(-s * 0.18, -s * 0.45);
  ctx.quadraticCurveTo(0, -s * 0.25, s * 0.2, -s * 0.48);
  ctx.quadraticCurveTo(s * 0.08, -s * 0.63, -s * 0.18, -s * 0.55);
  ctx.closePath();
  ctx.fill();

  // 4) Drooping front petal (main, makes it more natural/bouquet-like)
  ctx.globalAlpha = 1;
  ctx.fillStyle = frontGrad;
  ctx.beginPath();
  ctx.moveTo(-s * 0.38, -s * 0.42);
  // top peeling downwards
  ctx.quadraticCurveTo(0, -s * (0.16 + 0.04 * layerProg), s * 0.38, -s * 0.42);
  // bottom looping under
  ctx.quadraticCurveTo(0, s * (0.06 + 0.03 * layerProg), -s * 0.38, -s * 0.42);
  ctx.closePath();
  ctx.fill();

  // Front highlight (with shimmer)
  ctx.fillStyle = `rgba(255, 120, 160, ${0.35 + 0.35 * shimmer})`;
  ctx.beginPath();
  ctx.moveTo(-s * 0.26, -s * 0.37);
  ctx.quadraticCurveTo(0, -s * (0.15 + 0.03 * layerProg), s * 0.26, -s * 0.37);
  ctx.quadraticCurveTo(0, -s * (0.06 + 0.02 * layerProg), -s * 0.26, -s * 0.37);
  ctx.closePath();
  ctx.fill();

  // 5) Small secondary highlight vein
  ctx.strokeStyle = `rgba(255, 220, 230, ${0.25 + 0.35 * prog})`;
  ctx.lineWidth = s * 0.012;
  ctx.beginPath();
  ctx.moveTo(-s * 0.14, -s * 0.4);
  ctx.quadraticCurveTo(0, -s * 0.26, s * 0.14, -s * 0.4);
  ctx.stroke();

  // 6) Sepals (more natural, slightly less symmetric)
  ctx.fillStyle = '#1b6522';
  ctx.beginPath();
  ctx.moveTo(0, s * 0.055);
  ctx.lineTo(-s * 0.31, -s * 0.1);
  ctx.lineTo(-s * 0.11, -s * 0.02);
  ctx.lineTo(-s * 0.42, -s * 0.26);
  ctx.lineTo(-s * 0.16, -s * 0.05);
  ctx.lineTo(0, -s * 0.16);
  ctx.lineTo(s * 0.16, -s * 0.05);
  ctx.lineTo(s * 0.42, -s * 0.26);
  ctx.lineTo(s * 0.11, -s * 0.02);
  ctx.lineTo(s * 0.31, -s * 0.1);
  ctx.lineTo(0, s * 0.055);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/* ════════════════════════════════════════════
   STEMS
   ════════════════════════════════════════════ */
const START    = Date.now();
const DURATION = 5400;
let   progress = 0;

function buildStems(sc) {
  return [
    { bxo: -90*sc,  byo: 0, cp1x: -110*sc, cp1y: -100*sc, cp2x: -140*sc, cp2y: -220*sc, tx: -170*sc, ty: -310*sc, fs: 36*sc, ps:[0.05, 0.46], wob: 1.3 },
    { bxo: -40*sc,  byo: 0, cp1x: -50*sc,  cp1y: -70*sc,  cp2x: -65*sc,  cp2y: -150*sc, tx: -85*sc,  ty: -210*sc, fs: 26*sc, ps:[0.03, 0.41], wob: 0.5 },
    { bxo:   0,     byo: 0, cp1x:   0,     cp1y: -130*sc, cp2x:   0,     cp2y: -265*sc, tx:   0,     ty: -380*sc, fs: 46*sc, ps:[0.00, 0.37], wob: 0.0 },
    { bxo:  40*sc,  byo: 0, cp1x:  50*sc,  cp1y: -70*sc,  cp2x:  65*sc,  cp2y: -150*sc, tx:  85*sc,  ty: -210*sc, fs: 26*sc, ps:[0.04, 0.42], wob: -0.5 },
    { bxo:  90*sc,  byo: 0, cp1x:  110*sc, cp1y: -100*sc, cp2x:  140*sc, cp2y: -220*sc, tx: 170*sc,  ty: -310*sc, fs: 36*sc, ps:[0.06, 0.47], wob: -1.4 },
  ];
}

function draw() {
  const elapsed = Date.now() - START;
  progress = Math.min(elapsed / DURATION, 1);
  const p  = progress;
  const t  = elapsed;

  ctx.clearRect(0, 0, W, H);
  drawBg();
  drawStars();

  let sc = Math.min(W, H) / 700;

if (W < 768) {
    sc = W / 480;
}

if (W < 480) {
    sc = W / 560;
}

  const bx    = CX;
  const by    = BASE;
  const SD    = '#1b6522';   
  const SL    = '#2caa38';   
  const stems = buildStems(sc);

  /* STEMS + FLOWERS */
  stems.forEach((st) => {
    const sx0  = bx + st.bxo,  sy0  = by;
    const sx1  = bx + st.tx,   sy1  = by + st.ty;
    const cp1x = bx + st.cp1x, cp1y = by + st.cp1y;
    const cp2x = bx + st.cp2x, cp2y = by + st.cp2y;
    const sp   = seg(p, st.ps[0], st.ps[1]);

    /* — stem — */
    drawStem(sx0,sy0, cp1x,cp1y, cp2x,cp2y, sx1,sy1, sp, 2.8*sc, SD);
    drawStem(sx0,sy0, cp1x,cp1y, cp2x,cp2y, sx1,sy1, sp, 1.4*sc, SL);

    /* — flower — */
    const curT     = Math.min(sp, 1);
    const [fx, fy] = bezPt(sx0,sy0, cp1x,cp1y, cp2x,cp2y, sx1,sy1, curT);
    const angle    = bezAngle(sx0,sy0, cp1x,cp1y, cp2x,cp2y, sx1,sy1, curT);
    const fp       = seg(p, st.ps[1]-0.05, st.ps[1]+0.22);
    const flowerSize =
    W < 480 ? st.fs * 0.68 :
    W < 768 ? st.fs * 0.82 :
    st.fs;

drawFlower(fx, fy, flowerSize, fp, t, st.wob, angle);
  });

  /* SPARKLES */
  drawSparkles(seg(p, 0.32, 0.54));

 animationId = requestAnimationFrame(draw);
}

draw();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <>
            <button
                className="backBtn"
                onClick={() => navigate("/choose")}
            >
                ← Back
            </button>

            <canvas ref={canvasRef}></canvas>
        </>
    );
}