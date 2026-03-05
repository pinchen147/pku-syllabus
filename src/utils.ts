import type { Course } from './types';

const EVERY_MAP: Record<string, string> = { all: '每', odd: '单', even: '双' };
const WEEKDAY_NAMES = '啊一二三四五六日';

export function describeTime(co: Course): string {
  return (
    `${co.begin_week}~${co.end_week}周` +
    ` ${EVERY_MAP[co.every]}周${WEEKDAY_NAMES[co.weekday]}` +
    ` ${co.begin_time}~${co.end_time}节`
  );
}

export function semesterKey(sem: Date | null): string {
  if (sem === null) return '(null)';
  return `${sem.getFullYear()}/${sem.getMonth() + 1}/${sem.getDate()}`;
}

/* ── Consistent course colors ── */

const COURSE_PALETTE: { bg: string; text: string; accent: string }[] = [
  { bg: '#DBEAFE', text: '#1E40AF', accent: '#3B82F6' },
  { bg: '#FCE7F3', text: '#9D174D', accent: '#EC4899' },
  { bg: '#D1FAE5', text: '#065F46', accent: '#10B981' },
  { bg: '#FEF3C7', text: '#92400E', accent: '#F59E0B' },
  { bg: '#E0E7FF', text: '#3730A3', accent: '#6366F1' },
  { bg: '#FFE4E6', text: '#9F1239', accent: '#F43F5E' },
  { bg: '#CCFBF1', text: '#115E59', accent: '#14B8A6' },
  { bg: '#F3E8FF', text: '#6B21A8', accent: '#A855F7' },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getCourseColor(name: string): { bg: string; text: string; accent: string } {
  return COURSE_PALETTE[hashString(name) % COURSE_PALETTE.length];
}

/* ── Period start time labels (for calendar grid) ── */

export const PERIOD_START_TIMES = [
  '',        // index 0 unused
  '8:00',
  '9:00',
  '10:10',
  '11:10',
  '13:00',
  '14:00',
  '15:10',
  '16:10',
  '17:10',
  '18:40',
  '19:40',
  '20:40',
];
