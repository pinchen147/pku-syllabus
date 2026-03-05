import { useState, useCallback } from 'react';
import { Button, Upload, Alert } from 'antd';
import { Inbox } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { CourseList } from './CourseList';
import { DATA_VER } from '../config';
import { semesterKey } from '../utils';
import type { Course, CourseWithSkip } from '../types';
import type { AppContext } from '../App';

const { Dragger } = Upload;

export function ImportConfig() {
  const { courses, semester, setCourses } = useOutletContext<AppContext>();
  const navigate = useNavigate();

  const [parsed, setParsed] = useState<CourseWithSkip[]>([]);
  const [skipped, setSkipped] = useState<number[]>([]);

  const doLoad = useCallback(
    (e: { file: File; onSuccess: () => void; onError: (err: unknown) => void }) => {
      setParsed([]);
      setSkipped([]);

      const fr = new FileReader();
      fr.onload = () => {
        const lines = [''];
        (fr.result as string)
          .replace(/\r/g, '')
          .split('\n')
          .forEach((l) => {
            if (l.charAt(0) === ' ') lines[lines.length - 1] += l.substring(1);
            else lines.push(l);
          });

        for (const l of lines) {
          if (l.startsWith('X-WR-CALDESC:')) {
            const json = JSON.parse(l.substring(13));

            if (json.data_ver !== DATA_VER) {
              alert(
                `数据版本不匹配：文件版本 ${json.data_ver}，程序支持的版本 ${DATA_VER}`,
              );
              e.onError(new Error('version mismatch'));
              return;
            }

            if (json.semester_id !== semesterKey(semester)) {
              if (
                !window.confirm(
                  `学期不匹配：文件中的学期 ${json.semester_id}，当前学期 ${semesterKey(semester)}。\n仍然导入吗？`,
                )
              ) {
                e.onError(new Error('semester mismatch'));
                return;
              }
            }

            const coursesWithSkip: CourseWithSkip[] = (json.courses as Course[]).map(
              (co, idx) => ({ ...co, _skip_idx: idx }),
            );
            setParsed(coursesWithSkip);
            setSkipped([]);
            e.onSuccess();
            return;
          }
        }

        alert('找不到配置信息');
        e.onError(new Error('no config found'));
      };
      fr.onerror = () => e.onError(fr.error);
      fr.onabort = () => e.onError(new Error('aborted'));
      fr.readAsText(e.file);
    },
    [semester],
  );

  const toggleCourse = useCallback((idx: number) => {
    setSkipped((prev) =>
      prev.includes(idx) ? prev.filter((n) => n !== idx) : [...prev, idx],
    );
  }, []);

  const doImport = useCallback(() => {
    const imported = parsed
      .filter((co) => !skipped.includes(co._skip_idx))
      .map(({ _skip_idx, ...other }) => other);
    setCourses(courses.concat(imported));
    navigate('/edit');
  }, [parsed, skipped, courses, setCourses, navigate]);

  if (!semester) {
    return (
      <div>
        <TopBar title="导入文件" />
        <div style={{ padding: 'var(--space-xl)', maxWidth: 600, margin: '0 auto' }}>
          <Alert
            type="error"
            showIcon
            message="请先设置开学时间"
            action={
              <Button onClick={() => navigate('/')}>前往学期配置</Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar
        title="导入文件"
        actions={
          courses.length > 0 ? (
            <Button onClick={() => navigate('/edit')}>编辑课表</Button>
          ) : undefined
        }
      />
      <div className="import-content">
        <Dragger
          accept=".ics"
          customRequest={(options) => {
            doLoad({
              file: options.file as File,
              onSuccess: () => options.onSuccess?.(null),
              onError: (err) => options.onError?.(err as Error),
            });
          }}
          showUploadList={false}
        >
          <p className="ant-upload-drag-icon">
            <Inbox size={40} style={{ color: 'var(--color-primary)' }} />
          </p>
          <p className="ant-upload-text">点击选择.ICS文件或拖拽到这里</p>
          <p className="ant-upload-hint">从之前生成的日历中导入数据</p>
        </Dragger>
        <br />
        {parsed.length > 0 && (
          <CourseList
            courses={parsed}
            skipped_courses={skipped}
            toggle_course={toggleCourse}
            do_import={doImport}
          />
        )}
      </div>
    </div>
  );
}
