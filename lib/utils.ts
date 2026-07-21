import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names, letting later Tailwind utilities win over
 * earlier conflicting ones. Every component in this repo composes classes
 * through `cn` so consumers can always override from the outside.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
