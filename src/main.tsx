import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import updateLocale from 'dayjs/plugin/updateLocale';

import App from './App';
import { HomePage } from './pages/HomePage';
import { ImportElective } from './pages/ImportElective';
import { ImportConfig } from './pages/ImportConfig';
import { Edit } from './pages/Edit';
import { ExportIcs } from './pages/ExportIcs';
import { About } from './pages/About';

import './styles/global.css';

dayjs.locale('zh-cn');
dayjs.extend(updateLocale);
dayjs.updateLocale('zh-cn', { weekStart: 1 });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      autoInsertSpaceInButton={false}
      theme={{
        token: {
          borderRadius: 4,
          boxShadow: '0 1px 6px rgba(0, 0, 0, 0.2), 0 3px 12px 0 rgba(0, 0, 0, 0.08)',
          motionDurationSlow: '0.192s',
          motionDurationMid: '0.128s',
          motionDurationFast: '0.080s',
        },
      }}
    >
      <HashRouter>
        <Routes>
          <Route element={<App />}>
            <Route index element={<HomePage />} />
            <Route path="import/elective" element={<ImportElective />} />
            <Route path="import/config" element={<ImportConfig />} />
            <Route path="edit" element={<Edit />} />
            <Route path="export" element={<ExportIcs />} />
            <Route path="about" element={<About />} />
          </Route>
        </Routes>
      </HashRouter>
    </ConfigProvider>
  </React.StrictMode>,
);
