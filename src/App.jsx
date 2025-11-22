import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import AuthPage from './pages/AuthPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import './App.css'

const gradientBg = 'bg-gradient-to-b from-slate-50 via-slate-100 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950';

function AppContent({ theme, toggleTheme }) {
  const location = useLocation();
  const isAppRoute = location.pathname !== '/';

  return (
    <div className={`min-h-screen ${isAppRoute ? gradientBg : ''}`}>
      {isAppRoute && (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-0 mx-auto h-72 max-w-5xl rounded-full bg-gradient-to-br from-indigo-200 via-sky-100 to-white blur-3xl opacity-70 dark:from-indigo-900 dark:via-slate-900 dark:to-transparent" />
      )}
      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<AuthPage />} /> 
          <Route path="/dashboard" element={<Dashboard theme={theme} onToggleTheme={toggleTheme} />} />
          <Route path="/profile" element={<Profile theme={theme} onToggleTheme={toggleTheme} />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('stockmaster-theme') || 'light';
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('stockmaster-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <Router>
      <AppContent theme={theme} toggleTheme={toggleTheme} />
    </Router>
  );
}