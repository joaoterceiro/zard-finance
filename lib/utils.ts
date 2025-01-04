import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
} 