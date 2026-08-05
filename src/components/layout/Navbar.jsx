import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import schoolLogo from '../../assets/school-logo.png';
import {
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Sliders,
  Sun,
  X,
  Building,
  Mail,
  ShieldCheck
} from 'lucide-react';

const roleBadgeClass = (role) => {
  switch (role) {
    case 'VPAA':
      return 'border-rose-300 bg-rose-100 text-rose-950 dark:border-rose-800 dark:bg-rose-950 dark:text-amber-300 font-bold';
    case 'President':
      return 'border-amber-300 bg-amber-100 text-amber-950 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200 font-bold';
    case 'Deans':
      return 'border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-rose-200 font-bold';
    case 'Heads':
      return 'border-emerald-300 bg-emerald-100 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300';
  }
};

export const Navbar = ({ setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen, isDarkMode, setIsDarkMode }) => {
  const { currentUser, logout } = useAuth();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowUserDropdown(false);
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  const latestActivity = rtdbLiveTicker?.[0];

  return (
    <header className="app-header sticky top-0 z-40 border-b border-rose-950/10 bg-white/95 dark:border-rose-900/30 dark:bg-slate-950/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] w-full max-w-[1920px] items-center justify-between gap-3 px-3 sm:px-5 lg:px-7 xl:px-10">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="control-lift icon-control grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="brand-mark overflow-hidden grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-b from-rose-900 to-slate-950 p-1 border border-amber-500/40 shadow-lg shadow-rose-950/30 sm:h-11 sm:w-11">
            <img src={schoolLogo} alt="CCT Logo" className="h-full w-auto object-contain filter drop-shadow-[0_1px_3px_rgba(212,175,55,0.4)]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-black tracking-tight text-slate-950 dark:text-white sm:text-base">
                City College of Tagaytay
              </span>
              <span className="hidden rounded-md border border-amber-500/40 bg-rose-900/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-rose-900 dark:border-amber-500/50 dark:bg-rose-950 dark:text-amber-300 sm:inline">
                CCT
              </span>
            </div>
            <p className="truncate text-[10px] text-slate-500 dark:text-slate-400 sm:text-[11px]">
              Academic Performance Monitoring System
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="control-lift icon-control grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:w-auto sm:grid-cols-[auto_auto] sm:gap-2 sm:px-3"
            title={isDarkMode ? 'Use light theme' : 'Use dark theme'}
          >
            {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-rose-900" />}
            <span className="hidden text-[11px] font-bold sm:block">{isDarkMode ? 'Light' : 'Dark'}</span>
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowUserDropdown((open) => !open)}
              className="control-lift flex h-10 max-w-[12rem] items-center gap-2 rounded-xl border border-amber-500/30 bg-rose-950/10 px-2 transition hover:bg-rose-900/20 dark:border-rose-900/60 dark:bg-rose-950/40 sm:max-w-[18rem] sm:px-3"
              aria-expanded={showUserDropdown}
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-rose-900 to-amber-700 text-xs font-black text-amber-200 border border-amber-500/40">
                {currentUser?.name?.charAt(0) || 'U'}
              </span>
              <span className="hidden min-w-0 text-left sm:block">
                <span className="block truncate text-[11px] font-bold text-slate-900 dark:text-white">{currentUser?.name}</span>
                <span className="block truncate text-[9px] text-slate-500 dark:text-slate-400">{currentUser?.role}</span>
              </span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${showUserDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showUserDropdown && (
              <div className="dropdown-surface fixed left-3 right-3 top-[4.9rem] z-50 overflow-hidden rounded-2xl border border-rose-950/30 bg-white shadow-2xl dark:border-rose-900/60 dark:bg-slate-900 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[20rem]">
                
                {/* Active User Card Header */}
                <div className="border-b border-slate-100 p-4 dark:border-slate-800 bg-gradient-to-br from-rose-950/10 to-transparent">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-rose-900 to-amber-700 text-sm font-black text-amber-200 border border-amber-500/40">
                      {currentUser?.name?.charAt(0) || 'U'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{currentUser?.name}</p>
                      <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">{currentUser?.email}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px]">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Building className="h-3 w-3 text-amber-500" /> {currentUser?.department}
                    </span>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] ${roleBadgeClass(currentUser?.role)}`}>
                      {currentUser?.role}
                    </span>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="p-2 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (setActiveTab) setActiveTab('settings');
                      setShowUserDropdown(false);
                    }}
                    className="menu-option flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-rose-950/10 dark:text-slate-200 dark:hover:bg-rose-950/40 transition"
                  >
                    <Sliders className="h-4 w-4 text-amber-500" />
                    <span>Account & System Settings</span>
                  </button>
                </div>

                {/* Logout Footer */}
                <div className="border-t border-slate-100 p-2 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setShowUserDropdown(false);
                    }}
                    className="menu-option flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50 transition"
                  >
                    <LogOut className="h-4 w-4 text-rose-500" />
                    <span>Sign Out of Account</span>
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>


    </header>
  );
};
