
export interface Event {
  id: string;
  city: string; // 1. Город
  district: string; // 2. Округ
  name: string; // 3. НАИМЕНОВАНИЕ
  shortDescription: string; // 4. Краткое описание
  date: string; // 5. Дата проведения (YYYY-MM-DD)
  startTime?: string;
  venue: string; // 6. Площадка
  ageLimit: string; // 7. Возрастной ценз
  price: string; // 8. Цена
  longDescription: string; // Краткое описание (подробно)
  link: string; // 9. Ссылка на сайт
  contacts: string; // 10. Ссылки на ответственных
}

export type Role = 'viewer';
