"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AvatarUser {
  id: string;
  firstName: string | null;
  imageUrl: string | null;
}

interface AvatarStackProps {
  users: AvatarUser[];
  developerCount: number;
}

export function AvatarStack({ users, developerCount }: AvatarStackProps) {
  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        {users.map((user, i) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.3 }}
          >
            <Avatar className="size-8 border-2 border-background ring-0">
              {user.imageUrl ? (
                <AvatarImage src={user.imageUrl} alt={user.firstName ?? ""} />
              ) : null}
              <AvatarFallback className="bg-jade/10 text-xs font-bold text-jade">
                {user.firstName?.[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
          </motion.div>
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        Trusted by{" "}
        <span className="font-semibold text-foreground">
          {developerCount > 0 ? `${developerCount}+` : ""}
        </span>{" "}
        developers and growing
      </span>
    </div>
  );
}
