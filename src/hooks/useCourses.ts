import { useState, useCallback, useEffect } from 'react';
import type { Course } from '../types';

export function useCourses() {
  const [courses, setCoursesState] = useState<Course[]>([]);
  const [semester, setSemesterState] = useState<Date | null>(null);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (courses.length > 0) {
        e.preventDefault();
        e.returnValue = '确定要退出吗？';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [courses.length]);

  const setCourses = useCallback(
    (co: Course[] | null, sem?: Date | null) => {
      if (co !== null) setCoursesState(co);
      if (sem !== undefined && sem !== null) setSemesterState(sem);
    },
    [],
  );

  return { courses, semester, setCourses };
}
