export function todayISO(): string {
  return toISO(new Date());
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(iso: string, n: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function lastNDates(n: number): string[] {
  const today = todayISO();
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(addDays(today, -i));
  }
  return out;
}

const UZ_DAYS = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
const UZ_DAYS_SHORT = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
const UZ_MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr',
];

export function formatToday(): string {
  const now = new Date();
  return `${UZ_DAYS[now.getDay()]}, ${now.getDate()}-${UZ_MONTHS[now.getMonth()]}`;
}

export function dayNameShort(iso: string): string {
  return UZ_DAYS_SHORT[new Date(iso + 'T00:00:00').getDay()];
}

export function computeStreak(history: string[]): number {
  if (history.length === 0) return 0;
  const set = new Set(history);
  let streak = 0;
  let cursor = todayISO();
  if (!set.has(cursor)) cursor = addDays(cursor, -1);
  while (set.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function longestStreak(history: string[]): number {
  const days = [...new Set(history)].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of days) {
    run = prev !== null && addDays(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}
