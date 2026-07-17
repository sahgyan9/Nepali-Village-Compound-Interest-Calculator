import React, { useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { NepaliDateValue, CalculationResult } from '../types';
import { NEPALI_MONTHS } from '../constants';

interface ResultDisplayProps {
  result: CalculationResult;
  principal: string;
  monthlyInterestRate: string;
  startDate: NepaliDateValue;
  endDate: NepaliDateValue;
  t: any;
  formatNumber: (num: number | string) => string;
  formatDateWithMonthName: (date: NepaliDateValue) => string;
  formatDuration: (duration: any) => string;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  result,
  principal,
  monthlyInterestRate,
  startDate,
  endDate,
  t,
  formatNumber,
  formatDateWithMonthName,
  formatDuration,
}) => {
  const resultRef = useRef<HTMLDivElement>(null);

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
  }, [startDate, monthlyInterestRate, principal]);

  return (
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
  );
};
export default ResultDisplay;
