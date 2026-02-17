import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Compounds } from './pages/Compounds';
import { CompoundForm } from './pages/CompoundForm';
import { LogInjection } from './pages/LogInjection';
import { CheckIn } from './pages/CheckIn';
import { Trends } from './pages/Trends';
import { Settings } from './pages/Settings';
import { FAQ } from './pages/FAQ';
import { PeptideCalculator } from './pages/PeptideCalculator';
import { UnitConverter } from './pages/UnitConverter';
import { Calendar } from './pages/Calendar';
import { Research } from './pages/Research';
import { ResearchDetail } from './pages/ResearchDetail';
import { DisclaimerModal } from './components/DisclaimerModal';
import { seedMockData, getSettings } from './services/storage';

const AppContent: React.FC = () => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    // Initialize mock data if empty (for demo purposes)
    seedMockData();

    const hasSeen = localStorage.getItem('aesthetic_logbook_disclaimer');
    if (!hasSeen) {
      setShowDisclaimer(true);
    }

    // Theme Logic
    const applyTheme = () => {
      const s = getSettings();
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');

      if (s.theme === 'system') {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          root.classList.add('dark');
        } else {
          root.classList.add('light');
        }
      } else {
        root.classList.add(s.theme);
      }
    };

    // Apply immediately
    applyTheme();

    // Listen for custom event from Settings page
    const handleSettingsChange = () => applyTheme();
    window.addEventListener('app-settings-changed', handleSettingsChange);

    return () => {
      window.removeEventListener('app-settings-changed', handleSettingsChange);
    };
  }, []);

  const handleAcceptDisclaimer = () => {
    localStorage.setItem('aesthetic_logbook_disclaimer', 'true');
    setShowDisclaimer(false);
  };

  return (
    <>
      {showDisclaimer && <DisclaimerModal onAccept={handleAcceptDisclaimer} />}
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/compounds" element={<Compounds />} />
          <Route path="/compounds/new" element={<CompoundForm />} />
          <Route path="/compounds/edit/:id" element={<CompoundForm />} />
          <Route path="/log-injection" element={<LogInjection />} />
          <Route path="/check-in" element={<CheckIn />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/faq" element={<FAQ />} />
          <Route path="/tools/peptide-calculator" element={<PeptideCalculator />} />
          <Route path="/tools/unit-converter" element={<UnitConverter />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/research" element={<Research />} />
          <Route path="/research/:id" element={<ResearchDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </>
  );
};

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
