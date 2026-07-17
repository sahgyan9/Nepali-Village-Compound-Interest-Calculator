import React from 'react';
import { NepaliDateValue } from '../types';
import NepaliDateInput from './NepaliDateInput';
import { CalendarIcon, CurrencyNPRIcon, PercentIcon, QUICK_ADD_PRINCIPALS, QUICK_SELECT_RATES } from '../constants';
import { getTodayBS } from '../utils/nepaliDate';

interface ClassicFormProps {
  principal: string;
  monthlyInterestRate: string;
  startDate: NepaliDateValue;
  endDate: NepaliDateValue;
  error: string | null;
  language: string;
  t: any;
  handlePrincipalChange: (val: string) => void;
  handleRateChange: (val: string) => void;
  handleStartDateChange: (val: NepaliDateValue) => void;
  handleEndDateChange: (val: NepaliDateValue) => void;
  addToPrincipal: (amount: number) => void;
  selectRate: (rate: number) => void;
  calculateInterest: () => boolean;
  formatInputValue: (val: string) => string;
  formatQuickAddLabel: (amount: number) => string;
}

export const ClassicForm: React.FC<ClassicFormProps> = ({
  principal, monthlyInterestRate, startDate, endDate, error,
  language, t, handlePrincipalChange, handleRateChange, handleStartDateChange, handleEndDateChange,
  addToPrincipal, selectRate, calculateInterest, formatInputValue, formatQuickAddLabel
}) => {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateInterest();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
      
      {error && (
        <div role="alert" className="p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Principal Input Group */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
        <label htmlFor="principal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.principalLabel}</label>
        <div className="relative rounded-md shadow-sm">
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
            className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 pr-12 py-3 sm:text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50/50 dark:bg-slate-900 dark:text-white transition-colors"
            placeholder="0"
            aria-describedby="principal-currency"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 dark:text-gray-400 sm:text-sm" id="principal-currency">{t.npr}</span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
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
              className="px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors border border-red-200 dark:border-red-800 ml-auto"
            >
              {t.clearLabel}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Start Date Group */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
          <NepaliDateInput
            id="start-date"
            label={t.startDateLabel}
            value={startDate}
            onChange={handleStartDateChange}
            language={language}
          />
        </div>

        {/* End Date Group */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
          <div className="flex justify-between items-center mb-2">
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.endDateLabel}</span>
            <button
              type="button"
              onClick={() => handleEndDateChange(getTodayBS())}
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 flex items-center bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md transition-colors"
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
      </div>

      {/* Interest Rate Group */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
        <label htmlFor="interest-rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.interestRateLabel}</label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <PercentIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="number"
            name="interest-rate"
            id="interest-rate"
            value={monthlyInterestRate}
            onChange={(e) => handleRateChange(e.target.value)}
            className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 pr-12 py-3 sm:text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50/50 dark:bg-slate-900 dark:text-white transition-colors"
            placeholder="e.g., 1.5"
            min="0"
            step="any"
            aria-describedby="interest-rate-unit"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 dark:text-gray-400 sm:text-sm" id="interest-rate-unit">%</span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
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
        className="group relative flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 w-full transition-all shadow-md hover:shadow-lg overflow-hidden"
      >
        <div className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></div>
        <span className="relative flex items-center text-lg">
          {t.calculateBtn}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </span>
      </button>

    </form>
  );
};

export default ClassicForm;
