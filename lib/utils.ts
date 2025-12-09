import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidEmail(email: string): boolean {
  // Strict regex: 
  // 1. Alphanumeric + dots/dashes/underscores allowed before @
  // 2. @ symbol required
  // 3. Domain name required (alphanumeric + dots/dashes)
  // 4. TLD required (at least 2 characters, e.g., .com, .it, .co)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}