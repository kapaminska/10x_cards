import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Simple logger utility for the application
 */
export const logger = {
  info: (message: string, ...args: unknown[]) => {
    if (import.meta.env.MODE === "development") {
      // eslint-disable-next-line no-console
      console.info(message, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    if (import.meta.env.MODE === "development") {
      // eslint-disable-next-line no-console
      console.warn(message, ...args);
    }
  },
  error: (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.error(message, ...args); // Always log errors
  },
};
