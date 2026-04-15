"use client";

import { motion } from "framer-motion";
import { fadeInUp, floatingAnimation } from "@/lib/animations";
import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="show">
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <motion.div animate={floatingAnimation}>
            <Icon className="size-8 text-muted-foreground/50" />
          </motion.div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
          {action}
        </CardContent>
      </Card>
    </motion.div>
  );
}
