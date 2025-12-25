
import React, { useState, useEffect, useMemo } from 'react';
import Calendar from './components/Calendar';
import EventItem from './components/EventItem';
import { Event } from './types';

/**
 * Ключи теперь берутся из переменных окружения.
 * На Vercel их нужно добавить в настройках проекта (Environment Variables):
 * API_KEY - ваш ключ Google API
 * CALENDAR_ID - ID вашего Google календаря
 */
const TARGET_CALENDAR_ID = process.env.CALENDAR_ID || '';
const API_KEY = process.env.API_KEY || '';

declare global {
  interface Window {
    Telegram?: any;
  }
}

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string; details: React.ReactNode } | null>(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor('bg_color');
    }
  }, []);

  const fetchEvents = async (yearToFetch: number) => {
    if (!API_KEY || !TARGET_CALENDAR_ID) {
      setError({ 
        message: "Конфигурация отсутствует", 
        details: "Не установлены переменные окружения API_KEY или CALENDAR_ID. Настройте их в панели управления Vercel." 
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const timeMin = new Date(yearToFetch, 0, 1).toISOString();
      const timeMax = new Date(yearToFetch, 11, 31).toISOString();
      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(TARGET_CALENDAR_ID)}/events?key=${API_KEY}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        setError({ 
          message: "Ошибка доступа", 
          details: data.error?.message || "Проверьте ID календаря и API ключ." 
        });
        return;
      }

      if (data.items) {
        const mapped = data.items.map((gEvent: any) => {
          const rawDesc = gEvent.description || '';
          const cleanDesc = rawDesc.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ');
          const lines = cleanDesc.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);

          const headerMarkers = [
            '1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', '10.',
            'Город', 'Округ', 'Наименование', 'Описание', 'Площадка', 'Допуск', 'Стоимость', 'Сайт', 'Связь', 'Контакты'
          ];

          const isHeader = (text: string) => {
            return headerMarkers.some(m => text.toLowerCase().startsWith(m.toLowerCase()));
          };

          const getValueAfter = (patterns: string[], fallback: string) => {
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              const lowerLine = line.toLowerCase();
              const matchedPattern = patterns.find(p => lowerLine.startsWith(p.toLowerCase()));
              
              if (matchedPattern) {
                let after = line.substring(matchedPattern.length).replace(/^[:.\s-]+/, '').trim();
                if (after.length > 0 && !isHeader(after)) return after;
                if (lines[i + 1]) {
                  const nextLine = lines[i + 1];
                  if (!isHeader(nextLine)) return nextLine;
                }
              }
            }
            return fallback;
          };

          const start = gEvent.start?.date || gEvent.start?.dateTime?.split('T')[0] || '';
          const cityDistrictRaw = getValueAfter(['1. Город', '1.Город'], '');
          let city = 'Не указан';
          let district = '';
          
          if (cityDistrictRaw && !isHeader(cityDistrictRaw)) {
            const parts = cityDistrictRaw.split(',').map(p => p.trim());
            if (parts.length >= 2) {
              district = parts[0]; 
              city = parts[1];
            } else {
              city = parts[0];
            }
          }

          return {
            id: gEvent.id,
            city: city,
            district: district,
            name: getValueAfter(['3. НАИМЕНОВАНИЕ', '3.НАИМЕНОВАНИЕ'], gEvent.summary || 'БЕЗ НАЗВАНИЯ').toUpperCase(),
            shortDescription: getValueAfter(['4. Описание', '4.Описание'], ''),
            date: start,
            venue: getValueAfter(['6. Площадка', '6.Площадка'], gEvent.location || 'Не указана'),
            ageLimit: getValueAfter(['7. Допуск', '7.Допуск'], '0+'),
            price: getValueAfter(['8. Стоимость', '8.Стоимость', '8. Цена'], 'Бесплатно'),
            longDescription: cleanDesc,
            link: getValueAfter(['9. Сайт', '9.Сайт'], ''),
            contacts: getValueAfter(['10. Обратная связь', '10.Обратная'], ''),
          } as Event;
        });
        setEvents(mapped);
      }
    } catch (err) {
      setError({ message: "Ошибка сети", details: "Проверьте подключение к интернету." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(currentDate.getFullYear());
  }, [currentDate.getFullYear()]);

  const monthEvents = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return events.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [events, currentDate]);

  const filteredEvents = useMemo(() => {
    if (selectedDate) return monthEvents.filter(e => e.date === selectedDate);
    return monthEvents;
  }, [monthEvents, selectedDate]);

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <div className="shrink-0">
        <Calendar 
          currentDate={currentDate} 
          onMonthChange={setCurrentDate}
          events={events}
          selectedDate={selectedDate}
          onDateSelect={(d) => setSelectedDate(selectedDate === d ? null : d)}
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll pt-2 pb-10">
        <div className="px-6 py-4 flex justify-between items-center">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
            {selectedDate 
              ? `События за ${new Date(selectedDate).getDate()} число` 
              : `События: ${currentDate.toLocaleDateString('ru-RU', { month: 'long' })}`}
          </h3>
          {isLoading && (
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-blue-400 uppercase animate-pulse">Обновление</span>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            </div>
          )}
        </div>

        {error ? (
          <div className="mx-6 p-8 bg-rose-50 rounded-3xl text-center border-2 border-rose-100 border-dashed">
            <p className="text-rose-600 font-black uppercase text-sm mb-2">{error.message}</p>
            <p className="text-xs text-rose-400 font-medium mb-6">{error.details}</p>
            <button 
              onClick={() => fetchEvents(currentDate.getFullYear())} 
              className="px-6 py-2 bg-rose-600 text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-rose-200"
            >
              Обновить
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
                <EventItem 
                  key={event.id} 
                  event={event} 
                  isInitiallyExpanded={selectedDate === event.date}
                />
              ))
            ) : (
              <div className="py-20 flex flex-col items-center justify-center opacity-30">
                <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <p className="text-sm font-black uppercase tracking-widest text-slate-400">Событий нет</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
