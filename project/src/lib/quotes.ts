export interface Quote {
  text: string;
  author: string;
}

export const QUOTES: Quote[] = [
  { text: 'Vaqtingiz chekli resurs — uni oʻzingiz uchun muhim ishlarga sarflang.', author: 'Peter Drucker' },
  { text: 'Kichik qadamlar ham katta natijalarga olib keladi. Bugun boshlang.', author: 'Lao Tzu' },
  { text: 'Fokus — muvaffaqiyatning kalitidir. Bir ishni mukammal bajaring.', author: 'Steve Jobs' },
  { text: 'Disciplina — maqsadga yetishishning eng qisqa yoʻlidir.', author: 'Jim Rohn' },
  { text: "Har kuni oʻzingizni 1% ga yaxshilang — yil oxirida 37 baravar kuchliroq boʻlasiz.", author: 'James Clear' },
  { text: 'Reja tuzmagan odam boshqalarning rejasini bajaradi.', author: 'Brian Tracy' },
  { text: 'Dam olish ham ishning bir qismidir — charchagan miya yaxshi ishlamaydi.', author: 'Aristotel' },
  { text: 'Odatlar sizning taqdiringizdir. Yaxshi odatlar tuzing.', author: 'Mahatma Gandi' },
  { text: 'Bugun qilgan ishingiz ertangi katingni belgilaydi.', author: 'Elon Musk' },
  { text: 'Muvaffaqiyat — kunlik harakatlarning yigʻindisidir.', author: 'Robert Collier' },
  { text: 'Eng yaxshi vaqt — hozir. Kutmang, boshlang.', author: 'Napoleon Hill' },
  { text: "Vazifalaringizni yozing — miyangiz xotirash uchun emas, ijod uchun yaratilgan.", author: 'David Allen' },
  { text: 'Har bir kun yangi imkoniyatdir. Uni behuda oʻtkazmang.', author: 'Ralf Valdo Emerson' },
  { text: 'Maqsadga yetish — bu marafon, sprint emas. Sabr bilan yuring.', author: 'Anonim' },
  { text: 'Oʻzingizga ishoning — qolganlari vaqt masalasi.', author: 'Rumi' },
];

export function getDailyQuote(): Quote {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return QUOTES[dayOfYear % QUOTES.length];
}

export function getRandomQuote(): Quote {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}
