
import { Event } from '../types';

export const downloadIcsFile = (event: Event) => {
  const dateStr = event.date.replace(/-/g, '');
  const startTime = event.startTime ? event.startTime.replace(/:/g, '') + '00' : '000000';
  
  // Format: YYYYMMDDTHHmmSS
  const start = `${dateStr}T${startTime}`;
  // End date (default +2 hours)
  const end = `${dateStr}T${String(Number(startTime.substring(0,2)) + 2).padStart(2, '0')}${startTime.substring(2)}`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EventCalendar TWA//RU',
    'BEGIN:VEVENT',
    `UID:${event.id}@eventcalendar`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.name}`,
    `DESCRIPTION:${event.shortDescription}\\n\\n${event.longDescription}\\n\\nЦена: ${event.price}`,
    `LOCATION:${event.city}, ${event.venue}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `${event.name.substring(0, 20)}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
