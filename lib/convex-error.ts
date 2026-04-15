import { ConvexError } from "convex/values";

export function getErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (error instanceof ConvexError) {
    return typeof error.data === "string" ? error.data : fallback;
  }
  return fallback;
}
