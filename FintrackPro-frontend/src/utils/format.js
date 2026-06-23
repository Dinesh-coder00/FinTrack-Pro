// src/utils/format.js

/** Format a number as currency. */
export function fmt(value, currency = 'USD') {
  const num = typeof value === 'string' ? parseFloat(value) : (value ?? 0);
  return new Intl.NumberFormat('en-US', {
    style:    'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/** Format a date string/LocalDate to readable form. */
export function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
}

/** Format a date to YYYY-MM-DD for input[type=date]. */
export function toInputDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toISOString().split('T')[0];
}

/** Today's date in YYYY-MM-DD form. */
export function today() {
  return new Date().toISOString().split('T')[0];
}

/** First day of current month in YYYY-MM-DD form. */
export function monthStart() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`;
}

/** Returns a colour for a category. */
export const CATEGORY_COLOURS = {
  Food:          '#f59e0b',
  Travel:        '#06b6d4',
  Shopping:      '#a855f7',
  Bills:         '#ef4444',
  Entertainment: '#6366f1',
  Health:        '#10b981',
  Education:     '#3b82f6',
  Other:         '#94a3b8',
  Salary:        '#10b981',
  Freelance:     '#6366f1',
  Investment:    '#f59e0b',
  Business:      '#06b6d4',
};

export const INCOME_CATEGORIES = ['Salary','Freelance','Investment','Business','Rental','Gift','Other'];
export const EXPENSE_CATEGORIES = ['Food','Travel','Shopping','Bills','Entertainment','Health','Education','Other'];
