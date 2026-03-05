import { Button, Checkbox } from 'antd';
import { MapPin } from 'lucide-react';
import { describeTime } from '../utils';
import type { CourseWithSkip } from '../types';

import './CourseList.css';

interface CourseListProps {
  courses: CourseWithSkip[];
  skipped_courses: number[];
  toggle_course: (idx: number) => void;
  do_import: () => void;
}

export function CourseList({ courses, skipped_courses, toggle_course, do_import }: CourseListProps) {
  const importBtn = (
    <Button type="primary" size="large" block onClick={do_import}>
      导入所选课程
    </Button>
  );

  return (
    <div className="course-list">
      <div className="course-list-action">{importBtn}</div>
      <div className="course-list-items">
        {courses.map((co) => (
          <div key={co._skip_idx} className="course-list-item">
            <Checkbox
              checked={skipped_courses.indexOf(co._skip_idx) === -1}
              onChange={() => toggle_course(co._skip_idx)}
            />
            <div className="course-list-info">
              <span className="course-list-name">{co.course_name}</span>
              <span className="course-list-tag course-list-tag-blue">{describeTime(co)}</span>
              {!!co.classroom && (
                <span className="course-list-tag course-list-tag-purple">
                  <MapPin size={12} /> {co.classroom}
                </span>
              )}
              {!!co.desc && (
                <span className="course-list-tag">{co.desc}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="course-list-action">{importBtn}</div>
    </div>
  );
}
