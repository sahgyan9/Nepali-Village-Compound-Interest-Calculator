
import React, { useState, useEffect, useCallback } from 'react';
import { NepaliDateValue, NepaliMonth, Language } from '../types';
import { NEPALI_MONTHS, NEPALI_YEAR_START, NEPALI_YEAR_END, TRANSLATIONS } from '../constants';

interface NepaliDateInputProps {
  id: string;
  label: string;
  value: NepaliDateValue;
  onChange: (date: NepaliDateValue) => void;
  disabled?: boolean;
  language?: Language;
}

// Helper function to safely get days in a Nepali month
const getDaysInNepaliMonth = (year: number, month: number): number => { // month is 1-indexed here
  if (typeof window.NepaliDate !== 'function') {
    console.warn('NepaliDate constructor function is not available on window object.');
    return 32; // Fallback to a safe maximum
  }
  try {
    // Ensure year and month are valid numbers before calling
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12 || year < NEPALI_YEAR_START || year > NEPALI_YEAR_END) {
        console.warn(`Invalid year/month provided to getDaysInNepaliMonth: ${year}, ${month}`);
        return 32; // Fallback for invalid inputs
    }
    const nepaliDateInstance = new window.NepaliDate();
    if (nepaliDateInstance && typeof nepaliDateInstance.getDaysInMonth === 'function') {
      return nepaliDateInstance.getDaysInMonth(year, month - 1); // month - 1 for 0-indexed
    } else {
      console.warn('NepaliDate instance created, but getDaysInMonth method is not available or instance is invalid.');
      return 32; // Fallback
    }
  } catch (e) {
    console.error('Error instantiating NepaliDate or calling getDaysInMonth:', e);
    return 32; // Fallback in case of any error
  }
};


const NepaliDateInput: React.FC<NepaliDateInputProps> = ({ id, label, value, onChange, disabled, language = 'en' }) => {
  const t = TRANSLATIONS[language];
  const [selectedYear, setSelectedYear] = useState<number>(value.year);
  const [selectedMonth, setSelectedMonth] = useState<number>(value.month); // 1-indexed
  const [selectedDay, setSelectedDay] = useState<number>(value.day);

  const [daysInMonth, setDaysInMonth] = useState<number[]>(() => {
    const numDays = getDaysInNepaliMonth(value.year, value.month);
    return Array.from({ length: numDays }, (_, i) => i + 1);
  });

  // Effect 1: Sync with `value` prop changes from parent
  useEffect(() => {
    setSelectedYear(value.year);
    setSelectedMonth(value.month);
    
    const numDaysForValue = getDaysInNepaliMonth(value.year, value.month);
    setDaysInMonth(Array.from({ length: numDaysForValue }, (_, i) => i + 1));

    if (value.day > numDaysForValue) {
      setSelectedDay(numDaysForValue); // Adjust local day state
      // Propagate the corrected (clamped) day back to the parent
      onChange({ year: value.year, month: value.month, day: numDaysForValue });
    } else {
      setSelectedDay(value.day); // Sync local day if it's valid and matches prop
    }
  }, [value, onChange]);

  // Effect 2: Handle local changes to selectedYear or selectedMonth (e.g., from user interaction)
  // This updates daysInMonth and clamps selectedDay if it becomes invalid for the new month/year.
  // It then calls onChange with the fully consistent date.
  useEffect(() => {
    // Only run if the local state (year/month) has changed and is different from the prop 'value'
    // This avoids re-running when Effect 1 syncs from props.
    if (selectedYear !== value.year || selectedMonth !== value.month) {
      const numDays = getDaysInNepaliMonth(selectedYear, selectedMonth);
      setDaysInMonth(Array.from({ length: numDays }, (_, i) => i + 1));

      let dayToSet = selectedDay;
      if (selectedDay > numDays) {
        dayToSet = numDays;
        setSelectedDay(numDays); // Update local day state
      }
      // Propagate the new year/month and potentially clamped day to the parent
      onChange({ year: selectedYear, month: selectedMonth, day: dayToSet });
    }
  }, [selectedYear, selectedMonth, onChange]); // selectedDay and value are intentionally omitted here


  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
    // Effect 2 will be triggered by selectedYear change to handle dependent logic.
  };

  // FIX: Removed trailing underscore from function signature
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = parseInt(e.target.value); // This is 1-indexed
    setSelectedMonth(month);
    // Effect 2 will be triggered by selectedMonth change to handle dependent logic.
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const day = parseInt(e.target.value);
    setSelectedDay(day);
    // For day changes, directly inform the parent.
    // The year and month are already consistent from local state.
    onChange({ year: selectedYear, month: selectedMonth, day: day });
  };

  const yearOptions = Array.from({ length: NEPALI_YEAR_END - NEPALI_YEAR_START + 1 }, (_, i) => NEPALI_YEAR_START + i);

  return (
    <div className="mb-4">
      {label && <label htmlFor={`${id}-year`} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="grid grid-cols-3 gap-2">
        <select
          id={`${id}-year`}
          value={selectedYear}
          onChange={handleYearChange}
          disabled={disabled}
          className="block w-full py-2 px-3 border border-gray-300 bg-white text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          aria-label={`${label} Year`}
        >
          {yearOptions.map(year => <option key={year} value={year}>{year} {t.bs}</option>)}
        </select>
        <select
          id={`${id}-month`}
          value={selectedMonth}
          onChange={handleMonthChange}
          disabled={disabled}
          className="block w-full py-2 px-3 border border-gray-300 bg-white text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
          className="block w-full py-2 px-3 border border-gray-300 bg-white text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          aria-label={`${label} Day`}
        >
          {daysInMonth.map(day => <option key={day} value={day}>{day}</option>)}
        </select>
      </div>
    </div>
  );
};

export default NepaliDateInput;
