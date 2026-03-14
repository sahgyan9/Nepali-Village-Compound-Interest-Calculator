
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toPng } from 'html-to-image';
import NepaliDateInput from './components/NepaliDateInput';
import { NepaliDateValue, CalculationResult, CalculationHistoryItem, DurationYMD, Language } from './types';
import { CalendarIcon, CurrencyNPRIcon, PercentIcon, TRANSLATIONS, NEPALI_MONTHS } from './constants';
import { getTodayBS, safeLocalStorageGet } from './utils/nepaliDate';

// Calculates difference between two Nepali dates in years, months, and days
// Uses a 30-day month assumption for borrowing days.


const calculateNepaliYMDDifference = (
  startDateVal: NepaliDateValue,
  endDateVal: NepaliDateValue
): DurationYMD => {
  let y1 = startDateVal.year;
  let m1 = startDateVal.month;
  let d1 = startDateVal.day;

  let y2 = endDateVal.year;
  let m2 = endDateVal.month;
  let d2 = endDateVal.day;

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


const STORAGE_KEY = 'nepali_interest_calc_state';

const App: React.FC = () => {
  // Load persisted state safely (avoids crash from corrupted localStorage)
  const savedState = safeLocalStorageGet<Record<string, any>>(STORAGE_KEY, {});

  const [language, setLanguage] = useState<Language>(savedState.language || 'en');
  const t = TRANSLATIONS[language];
  const resultRef = useRef<HTMLDivElement>(null);
  const [principal, setPrincipal] = useState<string>(savedState.principal || '20000');
  const [monthlyInterestRate, setMonthlyInterestRate] = useState<string>(savedState.monthlyInterestRate || '3');
  
  const [startDate, setStartDate] = useState<NepaliDateValue>(() => savedState.startDate || { year: 2080, month: 1, day: 29 }); 
  const [endDate, setEndDate] = useState<NepaliDateValue>(() => savedState.endDate || { year: 2080, month: 9, day: 28 }); 

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isNepaliDateReady, setIsNepaliDateReady] = useState<boolean>(false);
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);
  const [exportItem, setExportItem] = useState<CalculationHistoryItem | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  // Fetch history from backend
  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/calculations');
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const deleteHistoryItem = async (id: string) => {
    try {
      const response = await fetch(`/api/calculations/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setHistory(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  const loadHistoryItem = (item: CalculationHistoryItem) => {
    setPrincipal(item.principal.toString());
    setMonthlyInterestRate(item.monthlyInterestRate.toString());
    setStartDate(item.startDate);
    setEndDate(item.endDate);
    setResult(item.result);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const downloadHistoryItem = async (item: CalculationHistoryItem) => {
    setExportItem(item);
    // Wait for state update and render
    setTimeout(async () => {
      if (exportRef.current) {
        try {
          const monthName = NEPALI_MONTHS.find(m => m.value === item.startDate.month)?.name || item.startDate.month;
          const fileName = `History_${item.startDate.day}-${monthName}-${item.startDate.year}_${item.monthlyInterestRate}_${item.principal}.png`;
          
          const dataUrl = await toPng(exportRef.current, {
            cacheBust: true,
            backgroundColor: '#ffffff',
          });
          
          const link = document.createElement('a');
          link.download = fileName;
          link.href = dataUrl;
          link.click();
          setExportItem(null);
        } catch (err) {
          console.error('Failed to export history item:', err);
          setExportItem(null);
        }
      }
    }, 100);
  };

  // Persist state to localStorage
  useEffect(() => {
    const stateToSave = {
      language,
      principal,
      monthlyInterestRate,
      startDate,
      endDate
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [language, principal, monthlyInterestRate, startDate, endDate]);

  const formatNumber = (num: number | string) => {
    return num.toLocaleString('en-IN');
  };

  const formatDuration = (duration: DurationYMD) => {
    const { years, months, days } = duration;
    return `${years} ${t.saal} ${months} ${t.mahina} ${days} ${t.din}`;
  };

  const formatDate = (date: NepaliDateValue) => {
    return `${date.year}-${date.month}-${date.day}`;
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

    try {
      const adStartDateInstance = new window.NepaliDate(startDate.year, startDate.month - 1, startDate.day);
      const adEndDateInstance = new window.NepaliDate(endDate.year, endDate.month - 1, endDate.day);

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

      // Save to backend
      fetch('/api/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          principal: initialPrincipal,
          monthlyInterestRate: ratePercent,
          startDate,
          endDate,
          result: newResult
        })
      }).then(res => res.json()).then(data => {
        setHistory(prev => [data, ...prev].slice(0, 50));
      }).catch(err => console.error('Failed to save calculation:', err));

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
      <main className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animated-bg py-8 px-4 flex flex-col items-center">
        <article className="bg-white/95 glass-card shadow-2xl rounded-2xl p-6 md:p-10 w-full max-w-2xl" id="calculator">
          <header className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              {t.title}
            </h1>
            <p className="text-gray-600 mt-2">{t.description}</p>
          </header>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="loading-spinner mb-4"></div>
            <div className="text-base font-medium text-gray-500">{t.loading}</div>
          </div>
        </article>
        <div className="mt-12 w-full max-w-4xl px-4 pb-12">
          <section className="bg-white/60 backdrop-blur-md rounded-2xl p-8 shadow-sm mb-8" id="about">
            <h2 className="text-2xl font-bold text-indigo-900 mb-4">{t.aboutTitle}</h2>
            <p className="text-gray-700 leading-relaxed">{t.aboutText}</p>
          </section>
          <section className="bg-white/60 backdrop-blur-md rounded-2xl p-8 shadow-sm" id="faq">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6">{t.faqTitle}</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-indigo-800 mb-2">{t.faq1Q}</h3>
                <p className="text-gray-700">{t.faq1A}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-indigo-800 mb-2">{t.faq2Q}</h3>
                <p className="text-gray-700">{t.faq2A}</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animated-bg py-8 px-4 flex flex-col items-center">
      <article className="bg-white/95 glass-card shadow-2xl rounded-2xl p-6 md:p-10 w-full max-w-2xl">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')}
            className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-full hover:bg-indigo-100 transition-colors border border-indigo-200"
            aria-label={language === 'en' ? 'Switch to Nepali language' : 'Switch to English language'}
          >
            {language === 'en' ? 'नेपालीमा हेर्नुहोस्' : 'View in English'}
          </button>
        </div>
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            {t.title}
          </h1>
          <p className="text-gray-600 mt-2">{t.description}</p>
        </header>

        <form onSubmit={(e) => { e.preventDefault(); calculateInterest(); }} className="space-y-6">
          <div>
            <label htmlFor="principal" className="block text-sm font-medium text-gray-700 mb-1">{t.principalLabel}</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CurrencyNPRIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                name="principal"
                id="principal"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 py-2.5 sm:text-sm border border-gray-300 rounded-lg bg-gray-50/50"
                placeholder="e.g., 100000"
                min="0"
                step="any"
                aria-describedby="principal-currency"
              />
               <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm" id="principal-currency">{t.npr}</span>
              </div>
            </div>
          </div>
          
          <NepaliDateInput
            id="start-date"
            label={t.startDateLabel}
            value={startDate}
            onChange={setStartDate}
            language={language}
          />
          <div className="relative">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">{t.endDateLabel}</label>
              <button
                type="button"
                onClick={() => setEndDate(getTodayBS())}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
              >
                <CalendarIcon className="w-3 h-3 mr-1" />
                {t.today}
              </button>
            </div>
            <NepaliDateInput
              id="end-date"
              label=""
              value={endDate}
              onChange={setEndDate}
              language={language}
            />
          </div>

          <div>
            <label htmlFor="interest-rate" className="block text-sm font-medium text-gray-700 mb-1">{t.interestRateLabel}</label>
             <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PercentIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                name="interest-rate"
                id="interest-rate"
                value={monthlyInterestRate}
                onChange={(e) => setMonthlyInterestRate(e.target.value)}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 py-2.5 sm:text-sm border border-gray-300 rounded-lg bg-gray-50/50"
                placeholder="e.g., 1.5"
                min="0"
                step="any"
                aria-describedby="interest-rate-unit"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm" id="interest-rate-unit">%</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-glow w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            aria-live="polite"
          >
            <CalendarIcon className="w-5 h-5 mr-2" />
            {t.calculateBtn}
          </button>
        </form>

        {error && (
          <div role="alert" className="mt-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {result && !error && (
          <div ref={resultRef} className="mt-8 pt-6 border-t border-gray-200 bg-white p-6 rounded-xl animate-fade-slide-up">
            <div className="flex justify-between items-center mb-6 no-export">
              <h2 className="text-2xl font-semibold text-gray-800">{t.resultsHeading}</h2>
              <button
                onClick={saveAsPng}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-500 flex items-center border border-indigo-200 px-3 py-1.5 rounded-md bg-white shadow-sm transition-all hover:bg-indigo-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                {t.savePng}
              </button>
            </div>

            {/* Input Summary Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block">{t.principalLabel}</span>
                  <span className="font-semibold text-gray-800">रु {formatNumber(parseFloat(principal))}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">{t.interestRateLabel}</span>
                  <span className="font-semibold text-gray-800">{monthlyInterestRate}%</span>
                </div>
                <div>
                  <span className="text-gray-500 block">{t.startDateLabel}</span>
                  <span className="font-semibold text-gray-800">
                    {formatDate(startDate)} {t.bs}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">{t.endDateLabel}</span>
                  <span className="font-semibold text-gray-800">
                    {formatDate(endDate)} {t.bs}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 bg-indigo-50 p-6 rounded-lg shadow-inner border border-indigo-100">
              <div className="flex justify-between items-center text-lg result-row">
                <span className="text-gray-600">{t.interestPeriod}</span>
                <span className="font-semibold text-indigo-700">{formatDuration(result.durationYMD)}</span>
              </div>
              <div className="flex justify-between items-center text-lg result-row">
                <span className="text-gray-600">{t.totalInterest}</span>
                <span className="font-semibold text-green-600">रु {formatNumber(result.totalInterest)}</span>
              </div>
              <div className="flex justify-between items-center text-xl pt-3 border-t border-indigo-200 result-row">
                <span className="text-gray-700 font-medium">{t.totalAmount}</span>
                <span className="font-bold text-indigo-800 text-2xl">रु {formatNumber(result.totalAmount)}</span>
              </div>
            </div>
             <p className="mt-4 text-[10px] text-gray-400 text-center italic">
                {t.note}
            </p>
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-12 w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 text-indigo-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              {t.history}
            </h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {history.map((item) => (
                <div key={item.id} className="history-card bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative group">
                  <div 
                    className="cursor-pointer"
                    onClick={() => loadHistoryItem(item)}
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-2">
                      <div>
                        <span className="text-gray-500 block">{t.principalLabel}</span>
                        <span className="font-semibold">रु {formatNumber(item.principal)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">{t.interestRateLabel}</span>
                        <span className="font-semibold">{item.monthlyInterestRate}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">{t.interestPeriod}</span>
                        <span className="font-semibold text-indigo-600">{formatDuration(item.result.durationYMD)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">{t.totalInterest}</span>
                        <span className="font-semibold text-green-600">रु {formatNumber(item.result.totalInterest)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-[10px] text-gray-400">
                        {new Date(item.timestamp).toLocaleString(language === 'ne' ? 'ne-NP' : 'en-US')}
                      </span>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); downloadHistoryItem(item); }}
                          className="p-1.5 text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors shadow-sm"
                          title={t.savePng}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); loadHistoryItem(item); }}
                          className="p-1.5 text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors shadow-sm"
                          title="Reuse"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteHistoryItem(item.id); }}
                          className="p-1.5 text-red-500 bg-red-50 rounded-md hover:bg-red-100 transition-colors shadow-sm"
                          title={t.delete}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>

                      <span className="text-sm font-bold text-indigo-800">
                        रु {formatNumber(item.result.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Hidden export container for history items */}
      <div className="fixed -left-[9999px] top-0">
        {exportItem && (
          <div ref={exportRef} className="w-[600px] p-10 bg-white">
            <header className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-indigo-600">{t.title}</h1>
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
                  <span className="font-semibold text-gray-800">{formatDate(exportItem.startDate)} {t.bs}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">{t.endDateLabel}</span>
                  <span className="font-semibold text-gray-800">{formatDate(exportItem.endDate)} {t.bs}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3 bg-indigo-50 p-6 rounded-lg border border-indigo-100">
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-600">{t.interestPeriod}</span>
                <span className="font-semibold text-indigo-700">{formatDuration(exportItem.result.durationYMD)}</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-600">{t.totalInterest}</span>
                <span className="font-semibold text-green-600">रु {formatNumber(exportItem.result.totalInterest)}</span>
              </div>
              <div className="flex justify-between items-center text-xl pt-2 border-t border-indigo-200">
                <span className="text-gray-700 font-medium">{t.totalAmount}</span>
                <span className="font-bold text-indigo-800 text-2xl">रु {formatNumber(exportItem.result.totalAmount)}</span>
              </div>
            </div>
            <p className="mt-4 text-[10px] text-gray-400 text-center italic">{t.note}</p>
          </div>
        )}
      </div>
      <div className="mt-12 max-w-4xl mx-auto px-4 pb-12">
        <section className="bg-white/60 backdrop-blur-md rounded-2xl p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-bold text-indigo-900 mb-4">{t.aboutTitle}</h2>
          <p className="text-gray-700 leading-relaxed">
            {t.aboutText}
          </p>
        </section>

        <section className="bg-white/60 backdrop-blur-md rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-indigo-900 mb-6">{t.faqTitle}</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-indigo-800 mb-2">{t.faq1Q}</h3>
              <p className="text-gray-700">{t.faq1A}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-indigo-800 mb-2">{t.faq2Q}</h3>
              <p className="text-gray-700">{t.faq2A}</p>
            </div>
          </div>
        </section>
      </div>

       <footer className="mt-8 text-center pb-8">
        <p className="text-sm text-white/70 bg-white/10 backdrop-blur-sm inline-block px-6 py-2 rounded-full">
          {t.footer}
        </p>
      </footer>
    </main>
  );
};

export default App;
