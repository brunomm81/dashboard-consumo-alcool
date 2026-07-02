'use client';

// Adaptado do React Bits (reactbits.dev) - SpotlightCard
import { useRef, useState } from 'react';

export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(108, 141, 255, 0.25)'
}) {
  const divRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  function handleMouseMove(e) {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`spotlight-card ${className}`}
    >
      <div
        className="spotlight-card__glow"
        style={{
          opacity,
          background: `radial-gradient(circle at ${pos.x}px ${pos.y}px, ${spotlightColor}, transparent 70%)`
        }}
      />
      {children}
    </div>
  );
}
