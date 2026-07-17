import { useState, useEffect, useCallback, useRef } from 'react';
import { NepaliDateValue, CalculationResult, CalculationHistoryItem, DurationYMD } from '../types';
import { getTodayBS, safeLocalStorageGet } from '../utils/nepaliDate';

export const STATE_STORAGE_KEY = 'nepali_interest_calc_state';
export const HISTORY_STORAGE_KEY = 'nepali_interest_calc_history';
export const MAX_HISTORY = 50;

// Calculates difference between two Nepali dates in years, months, and days
// Uses a 30-day month assumption for borrowing days.
export const calculateNepaliYMDDifference = (
  startDateVal: NepaliDateValue,
  endDateVal: NepaliDateValue
): DurationYMD => {
  let y1 = Number(startDateVal.year);
  let m1 = Number(startDateVal.month);
  let d1 = Number(startDateVal.day);

  let y2 = Number(endDateVal.year);
  let m2 = Number(endDateVal.month);
  let d2 = Number(endDateVal.day);

  if (d2 < d1) {
    // Borrow days: Assume a 30-day month for borrowing purposes.
    d2 += 30;

    if (m2 === 1) {
      m2 = 12;
      y2 -= 1;
    } else {
      m2 -= 1;
    }
  }

  if (m2 < m1) {
    // Borrow months from the previous year
    m2 += 12;
    y2 -= 1;
  }

  const diffDays = d2 - d1;
  const diffMonths = m2 - m1;
  const diffYears = y2 - y1;

  // Ensure no negative results, though logic above should prevent this for valid date ranges
  return {
    years: Math.max(0, diffYears),
    months: Math.max(0, diffMonths),
    days: Math.max(0, diffDays)
  };
};

