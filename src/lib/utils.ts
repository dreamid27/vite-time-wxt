import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const normalizeUrl = (url: string): string => {
  try {
    // Remove protocol and www. prefix, and trailing slashes for comparison
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace('www.', '').toLowerCase();
  } catch {
    return url.toLowerCase();
  }
};
