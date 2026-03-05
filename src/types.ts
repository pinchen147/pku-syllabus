export interface Course {
  course_name: string;
  begin_week: number;
  end_week: number;
  every: 'all' | 'odd' | 'even';
  weekday: number; // 1-7
  begin_time: number; // 1-12
  end_time: number; // 1-12
  classroom: string;
  desc: string;
}

export interface CourseWithSkip extends Course {
  _skip_idx: number;
}