export const useCalculator = (t: any, language: string, savedState: Record<string, any>) => {
  const [principal, setPrincipal] = useState<string>(
    savedState.principal !== undefined && savedState.principal !== null ? savedState.principal : ''
  );
  const [monthlyInterestRate, setMonthlyInterestRate] = useState<string>(savedState.monthlyInterestRate || '3');

  const [startDate, setStartDate] = useState<NepaliDateValue>(
    () => ({ year: '', month: '', day: '' })
  );
  const [endDate, setEndDate] = useState<NepaliDateValue>(
    () => ({ year: '', month: '', day: '' })
  );

  const shouldDefaultEndDateToToday = useRef(true);

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isNepaliDateReady, setIsNepaliDateReady] = useState<boolean>(false);
  const [history, setHistory] = useState<CalculationHistoryItem[]>(() =>
    safeLocalStorageGet<CalculationHistoryItem[]>(HISTORY_STORAGE_KEY, [])
  );

  useEffect(() => {
    const checkLibrary = () => {
      if (window.NepaliDate && typeof window.NepaliDate === 'function' && typeof new window.NepaliDate().getBS === 'function') {
        setIsNepaliDateReady(true);
      } else {
        const intervalId = setInterval(() => {
          if (window.NepaliDate && typeof window.NepaliDate === 'function' && typeof new window.NepaliDate().getBS === 'function') {
            setIsNepaliDateReady(true);
            clearInterval(intervalId);
          }
        }, 100);
        return () => clearInterval(intervalId);
      }
    };
    checkLibrary();
  }, []);

  useEffect(() => {
    if (isNepaliDateReady && shouldDefaultEndDateToToday.current) {
      setEndDate(getTodayBS());
      shouldDefaultEndDateToToday.current = false;
    }
  }, [isNepaliDateReady]);

  useEffect(() => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const stateToSave = {
      language,
      principal,
      monthlyInterestRate,
      startDate,
      endDate
    };
    localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [language, principal, monthlyInterestRate, startDate, endDate]);

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  const handlePrincipalChange = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    let cleanValue = parts[0];
    if (parts.length > 1) {
      cleanValue += '.' + parts.slice(1).join('');
    }
    setPrincipal(cleanValue);
    clearResult();
  };

  const handleRateChange = (value: string) => {
    setMonthlyInterestRate(value);
    clearResult();
  };

  const handleStartDateChange = (date: NepaliDateValue) => {
    setStartDate(date);
    clearResult();
  };

  const handleEndDateChange = (date: NepaliDateValue) => {
    setEndDate(date);
    clearResult();
  };

  const addToPrincipal = (amount: number) => {
    setPrincipal((prev) => {
      const current = parseFloat(prev) || 0;
      return (current + amount).toString();
    });
    clearResult();
  };

  const selectRate = (rate: number) => {
    setMonthlyInterestRate(rate.toString());
    clearResult();
  };

  const loadHistoryItem = (item: CalculationHistoryItem) => {
    setPrincipal(item.principal.toString());
    setMonthlyInterestRate(item.monthlyInterestRate.toString());
    setStartDate(item.startDate);
    setEndDate(item.endDate);
    setResult(item.result);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteHistoryItem = (id: string) => {
    if (!window.confirm(t.deleteConfirm)) return;
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearAllHistory = () => {
    if (history.length === 0) return;
    if (!window.confirm(t.clearHistoryConfirm)) return;
    setHistory([]);
  };

  const resetForm = () => {
    setPrincipal('');
    setStartDate({ year: '', month: '', day: '' });
    setEndDate(getTodayBS());
    setMonthlyInterestRate('3');
    clearResult();
  };

  const calculateInterest = useCallback((): boolean => {
    setError(null);
    setResult(null);

    if (!isNepaliDateReady || !window.NepaliDate) {
      setError(t.errorLibrary);
      return false;
    }

    const initialPrincipal = parseFloat(principal);
    const ratePercent = parseFloat(monthlyInterestRate);

    if (isNaN(initialPrincipal) || initialPrincipal <= 0) {
      setError(t.errorPrincipal);
      return false;
    }
    if (isNaN(ratePercent) || ratePercent < 0) {
      setError(t.errorRate);
      return false;
    }

    if (!startDate.year || !startDate.month || !startDate.day || !endDate.year || !endDate.month || !endDate.day) {
      setError(language === 'ne' ? 'कृपया पूर्ण सुरु र अन्तिम मिति छान्नुहोस्।' : 'Please select complete start and end dates.');
      return false;
    }

    try {
      const adStartDateInstance = new window.NepaliDate(Number(startDate.year), Number(startDate.month) - 1, Number(startDate.day));
      const adEndDateInstance = new window.NepaliDate(Number(endDate.year), Number(endDate.month) - 1, Number(endDate.day));

      if (!adStartDateInstance.getAD || !adEndDateInstance.getAD) {
          setError(t.errorConversion);
          return false;
      }

      const adStartDateParts = adStartDateInstance.getAD();
      const jsAdStartDate = new Date(adStartDateParts.year, adStartDateParts.month, adStartDateParts.date);

      const adEndDateParts = adEndDateInstance.getAD();
      const jsAdEndDate = new Date(adEndDateParts.year, adEndDateParts.month, adEndDateParts.date);

      if (jsAdEndDate.getTime() < jsAdStartDate.getTime()) {
        setError(t.errorEndDate);
        return false;
      }

      if (jsAdEndDate.getTime() === jsAdStartDate.getTime()) {
        const durationYMD = { years: 0, months: 0, days: 0 };
        setResult({
          totalAmount: initialPrincipal,
          totalInterest: 0,
          durationYMD,
        });
        return true;
      }

      const durationYMD = calculateNepaliYMDDifference(startDate, endDate);
      const { years: diffYears, months: diffMonths, days: diffDays } = durationYMD;

      const monthlyRateDecimal = ratePercent / 100;
      const annualRateDecimal = monthlyRateDecimal * 12;
      const dailyRateDecimal = monthlyRateDecimal / 30;

      let principalAfterFullYears = initialPrincipal;
      let interestFromFullYears = 0;

      if (diffYears > 0) {
        for (let i = 0; i < diffYears; i++) {
          const interestThisYear = principalAfterFullYears * annualRateDecimal;
          principalAfterFullYears += interestThisYear;
          interestFromFullYears += interestThisYear;
        }
      }

      const equivalentRemainingDays = (diffMonths * 30) + diffDays;
      const interestForRemainingPeriod = principalAfterFullYears * dailyRateDecimal * equivalentRemainingDays;

      const totalInterest = interestFromFullYears + interestForRemainingPeriod;
      const totalAmount = initialPrincipal + totalInterest;

      const newResult: CalculationResult = {
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        totalInterest: parseFloat(totalInterest.toFixed(2)),
        durationYMD,
      };

      setResult(newResult);

      const newHistoryItem: CalculationHistoryItem = {
        id: `${Date.now().toString()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
        principal: initialPrincipal,
        monthlyInterestRate: ratePercent,
        startDate,
        endDate,
        result: newResult,
      };
      setHistory(prev => [newHistoryItem, ...prev].slice(0, MAX_HISTORY));
      return true;

    } catch (e) {
      console.error("Calculation error:", e);
      setError(t.errorGeneral);
      return false;
    }
  }, [principal, monthlyInterestRate, startDate, endDate, isNepaliDateReady, t]);

  return {
    principal,
    monthlyInterestRate,
    startDate,
    endDate,
    result,
    error,
    history,
    isNepaliDateReady,
    handlePrincipalChange,
    handleRateChange,
    handleStartDateChange,
    handleEndDateChange,
    addToPrincipal,
    selectRate,
    loadHistoryItem,
    deleteHistoryItem,
    clearAllHistory,
    calculateInterest,
    resetForm,
    clearResult
  };
};
