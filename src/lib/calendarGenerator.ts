import ical, {
  type ICalCalendar,
  ICalAlarmType,
  ICalEventRepeatingFreq,
  ICalWeekday,
} from 'ical-generator';
import type { Course } from '../types';
import { DATA_VER } from '../config';
import { semesterKey } from '../utils';

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

export const CO_BEGIN_TIME = [
  0,
  8 * HOUR + 0 * MIN,
  9 * HOUR + 0 * MIN,
  10 * HOUR + 10 * MIN,
  11 * HOUR + 10 * MIN,
  13 * HOUR + 0 * MIN,
  14 * HOUR + 0 * MIN,
  15 * HOUR + 10 * MIN,
  16 * HOUR + 10 * MIN,
  17 * HOUR + 10 * MIN,
  18 * HOUR + 40 * MIN,
  19 * HOUR + 40 * MIN,
  20 * HOUR + 40 * MIN,
];

export const CO_END_TIME = [
  0,
  8 * HOUR + 50 * MIN,
  9 * HOUR + 50 * MIN,
  11 * HOUR + 0 * MIN,
  12 * HOUR + 0 * MIN,
  13 * HOUR + 50 * MIN,
  14 * HOUR + 50 * MIN,
  16 * HOUR + 0 * MIN,
  17 * HOUR + 0 * MIN,
  18 * HOUR + 0 * MIN,
  19 * HOUR + 30 * MIN,
  20 * HOUR + 30 * MIN,
  21 * HOUR + 30 * MIN,
];

const ICAL_WEEKDAY: Record<number, ICalWeekday> = {
  1: ICalWeekday.MO,
  2: ICalWeekday.TU,
  3: ICalWeekday.WE,
  4: ICalWeekday.TH,
  5: ICalWeekday.FR,
  6: ICalWeekday.SA,
  7: ICalWeekday.SU,
};

function then(date: Date, deltaMs: number): Date {
  return new Date(+date + deltaMs);
}

export function getWeekStart(wk: number, sem: Date): Date {
  return then(sem, WEEK * (wk - 1));
}

export function getFirstDate(co: Course, sem: Date): Date {
  let t = getWeekStart(co.begin_week, sem);
  t = then(t, DAY * (co.weekday - 1));
  if (
    (co.every === 'odd' && co.begin_week % 2 === 0) ||
    (co.every === 'even' && co.begin_week % 2 === 1)
  )
    t = then(t, WEEK);
  return t;
}

export function generateCalendar(
  courses: Course[],
  semester: Date,
  alarm: number,
): ICalCalendar {
  const cal = ical({
    name: '课表',
    prodId: {
      company: 'superman-industries.com',
      product: 'ical-generator',
    },
  });

  cal.timezone('Asia/Shanghai');
  cal.x([
    {
      key: 'X-WR-CALDESC',
      value: JSON.stringify({
        data_ver: DATA_VER,
        semester_id: semesterKey(semester),
        courses,
      }),
    },
  ]);

  courses.forEach((co) => {
    const firstDate = getFirstDate(co, semester);

    const evt = cal.createEvent({
      start: then(firstDate, CO_BEGIN_TIME[co.begin_time]),
      end: then(firstDate, CO_END_TIME[co.end_time]),
      summary: co.course_name,
      location: co.classroom,
      description: co.desc,
    });

    if (alarm) {
      evt.createAlarm({
        type: ICalAlarmType.display,
        trigger: alarm * 60,
      });
    }

    evt.repeating({
      freq: ICalEventRepeatingFreq.WEEKLY,
      interval: co.every === 'all' ? 1 : 2,
      until: then(getWeekStart(co.end_week + 1, semester), -1),
      byDay: [ICAL_WEEKDAY[co.weekday]],
      exclude: [],
    });
  });

  return cal;
}

export function downloadCalendar(cal: ICalCalendar): void {
  const blob = new Blob([cal.toString()], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '课表.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
