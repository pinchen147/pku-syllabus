import { describe, it, expect } from 'vitest';
import {
  generateCalendar,
  getFirstDate,
  getWeekStart,
  CO_BEGIN_TIME,
  CO_END_TIME,
} from '../lib/calendarGenerator';
import type { Course } from '../types';

describe('getWeekStart', () => {
  it('returns semester start for week 1', () => {
    const sem = new Date(2024, 1, 19); // Feb 19 2024 (Monday)
    expect(getWeekStart(1, sem).getTime()).toBe(sem.getTime());
  });

  it('returns correct date for week 2', () => {
    const sem = new Date(2024, 1, 19);
    const week2 = getWeekStart(2, sem);
    expect(week2.getTime()).toBe(new Date(2024, 1, 26).getTime());
  });
});

describe('getFirstDate', () => {
  const sem = new Date(2024, 1, 19); // Monday Feb 19 2024

  it('returns Monday of week 1 for weekday 1', () => {
    const co: Course = {
      course_name: 'Test',
      begin_week: 1,
      end_week: 16,
      every: 'all',
      weekday: 1,
      begin_time: 1,
      end_time: 2,
      classroom: '',
      desc: '',
    };
    const d = getFirstDate(co, sem);
    expect(d.getTime()).toBe(new Date(2024, 1, 19).getTime());
  });

  it('returns Tuesday of week 1 for weekday 2', () => {
    const co: Course = {
      course_name: 'Test',
      begin_week: 1,
      end_week: 16,
      every: 'all',
      weekday: 2,
      begin_time: 1,
      end_time: 2,
      classroom: '',
      desc: '',
    };
    const d = getFirstDate(co, sem);
    expect(d.getTime()).toBe(new Date(2024, 1, 20).getTime());
  });

  it('shifts odd-week course starting on even week', () => {
    const co: Course = {
      course_name: 'Test',
      begin_week: 2,
      end_week: 16,
      every: 'odd',
      weekday: 1,
      begin_time: 1,
      end_time: 2,
      classroom: '',
      desc: '',
    };
    // begin_week=2 (even), every='odd' → starts next week (week 3)
    const d = getFirstDate(co, sem);
    const week3Monday = new Date(2024, 2, 4); // March 4 2024
    expect(d.getTime()).toBe(week3Monday.getTime());
  });

  it('shifts even-week course starting on odd week', () => {
    const co: Course = {
      course_name: 'Test',
      begin_week: 1,
      end_week: 16,
      every: 'even',
      weekday: 1,
      begin_time: 1,
      end_time: 2,
      classroom: '',
      desc: '',
    };
    // begin_week=1 (odd), every='even' → starts next week (week 2)
    const d = getFirstDate(co, sem);
    expect(d.getTime()).toBe(new Date(2024, 1, 26).getTime());
  });
});

describe('CO_BEGIN_TIME / CO_END_TIME', () => {
  it('has 13 entries (0 + classes 1-12)', () => {
    expect(CO_BEGIN_TIME).toHaveLength(13);
    expect(CO_END_TIME).toHaveLength(13);
  });

  it('class 1 starts at 8:00', () => {
    expect(CO_BEGIN_TIME[1]).toBe(8 * 60 * 60 * 1000);
  });

  it('class 1 ends at 8:50', () => {
    expect(CO_END_TIME[1]).toBe((8 * 60 + 50) * 60 * 1000);
  });
});

describe('generateCalendar', () => {
  const sem = new Date(2024, 1, 19);
  const courses: Course[] = [
    {
      course_name: '高等数学',
      begin_week: 1,
      end_week: 16,
      every: 'all',
      weekday: 2,
      begin_time: 1,
      end_time: 2,
      classroom: '理教306',
      desc: '张三',
    },
  ];

  it('produces valid ICS output', () => {
    const cal = generateCalendar(courses, sem, 30);
    const ics = cal.toString();
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('END:VCALENDAR');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('高等数学');
    expect(ics).toContain('理教306');
  });

  it('includes X-WR-CALDESC metadata', () => {
    const cal = generateCalendar(courses, sem, 0);
    const ics = cal.toString();
    expect(ics).toContain('X-WR-CALDESC:');
    expect(ics).toContain('data_v3');
  });

  it('includes alarm when alarm > 0', () => {
    const cal = generateCalendar(courses, sem, 15);
    const ics = cal.toString();
    expect(ics).toContain('BEGIN:VALARM');
  });

  it('excludes alarm when alarm = 0', () => {
    const cal = generateCalendar(courses, sem, 0);
    const ics = cal.toString();
    expect(ics).not.toContain('BEGIN:VALARM');
  });

  it('uses WEEKLY repeating for every=all with interval 1', () => {
    const cal = generateCalendar(courses, sem, 0);
    const ics = cal.toString();
    expect(ics).toContain('FREQ=WEEKLY');
    expect(ics).toContain('INTERVAL=1');
  });

  it('uses interval 2 for odd/even weeks', () => {
    const oddCourse: Course[] = [
      {
        ...courses[0],
        every: 'odd',
        begin_week: 1,
        end_week: 15,
      },
    ];
    const cal = generateCalendar(oddCourse, sem, 0);
    const ics = cal.toString();
    expect(ics).toContain('INTERVAL=2');
  });
});
