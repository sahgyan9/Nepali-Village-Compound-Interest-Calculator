
import React, { useState, useEffect, useRef } from 'react';
import { NepaliDateValue, NepaliMonth, Language } from '../types';
import { NEPALI_MONTHS, TRANSLATIONS } from '../constants';
import { getDaysInNepaliMonth } from '../utils/nepaliDate';

interface NepaliDateInputProps {
  id: string;
  label: string;
  value: NepaliDateValue;
  onChange: (date: NepaliDateValue) => void;
  disabled?: boolean;
  language?: Language;
}

const NepaliDateInput: React.FC<NepaliDateInputProps> = ({ id, label, value, onChange, disabled, language = 'en' }) => {
  const t = TRANSLATIONS[language];
  
  // Use a ref for onChange to avoid it triggering effects
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [selectedYear, setSelectedYear] = useState<number>(value.year);
  const [selectedMonth, setSelectedMonth] = useState<number>(value.month); // 1-indexed
  const [selectedDay, setSelectedDay] = useState<number>(value.day);

  const [daysInMonth, setDaysInMonth] = useState<number[]>(() => {
    const numDays = getDaysInNepaliMonth(value.year, value.month);
    return Array.from({ length: numDays }, (_, i) => i + 1);
  });

  // Sync with `value` prop changes from parent
  useEffect(() => {
    setSelectedYear(value.year);
    setSelectedMonth(value.month);
    
    const numDaysForValue = getDaysInNepaliMonth(value.year, value.month);
    setDaysInMonth(Array.from({ length: numDaysForValue }, (_, i) => i + 1));

    if (value.day > numDaysForValue) {
      setSelectedDay(numDaysForValue);
      onChangeRef.current({ year: value.year, month: value.month, day: numDaysForValue });
    } else {
      setSelectedDay(value.day);
    }
  }, [value.year, value.month, value.day]);

  // Handle local changes to year/month
  useEffect(() => {
    if (selectedYear !== value.year || selectedMonth !== value.month) {
      const numDays = getDaysInNepaliMonth(selectedYear, selectedMonth);
      setDaysInMonth(Array.from({ length: numDays }, (_, i) => i + 1));

      let dayToSet = selectedDay;
      if (selectedDay > numDays) {
        dayToSet = numDays;
        setSelectedDay(numDays);
      }
      onChangeRef.current({ year: selectedYear, month: selectedMonth, day: dayToSet });
    }
  }, [selectedYear, selectedMonth]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(e.target.value));
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const day = parseInt(e.target.value);
    setSelectedDay(day);
    onChangeRef.current({ year: selectedYear, month: selectedMonth, day });
  };

  const yearOptions = Array.from({ length: 101 }, (_, i) => 2000 + i);

  return (
    <div className="mb-4">
      {label && <label htmlFor={`${id}-year`} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="grid grid-cols-3 gap-2">
        <select
          id={`${id}-year`}
          value={selectedYear}
          onChange={handleYearChange}
          disabled={disabled}
          className="block w-full py-2.5 px-3 border border-gray-300 bg-gray-50/50 text-gray-900 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          aria-label={`${label} Year`}
        >
          {yearOptions.map(year => <option key={year} value={year}>{year} {t.bs}</option>)}
        </select>
        <select
          id={`${id}-month`}
          value={selectedMonth}
          onChange={handleMonthChange}
          disabled={disabled}
          className="block w-full py-2.5 px-3 border border-gray-300 bg-gray-50/50 text-gray-900 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          aria-label={`${label} Month`}
        >
          {NEPALI_MONTHS.map((month: NepaliMonth) => (
            <option key={month.value} value={month.value}>
              {language === 'ne' ? month.neName : month.name}
            </option>
          ))}
        </select>
        <select
          id={`${id}-day`}
          value={selectedDay}
          onChange={handleDayChange}
          disabled={disabled}
          className="block w-full py-2.5 px-3 border border-gray-300 bg-gray-50/50 text-gray-900 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          aria-label={`${label} Day`}
        >
          {daysInMonth.map(day => <option key={day} value={day}>{day}</option>)}
        </select>
      </div>
    </div>
  );
};

export default NepaliDateInput;

