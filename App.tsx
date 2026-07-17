
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toPng } from 'html-to-image';
import NepaliDateInput from './components/NepaliDateInput';
import ContactModal from './components/ContactModal';
import InfoSections from './components/InfoSections';
import { NepaliDateValue, CalculationResult, CalculationHistoryItem, DurationYMD, Language } from './types';
import {
  CalendarIcon,
  CurrencyNPRIcon,
  PercentIcon,
  TRANSLATIONS,
  NEPALI_MONTHS,
  QUICK_ADD_PRINCIPALS,
  QUICK_SELECT_RATES,
  DEFAULT_NEPALI_YEAR,
  DEFAULT_NEPALI_MONTH,
  DEFAULT_NEPALI_DAY,
} from './constants';
import { getTodayBS, safeLocalStorageGet } from './utils/nepaliDate';

// Calculates difference between two Nepali dates in years, months, and days
// Uses a 30-day month assumption for borrowing days.


const calculateNepaliYMDDifference = (
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


const STATE_STORAGE_KEY = 'nepali_interest_calc_state';
const HISTORY_STORAGE_KEY = 'nepali_interest_calc_history';
const MAX_HISTORY = 50;

const pad2 = (n: number) => n.toString().padStart(2, '0');

const App: React.FC = () => {
  // Load persisted state safely (avoids crash from corrupted localStorage)
  const savedState = safeLocalStorageGet<Record<string, any>>(STATE_STORAGE_KEY, {});

  const [language, setLanguage] = useState<Language>(savedState.language || 'en');
  const t = TRANSLATIONS[language];
  const resultRef = useRef<HTMLDivElement>(null);
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
  
  // Set end date to today on initial load when the date library is ready
  const shouldDefaultEndDateToToday = useRef(true);

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isNepaliDateReady, setIsNepaliDateReady] = useState<boolean>(false);
  const [history, setHistory] = useState<CalculationHistoryItem[]>(() =>
    safeLocalStorageGet<CalculationHistoryItem[]>(HISTORY_STORAGE_KEY, [])
  );
  const [exportItem, setExportItem] = useState<CalculationHistoryItem | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || !('theme' in localStorage);
    }
    return true;
  });

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  };

  useEffect(() => {
    if (isNepaliDateReady && shouldDefaultEndDateToToday.current) {
      setEndDate(getTodayBS());
      shouldDefaultEndDateToToday.current = false;
    }
  }, [isNepaliDateReady]);

  // Persist history to localStorage. History lives entirely client-side:
  // there is no backend in this static deployment, and per-device storage
  // also means one visitor never sees or deletes another visitor's figures.
  useEffect(() => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

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

  const downloadHistoryItem = (item: CalculationHistoryItem) => {
    setExportItem(item);
  };

  // Export hidden history snapshot to PNG once it has actually rendered.
  // Driven by exportRef availability rather than a fixed setTimeout delay.
  useEffect(() => {
    if (!exportItem) return;

    let cancelled = false;

    const run = async () => {
      if (!exportRef.current) return;
      try {
        const monthName = NEPALI_MONTHS.find(m => m.value === exportItem.startDate.month)?.name || exportItem.startDate.month;
        const fileName = `History_${exportItem.startDate.day}-${monthName}-${exportItem.startDate.year}_${exportItem.monthlyInterestRate}_${exportItem.principal}.png`;

        const dataUrl = await toPng(exportRef.current, {
          cacheBust: true,
          backgroundColor: '#ffffff',
        });

        if (cancelled) return;
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Failed to export history item:', err);
      } finally {
        if (!cancelled) setExportItem(null);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [exportItem]);

  // Persist state to localStorage
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

  const formatNumber = (num: number | string) => {
    const n = Number(num);
    return isNaN(n) ? num.toString() : n.toLocaleString('en-IN');
  };

  const formatInputValue = (val: string) => {
    if (!val) return '';
    const parts = val.split('.');
    const num = Number(parts[0]);
    if (isNaN(num)) return val;
    let formatted = num.toLocaleString('en-IN');
    if (parts.length > 1) {
      formatted += '.' + parts.slice(1).join('');
    } else if (val.endsWith('.')) {
      formatted += '.';
    }
    return formatted;
  };

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

  // Adds a quick-add amount to the current principal instead of replacing it,
  // so tapping 30,000 then 20,000 results in 50,000.
  const addToPrincipal = (amount: number) => {
    setPrincipal((prev) => {
      const current = parseFloat(prev) || 0;
      return (current + amount).toString();
    });
    clearResult();
  };

  const formatQuickAddLabel = (amount: number) => {
    if (amount % 100000 === 0) {
      const lakhs = amount / 100000;
      return language === 'ne' ? `${lakhs} लाख` : `${lakhs} Lakh`;
    }
    return formatNumber(amount);
  };

  // Rate chips set the value directly (unlike the additive principal chips) since
  // interest rates are a single selection, not a sum of amounts.
  const selectRate = (rate: number) => {
    setMonthlyInterestRate(rate.toString());
    clearResult();
  };

  const formatDuration = (duration: DurationYMD) => {
    const { years, months, days } = duration;
    return `${years} ${t.saal} ${months} ${t.mahina} ${days} ${t.din}`;
  };

  // Compact, zero-padded numeric form (e.g. 2080-01-05).
  const formatDate = (date: NepaliDateValue) => {
    return `${date.year}-${pad2(date.month)}-${pad2(date.day)}`;
  };

  // Friendlier form with the Nepali month name for the results summary
  // (e.g. 05 Baishakh 2080 / ०५ बैशाख २०८०).
  const formatDateWithMonthName = (date: NepaliDateValue) => {
    const month = NEPALI_MONTHS.find(m => m.value === date.month);
    const monthName = month ? (language === 'ne' ? month.neName : month.name) : pad2(date.month);
    return `${pad2(date.day)} ${monthName} ${date.year}`;
  };

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

  const calculateInterest = useCallback(() => {
    setError(null);
    setResult(null);

    if (!isNepaliDateReady || !window.NepaliDate) {
      setError(t.errorLibrary);
      return;
    }

    const initialPrincipal = parseFloat(principal);
    const ratePercent = parseFloat(monthlyInterestRate);

    if (isNaN(initialPrincipal) || initialPrincipal <= 0) {
      setError(t.errorPrincipal);
      return;
    }
    if (isNaN(ratePercent) || ratePercent < 0) {
      setError(t.errorRate);
      return;
    }

    if (!startDate.year || !startDate.month || !startDate.day || !endDate.year || !endDate.month || !endDate.day) {
      setError(language === 'ne' ? 'कृपया पूर्ण सुरु र अन्तिम मिति छान्नुहोस्।' : 'Please select complete start and end dates.');
      return;
    }

    try {
      const adStartDateInstance = new window.NepaliDate(Number(startDate.year), Number(startDate.month) - 1, Number(startDate.day));
      const adEndDateInstance = new window.NepaliDate(Number(endDate.year), Number(endDate.month) - 1, Number(endDate.day));

      if (!adStartDateInstance.getAD || !adEndDateInstance.getAD) {
          setError(t.errorConversion);
          return;
      }

      const adStartDateParts = adStartDateInstance.getAD();
      const jsAdStartDate = new Date(adStartDateParts.year, adStartDateParts.month, adStartDateParts.date);

      const adEndDateParts = adEndDateInstance.getAD();
      const jsAdEndDate = new Date(adEndDateParts.year, adEndDateParts.month, adEndDateParts.date);

      if (jsAdEndDate.getTime() < jsAdStartDate.getTime()) {
        setError(t.errorEndDate);
        return;
      }

      if (jsAdEndDate.getTime() === jsAdStartDate.getTime()) {
        const durationYMD = { years: 0, months: 0, days: 0 };
        setResult({
          totalAmount: initialPrincipal,
          totalInterest: 0,
          durationYMD,
        });
        return;
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

      // Save to local history (client-side only; see HISTORY_STORAGE_KEY effect above).
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

    } catch (e) {
      console.error("Calculation error:", e);
      setError(t.errorGeneral);
    }
  }, [principal, monthlyInterestRate, startDate, endDate, isNepaliDateReady, t]);

  const saveAsPng = useCallback(() => {
    if (resultRef.current === null) {
      return;
    }

    const monthName = NEPALI_MONTHS.find(m => m.value === startDate.month)?.name || startDate.month;
    const fileName = `${startDate.day}-${monthName}-${startDate.year}_${monthlyInterestRate}_${principal}.png`;

    toPng(resultRef.current, {
      cacheBust: true,
      backgroundColor: '#ffffff',
      filter: (node) => {
        const exclusionClasses = ['no-export'];
        return !exclusionClasses.some(cls => node.classList?.contains(cls));
      }
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('oops, something went wrong!', err);
      });
  }, [resultRef, startDate, monthlyInterestRate, principal]);

  if (!isNepaliDateReady) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#fdf6e3] via-[#faf0dc] to-[#f0dfb8] dark:from-gray-950 dark:via-slate-900 dark:to-teal-950 animated-bg py-8 px-4 flex flex-col items-center transition-colors duration-300">
        <article className="bg-emerald-50/90 dark:bg-slate-900/80 dark:border dark:border-slate-800 glass-card shadow-2xl rounded-2xl p-6 md:p-10 w-full max-w-2xl transition-colors duration-300" id="calculator">
          <header className="mb-8 text-center">
            <img src="/favicon.svg" alt="" aria-hidden="true" width={48} height={48} className="mx-auto mb-3 rounded-xl shadow-sm" />
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">
              {t.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{t.description}</p>
          </header>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="loading-spinner mb-4"></div>
            <div className="text-base font-medium text-gray-500">{t.loading}</div>
          </div>
        </article>
        <InfoSections t={t} onContactClick={() => setShowContactModal(true)} />
        <ContactModal open={showContactModal} onClose={() => setShowContactModal(false)} t={t} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#fdf6e3] via-[#faf0dc] to-[#f0dfb8] dark:from-gray-950 dark:via-slate-900 dark:to-teal-950 animated-bg py-8 px-4 flex flex-col items-center transition-colors duration-300">
      <article className="bg-emerald-50/90 dark:bg-slate-900/80 dark:border dark:border-slate-800 glass-card shadow-2xl rounded-2xl p-6 md:p-10 w-full max-w-2xl transition-colors duration-300">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')}
            className="px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-200 dark:border-emerald-800"
            aria-label={language === 'en' ? 'Switch to Nepali language' : 'Switch to English language'}
          >
            {language === 'en' ? 'नेपालीमा हेर्नुहोस्' : 'View in English'}
          </button>
        </div>
        <header className="mb-8 text-center">
          <img src="/favicon.svg" alt="" aria-hidden="true" width={48} height={48} className="mx-auto mb-3 rounded-xl shadow-sm" />
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">
            {t.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{t.description}</p>
        </header>

        <form onSubmit={(e) => { e.preventDefault(); calculateInterest(); }} className="space-y-6">
          <div>
            <label htmlFor="principal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.principalLabel}</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CurrencyNPRIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                inputMode="decimal"
                name="principal"
                id="principal"
                value={formatInputValue(principal)}
                onChange={(e) => handlePrincipalChange(e.target.value)}
                className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 pr-12 py-2.5 sm:text-sm border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50/50 dark:bg-slate-800 dark:text-white"
                placeholder="0"
                aria-describedby="principal-currency"
              />
               <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400 sm:text-sm" id="principal-currency">{t.npr}</span>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">{t.quickAddLabel}</span>
              {QUICK_ADD_PRINCIPALS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => addToPrincipal(amount)}
                  className="px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-200 dark:border-emerald-800"
                >
                  +{formatQuickAddLabel(amount)}
                </button>
              ))}
              {principal !== '' && (
                <button
                  type="button"
                  onClick={() => handlePrincipalChange('')}
                  className="px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors border border-red-200 dark:border-red-800"
                >
                  {t.clearLabel}
                </button>
              )}
            </div>
          </div>

          <NepaliDateInput
            id="start-date"
            label={t.startDateLabel}
            value={startDate}
            onChange={handleStartDateChange}
            language={language}
          />
          <div className="relative">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.endDateLabel}</label>
              <button
                type="button"
                onClick={() => handleEndDateChange(getTodayBS())}
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 flex items-center"
              >
                <CalendarIcon className="w-3 h-3 mr-1" />
                {t.today}
              </button>
            </div>
            <NepaliDateInput
              id="end-date"
              label=""
              value={endDate}
              onChange={handleEndDateChange}
              language={language}
            />
          </div>

          <div>
            <label htmlFor="interest-rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.interestRateLabel}</label>
             <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PercentIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                name="interest-rate"
                id="interest-rate"
                value={monthlyInterestRate}
                onChange={(e) => handleRateChange(e.target.value)}
                className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 pr-12 py-2.5 sm:text-sm border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50/50 dark:bg-slate-800 dark:text-white"
                placeholder="e.g., 1.5"
                min="0"
                step="any"
                aria-describedby="interest-rate-unit"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400 sm:text-sm" id="interest-rate-unit">%</span>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">{t.quickSelectLabel}</span>
              {QUICK_SELECT_RATES.map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => selectRate(rate)}
                  className="px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-200 dark:border-emerald-800"
                >
                  {rate}%
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn-glow w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            aria-live="polite"
          >
            <CalendarIcon className="w-5 h-5 mr-2" />
            {t.calculateBtn}
          </button>
        </form>

        {error && (
          <div role="alert" className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {result && !error && (
          <div ref={resultRef} className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 rounded-xl animate-fade-slide-up">
            <div className="flex justify-between items-center mb-6 no-export">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{t.resultsHeading}</h2>
              <button
                onClick={saveAsPng}
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 shadow-sm transition-all hover:bg-emerald-50 dark:hover:bg-slate-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                {t.savePng}
              </button>
            </div>

            {/* Input Summary Section */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-gray-100 dark:border-slate-700">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block">{t.principalLabel}</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">रु {formatNumber(parseFloat(principal))}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block">{t.interestRateLabel}</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{monthlyInterestRate}%</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block">{t.startDateLabel}</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">
                    {formatDateWithMonthName(startDate)} {t.bs}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block">{t.endDateLabel}</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">
                    {formatDateWithMonthName(endDate)} {t.bs}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-lg shadow-inner border border-emerald-100 dark:border-emerald-900/50">
              <div className="flex justify-between items-center text-lg result-row">
                <span className="text-gray-600 dark:text-gray-300">{t.interestPeriod}</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">{formatDuration(result.durationYMD)}</span>
              </div>
              <div className="flex justify-between items-center text-lg result-row">
                <span className="text-gray-600 dark:text-gray-300">{t.totalInterest}</span>
                <span className="font-semibold text-green-600 dark:text-green-400">रु {formatNumber(result.totalInterest)}</span>
              </div>
              <div className="flex justify-between items-center text-xl pt-3 border-t border-emerald-200 dark:border-emerald-800/50 result-row">
                <span className="text-gray-700 dark:text-gray-200 font-medium">{t.totalAmount}</span>
                <span className="font-bold text-emerald-800 dark:text-emerald-300 text-2xl">रु {formatNumber(result.totalAmount)}</span>
              </div>
            </div>
             <p className="mt-4 text-[10px] text-gray-400 text-center italic">
                {t.note}
            </p>
          </div>
        )}

        <div className="mt-12 w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 text-emerald-600 dark:text-emerald-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              {t.history}
            </h2>
            {history.length > 0 && (
              <button
                type="button"
                onClick={clearAllHistory}
                className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 flex items-center border border-red-200 dark:border-red-800/50 px-3 py-1.5 rounded-md bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              >
                {t.clearHistory}
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">{t.noHistory}</p>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {history.map((item) => (
                <div key={item.id} className="history-card bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm relative group">
                  <div
                    className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg"
                    role="button"
                    tabIndex={0}
                    onClick={() => loadHistoryItem(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        loadHistoryItem(item);
                      }
                    }}
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-2">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 block">{t.principalLabel}</span>
                        <span className="font-semibold dark:text-gray-200">रु {formatNumber(item.principal)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 block">{t.interestRateLabel}</span>
                        <span className="font-semibold dark:text-gray-200">{item.monthlyInterestRate}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 block">{t.interestPeriod}</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatDuration(item.result.durationYMD)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 block">{t.totalInterest}</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">रु {formatNumber(item.result.totalInterest)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap justify-between items-center gap-y-2 pt-2 border-t border-gray-100 dark:border-slate-700">
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 order-1">
                        {new Date(item.timestamp).toLocaleString(language === 'ne' ? 'ne-NP' : 'en-US')}
                      </span>

                      <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300 order-2 ml-auto sm:order-3">
                        रु {formatNumber(item.result.totalAmount)}
                      </span>

                      <div className="flex gap-2 order-3 w-full justify-end sm:w-auto sm:order-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); downloadHistoryItem(item); }}
                          className="p-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors shadow-sm"
                          title={t.savePng}
                          aria-label={t.savePng}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); loadHistoryItem(item); }}
                          className="p-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded-md hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors shadow-sm"
                          title="Reuse"
                          aria-label="Reuse"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteHistoryItem(item.id); }}
                          className="p-2 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors shadow-sm"
                          title={t.delete}
                          aria-label={t.delete}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </article>

      {/* Hidden export container for history items */}
      <div className="fixed -left-[9999px] top-0">
        {exportItem && (
          <div ref={exportRef} className="w-[600px] p-10 bg-white">
            <header className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-emerald-600">{t.title}</h1>
              <p className="text-gray-600 mt-2">{t.description}</p>
            </header>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block">{t.principalLabel}</span>
                  <span className="font-semibold text-gray-800">रु {formatNumber(exportItem.principal)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">{t.interestRateLabel}</span>
                  <span className="font-semibold text-gray-800">{exportItem.monthlyInterestRate}%</span>
                </div>
                <div>
                  <span className="text-gray-500 block">{t.startDateLabel}</span>
                  <span className="font-semibold text-gray-800">{formatDateWithMonthName(exportItem.startDate)} {t.bs}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">{t.endDateLabel}</span>
                  <span className="font-semibold text-gray-800">{formatDateWithMonthName(exportItem.endDate)} {t.bs}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3 bg-emerald-50 p-6 rounded-lg border border-emerald-100">
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-600">{t.interestPeriod}</span>
                <span className="font-semibold text-emerald-700">{formatDuration(exportItem.result.durationYMD)}</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-600">{t.totalInterest}</span>
                <span className="font-semibold text-green-600">रु {formatNumber(exportItem.result.totalInterest)}</span>
              </div>
              <div className="flex justify-between items-center text-xl pt-2 border-t border-emerald-200">
                <span className="text-gray-700 font-medium">{t.totalAmount}</span>
                <span className="font-bold text-emerald-800 text-2xl">रु {formatNumber(exportItem.result.totalAmount)}</span>
              </div>
            </div>
            <p className="mt-4 text-[10px] text-gray-400 text-center italic">{t.note}</p>
          </div>
        )}
      </div>

      <InfoSections t={t} onContactClick={() => setShowContactModal(true)} />

       <footer className="mt-8 text-center pb-8">
        <p className="text-sm text-amber-900/60 bg-white/40 backdrop-blur-sm inline-block px-6 py-2 rounded-full">
          {t.footer}
        </p>
      </footer>
      <ContactModal open={showContactModal} onClose={() => setShowContactModal(false)} t={t} />
    </main>
  );
};

export default App;
