
// Declare NepaliDateConverter library for global access
// This assumes the UMD library loads and attaches itself to the window object as `NepaliDate`
declare global {
  interface Window {
    NepaliDate: any; 
  }
}

export type Language = 'en' | 'ne';

export interface NepaliDateValue {
  year: number;
  month: number; // 1-12 (Baishakh to Chaitra)
  day: number;   // 1-32
}

export interface DurationYMD {
  years: number;
  months: number;
  days: number;
}

export interface CalculationResult {
  totalAmount: number;
  totalInterest: number;
  durationYMD: DurationYMD;
  durationString: string; // e.g., "X Saal Y Mahina Z Din"
}

export interface NepaliMonth {
  value: number;
  name: string;
  neName: string;
}