
import React, { useState } from 'react';
import { Event } from '../types';

interface AdminFormProps {
  onClose: () => void;
  selectedDate?: string | null;
}

const AdminForm: React.FC<AdminFormProps> = ({ onClose, selectedDate }) => {
  const [formData, setFormData] = useState({
    city: '',
    district: '',
    name: '',
    description: '',
    date: selectedDate || new Date().toISOString().split('T')[0],
    venue: '',
    ageLimit: '18+',
    price: 'Бесплатно',
    link: '',
    contacts: ''
  });

  const [copyStatus, setCopyStatus] = useState(false);

  const generateDescription = () => {
    return `1. Город: ${formData.city}
2. ОКРУГ: ${formData.district}
3. НАИМЕНОВАНИЕ: ${formData.name.toUpperCase()}
4. Краткое описание: ${formData.description}
5. Дата проведения: ${formData.date}
6. Площадка: ${formData.venue}
7. Возрастной ценз: ${formData.ageLimit}
8. Цена: ${formData.price}
9. Ссылка: ${formData.link}
10. Ответственные: ${formData.contacts}`;
  };

  const handleCopy = () => {
    const text = generateDescription();
    navigator.clipboard.writeText(text);
    setCopyStatus(true);
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
    setTimeout(() => setCopyStatus(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center shrink-0">
          <h3 className="font-black text-slate-800 uppercase tracking-tight">Новое событие</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scroll pb-24">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">1. Город</label>
              <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Москва" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">2. Округ</label>
              <input type="text" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all" placeholder="ЦФО" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">3. Наименование</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold uppercase focus:ring-2 focus:ring-blue-500 transition-all" placeholder="НАЗВАНИЕ МЕРОПРИЯТИЯ" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">4. Описание</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all min-h-[80px]" placeholder="Краткая суть..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">5. Дата</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">7. Возраст</label>
              <input type="text" value={formData.ageLimit} onChange={e => setFormData({...formData, ageLimit: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all" placeholder="18+, 0+..." />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">6. Площадка</label>
            <input type="text" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Название полигона" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">8. Цена</label>
            <input type="text" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Бесплатно / 1000 руб." />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">9. Ссылка</label>
            <input type="text" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all" placeholder="https://..." />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">10. Контакты</label>
            <input type="text" value={formData.contacts} onChange={e => setFormData({...formData, contacts: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all" placeholder="@username, чат..." />
          </div>
        </div>

        <div className="p-6 bg-white border-t border-slate-50 shrink-0">
          <button 
            onClick={handleCopy}
            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg flex items-center justify-center space-x-2 ${copyStatus ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white shadow-blue-200'}`}
          >
            {copyStatus ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                <span>Скопировано!</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                <span>Копировать для календаря</span>
              </>
            )}
          </button>
          <p className="text-[10px] text-center text-slate-400 mt-3 font-medium px-4">
            Скопируйте текст и вставьте его в описание события в Google Календаре. Приложение само распознает пункты.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminForm;
