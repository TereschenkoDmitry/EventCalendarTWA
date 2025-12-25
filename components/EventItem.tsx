
import React, { useState, useEffect } from 'react';
import { Event } from '../types';
import { downloadIcsFile } from '../utils/icsGenerator';

interface EventItemProps {
  event: Event;
  isInitiallyExpanded?: boolean;
}

const EventItem: React.FC<EventItemProps> = ({ event, isInitiallyExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);

  useEffect(() => {
    setIsExpanded(isInitiallyExpanded);
  }, [isInitiallyExpanded]);

  const toggle = () => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
    setIsExpanded(!isExpanded);
  };

  const handleAddToCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
    downloadIcsFile(event);
  };

  return (
    <div className={`mx-4 my-3 rounded-2xl transition-all duration-300 ${isExpanded ? 'bg-white shadow-xl ring-1 ring-slate-100' : 'bg-white/60 shadow-sm hover:shadow-md'}`}>
      <button
        onClick={toggle}
        className="w-full px-5 py-4 flex items-center text-left"
      >
        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 shrink-0">
          <span className="text-[10px] font-bold uppercase opacity-60">
            {new Date(event.date).toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '')}
          </span>
          <span className="text-lg font-black leading-none">
            {new Date(event.date).getDate()}
          </span>
        </div>
        
        <div className="ml-4 flex-1 overflow-hidden">
          <h4 className={`text-sm font-black tracking-tight uppercase truncate transition-colors ${isExpanded ? 'text-blue-600' : 'text-slate-800'}`}>
            {event.name}
          </h4>
          <div className="flex items-center mt-1 space-x-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded">
              {event.city}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-1.5 py-0.5 rounded">
              {event.price}
            </span>
          </div>
        </div>

        <div className={`ml-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isExpanded ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-100 text-slate-400'}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="px-5 pb-6 pt-2 space-y-5 animate-fade-in border-t border-slate-50">
          <div className="grid grid-cols-1 gap-5 text-[13px]">
            <section>
              <h5 className="text-[10px] font-black text-blue-600/40 uppercase tracking-widest mb-2 flex items-center">
                <span className="w-4 h-px bg-blue-600/20 mr-2"></span>
                Основная информация
              </h5>
              <div className="space-y-3 pl-2 border-l-2 border-blue-50">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400 mb-0.5">1. Город и 2. Округ</span>
                  <span className="font-bold text-slate-700">{event.city} {event.district ? `(${event.district})` : ''}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400 mb-0.5">4. Описание</span>
                  <p className="text-slate-600 leading-relaxed font-medium">{event.shortDescription}</p>
                </div>
              </div>
            </section>

            <section>
              <h5 className="text-[10px] font-black text-blue-600/40 uppercase tracking-widest mb-2 flex items-center">
                <span className="w-4 h-px bg-blue-600/20 mr-2"></span>
                Место и условия
              </h5>
              <div className="space-y-3 pl-2 border-l-2 border-blue-50">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400 mb-0.5">6. Площадка</span>
                  <span className="font-bold text-slate-700">{event.venue}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400 mb-0.5">7. Допуск</span>
                  <span className="font-bold text-slate-700">{event.ageLimit}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400 mb-0.5">8. Стоимость</span>
                  <span className="text-lg font-black text-emerald-600 uppercase italic">{event.price}</span>
                </div>
              </div>
            </section>

            <section>
              <h5 className="text-[10px] font-black text-blue-600/40 uppercase tracking-widest mb-2 flex items-center">
                <span className="w-4 h-px bg-blue-600/20 mr-2"></span>
                Контакты и ссылки
              </h5>
              <div className="space-y-3 pl-2 border-l-2 border-blue-50">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400 mb-0.5">9. Сайт мероприятия</span>
                  {event.link ? (
                    <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold underline break-all">
                      {event.link}
                    </a>
                  ) : <span className="text-slate-400 italic">Не указан</span>}
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400 mb-0.5">10. Обратная связь</span>
                  <p className="text-slate-600 font-medium">{event.contacts || 'Информация уточняется'}</p>
                </div>
              </div>
            </section>
          </div>
          
          <div className="pt-4 mt-2 border-t border-slate-50">
             <div className="text-[12px] text-slate-500 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-xl italic">
               {event.longDescription}
             </div>
          </div>

          <button
            onClick={handleAddToCalendar}
            className="w-full mt-4 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Добавить в мой календарь</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default EventItem;
