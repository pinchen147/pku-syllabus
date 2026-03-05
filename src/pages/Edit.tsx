import { useState, useCallback, useMemo } from 'react';
import { Button, Modal, Input, Select, Popconfirm } from 'antd';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { getCourseColor, PERIOD_START_TIMES } from '../utils';
import { WEEKS_NUM } from '../config';
import type { Course } from '../types';
import type { AppContext } from '../App';

import './Edit.css';

const WEEKDAY_NAMES = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const EVERY_OPTIONS = [
  { value: 'all', label: '每周' },
  { value: 'odd', label: '单周' },
  { value: 'even', label: '双周' },
];
const WEEKDAY_OPTIONS = WEEKDAY_NAMES.map((name, i) => ({ value: i + 1, label: name }));
const FILTER_OPTIONS = [
  { key: 'all' as const, label: '全部' },
  { key: 'odd' as const, label: '单周' },
  { key: 'even' as const, label: '双周' },
];

type WeekFilter = 'all' | 'odd' | 'even';

interface CourseWithIndex {
  course: Course;
  idx: number;
}

function getVisibleCourses(
  courses: Course[],
  week: number,
  filter: WeekFilter,
): CourseWithIndex[] {
  return courses
    .map((course, idx) => ({ course, idx }))
    .filter(({ course }) => {
      // Must be within week range
      if (week < course.begin_week || week > course.end_week) return false;
      // Check odd/even parity
      if (course.every === 'odd' && week % 2 === 0) return false;
      if (course.every === 'even' && week % 2 === 1) return false;
      // Check display filter
      if (filter === 'odd' && course.every === 'even') return false;
      if (filter === 'even' && course.every === 'odd') return false;
      return true;
    });
}

