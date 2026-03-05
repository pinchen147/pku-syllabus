import { useRef, useState, useCallback } from 'react';
import { Button, Checkbox } from 'antd';
import { Trash2 } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { CourseList } from './CourseList';
import { parseHtml, parseTsv } from '../lib/electiveParser';
import type { CourseWithSkip } from '../types';
import type { AppContext } from '../App';

import elective_instruction from '../assets/elective_instruction.jpg';
import './ImportElective.css';

const DESC_DISP_NAMES = ['教师', '班号', '课程类别', '学分'];

export function ImportElective() {
  const { courses, setCourses } = useOutletContext<AppContext>();
  const navigate = useNavigate();

  const [parsed, setParsed] = useState<CourseWithSkip[]>([]);
  const [skipped, setSkipped] = useState<number[]>([]);
  const [descChecked, setDescChecked] = useState<string[]>(['教师', '班号']);
  const pasterRef = useRef<HTMLDivElement>(null);

  const clearPaster = useCallback(() => {
    if (pasterRef.current) pasterRef.current.textContent = '';
    setParsed([]);
    setSkipped([]);
  }, []);

  const doLoad = useCallback(
    (checked?: string[]) => {
      const el = pasterRef.current;
      if (!el) return;
      const dc = checked ?? descChecked;

      try {
        let result = parseHtml(el, dc);
        if (!result) {
          const text = el.innerText || el.textContent || '';
          result = parseTsv(text, dc);
        }
        if (result && result.courses.length > 0) {
          setParsed(result.courses);
          setSkipped(result.skippedIndices);
        }
      } catch (error) {
        console.trace(error);
      }
    },
    [descChecked],
  );

  const onDescChange = useCallback(
    (li: string[]) => {
      setDescChecked(li);
      setParsed([]);
      setSkipped([]);
      setTimeout(() => {
        const el = pasterRef.current;
        if (!el) return;
        try {
          let result = parseHtml(el, li);
          if (!result) {
            const text = el.innerText || el.textContent || '';
            result = parseTsv(text, li);
          }
          if (result && result.courses.length > 0) {
            setParsed(result.courses);
            setSkipped(result.skippedIndices);
          }
        } catch (error) {
          console.trace(error);
        }
      }, 0);
    },
    [],
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

  const loaded = parsed.length > 0;

  return (
    <div>
      <TopBar
        title="导入选课"
        actions={
          courses.length > 0 ? (
            <Button onClick={() => navigate('/edit')}>编辑课表</Button>
          ) : undefined
        }
      />
      <div className="import-content">
        <div className="import-steps">
          <div className="import-step">
            <span className="import-step-badge">1</span>
            <span>在选课系统中点击"查看选课结果"</span>
          </div>
          <div className="import-step">
            <span className="import-step-badge">2</span>
            <span>复制整个选课结果表格</span>
          </div>
          <div className="import-step">
            <span className="import-step-badge">3</span>
            <span>粘贴到下方区域</span>
          </div>
        </div>

        <div className="import-instruction-img-wrapper">
          <img src={elective_instruction} className="import-instruction-img" alt="instruction" />
        </div>

        <div className="import-toolbar">
          <Button danger onClick={clearPaster} icon={<Trash2 size={14} />}>
            重置
          </Button>
          {loaded ? (
            <span className="import-success">识别成功！</span>
          ) : (
            <Button
              type="primary"
              onClick={() => window.open('http://elective.pku.edu.cn')}
            >
              打开选课系统
            </Button>
          )}
        </div>

        <div
          className="import-paste-area"
          ref={pasterRef}
          onInput={() => doLoad()}
          style={{ display: loaded ? 'none' : 'block' }}
          contentEditable={!loaded}
        />

        {loaded ? (
          <div>
            <div className="import-desc-options">
              <span className="import-desc-label">备注字段：</span>
              <Checkbox.Group
                options={DESC_DISP_NAMES}
                value={descChecked}
                onChange={(vals) => onDescChange(vals as string[])}
              />
            </div>
            <CourseList
              courses={parsed}
              skipped_courses={skipped}
              toggle_course={toggleCourse}
              do_import={doImport}
            />
          </div>
        ) : (
          <p className="import-hint">正确粘贴后将自动识别</p>
        )}
      </div>
    </div>
  );
}
