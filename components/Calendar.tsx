
import React from 'react';
import { MONTHS_RU, DAYS_RU, getDaysInMonth, getFirstDayOfMonth } from '../constants';
import { Event } from '../types';

interface CalendarProps {
  currentDate: Date;
  onMonthChange: (date: Date) => void;
  events: Event[];
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({
  currentDate,
  onMonthChange,
  events,
  selectedDate,
  onDateSelect
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const prevMonth = () => onMonthChange(new Date(year, month - 1, 1));
  const nextMonth = () => onMonthChange(new Date(year, month + 1, 1));

  const daysWithEvents = new Set(events.map(e => e.date));

  const renderDays = () => {
    const slots = [];
    for (let i = 0; i < firstDay; i++) {
      slots.push(<div key={`empty-${i}`} className="aspect-square"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hasEvent = daysWithEvents.has(dateKey);
      const isSelected = selectedDate === dateKey;
      const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

      slots.push(
        <div key={d} className="relative aspect-square flex items-center justify-center">
          <button
            onClick={() => onDateSelect(dateKey)}
            className={`
              w-9 h-9 rounded-full flex flex-col items-center justify-center transition-all duration-200 relative
              ${isSelected 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110 z-10' 
                : hasEvent
                  ? 'bg-blue-100 text-blue-700 font-bold'
                  : isToday 
                    ? 'bg-white text-blue-700 ring-2 ring-blue-100' 
                    : 'text-slate-700 hover:bg-slate-100'}
            `}
          >
            <span className={`text-sm ${isSelected || hasEvent ? 'font-bold' : 'font-medium'}`}>{d}</span>
          </button>
        </div>
      );
    }
    return slots;
  };

  return (
    <div className="bg-white rounded-b-3xl shadow-xl shadow-slate-200/50 overflow-hidden z-10 relative">
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-xl font-black text-slate-800 tracking-tight">
          {MONTHS_RU[month]} <span className="text-blue-600/50">{year}</span>
        </h2>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-2 text-slate-400 hover:text-blue-600 active:scale-90 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button onClick={nextMonth} className="p-2 text-slate-400 hover:text-blue-600 active:scale-90 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 px-4 pb-2">
        {DAYS_RU.map(day => (
          <div key={day} className="text-center text-[11px] font-bold text-slate-300 uppercase tracking-widest py-2">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 px-4 pb-6">
        {renderDays()}
      </div>
    </div>
  );
};

export default Calendar;
