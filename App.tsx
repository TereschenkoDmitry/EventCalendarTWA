
import React, { useState, useEffect, useMemo } from 'react';
import Calendar from './components/Calendar';
import EventItem from './components/EventItem';
import { Event } from './types';

/**
 * Максимально надежное получение переменных окружения для Vercel/Vite.
 */
const getEnv = (key: string): string => {
  let value = '';
  
  try {
    // Для Vite (стандарт на Vercel для большинства React шаблонов)
    // Cast to any to avoid "Property 'env' does not exist on type 'ImportMeta'" error
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      value = (import.meta as any).env[`VITE_${key}`] || '';
    }
  } catch (e) {}
  
  if (!value) {
    try {
      // Для сред, использующих process.env
      // @ts-ignore
      if (typeof process !== 'undefined' && process.env) {
        value = process.env[`VITE_${key}`] || process.env[key] || '';
      }
    } catch (e) {}
  }
  
  return value;
};

const TARGET_CALENDAR_ID = getEnv('CALENDAR_ID');
// Guideline: The API key must be obtained exclusively from the environment variable process.env.API_KEY.
// @ts-ignore
const API_KEY = (typeof process !== 'undefined' && process.env.API_KEY) ? process.env.API_KEY : '';

// Отладка в консоль (на Vercel нажмите F12 чтобы увидеть)
console.log('App Configuration Status:', {
  hasCalendarId: !!TARGET_CALENDAR_ID,
  hasApiKey: !!API_KEY,
  calendarIdLength: TARGET_CALENDAR_ID ? TARGET_CALENDAR_ID.length : 0
});

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
    // Guideline: Do not request user to update API_KEY in the UI or ask for it.
    if (!API_KEY || !TARGET_CALENDAR_ID) {
      setError({ 
        message: "Конфигурация не найдена", 
        details: (
          <div className="text-left mt-2 space-y-2">
            <p>Необходимые параметры (API_KEY, CALENDAR_ID) не настроены в окружении.</p>
          </div>
        )
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
          message: "Ошибка Google API", 
          details: data.error?.message || "Возможно, календарь не является публичным или API ключ недействителен." 
        });
        return;
      }

      if (data.items) {
        const mapped = data.items.map((gEvent: any) => {
          const rawDesc = gEvent.description || '';
          const cleanDesc = rawDesc.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ');
          const lines = cleanDesc.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);

          const headerMarkers = ['1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', '10.'];
          const isHeader = (text: string) => headerMarkers.some(m => text.startsWith(m));

          const getValueAfter = (patterns: string[], fallback: string) => {
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              const matchedPattern = patterns.find(p => line.toLowerCase().startsWith(p.toLowerCase()));
              if (matchedPattern) {
                let after = line.substring(matchedPattern.length).replace(/^[:.\s-]+/, '').trim();
                if (after.length > 0 && !isHeader(after)) return after;
                if (lines[i + 1] && !isHeader(lines[i + 1])) return lines[i + 1];
              }
            }
            return fallback;
          };

          const start = gEvent.start?.date || gEvent.start?.dateTime?.split('T')[0] || '';
          const cityDistrictRaw = getValueAfter(['1. Город', '1.Город'], '');
          let city = 'Не указан';
          let district = '';
          
          if (cityDistrictRaw) {
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
            city,
            district,
            name: getValueAfter(['3. НАИМЕНОВАНИЕ'], gEvent.summary || 'БЕЗ НАЗВАНИЯ').toUpperCase(),
            shortDescription: getValueAfter(['4. Описание'], ''),
            date: start,
            venue: getValueAfter(['6. Площадка'], gEvent.location || 'Не указана'),
            ageLimit: getValueAfter(['7. Допуск'], '0+'),
            price: getValueAfter(['8. Стоимость', '8. Цена'], 'Бесплатно'),
            longDescription: cleanDesc,
            link: getValueAfter(['9. Сайт'], ''),
            contacts: getValueAfter(['10. Обратная связь'], ''),
          } as Event;
        });
        setEvents(mapped);
      }
    } catch (err) {
      setError({ 
        message: "Ошибка сети", 
        details: "Не удалось подключиться к серверам Google. Проверьте соединение." 
      });
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
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            </div>
          )}
        </div>

        {error ? (
          <div className="mx-6 p-8 bg-white rounded-3xl shadow-sm border border-slate-100 animate-fade-in">
            <p className="text-rose-500 font-black uppercase text-sm mb-2">{error.message}</p>
            <div className="text-[11px] text-slate-600 font-medium mb-6 leading-relaxed">
              {error.details}
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider active:scale-95 transition-transform"
            >
              Обновить страницу
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
              <div className="py-20 flex flex-col items-center justify-center opacity-20">
                <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Событий нет</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
