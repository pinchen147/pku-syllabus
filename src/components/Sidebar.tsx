import { useLocation, useNavigate } from 'react-router-dom';
import {
  Settings,
  ClipboardPaste,
  FileUp,
  Pencil,
  CalendarCheck,
  Info,
} from 'lucide-react';
import type { Course } from '../types';

import './Sidebar.css';

interface SidebarProps {
  courses: Course[];
}

const NAV_ITEMS = [
  { key: '/', icon: Settings, label: '学期配置' },
  { key: '/import/elective', icon: ClipboardPaste, label: '导入选课' },
  { key: '/import/config', icon: FileUp, label: '导入文件' },
  { key: '/edit', icon: Pencil, label: '编辑课表' },
  { key: '/export', icon: CalendarCheck, label: '生成日历' },
];

export function Sidebar({ courses }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="sidebar">
      <div className="sidebar-brand" onClick={() => navigate('/')}>
        课表助手
      </div>

      <ul className="sidebar-nav">
        {NAV_ITEMS.map(({ key, icon: Icon, label }) => {
          const active = location.pathname === key;
          return (
            <li key={key}>
              <button
                className={`sidebar-item${active ? ' sidebar-item-active' : ''}`}
                onClick={() => navigate(key)}
              >
                <Icon size={18} />
                <span>{label}</span>
                {key === '/edit' && courses.length > 0 && (
                  <span className="sidebar-badge">{courses.length}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-footer">
        <button
          className={`sidebar-item${location.pathname === '/about' ? ' sidebar-item-active' : ''}`}
          onClick={() => navigate('/about')}
        >
          <Info size={18} />
          <span>关于</span>
        </button>
      </div>
    </nav>
  );
}
