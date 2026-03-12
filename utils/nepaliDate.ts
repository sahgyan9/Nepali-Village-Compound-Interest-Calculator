import { NepaliDateValue } from '../types';
import { NEPALI_YEAR_START, NEPALI_YEAR_END } from '../constants';

/**
 * Get the number of days in a specific Nepali (BS) month.
 * @param bsYear - Bikram Sambat year
 * @param bsMonth - 1-indexed month (1 = Baishakh, 12 = Chaitra)
 * @returns Number of days in the month, or 32 as a safe fallback
 */
export const getDaysInNepaliMonth = (bsYear: number, bsMonth: number): number => {
  if (typeof window.NepaliDate !== 'function') {
    console.warn('NepaliDate constructor not available for getDaysInNepaliMonth.');
    return 32;
  }
  try {
    if (
      isNaN(bsYear) || isNaN(bsMonth) ||
      bsMonth < 1 || bsMonth > 12 ||
      bsYear < NEPALI_YEAR_START || bsYear > NEPALI_YEAR_END
    ) {
      console.warn(`Invalid year/month for getDaysInNepaliMonth: ${bsYear}, ${bsMonth}`);
      return 32;
    }
    const instance = new window.NepaliDate();
    if (instance && typeof instance.getDaysInMonth === 'function') {
      const days = instance.getDaysInMonth(bsYear, bsMonth - 1); // 0-indexed month
      if (typeof days === 'number' && !isNaN(days) && days >= 1 && days <= 32) {
        return days;
      }
    }
    return 32;
  } catch (e) {
    console.error('Error in getDaysInNepaliMonth:', e);
    return 32;
  }
};

/**
 * Get today's date in Bikram Sambat.
 * Falls back to defaults if the NepaliDate library isn't loaded.
 */
export const getTodayBS = (): NepaliDateValue => {
  if (window.NepaliDate) {
    const bsToday = new window.NepaliDate().getBS();
    return {
      year: bsToday.year,
      month: bsToday.month + 1, // Convert 0-indexed to 1-indexed
      day: bsToday.date,
    };
  }
  console.warn('NepaliDate library not loaded, using fallback date.');
  return { year: 2080, month: 1, day: 1 };
};

/**
 * Safe JSON parse from localStorage with fallback.
 */
export const safeLocalStorageGet = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    console.warn(`Failed to parse localStorage key "${key}", using fallback.`);
    return fallback;
  }
};
