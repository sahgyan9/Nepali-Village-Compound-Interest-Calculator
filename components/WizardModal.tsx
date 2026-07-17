import React from 'react';
import { NepaliDateValue, CalculationResult } from '../types';
import NepaliDateInput from './NepaliDateInput';
import { CalendarIcon, CurrencyNPRIcon, PercentIcon, QUICK_ADD_PRINCIPALS, QUICK_SELECT_RATES, NEPALI_MONTHS } from '../constants';
import { getTodayBS } from '../utils/nepaliDate';

interface WizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: number;
  totalSteps: number;
  setCurrentStep: (step: number | ((prev: number) => number)) => void;
  principal: string;
  monthlyInterestRate: string;
  startDate: NepaliDateValue;
  endDate: NepaliDateValue;
  result: CalculationResult | null;
  error: string | null;
  language: string;
  setLanguage: (lang: any) => void;
  t: any;
  handlePrincipalChange: (val: string) => void;
  handleRateChange: (val: string) => void;
  handleStartDateChange: (val: NepaliDateValue) => void;
  handleEndDateChange: (val: NepaliDateValue) => void;
  addToPrincipal: (amount: number) => void;
  selectRate: (rate: number) => void;
  calculateInterest: () => boolean;
  formatNumber: (num: number | string) => string;
  formatInputValue: (val: string) => string;
  formatQuickAddLabel: (amount: number) => string;
  formatDuration: (duration: any) => string;
  formatDateWithMonthName: (date: NepaliDateValue) => string;
}

const pad2 = (n: number) => n.toString().padStart(2, '0');