export function Edit() {
  const { courses, setCourses } = useOutletContext<AppContext>();
  const navigate = useNavigate();

  const [currentWeek, setCurrentWeek] = useState(1);
  const [weekFilter, setWeekFilter] = useState<WeekFilter>('all');
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string | number>>({});
  const [formChanged, setFormChanged] = useState(false);

  const visibleCourses = useMemo(
    () => getVisibleCourses(courses, currentWeek, weekFilter),
    [courses, currentWeek, weekFilter],
  );

  const deleteCourse = useCallback(
    (idx: number) => {
      const cos = courses.slice();
      cos.splice(idx, 1);
      setCourses(cos);
      setEditingIdx(null);
    },
    [courses, setCourses],
  );

  const modifyCourse = useCallback(
    (idx: number, co: Course, fork: boolean) => {
      const cos = courses.slice();
      if (fork) cos.splice(idx + 1, 0, co);
      else cos[idx] = co;
      setCourses(cos);
      setEditingIdx(null);
    },
    [courses, setCourses],
  );

  const addCourse = useCallback(() => {
    const newCourse: Course = {
      course_name: '（自选课程）',
      begin_week: 1,
      end_week: WEEKS_NUM,
      every: 'all',
      weekday: 1,
      begin_time: 1,
      end_time: 2,
      classroom: '',
      desc: '',
    };
    setCourses([...courses, newCourse]);
    // Open editor for the new course
    setEditingIdx(courses.length);
    setEditForm({});
    setFormChanged(false);
  }, [courses, setCourses]);

  const openEditor = useCallback(
    (idx: number) => {
      setEditingIdx(idx);
      setEditForm({});
      setFormChanged(false);
    },
    [],
  );

  const changeField = useCallback(
    (name: string, val: string | number) => {
      setEditForm((prev) => ({ ...prev, [name]: val }));
      setFormChanged(true);
    },
    [],
  );

  const validate = (co: Course) => {
    const isint = (x: number) => Number.isInteger(x);
    return (
      isint(co.begin_time) &&
      isint(co.end_time) &&
      co.begin_time <= co.end_time &&
      1 <= co.begin_time &&
      co.end_time <= 12 &&
      isint(co.begin_week) &&
      isint(co.end_week) &&
      co.begin_week <= co.end_week &&
      1 <= co.begin_week &&
      isint(co.weekday) &&
      1 <= co.weekday &&
      co.weekday <= 7 &&
      ['all', 'odd', 'even'].includes(co.every)
    );
  };

  const doSave = useCallback(
    (fork = false) => {
      if (editingIdx === null) return;
      const base = courses[editingIdx];
      const co = { ...base } as Record<string, unknown>;
      for (const [k, v] of Object.entries(editForm)) {
        if (v !== null && v !== undefined) {
          co[k] = typeof (base as unknown as Record<string, unknown>)[k] === 'number'
            ? parseInt(String(v))
            : v;
        }
      }
      if (validate(co as unknown as Course)) {
        modifyCourse(editingIdx, co as unknown as Course, fork);
      } else {
        alert('输入无效');
      }
    },
    [editingIdx, courses, editForm, modifyCourse],
  );

  const editingCourse = editingIdx !== null ? courses[editingIdx] : null;

  return (
    <div className="edit-page">
      <TopBar
        title="编辑课表"
        actions={
          <div className="edit-topbar-actions">
            {/* Week navigation */}
            <div className="edit-week-nav">
              <button
                className="edit-week-btn"
                onClick={() => setCurrentWeek((w) => Math.max(1, w - 1))}
                disabled={currentWeek <= 1}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="edit-week-pill">第 {currentWeek} 周</span>
              <button
                className="edit-week-btn"
                onClick={() => setCurrentWeek((w) => Math.min(WEEKS_NUM, w + 1))}
                disabled={currentWeek >= WEEKS_NUM}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Filter */}
            <div className="edit-filter">
              {FILTER_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  className={`edit-filter-btn${weekFilter === key ? ' edit-filter-btn-active' : ''}`}
                  onClick={() => setWeekFilter(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            <Button onClick={addCourse} icon={<Plus size={14} />}>
              添加课程
            </Button>
            <Button type="primary" onClick={() => navigate('/export')}>
              生成日历
            </Button>
          </div>
        }
      />

      {/* Calendar Grid */}
      <div className="edit-grid-wrapper">
        <div className="edit-grid">
          {/* Header row */}
          <div className="edit-grid-corner" />
          {WEEKDAY_NAMES.map((name, i) => (
            <div
              key={name}
              className={`edit-grid-day-header${i >= 5 ? ' edit-grid-weekend' : ''}`}
            >
              {name}
            </div>
          ))}

          {/* Time rows + course blocks */}
          {Array.from({ length: 12 }, (_, i) => i + 1).map((period) => (
            <div
              key={period}
              className="edit-grid-time"
              style={{ gridRow: period + 1, gridColumn: 1 }}
            >
              <span className="edit-grid-period">{period}</span>
              <span className="edit-grid-time-label">{PERIOD_START_TIMES[period]}</span>
            </div>
          ))}

          {/* Grid cells (background) */}
          {Array.from({ length: 12 }, (_, row) =>
            Array.from({ length: 7 }, (_, col) => (
              <div
                key={`cell-${row}-${col}`}
                className={`edit-grid-cell${col >= 5 ? ' edit-grid-weekend' : ''}`}
                style={{ gridRow: row + 2, gridColumn: col + 2 }}
              />
            )),
          )}

          {/* Course blocks */}
          {visibleCourses.map(({ course, idx }) => {
            const color = getCourseColor(course.course_name);
            return (
              <div
                key={`course-${idx}`}
                className="edit-course-block"
                style={{
                  gridRow: `${course.begin_time + 1} / ${course.end_time + 2}`,
                  gridColumn: course.weekday + 1,
                  backgroundColor: color.bg,
                  borderLeftColor: color.accent,
                  color: color.text,
                }}
                onClick={() => openEditor(idx)}
              >
                <span className="edit-course-name">{course.course_name}</span>
                {course.classroom && (
                  <span className="edit-course-room">{course.classroom}</span>
                )}
                {course.every !== 'all' && (
                  <span className="edit-course-badge">
                    {course.every === 'odd' ? '单' : '双'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Course Editor Modal */}
      <Modal
        title="编辑课程"
        open={editingIdx !== null}
        onCancel={() => setEditingIdx(null)}
        footer={null}
        destroyOnClose
        width={480}
      >
        {editingCourse && (
          <div className="edit-modal-form">
            <div className="edit-form-group">
              <label className="edit-form-label">课程名称</label>
              <Input
                defaultValue={editingCourse.course_name}
                onChange={(e) => changeField('course_name', e.target.value)}
              />
            </div>

            <div className="edit-form-row">
              <div className="edit-form-group edit-form-flex">
                <label className="edit-form-label">起始周</label>
                <Input
                  type="number"
                  defaultValue={editingCourse.begin_week}
                  onChange={(e) => changeField('begin_week', e.target.value)}
                />
              </div>
              <div className="edit-form-group edit-form-flex">
                <label className="edit-form-label">结束周</label>
                <Input
                  type="number"
                  defaultValue={editingCourse.end_week}
                  onChange={(e) => changeField('end_week', e.target.value)}
                />
              </div>
              <div className="edit-form-group edit-form-flex">
                <label className="edit-form-label">频率</label>
                <Select
                  defaultValue={editingCourse.every}
                  onChange={(v) => changeField('every', v)}
                  options={EVERY_OPTIONS}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div className="edit-form-row">
              <div className="edit-form-group edit-form-flex">
                <label className="edit-form-label">星期</label>
                <Select
                  defaultValue={editingCourse.weekday}
                  onChange={(v) => changeField('weekday', v)}
                  options={WEEKDAY_OPTIONS}
                  style={{ width: '100%' }}
                />
              </div>
              <div className="edit-form-group edit-form-flex">
                <label className="edit-form-label">开始节</label>
                <Input
                  type="number"
                  defaultValue={editingCourse.begin_time}
                  onChange={(e) => changeField('begin_time', e.target.value)}
                />
              </div>
              <div className="edit-form-group edit-form-flex">
                <label className="edit-form-label">结束节</label>
                <Input
                  type="number"
                  defaultValue={editingCourse.end_time}
                  onChange={(e) => changeField('end_time', e.target.value)}
                />
              </div>
            </div>

            <div className="edit-form-group">
              <label className="edit-form-label">教室</label>
              <Input
                defaultValue={editingCourse.classroom}
                placeholder="教室"
                onChange={(e) => changeField('classroom', e.target.value)}
              />
            </div>

            <div className="edit-form-group">
              <label className="edit-form-label">备注</label>
              <Input
                defaultValue={editingCourse.desc}
                onChange={(e) => changeField('desc', e.target.value)}
              />
            </div>

            <div className="edit-modal-actions">
              <Popconfirm
                title="确认删除此课程？"
                onConfirm={() => deleteCourse(editingIdx!)}
                okText="删除"
                cancelText="取消"
              >
                <Button danger icon={<Trash2 size={14} />}>
                  删除
                </Button>
              </Popconfirm>
              <div className="edit-modal-right">
                <Button onClick={() => doSave(true)}>
                  存为副本
                </Button>
                <Button type="primary" onClick={() => doSave(false)} disabled={!formChanged}>
                  保存
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
