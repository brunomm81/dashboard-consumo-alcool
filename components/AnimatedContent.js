'use client';

// Adaptado do React Bits (reactbits.dev) - AnimatedContent
import { motion } from 'framer-motion';

export default function AnimatedContent({
  children,
  distance = 40,
  direction = 'vertical',
  reverse = false,
  duration = 0.7,
  delay = 0,
  ease = [0.22, 1, 0.36, 1],
  initialOpacity = 0,
  scale = 1,
  className = ''
}) {
  const axis = direction === 'horizontal' ? 'x' : 'y';
  const offset = reverse ? -distance : distance;

  return (
    <motion.div
      className={className}
      initial={{ opacity: initialOpacity, [axis]: offset, scale }}
      whileInView={{ opacity: 1, [axis]: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, delay, ease }}
    >
      {children}
    </motion.div>
  );
}
