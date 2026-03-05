import { describe, it, expect } from 'vitest';
import { describeTime, semesterKey, getCourseColor } from '../utils';
import type { Course } from '../types';

describe('describeTime', () => {
  it('formats a standard course time', () => {
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
    expect(describeTime(co)).toBe('1~16周 每周二 1~2节');
  });

  it('formats odd week course', () => {
    const co: Course = {
      course_name: 'Test',
      begin_week: 1,
      end_week: 15,
      every: 'odd',
      weekday: 5,
      begin_time: 3,
      end_time: 4,
      classroom: '',
      desc: '',
    };
    expect(describeTime(co)).toBe('1~15周 单周五 3~4节');
  });

  it('formats even week course', () => {
    const co: Course = {
      course_name: 'Test',
      begin_week: 2,
      end_week: 16,
      every: 'even',
      weekday: 3,
      begin_time: 5,
      end_time: 6,
      classroom: '',
      desc: '',
    };
    expect(describeTime(co)).toBe('2~16周 双周三 5~6节');
  });
});

describe('semesterKey', () => {
  it('returns formatted date', () => {
    const d = new Date(2024, 1, 19); // Feb 19 2024
    expect(semesterKey(d)).toBe('2024/2/19');
  });

  it('returns (null) for null', () => {
    expect(semesterKey(null)).toBe('(null)');
  });
});

describe('getCourseColor', () => {
  it('returns bg, text, accent properties', () => {
    const color = getCourseColor('高等数学');
    expect(color).toHaveProperty('bg');
    expect(color).toHaveProperty('text');
    expect(color).toHaveProperty('accent');
  });

  it('returns the same color for the same name', () => {
    const a = getCourseColor('线性代数');
    const b = getCourseColor('线性代数');
    expect(a).toEqual(b);
  });

  it('returns different colors for different names', () => {
    const a = getCourseColor('高等数学');
    const b = getCourseColor('大学物理');
    // Different names should likely map to different colors (not guaranteed for all pairs but these specific ones do)
    expect(a.bg !== b.bg || a.text !== b.text).toBe(true);
  });

  it('always returns a valid palette entry', () => {
    const names = ['课程A', '课程B', '课程C', '数学分析', '英语', '体育', '思想政治', '计算机'];
    for (const name of names) {
      const color = getCourseColor(name);
      expect(color.bg).toMatch(/^#[0-9A-F]{6}$/i);
      expect(color.text).toMatch(/^#[0-9A-F]{6}$/i);
      expect(color.accent).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });
});
