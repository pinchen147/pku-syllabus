import { Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { useCourses } from './hooks/useCourses';
import type { Course } from './types';

import './App.css';

export interface AppContext {
  courses: Course[];
  semester: Date | null;
  setCourses: (co: Course[] | null, sem?: Date | null) => void;
}

export default function App() {
  const { courses, semester, setCourses } = useCourses();

  const ctx: AppContext = { courses, semester, setCourses };

  return (
    <div className="app-layout">
      <Sidebar courses={courses} />
      <main className="app-main">
        <Outlet context={ctx} />
      </main>
    </div>
  );
}
