import React, { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { CalculationHistoryItem, NepaliDateValue } from '../types';
import { NEPALI_MONTHS } from '../constants';

interface HistoryListProps {
  history: CalculationHistoryItem[];
  t: any;
  language: string;
  clearAllHistory: () => void;
  loadHistoryItem: (item: CalculationHistoryItem) => void;
  deleteHistoryItem: (id: string) => void;
  formatNumber: (num: number | string) => string;
  formatDuration: (duration: any) => string;
  formatDateWithMonthName: (date: NepaliDateValue) => string;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  t,
  language,
  clearAllHistory,
  loadHistoryItem,
  deleteHistoryItem,
  formatNumber,
  formatDuration,
  formatDateWithMonthName
}) => {
  const [exportItem, setExportItem] = useState<CalculationHistoryItem | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const downloadHistoryItem = (item: CalculationHistoryItem) => {
    setExportItem(item);
  };

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

  return (
    <>
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
    </>
  );
};
export default HistoryList;
