'use client';

// Fundo "aurora" animado (CSS puro, sem dependencia de WebGL),
// inspirado no efeito Aurora do React Bits (reactbits.dev).
export default function AuroraBackground() {
  return (
    <div className="aurora-bg" aria-hidden="true">
      <div className="aurora-blob aurora-blob--1" />
      <div className="aurora-blob aurora-blob--2" />
      <div className="aurora-blob aurora-blob--3" />
    </div>
  );
}
