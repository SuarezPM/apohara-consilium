import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn-style class merger: tailwind-aware clsx. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
