import type { ReactNode } from 'react';
import './TopBar.css';

interface TopBarProps {
  title: string;
  actions?: ReactNode;
}

export function TopBar({ title, actions }: TopBarProps) {
  return (
    <header className="topbar">
      <h1 className="topbar-title">{title}</h1>
      {actions && <div className="topbar-actions">{actions}</div>}
    </header>
  );
}
