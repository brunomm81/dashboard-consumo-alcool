'use client';

// Adaptado do React Bits (reactbits.dev) - GradientText
export default function GradientText({
  children,
  className = '',
  colors = ['#6c8dff', '#35d0ba', '#a78bfa', '#6c8dff'],
  animationSpeed = 6
}) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${colors.join(', ')})`,
    animationDuration: `${animationSpeed}s`
  };

  return (
    <span className={`gradient-text ${className}`} style={gradientStyle}>
      {children}
    </span>
  );
}
