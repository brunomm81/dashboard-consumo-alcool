'use client';

// Adaptado do React Bits (reactbits.dev) - CountUp
import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';

export default function CountUp({
  to,
  from = 0,
  direction = 'up',
  delay = 0,
  duration = 2,
  className = '',
  startWhen = true,
  separator = '',
  decimals = 0,
  suffix = '',
  prefix = '',
  onEnd
}) {
  const ref = useRef(null);
  const motionValue = useMotionValue(direction === 'down' ? to : from);

  const damping = 20 + 40 * (1 / duration);
  const stiffness = 100 * (1 / duration);
  const springValue = useSpring(motionValue, { damping, stiffness });

  const isInView = useInView(ref, { once: true, margin: '0px' });

  const format = (value) => {
    const fixed = Number(value).toFixed(decimals);
    const parts = fixed.split('.');
    if (separator) {
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    }
    return prefix + parts.join('.') + suffix;
  };

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = format(direction === 'down' ? to : from);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isInView && startWhen) {
      const startTimer = setTimeout(() => {
        motionValue.set(direction === 'down' ? from : to);
      }, delay * 1000);

      // Garante que o valor final exibido seja exatamente o alvo (o spring
      // pode parar de emitir eventos um passo antes de assentar).
      const target = direction === 'down' ? from : to;
      const endTimer = setTimeout(() => {
        if (ref.current) ref.current.textContent = format(target);
      }, (delay + duration) * 1000 + 100);

      return () => {
        clearTimeout(startTimer);
        clearTimeout(endTimer);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView, startWhen, motionValue, direction, from, to, delay, duration]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = format(latest);
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [springValue, decimals, separator, prefix, suffix]);

  useEffect(() => {
    if (!onEnd) return;
    const unsubscribe = springValue.on('change', (latest) => {
      const target = direction === 'down' ? from : to;
      if (Math.abs(latest - target) < Math.pow(10, -decimals) / 2) onEnd();
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [springValue]);

  return <span className={className} ref={ref} />;
}
