import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { RecordsPage } from './pages/RecordsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AccountsPage } from './pages/AccountsPage';
import { BackupPage } from './pages/BackupPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('cct_theme') === 'dark');
  const { currentUser, isAuthenticated, permissions } = useAuth();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('cct_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    if ((activeTab === 'accounts' && !permissions.canManageAccounts)
      || (activeTab === 'backup' && !permissions.canManageBackups)) {
      setActiveTab('dashboard');
    }
    setIsMobileMenuOpen(false);
  }, [currentUser?.id, activeTab, permissions.canManageAccounts, permissions.canManageBackups]);

  if (!isAuthenticated) return <LoginPage />;

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'records':
        return <RecordsPage />;
      case 'reports':
        return <ReportsPage isDarkMode={isDarkMode} />;
      case 'accounts':
        return permissions.canManageAccounts
          ? <AccountsPage />
          : <DashboardPage setActiveTab={setActiveTab} isDarkMode={isDarkMode} />;
      case 'backup':
        return permissions.canManageBackups
          ? <BackupPage />
          : <DashboardPage setActiveTab={setActiveTab} isDarkMode={isDarkMode} />;
      case 'settings':
        return <SettingsPage />;
      case 'dashboard':
      default:
        return <DashboardPage setActiveTab={setActiveTab} isDarkMode={isDarkMode} />;
    }
  };



  return (
    <div className={`app-shell min-h-screen font-sans transition-colors duration-300 ${
      isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      <Navbar
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      <div className="mx-auto flex w-full max-w-[1920px] gap-4 px-3 py-3 sm:gap-5 sm:px-5 sm:py-5 lg:px-7 xl:gap-6 xl:px-10">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsMobileMenuOpen(false);
          }}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        <main className="min-w-0 flex-1 pb-8">
          <div key={`${activeTab}-${currentUser?.id}`} className="page-transition">
            {renderActiveTab()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
