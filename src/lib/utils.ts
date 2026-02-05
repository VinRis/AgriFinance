import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Triggers a device vibration if supported.
 * @param pattern - A single number (ms) or an array of numbers (ms) for a vibration pattern.
 */
export function vibrate(pattern: number | number[] = 10) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Ignore vibration errors (e.g. user gestures)
    }
  }
}
