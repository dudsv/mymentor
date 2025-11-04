import React, { useEffect, useMemo, useState, useRef } from 'react';

/** @typedef {{x:number,y:number}} Pt */
/** @typedef {{start:Pt, ctrl1:Pt, ctrl2:Pt, color:string, gradient:'cyan'|'pink'|'green'|'purple'}} CircuitPath */

// Deterministic generation (no per-render churn)
/** @returns {CircuitPath[]} */
function generateCircuitPaths() {
  /** @type {CircuitPath[]} */
  const paths = [];
  for (let i = 0; i < 9; i++) {
    paths.push({ start: { x: 10 + i * 10, y: 0 }, ctrl1: { x: 10 + i * 10, y: 15 + (i % 3) * 5 }, ctrl2: { x: 30 + i * 5, y: 35 }, color: '#00D4AA', gradient: 'cyan' });
  }
  for (let i = 0; i < 9; i++) {
    paths.push({ start: { x: 10 + i * 10, y: 100 }, ctrl1: { x: 10 + i * 10, y: 85 - (i % 3) * 5 }, ctrl2: { x: 30 + i * 5, y: 65 }, color: '#E91E8C', gradient: 'pink' });
  }
  for (let i = 0; i < 8; i++) {
    paths.push({ start: { x: 0, y: 15 + i * 10 }, ctrl1: { x: 15 + (i % 3) * 5, y: 15 + i * 10 }, ctrl2: { x: 35, y: 35 + i * 5 }, color: '#7AE582', gradient: 'green' });
  }
  for (let i = 0; i < 8; i++) {
    paths.push({ start: { x: 100, y: 15 + i * 10 }, ctrl1: { x: 85 - (i % 3) * 5, y: 15 + i * 10 }, ctrl2: { x: 65, y: 35 + i * 5 }, color: '#7B3FF2', gradient: 'purple' });
  }
  return paths;
}

const CIRCUIT_PATHS = Object.freeze(generateCircuitPaths());
const MOTION = { base: 2.6, variance: 0.4, stagger: 0.06, hexSpin: 28 };
function createMotion(speed /**: 'slow'|'norm'|'fast' */){
  const scale = speed === 'slow' ? 1.25 : speed === 'fast' ? 0.8 : 1;
  const base = MOTION.base * scale;
  const hexSpin = MOTION.hexSpin / (speed === 'fast' ? 1.2 : speed === 'slow' ? 0.8 : 1);
  return { ...MOTION, base, hexSpin };
}

function useStableId(prefix='uid'){ const r = useRef(null); if(r.current==null){ r.current = prefix+'-'+Math.random().toString(36).slice(2);} return r.current; }

