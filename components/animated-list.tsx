"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import type { ReactNode } from "react";

interface AnimatedListProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
}

export function AnimatedList({
  children,
  className,
  staggerDelay = 0.07,
}: AnimatedListProps) {
  return (
    <motion.div
      variants={staggerContainer(staggerDelay)}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children.map((child, i) => (
        <motion.div key={i} variants={fadeInUp}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
