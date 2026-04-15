"use client";

import React, { useState } from "react";
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";

export function AnimatedTooltip({
  items,
}: {
  items: {
    id: string;
    name: string;
    image: string | null;
    fallback: string;
  }[];
}) {
  const [hoveredIndex, setHoveredIndex] = useState<string | null>(null);
  const springConfig = { stiffness: 100, damping: 5 };
  const x = useMotionValue(0);

  const rotate = useSpring(
    useTransform(x, [-100, 100], [-45, 45]),
    springConfig,
  );

  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig,
  );

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const halfWidth = (event.target as HTMLElement).offsetWidth / 2;
    x.set(event.nativeEvent.offsetX - halfWidth);
  };

  return (
    <div className="flex -space-x-2">
      {items.map((item) => (
        <div
          className="group relative"
          key={item.id}
          onMouseEnter={() => setHoveredIndex(item.id)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence mode="popLayout">
            {hoveredIndex === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 260,
                    damping: 10,
                  },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                style={{
                  translateX: translateX,
                  rotate: rotate,
                  whiteSpace: "nowrap",
                }}
                className="absolute -top-12 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center justify-center rounded-md bg-card px-3 py-1.5 text-xs shadow-xl border border-border"
              >
                <div className="absolute inset-x-4 -bottom-px z-30 h-px bg-gradient-to-r from-transparent via-jade to-transparent" />
                <div className="absolute -bottom-px left-4 z-30 h-px w-2/5 bg-gradient-to-r from-transparent via-jade to-transparent" />
                <span className="relative z-30 text-xs font-medium text-foreground">
                  {item.name}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <div
            onMouseMove={handleMouseMove}
            className="relative flex size-8 items-center justify-center overflow-hidden rounded-full border-2 border-background bg-jade/10 transition-transform duration-200 group-hover:z-30 group-hover:scale-110"
          >
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image}
                alt={item.name}
                className="size-full object-cover"
              />
            ) : (
              <span className="text-xs font-bold text-jade">
                {item.fallback}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