export default function NBSHomeSplash({ density = 'mid', speed = 'norm', onComplete }: { density?: 'low'|'mid'|'high', speed?: 'slow'|'norm'|'fast', onComplete?: () => void } = {}) {
  const uid = useStableId('nbs');
  const [reduced, setReduced] = useState(false);
  const [vp, setVp] = useState({ w: typeof window !== 'undefined' ? window.innerWidth : 1280, h: typeof window !== 'undefined' ? window.innerHeight : 720 });

  useEffect(()=>{
    const mq = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    const onChange = () => setReduced(!!mq && mq.matches);
    onChange();
    mq && mq.addEventListener && mq.addEventListener('change', onChange);
    const onR = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onR);
    return ()=>{ mq && mq.removeEventListener && mq.removeEventListener('change', onChange); window.removeEventListener('resize', onR); };
  },[]);

  const circuitPaths = useMemo(()=>CIRCUIT_PATHS,[]);
  const isMobile = vp.w < 768;
  const densityMap = isMobile ? { low: 6, mid: 10, high: 14 } : { low: 12, mid: 20, high: 28 };
  const PULSE_COUNT = densityMap[density] ?? densityMap.mid; // (mantido para futuro uso)

  const motion = useMemo(()=>createMotion(speed),[speed]);
  // Intro reveal toggle (3-step grow) + key to reiniciar
  const [intro, setIntro] = useState(true);
  const [introKey, setIntroKey] = useState(0);
  // Velocidade do reveal (1 = padrão). Maior = mais rápido
  const [introSpeed, setIntroSpeed] = useState(0.5);
  const introDur = useMemo(() => (motion.base * 0.9 / introSpeed), [motion.base, introSpeed]);
  // Auto-reset intro after reveal ends so pulse remains only
  useEffect(() => {
    if (!intro || reduced) {
      if (onComplete) setTimeout(() => onComplete(), 100);
      return;
    }
    const total = (introDur + motion.stagger * (circuitPaths.length - 1)) * 1000 + 120;
    const t = setTimeout(() => {
      setIntro(false);
      if (onComplete) onComplete();
    }, total);
    return () => clearTimeout(t);
  }, [intro, introDur, motion.stagger, circuitPaths.length, reduced, onComplete]);

  // Estado padrão (sem UI)
  const ui = { pins: false, particles: true, trilhas: true, pinRingLoader: true, ringArc: true };
  const chipReactive = false;
  const sides = { cyan: true, pink: true, green: true, purple: true };
  const gain = { cyan: 1, pink: 1, green: 1, purple: 1 };
  const continuous = true;
  const trailDots = false;
  const lockCenter = true;
  const ringStyle = 'classic';
  const ringStroke = 1.7;
  const LOGO_URL = "https://raw.githubusercontent.com/dudsv/nestle-tools/refs/heads/main/image%2041%20(1).png";
  const chip = { x: 570, y: 10, scale: 1.0 };
  const logo = { url: LOGO_URL, visible: true, fit: 'contain' as 'contain'|'cover' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden" style={{ background: '#0a0118' }}>
      {/* subtle grid */}
      <div className="absolute inset-0" style={{ opacity:.10, backgroundImage:'linear-gradient(0deg, transparent 24%, rgba(0,212,170,.1) 25%, rgba(0,212,170,.1) 26%, transparent 27%, transparent 74%, rgba(123,63,242,.1) 75%, rgba(123,63,242,.1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(122,229,130,.1) 25%, rgba(122,229,130,.1) 26%, transparent 27%, transparent 74%, rgba(233,30,140,.1) 75%, rgba(233,30,140,.1) 76%, transparent 77%, transparent)', backgroundSize:'50px 50px' }} />

      {/* main SVG */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden focusable="false">
        <defs>
          <linearGradient id={`${uid}-cyan`} x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#00D4AA" stopOpacity="0"/><stop offset="50%" stopColor="#00D4AA" stopOpacity="1"/><stop offset="100%" stopColor="#00D4AA" stopOpacity=".8"/></linearGradient>
          <linearGradient id={`${uid}-green`} x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#7AE582" stopOpacity="0"/><stop offset="50%" stopColor="#7AE582" stopOpacity="1"/><stop offset="100%" stopColor="#7AE582" stopOpacity=".8"/></linearGradient>
          <linearGradient id={`${uid}-purple`} x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#7B3FF2" stopOpacity="0"/><stop offset="50%" stopColor="#7B3FF2" stopOpacity="1"/><stop offset="100%" stopColor="#7B3FF2" stopOpacity=".8"/></linearGradient>
          <linearGradient id={`${uid}-pink`} x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#E91E8C" stopOpacity="0"/><stop offset="50%" stopColor="#E91E8C" stopOpacity="1"/><stop offset="100%" stopColor="#E91E8C" stopOpacity=".8"/></linearGradient>
          <linearGradient id={`${uid}-ringGrad`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00D4AA"/>
            <stop offset="33%" stopColor="#7AE582"/>
            <stop offset="66%" stopColor="#7B3FF2"/>
            <stop offset="100%" stopColor="#E91E8C"/>
          </linearGradient>
          <filter id={`${uid}-glow`}><feGaussianBlur stdDeviation=".4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id={`${uid}-sglow`}><feGaussianBlur stdDeviation=".9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          {/* defs paths for reference (optional) */}
          {ui.trilhas && circuitPaths.map((p,i)=>{ const d = `M ${p.start.x} ${p.start.y} Q ${p.ctrl1.x} ${p.ctrl1.y}, ${p.ctrl2.x} ${p.ctrl2.y} T 50 50`; return (<path key={`def-${i}`} id={`${uid}-mp-${i}`} d={d} fill="none" stroke="none"/>); })}
          <style>{`@media (prefers-reduced-motion: reduce){ .no-reduce{animation:none!important} }
  .dash{ stroke-dasharray:140 60; animation: dash var(--dashDur,2.4s) linear infinite; animation-delay: var(--animDelay,0s); }
  .pulse{ animation: glow var(--glowDur,2.8s) cubic-bezier(.4,0,.2,1) infinite; animation-delay: var(--animDelay,0s); }
  @keyframes dash{ to{ stroke-dashoffset:-200 } }
  @keyframes glow{ 0%,100%{ opacity:.5 } 50%{ opacity:1 } }
  .texture{ stroke-dasharray:2 2 !important }
  /* Intro reveal (3 steps) */
  .intro{ animation: reveal3 var(--introDur,1.6s) cubic-bezier(.22,.61,.36,1) both; }
  @keyframes reveal3{ 0%{stroke-dasharray:0 100} 33%{stroke-dasharray:35 100} 66%{stroke-dasharray:70 100} 100%{stroke-dasharray:100 0} }
`}</style>
        </defs>

        {/* converging circuits */}
        {ui.trilhas && circuitPaths.map((p, i) => {
          if (!sides[p.gradient]) return null;
          const d = `M ${p.start.x} ${p.start.y} Q ${p.ctrl1.x} ${p.ctrl1.y}, ${p.ctrl2.x} ${p.ctrl2.y} T 50 50`;
          const delay = i * motion.stagger;
          const grad = `${uid}-${p.gradient}`;
          const g = (gain[p.gradient] || 1);
          return (
            <g key={i}>
              {continuous ? (
                <path
                  d={d}
                  key={`p-${i}-${introKey}`}
                  pathLength="100"
                  stroke={`url(#${grad})`}
                  strokeWidth={0.2 * (g || 1)}
                  fill="none"
                  filter={`url(#${uid}-glow)`}
                  className={!reduced ? `pulse ${intro ? 'intro' : ''}` : ''}
                  style={{ ['--glowDur' as any]: `${(motion.base*1.05).toFixed(2)}s`, ['--animDelay' as any]: `${delay}s`, ['--introDur' as any]: `${(motion.base*0.9/introSpeed).toFixed(2)}s` }}
                  opacity="0.9"
                />
              ) : (
                <path
                  d={d}
                  stroke={`url(#${grad})`}
                  strokeWidth={0.2 * (g || 1)}
                  fill="none"
                  filter={`url(#${uid}-glow)`}
                  className={!reduced ? `dash ${isMobile && (i%3===0) ? 'texture' : ''}` : ''}
                  style={{ ['--dashDur' as any]: `${(motion.base*0.92).toFixed(2)}s`, ['--glowDur' as any]: `${(motion.base*1.05).toFixed(2)}s`, ['--animDelay' as any]: `${delay}s` }}
                  opacity="0.8"
                />
              )}
            </g>
          );
        })}
      {/* Ring arc (restaurado) */}
      <g id={`${uid}-pinRingLoader`}>
        <g>
          <circle cx="50" cy="50" r="8.9" fill="none" stroke={`url(#${uid}-ringGrad)`} strokeWidth={ringStroke} strokeDasharray={(ringStyle as string)==='dashed' ? '2 1.2' : undefined} opacity="0.85" filter={`url(#${uid}-glow)`}>
            {!reduced && (
              <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur={`${(motion.base*1.2).toFixed(2)}s`} repeatCount="indefinite" />
            )}
          </circle>
        </g>
      </g>
      </svg>

      {/* center chip */}
      <div className="absolute z-10" style={ lockCenter ? { left:'50%', top:'50%', transform:`translate(-50%, -50%) scale(${chip.scale})`, transformOrigin:'center' } : { left:chip.x, top:chip.y, transform:`scale(${chip.scale})`, transformOrigin:'top left' } }>
        <div className="relative w-72 h-72">
          <div className="absolute inset-12 flex items-center justify-center pointer-events-none">
            <svg width="220" height="220" viewBox="0 0 100 100" aria-hidden focusable="false">
              <defs>
                <linearGradient id={`${uid}-chipG`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00D4AA"/><stop offset="50%" stopColor="#3C63FF"/><stop offset="100%" stopColor="#9BE15D"/></linearGradient>
                <filter id={`${uid}-chipGlow`}><feGaussianBlur stdDeviation=".8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <style>{`.body{fill:#0c1422;stroke:url(#${uid}-chipG);stroke-width:.8;filter:url(#${uid}-chipGlow)} .pin{stroke:#1f2a44;stroke-width:.35}`}</style>
              </defs>
              {/* corpo do chip */}
              {chipReactive ? (
                <g>
                  <polygon points="35,28 65,28 72,35 72,65 65,72 35,72 28,65 28,35" fill="#0c1422" stroke="none" filter={`url(#${uid}-chipGlow)`} />
                  {[{c:'#00D4AA',begin:0},{c:'#7AE582',begin:motion.base*0.25},{c:'#7B3FF2',begin:motion.base*0.50},{c:'#E91E8C',begin:motion.base*0.75}].map((s,idx)=> (
                    <polygon key={`chip-stk-${idx}`} points="35,28 65,28 72,35 72,65 65,72 35,72 28,65 28,35" fill="none" stroke={s.c} strokeWidth={0.8} filter={`url(#${uid}-chipGlow)`} opacity="0.25">
                      {!reduced && (<animate attributeName="opacity" values="0.25;1;0.25" dur={`${(motion.base*1.05).toFixed(2)}s`} begin={`${s.begin.toFixed(2)}s`} repeatCount="indefinite" />)}
                    </polygon>
                  ))}
                </g>
              ) : (
                <polygon className="body" points="35,28 65,28 72,35 72,65 65,72 35,72 28,65 28,35" />
              )}
              {/* janela interna */}
              <rect x="36" y="36" width="28" height="28" rx="2" ry="2" fill="#0a0f1a" stroke="#20324d" strokeWidth=".6" />
              {/* imagem central */}
              {logo.visible && logo.url && (<image href={logo.url} x="36" y="36" width="28" height="28" preserveAspectRatio={logo.fit==='contain' ? 'xMidYMid meet' : 'xMidYMid slice'} />)}
            </svg>
          </div>
        </div>
      </div>

      <style>{`@keyframes ping{0%{transform:scale(.95);opacity:1}50%,100%{transform:scale(1.5);opacity:0}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
