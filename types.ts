
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
}

export interface NepaliMonth {
  value: number;
  name: string;
  neName: string;
}

export interface CalculationHistoryItem {
  id: string;
  timestamp: string;
  principal: number;
  monthlyInterestRate: number;
  startDate: NepaliDateValue;
  endDate: NepaliDateValue;
  result: CalculationResult;
}

export interface TranslationStrings {
  title: string;
  description: string;
  principalLabel: string;
  npr: string;
  startDateLabel: string;
  endDateLabel: string;
  today: string;
  interestRateLabel: string;
  calculateBtn: string;
  resultsHeading: string;
  interestPeriod: string;
  totalInterest: string;
  totalAmount: string;
  note: string;
  footer: string;
  saal: string;
  mahina: string;
  din: string;
  loading: string;
  errorPrincipal: string;
  errorRate: string;
  errorLibrary: string;
  errorConversion: string;
  errorEndDate: string;
  errorGeneral: string;
  savePng: string;
  bs: string;
  history: string;
  noHistory: string;
  delete: string;
  clearHistory: string;
  aboutTitle: string;
  aboutText: string;
  faqTitle: string;
  faq1Q: string;
  faq1A: string;
  faq2Q: string;
  faq2A: string;
}