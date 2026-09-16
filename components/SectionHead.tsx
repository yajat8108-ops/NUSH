'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SectionHeadProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 90,
      damping: 18,
      mass: 0.8,
    },
  },
};

export default function SectionHead({ eyebrow, title, subtitle }: SectionHeadProps) {
  return (
    <motion.div
      className="section-head"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {eyebrow && (
        <motion.span className="eyebrow" variants={childVariants}>
          {eyebrow}
        </motion.span>
      )}
      <motion.h2 variants={childVariants}>{title}</motion.h2>
      {subtitle && (
        <motion.p variants={childVariants}>{subtitle}</motion.p>
      )}
    </motion.div>
  );
}
