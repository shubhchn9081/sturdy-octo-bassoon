import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format numbers with commas for thousands
export function formatNumber(num: number): string {
  return num.toLocaleString(undefined, { maximumFractionDigits: 8 });
}

// Format crypto currency amounts
export function formatCrypto(amount: number): string {
  if (amount === 0) return "0.00000000";
  
  if (amount < 0.00000001) {
    return amount.toExponential(8);
  }
  
  return amount.toFixed(8);
}

// Calculate profit from bet amount and multiplier
export function calculateProfit(amount: number, multiplier: number): number {
  return amount * multiplier;
}

// Generate random number between min and max (inclusive)
export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Format a multiplier with 'x' suffix
export function formatMultiplier(multiplier: number): string {
  return `${multiplier.toFixed(2)}x`;
}

// Format percentage
export function formatPercentage(percentage: number): string {
  return `${percentage.toFixed(2)}%`;
}

// Shorten a string (for usernames)
export function shortenString(str: string, length: number = 8): string {
  if (!str) return "";
  if (str.length <= length) return str;
  return `${str.substring(0, length)}...`;
}

// Convert RGB to HEX
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

// Get a gradient of colors between two hex colors
export function getColorGradient(startColor: string, endColor: string, steps: number): string[] {
  const start = {
    r: parseInt(startColor.slice(1, 3), 16),
    g: parseInt(startColor.slice(3, 5), 16),
    b: parseInt(startColor.slice(5, 7), 16)
  };
  
  const end = {
    r: parseInt(endColor.slice(1, 3), 16),
    g: parseInt(endColor.slice(3, 5), 16),
    b: parseInt(endColor.slice(5, 7), 16)
  };
  
  const gradient = [];
  
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);
    const r = Math.round(start.r + ratio * (end.r - start.r));
    const g = Math.round(start.g + ratio * (end.g - start.g));
    const b = Math.round(start.b + ratio * (end.b - start.b));
    gradient.push(rgbToHex(r, g, b));
  }
  
  return gradient;
}

// Delay execution (for animations)
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Get a random element from an array
export function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}
