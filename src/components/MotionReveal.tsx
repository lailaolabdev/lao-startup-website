'use client';

import { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type Direction = 'up' | 'down' | 'left' | 'right';

const offsetByDirection: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 34 },
  down: { x: 0, y: -34 },
  left: { x: 34, y: 0 },
  right: { x: -34, y: 0 },
};

interface MotionRevealProps {
  children: ReactNode;
  className?: string;
  direction?: Direction;
  delay?: number;
  amount?: number;
}

const getMotionState = (direction: Direction, reduceMotion: boolean) => {
  if (reduceMotion) {
    return { hidden: { opacity: 1, x: 0, y: 0 }, visible: { opacity: 1, x: 0, y: 0 } };
  }

  const offset = offsetByDirection[direction];
  return {
    hidden: { opacity: 0, x: offset.x, y: offset.y },
    visible: { opacity: 1, x: 0, y: 0 },
  };
};

export function MotionSection({
  children,
  className,
  direction = 'up',
  delay = 0,
  amount = 0.18,
}: MotionRevealProps) {
  const reduceMotion = useReducedMotion();
  const states = getMotionState(direction, Boolean(reduceMotion));

  return (
    <motion.section
      className={className}
      initial="hidden"
      whileInView="visible"
      variants={states}
      viewport={{ amount, once: false, margin: '-8% 0px -8% 0px' }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.section>
  );
}

export function MotionDiv({
  children,
  className,
  direction = 'up',
  delay = 0,
  amount = 0.2,
}: MotionRevealProps) {
  const reduceMotion = useReducedMotion();
  const states = getMotionState(direction, Boolean(reduceMotion));

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      variants={states}
      viewport={{ amount, once: false, margin: '-8% 0px -8% 0px' }}
      transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