export const WizardModal: React.FC<WizardModalProps> = ({
  isOpen, onClose, currentStep, totalSteps, setCurrentStep,
  principal, monthlyInterestRate, startDate, endDate, result, error,
  language, setLanguage, t, handlePrincipalChange, handleRateChange, handleStartDateChange, handleEndDateChange,
  addToPrincipal, selectRate, calculateInterest, formatNumber, formatInputValue, formatQuickAddLabel, formatDuration, formatDateWithMonthName
}) => {
  if (!isOpen) return null;

  const handleNextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300" onClick={onClose}></div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative transform transition-all duration-300 animate-fade-in mt-2 mb-auto md:my-auto">
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {currentStep === 5 ? (language === 'en' ? 'Result' : 'नतिजा') : (language === 'en' ? `Step ${currentStep} of ${totalSteps - 1}` : `चरण ${currentStep} / ${totalSteps - 1}`)}
          </h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')}
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
            >
              {language === 'en' ? 'नेपाली' : 'EN'}
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-6">
          <form onSubmit={(e) => { 
            e.preventDefault(); 
            if (currentStep === 4) { 
              if (calculateInterest()) {
                setCurrentStep(5);
              }
            } else if (currentStep === 5) {
              onClose();
            } else { 
              handleNextStep(); 
            } 
          }} className="space-y-6">
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-2 text-center animate-fade-in">
                {error}
              </div>
            )}

            {currentStep === 1 && (
              <div className="animate-fade-slide-up">
                <label htmlFor="principal-wizard" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center text-lg">{t.principalLabel}</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CurrencyNPRIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    inputMode="decimal"
                    name="principal-wizard"
                    id="principal-wizard"
                    value={formatInputValue(principal)}
                    onChange={(e) => handlePrincipalChange(e.target.value)}
                    className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 pr-12 py-3 text-lg border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50/50 dark:bg-slate-800 dark:text-white"
                    placeholder="0"
                    aria-describedby="principal-currency-wizard"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400 sm:text-sm" id="principal-currency-wizard">{t.npr}</span>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-full text-center mb-1">{t.quickAddLabel}</span>
                  {QUICK_ADD_PRINCIPALS.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => addToPrincipal(amount)}
                      className="px-4 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-200 dark:border-emerald-800"
                    >
                      +{formatQuickAddLabel(amount)}
                    </button>
                  ))}
                  {principal !== '' && (
                    <button
                      type="button"
                      onClick={() => handlePrincipalChange('')}
                      className="px-4 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors border border-red-200 dark:border-red-800"
                    >
                      {t.clearLabel}
                    </button>
                  )}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="animate-fade-slide-up">
                <div className="mb-4 text-center">
                  <span className="text-lg font-medium text-gray-700 dark:text-gray-300">{t.startDateLabel}</span>
                </div>
                <NepaliDateInput
                  id="start-date-wizard"
                  label=""
                  value={startDate}
                  onChange={handleStartDateChange}
                  language={language}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="animate-fade-slide-up relative">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium text-gray-700 dark:text-gray-300">{t.endDateLabel}</span>
                  <button
                    type="button"
                    onClick={() => handleEndDateChange(getTodayBS())}
                    className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 flex items-center bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full"
                  >
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    {t.today}
                  </button>
                </div>
                <NepaliDateInput
                  id="end-date-wizard"
                  label=""
                  value={endDate}
                  onChange={handleEndDateChange}
                  language={language}
                />
              </div>
            )}

            {currentStep === 4 && (
              <div className="animate-fade-slide-up">
                <label htmlFor="interest-rate-wizard" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center text-lg">{t.interestRateLabel}</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PercentIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="interest-rate-wizard"
                    id="interest-rate-wizard"
                    value={monthlyInterestRate}
                    onChange={(e) => handleRateChange(e.target.value)}
                    className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 pr-12 py-3 text-lg border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50/50 dark:bg-slate-800 dark:text-white"
                    placeholder="e.g., 1.5"
                    min="0"
                    step="any"
                    aria-describedby="interest-rate-unit-wizard"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400 sm:text-sm" id="interest-rate-unit-wizard">%</span>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-full text-center mb-1">{t.quickSelectLabel}</span>
                  {QUICK_SELECT_RATES.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => selectRate(rate)}
                      className="px-4 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-200 dark:border-emerald-800"
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 5 && result && (
              <div className="animate-fade-slide-up space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    {language === 'en' ? 'Your Inputs' : 'तपाईंको विवरण'}
                  </h4>
                  <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-100 dark:border-slate-700">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 block mb-0.5">{t.principalLabel}</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-100">रु {formatNumber(parseFloat(principal))}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 block mb-0.5">{t.interestRateLabel}</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-100">{monthlyInterestRate}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 block mb-0.5">{t.startDateLabel}</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-100">
                          {formatDateWithMonthName(startDate)} {t.bs}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 block mb-0.5">{t.endDateLabel}</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-100">
                          {formatDateWithMonthName(endDate)} {t.bs}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
                    {language === 'en' ? 'Calculation Result' : 'गणना नतिजा'}
                  </h4>
                  <div className="space-y-3 bg-emerald-50 dark:bg-emerald-900/30 p-5 rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-800/50">
                    <div className="flex justify-between items-center text-sm md:text-base result-row">
                      <span className="text-gray-600 dark:text-gray-300">{t.interestPeriod}</span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">{formatDuration(result.durationYMD)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm md:text-base result-row">
                      <span className="text-gray-600 dark:text-gray-300">{t.totalInterest}</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">रु {formatNumber(result.totalInterest)}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg md:text-xl pt-3 border-t border-emerald-200 dark:border-emerald-800/50 result-row">
                      <span className="text-gray-700 dark:text-gray-200 font-medium">{t.totalAmount}</span>
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 text-xl md:text-2xl">रु {formatNumber(result.totalAmount)}</span>
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] text-gray-400 text-center italic">
                    {t.note}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-4 border-t border-gray-100 dark:border-slate-800">
              <button
                type="button"
                onClick={currentStep === 5 ? () => {
                  handlePrincipalChange('');
                  setCurrentStep(1);
                } : (currentStep > 1 ? handlePrevStep : onClose)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              >
                {currentStep === 5 ? (language === 'en' ? 'Start New' : 'नयाँ सुरु गर्नुहोस्') : (currentStep > 1 ? (language === 'en' ? 'Back' : 'पछाडि') : (language === 'en' ? 'Cancel' : 'रद्द गर्नुहोस्'))}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-md flex items-center"
              >
                {currentStep < 4 ? (language === 'en' ? 'Next' : 'अर्को') : currentStep === 4 ? t.calculateBtn : (language === 'en' ? 'Done' : 'सकियो')}
                {currentStep < 4 && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                )}
                {currentStep === 5 && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 ml-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default WizardModal;
