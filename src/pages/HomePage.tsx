import { Button, DatePicker, Alert } from 'antd';
import { ClipboardPaste, FileUp, ExternalLink } from 'lucide-react';
import dayjs from 'dayjs';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import type { AppContext } from '../App';

import './HomePage.css';

export function HomePage() {
  const { courses, semester, setCourses } = useOutletContext<AppContext>();
  const navigate = useNavigate();

  const toDayjs = (date: Date | null) => (date ? dayjs(date) : null);

  const IS_WEBVIEW = /MicroMessenger\/|QQ\//.test(navigator.userAgent);

  return (
    <div>
      <TopBar
        title="学期配置"
        actions={
          courses.length > 0 ? (
            <Button onClick={() => navigate('/edit')}>编辑课表</Button>
          ) : undefined
        }
      />
      <div className="home-content">
        {IS_WEBVIEW && (
          <Alert
            message="请在浏览器中打开"
            description="QQ、微信等程序的内嵌网页不支持文件下载，故无法正常保存日历。"
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <div className="home-card">
          <h2 className="home-card-title">开学时间</h2>
          <p className="home-card-desc">请选择本学期第一周的周一日期</p>
          <div className="home-semester-row">
            <DatePicker
              style={{ width: 200 }}
              picker="week"
              value={toDayjs(semester)}
              format="YYYY-MM-DD"
              onChange={(val) => {
                if (val) {
                  const monday = val.day(1).startOf('day');
                  setCourses(null, monday.toDate());
                }
              }}
            />
            <Button
              type="link"
              size="small"
              onClick={() => window.open('https://www.pku.edu.cn/campus.html#p3a')}
            >
              <ExternalLink size={14} /> 校历
            </Button>
          </div>
        </div>

        {semester !== null && (
          <div className="home-actions">
            <div className="home-action-card" onClick={() => navigate('/import/elective')}>
              <div className="home-action-icon home-action-icon-primary">
                <ClipboardPaste size={24} />
              </div>
              <div>
                <h3 className="home-action-title">从选课系统导入</h3>
                <p className="home-action-desc">初次使用请选择此项</p>
              </div>
            </div>

            <div className="home-action-card" onClick={() => navigate('/import/config')}>
              <div className="home-action-icon">
                <FileUp size={24} />
              </div>
              <div>
                <h3 className="home-action-title">编辑日历文件</h3>
                <p className="home-action-desc">对本工具生成的日历进行编辑</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
