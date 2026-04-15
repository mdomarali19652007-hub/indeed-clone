import type { Variants } from "framer-motion";

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export const staggerContainer = (staggerChildren = 0.08): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren } },
});

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export const slideInFromLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const slideInFromRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const cardHover = {
  y: -2,
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  transition: { duration: 0.2, ease: "easeOut" as const },
};

export const tapScale = {
  scale: 0.95,
};

export const floatingAnimation = {
  y: [0, -8, 0],
  transition: {
    repeat: Infinity,
    duration: 3,
    ease: "easeInOut" as const,
  },
};
