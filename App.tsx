import React, { useState, useEffect } from 'react';
import ContactModal from './components/ContactModal';
import InfoSections from './components/InfoSections';
import WizardModal from './components/WizardModal';
import ResultDisplay from './components/ResultDisplay';
import HistoryList from './components/HistoryList';
import { useCalculator, STATE_STORAGE_KEY } from './hooks/useCalculator';
import { TRANSLATIONS, NEPALI_MONTHS, Language } from './constants';
import { safeLocalStorageGet } from './utils/nepaliDate';
import { NepaliDateValue, DurationYMD } from './types';

const pad2 = (n: number) => n.toString().padStart(2, '0');

const App: React.FC = () => {
  const savedState = safeLocalStorageGet<Record<string, any>>(STATE_STORAGE_KEY, {});
  const [language, setLanguage] = useState<Language>(savedState.language || 'en');
  const t = TRANSLATIONS[language];

  const calculator = useCalculator(t, language, savedState);

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

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

  const formatQuickAddLabel = (amount: number) => {
    if (amount % 100000 === 0) {
      const lakhs = amount / 100000;
      return language === 'ne' ? `${lakhs} लाख` : `${lakhs} Lakh`;
    }
    return formatNumber(amount);
  };

  const formatDuration = (duration: DurationYMD) => {
    const { years, months, days } = duration;
    return `${years} ${t.saal} ${months} ${t.mahina} ${days} ${t.din}`;
  };

  const formatDateWithMonthName = (date: NepaliDateValue) => {
    const month = NEPALI_MONTHS.find(m => m.value === date.month);
    const monthName = month ? (language === 'ne' ? month.neName : month.name) : pad2(date.month);
    return `${pad2(date.day)} ${monthName} ${date.year}`;
  };

  const startWizard = () => {
    calculator.resetForm();
    setCurrentStep(1);
    setIsWizardOpen(true);
  };

  const closeWizard = () => {
    setIsWizardOpen(false);
  };

  if (!calculator.isNepaliDateReady) {
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
        <footer className="mt-8 text-center pb-8">
          <p className="text-sm text-amber-900/60 bg-white/40 backdrop-blur-sm inline-block px-6 py-2 rounded-full">
            {t.footer}
          </p>
        </footer>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#fdf6e3] via-[#faf0dc] to-[#f0dfb8] dark:from-gray-950 dark:via-slate-900 dark:to-teal-950 animated-bg py-8 px-4 flex flex-col items-center transition-colors duration-300">
      
      {/* Top Navigation Row */}
      <nav className="w-full max-w-2xl flex justify-between items-center mb-6 px-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setLanguage('ne')}
            className={`px-3 py-1 text-sm font-medium rounded-full transition-all duration-300 ${
              language === 'ne' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 transform scale-105' 
                : 'bg-white/50 dark:bg-slate-800/50 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-700'
            }`}
          >
            नेपाली
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 text-sm font-medium rounded-full transition-all duration-300 ${
              language === 'en' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 transform scale-105' 
                : 'bg-white/50 dark:bg-slate-800/50 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-700'
            }`}
          >
            English
          </button>
        </div>
        
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-full bg-white/50 dark:bg-slate-800/50 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-amber-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
            </svg>
          )}
        </button>
      </nav>

      {/* Main Content Area */}
      {!isWizardOpen && (
        <>
        <article className="bg-emerald-50/90 dark:bg-slate-900/80 dark:border dark:border-slate-800 glass-card shadow-2xl rounded-2xl p-6 md:p-10 w-full max-w-2xl transition-colors duration-300" id="calculator">
          <header className="mb-8 text-center">
            <img src="/favicon.svg" alt="" aria-hidden="true" width={48} height={48} className="mx-auto mb-3 rounded-xl shadow-sm" />
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">
              {t.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{t.description}</p>
          </header>

          <div className="flex flex-col items-center justify-center space-y-6">
            <button
              onClick={startWizard}
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-blue-600 rounded-2xl hover:bg-blue-500 hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 w-full md:w-auto text-lg overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full -mt-1 rounded-2xl opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></div>
              <span className="relative flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 mr-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                {language === 'en' ? 'New Calculation' : 'नयाँ गणना'}
              </span>
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
              {language === 'en' 
                ? 'Click above to start a new compound interest calculation in a simple step-by-step wizard.' 
                : 'नयाँ ब्याज गणना सुरु गर्न माथि क्लिक गर्नुहोस्।'}
            </p>
          </div>

          {calculator.result && !calculator.error && (
            <ResultDisplay 
              result={calculator.result}
              principal={calculator.principal}
              monthlyInterestRate={calculator.monthlyInterestRate}
              startDate={calculator.startDate}
              endDate={calculator.endDate}
              t={t}
              formatNumber={formatNumber}
              formatDateWithMonthName={formatDateWithMonthName}
              formatDuration={formatDuration}
            />
          )}

          <HistoryList 
            history={calculator.history}
            t={t}
            language={language}
            clearAllHistory={calculator.clearAllHistory}
            loadHistoryItem={calculator.loadHistoryItem}
            deleteHistoryItem={calculator.deleteHistoryItem}
            formatNumber={formatNumber}
            formatDuration={formatDuration}
            formatDateWithMonthName={formatDateWithMonthName}
          />
        </article>

        <InfoSections t={t} onContactClick={() => setShowContactModal(true)} />

        <footer className="mt-8 text-center pb-8">
          <p className="text-sm text-amber-900/60 dark:text-gray-400 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm inline-block px-6 py-2 rounded-full">
            {t.footer}
          </p>
        </footer>
        </>
      )}

      {/* Wizard Modal Component */}
      <WizardModal 
        isOpen={isWizardOpen}
        onClose={closeWizard}
        currentStep={currentStep}
        totalSteps={totalSteps}
        setCurrentStep={setCurrentStep}
        principal={calculator.principal}
        monthlyInterestRate={calculator.monthlyInterestRate}
        startDate={calculator.startDate}
        endDate={calculator.endDate}
        result={calculator.result}
        error={calculator.error}
        language={language}
        t={t}
        handlePrincipalChange={calculator.handlePrincipalChange}
        handleRateChange={calculator.handleRateChange}
        handleStartDateChange={calculator.handleStartDateChange}
        handleEndDateChange={calculator.handleEndDateChange}
        addToPrincipal={calculator.addToPrincipal}
        selectRate={calculator.selectRate}
        calculateInterest={calculator.calculateInterest}
        formatNumber={formatNumber}
        formatInputValue={formatInputValue}
        formatQuickAddLabel={formatQuickAddLabel}
        formatDuration={formatDuration}
        formatDateWithMonthName={formatDateWithMonthName}
      />

      {showContactModal && (
        <ContactModal 
          onClose={() => setShowContactModal(false)}
          language={language} 
        />
      )}
    </main>
  );
};

export default App;
