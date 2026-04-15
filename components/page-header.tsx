"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="show"
      className="flex items-center justify-between"
    >
      <div>
        <h1 className="font-(family-name:--font-bricolage) text-2xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </motion.div>
  );
}
