import React, { useEffect, useState } from 'react';

/**
 * Loading overlay component.
 * Displays a semi‑transparent backdrop and an animated ring derived from
 * the splash intro. The animation respects the user’s reduced-motion
 * preference. To use, render <LoadingOverlay/> whenever your page is
 * fetching data or transitioning between views.
 */
export default function LoadingOverlay() {
  // honour reduced motion preference
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setReduced(mq.matches);
    handler();
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        background: 'rgba(10, 1, 24, 0.65)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      <svg width="120" height="120" viewBox="0 0 100 100" aria-hidden focusable="false">
        <defs>
          <linearGradient id="loading-ring" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00D4AA" />
            <stop offset="33%" stopColor="#7AE582" />
            <stop offset="66%" stopColor="#7B3FF2" />
            <stop offset="100%" stopColor="#E91E8C" />
          </linearGradient>
          <filter id="loading-glow">
            <feGaussianBlur stdDeviation="0.8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx="50"
          cy="50"
          r="28"
          fill="none"
          stroke="url(#loading-ring)"
          strokeWidth="4"
          filter="url(#loading-glow)"
        >
          {!reduced && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 50 50"
              to="360 50 50"
              dur="2s"
              repeatCount="indefinite"
            />
          )}
        </circle>
      </svg>
    </div>
  );
}