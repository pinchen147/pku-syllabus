import { useState, useCallback } from 'react';
import { Button, Input, Alert } from 'antd';
import { Download, CalendarCheck } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { generateCalendar, downloadCalendar } from '../lib/calendarGenerator';
import { semesterKey } from '../utils';
import type { AppContext } from '../App';

import './ExportIcs.css';

export function ExportIcs() {
  const { courses, semester } = useOutletContext<AppContext>();
  const navigate = useNavigate();
  const [alarm, setAlarm] = useState(30);

  const onChangeAlarm = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let v = parseInt(e.target.value);
    if (v <= 0 || isNaN(v)) v = 0;
    setAlarm(v);
  }, []);

  const handleDownload = useCallback(() => {
    if (!semester) return;
    const cal = generateCalendar(courses, semester, alarm);
    downloadCalendar(cal);
  }, [courses, semester, alarm]);

  if (!semester) {
    return (
      <div>
        <TopBar title="生成日历" />
        <div style={{ padding: 32, maxWidth: 600, margin: '0 auto' }}>
          <Alert
            type="error"
            showIcon
            message="请先设置开学时间"
            action={<Button onClick={() => navigate('/')}>前往学期配置</Button>}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar title="生成日历" />
      <div className="export-wrapper">
        <div className="export-card">
          <div className="export-icon">
            <CalendarCheck size={32} />
          </div>
          <h2 className="export-title">导出 iCalendar 日历</h2>
          <p className="export-desc">
            将 {courses.length} 门课程导出为 .ICS 文件，可导入系统日历。
          </p>

          <div className="export-semester-info">
            第一周开始于 {semesterKey(semester)}{' '}
            <a onClick={() => navigate('/')}>修改</a>
          </div>

          <div className="export-alarm">
            <Input
              type="number"
              addonBefore="提醒：上课前"
              placeholder="（不提醒）"
              addonAfter="分钟"
              allowClear
              value={alarm || ''}
              onChange={onChangeAlarm}
            />
          </div>

          <Button
            block
            type="primary"
            size="large"
            disabled={courses.length === 0}
            onClick={handleDownload}
            icon={<Download size={16} />}
          >
            保存日历
          </Button>
        </div>

        <div className="export-hints">
          <p>
            将生成 iCalendar (.ICS) 格式日历，可导入到 Windows、macOS、iOS 系统日历和 Outlook、Google Calendar 等程序中。
            部分 Android 系统支持该格式，请自行搜索你的系统如何导入日历。
          </p>
          <p>
            若无法保存，建议使用最新版 <b>Chrome</b> 或 <b>Safari</b> 浏览器。
            不要使用微信等软件的内嵌浏览器。
          </p>
        </div>
      </div>
    </div>
  );
}
