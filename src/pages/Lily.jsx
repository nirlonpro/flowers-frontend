import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/lily.css";

export default function Lily(){

    const canvasRef = useRef(null);

    const navigate = useNavigate();

    useEffect(()=>{

        const canvas = canvasRef.current;

        const ctx = canvas.getContext("2d");

        let animationId;

       let W, H, CX, BASE;

function resize() {
     const dpr = window.devicePixelRatio || 1;

    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    W = window.innerWidth;
    H = window.innerHeight;

    CX = W / 2;
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
  // A deep, rich background to make the pure white lilies pop beautifully
  const bg = ctx.createRadialGradient(CX, H*0.5, 10, CX, H*0.35, H*0.75);
  bg.addColorStop(0,    '#1c2617'); 
  bg.addColorStop(0.38, '#0c1209');
  bg.addColorStop(0.72, '#050a04');
  bg.addColorStop(1,    '#020501');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  
  const pool = ctx.createRadialGradient(CX, BASE+20, 5, CX, BASE-40, 260);
  pool.addColorStop(0, 'rgba(30, 80, 20, 0.2)');
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
    ctx.fillStyle = s.gold ? `rgba(255,240,200,${a})` : `rgba(220,255,230,${a})`;
    ctx.fill();
  }
}

/* ── sparkles ────────────────────────────── */
const SPARKS = Array.from({length: 32}, () => { const s={}; resetSp(s); s.life=Math.random()*s.max; return s; });
function resetSp(s) {
  s.x    = CX + (Math.random()-0.5)*250;
  s.y    = BASE - 60 - Math.random()*350;
  s.vy   = -0.26 - Math.random()*0.52;
  s.life = 0;
  s.max  = 0.6 + Math.random()*0.5;
  s.sz   = 1.5 + Math.random()*2.5;
  // White/gold/pale green sparkles for the elegant lily aesthetic
  s.hue  = Math.random()<0.5 ? 60+Math.random()*20 : 120+Math.random()*30; 
}
function drawSparkles(show) {
  if (!show) return;
  for (const s of SPARKS) {
    s.life += 0.009;
    if (s.life > s.max) resetSp(s);
    const a = Math.sin((s.life/s.max)*Math.PI) * show;
    ctx.beginPath();
    ctx.arc(s.x + Math.sin(s.life*4)*5, s.y + s.vy*s.life*55, s.sz, 0, Math.PI*2);
    ctx.fillStyle   = `hsla(${s.hue},100%,85%,${a})`;
    ctx.shadowColor = `hsla(${s.hue},100%,95%,${a})`;
    ctx.shadowBlur  = 12;
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
  ctx.shadowBlur  = 3;
  ctx.stroke();
  ctx.shadowBlur  = 0;
}

/* ── long, slender lily leaves ───────────── */
function drawLeaf(x, y, rot, size, prog) {
  if (prog <= 0) return;
  const s = size * prog;
  
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);

  // Lance-shaped lily leaf
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(s * 0.15, s * 0.15, s, 0);
  ctx.quadraticCurveTo(s * 0.15, -s * 0.15, 0, 0);
  
  const lg = ctx.createLinearGradient(0, 0, s, 0);
  lg.addColorStop(0, '#2d5e20');
  lg.addColorStop(1, '#509c3c');
  ctx.fillStyle = lg;
  ctx.fill();

  // Central vein
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(s * 0.5, 0, s * 0.9, 0);
  ctx.strokeStyle = 'rgba(0, 40, 0, 0.4)';
  ctx.lineWidth = s * 0.02;
  ctx.stroke();

  ctx.restore();
}

/* ── elegant white lily ──────────────────── */
function drawFlower(x, y, size, prog, t, wob, stemAngle) {
  if (prog <= 0) return;
  
  const s   = size * prog * 1.6; 
  const rot = (stemAngle + Math.PI/2) * 0.3 + Math.sin(t*0.001 + wob) * 0.04;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);

  // Gradient for the pure white petals with greenish-yellow centers
  const petalGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.7);
  petalGradient.addColorStop(0, '#b8e69c'); // Light green-yellow base
  petalGradient.addColorStop(0.25, '#f5fceb'); // Cream transition
  petalGradient.addColorStop(0.8, '#ffffff'); // Pure white tips
  petalGradient.addColorStop(1, '#f2f2f2');

  function drawPetal(radius, widthScale) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    // Sweeping lily curve
    ctx.bezierCurveTo(-radius * 0.3 * widthScale, -radius * 0.3, -radius * 0.2 * widthScale, -radius * 0.8, 0, -radius);
    ctx.bezierCurveTo(radius * 0.2 * widthScale, -radius * 0.8, radius * 0.3 * widthScale, -radius * 0.3, 0, 0);
    
    ctx.fillStyle = petalGradient;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = 10 * prog;
    ctx.fill();
    
    // Central crease
    ctx.strokeStyle = 'rgba(100, 150, 80, 0.15)';
    ctx.lineWidth = radius * 0.015;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(radius * 0.02, -radius * 0.5, 0, -radius * 0.9);
    ctx.stroke();
    
    // Slight darker edge for depth
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = radius * 0.005;
    ctx.stroke();
  }

  // 1. BACK PETALS (Sepals - slightly narrower)
  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.rotate((i * (Math.PI * 2) / 3));
    drawPetal(s * 0.9, 0.85);
    ctx.restore();
  }

  // 2. FRONT PETALS (Slightly wider, rotated to overlap)
  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.rotate((i * (Math.PI * 2) / 3) + (Math.PI / 3));
    // Add a tiny bit of drop shadow to separate front from back
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 8;
    drawPetal(s, 1.0);
    ctx.restore();
  }

  ctx.shadowBlur = 0;

  // 3. STAMENS & ANTHERS (The pollen stalks)
  for (let i = 0; i < 6; i++) {
    ctx.save();
    const stamenAngle = (i * (Math.PI * 2) / 6) + (Math.PI / 6);
    ctx.rotate(stamenAngle);
    
    // Filament (the pale stalk)
    const filLength = s * 0.55;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(filLength * 0.2, -filLength * 0.6, 0, -filLength);
    ctx.strokeStyle = '#cce3b6';
    ctx.lineWidth = s * 0.02;
    ctx.stroke();

    // Anther (the dark rust-orange pill shape at the end)
    ctx.translate(0, -filLength);
    ctx.rotate(Math.PI / 2 + 0.2); // Anthers usually balance sideways
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.04, s * 0.12, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#9c3d03'; // Rich rust brown/orange
    ctx.fill();
    // Tiny highlight on the anther
    ctx.fillStyle = '#c95e1c';
    ctx.ellipse(-s * 0.01, -s * 0.02, s * 0.015, s * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 4. PISTIL (The thicker central green stalk)
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -s * 0.65);
  ctx.strokeStyle = '#9dc779';
  ctx.lineWidth = s * 0.035;
  ctx.stroke();
  
  // Stigma (the sticky top of the pistil)
  ctx.beginPath();
  ctx.arc(0, -s * 0.65, s * 0.04, 0, Math.PI * 2);
  ctx.fillStyle = '#7aab4d';
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
    { bxo: -100*sc, byo: 0, cp1x: -120*sc, cp1y: -100*sc, cp2x: -150*sc, cp2y: -220*sc, tx: -180*sc, ty: -310*sc, fs: 36*sc, ps:[0.05, 0.46], wob: 1.3 },
    { bxo: -45*sc,  byo: 0, cp1x: -55*sc,  cp1y: -70*sc,  cp2x: -75*sc,  cp2y: -150*sc, tx: -95*sc,  ty: -230*sc, fs: 28*sc, ps:[0.03, 0.41], wob: 0.5 },
    { bxo:   0,     byo: 0, cp1x:   0,     cp1y: -130*sc, cp2x:   0,     cp2y: -265*sc, tx:   0,     ty: -400*sc, fs: 46*sc, ps:[0.00, 0.37], wob: 0.0 },
    { bxo:  45*sc,  byo: 0, cp1x:  55*sc,  cp1y: -70*sc,  cp2x:  75*sc,  cp2y: -150*sc, tx:  95*sc,  ty: -230*sc, fs: 28*sc, ps:[0.04, 0.42], wob: -0.5 },
    { bxo:  100*sc, byo: 0, cp1x:  120*sc, cp1y: -100*sc, cp2x:  150*sc, cp2y: -220*sc, tx: 180*sc,  ty: -310*sc, fs: 36*sc, ps:[0.06, 0.47], wob: -1.4 },
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
  const SD    = '#234a1c'; // Vibrant dark green for lily stems
  const SL    = '#468f3b';   
  const stems = buildStems(sc);

  /* STEMS + LEAVES + FLOWERS */
  stems.forEach((st, idx) => {
    const sx0  = bx + st.bxo,  sy0  = by;
    const sx1  = bx + st.tx,   sy1  = by + st.ty;
    const cp1x = bx + st.cp1x, cp1y = by + st.cp1y;
    const cp2x = bx + st.cp2x, cp2y = by + st.cp2y;
    const sp   = seg(p, st.ps[0], st.ps[1]);

    drawStem(sx0,sy0, cp1x,cp1y, cp2x,cp2y, sx1,sy1, sp, 3.2*sc, SD);
    drawStem(sx0,sy0, cp1x,cp1y, cp2x,cp2y, sx1,sy1, sp, 1.4*sc, SL);

    /* — Lily leaves scattered up the stem — */
    const leafData = [
      { t: 0.15, dir: -1 }, 
      { t: 0.35, dir: 1 }, 
      { t: 0.55, dir: -1 }, 
      { t: 0.75, dir: 1 }
    ];

    leafData.forEach((leaf) => {
      // Don't crowd the shorter stems too much
      if ((idx === 1 || idx === 3) && leaf.t > 0.5) return; 

      if (sp > leaf.t) {
        const [lx, ly] = bezPt(sx0,sy0, cp1x,cp1y, cp2x,cp2y, sx1,sy1, leaf.t);
        const lAngle   = bezAngle(sx0,sy0, cp1x,cp1y, cp2x,cp2y, sx1,sy1, leaf.t);
        const leafRot  = lAngle + (Math.PI / 2.8) * leaf.dir; 
        const lProg    = clamp((sp - leaf.t) * 5, 0, 1); 
        
        drawLeaf(lx, ly, leafRot, st.fs * 1.5, lProg);
      }
    });

    /* — flower — */
    const curT     = Math.min(sp, 1);
    const [fx, fy] = bezPt(sx0,sy0, cp1x,cp1y, cp2x,cp2y, sx1,sy1, curT);
    const angle    = bezAngle(sx0,sy0, cp1x,cp1y, cp2x,cp2y, sx1,sy1, curT);
    const fp       = seg(p, st.ps[1]-0.05, st.ps[1]+0.22);
    
    drawFlower(fx, fy, st.fs, fp, t, st.wob, angle);
  });

  /* SPARKLES */
  drawSparkles(seg(p, 0.32, 0.54));

 animationId = requestAnimationFrame(draw);
}
function resize() {

    const dpr = window.devicePixelRatio || 1;

    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    W = window.innerWidth;
    H = window.innerHeight;

    CX = W / 2;
    BASE = H * 0.87;
}

draw();

        return ()=>{

            window.removeEventListener("resize",resize);

            cancelAnimationFrame(animationId);

        }

    },[]);

    return(

        <>

        <button
        className="backBtn"
        onClick={()=>navigate("/choose")}
        >
        ← Back
        </button>

        <canvas ref={canvasRef}></canvas>


        </>

    );

}