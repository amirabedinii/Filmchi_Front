import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts English digits to Persian digits
 */
export function toPersianDigits(str: string | number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  const strValue = String(str);
  let result = '';
  
  for (let i = 0; i < strValue.length; i++) {
    const char = strValue[i];
    const index = englishDigits.indexOf(char);
    if (index !== -1) {
      result += persianDigits[index];
    } else {
      result += char;
    }
  }
  
  return result;
}

/**
 * Formats a number with Persian digits if language is Persian
 */
export function formatNumber(num: number | string, language: string = 'en'): string {
  const numStr = String(num);
  return language === 'fa' ? toPersianDigits(numStr) : numStr;
}

/**
 * Translates movie status to the current language
 */
export function translateStatus(status: string, t: (key: string) => string): string {
  const translationKey = `movie.statuses.${status}`;
  const translated = t(translationKey);
  
  // If translation doesn't exist, return original status
  if (typeof translated === 'string' && translated !== translationKey) {
    return translated;
  }
  
  // Fallback to original status
  return status;
}
