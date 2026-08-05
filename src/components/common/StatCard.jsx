import React from 'react';

const TONES = {
  blue: {
    accent: 'from-blue-500 to-indigo-600',
    glow: 'bg-blue-500/10 dark:bg-blue-400/10',
    icon: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/70 dark:bg-blue-950/70 dark:text-blue-300',
    value: 'text-blue-700 dark:text-blue-300'
  },
  emerald: {
    accent: 'from-emerald-500 to-teal-600',
    glow: 'bg-emerald-500/10 dark:bg-emerald-400/10',
    icon: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/70 dark:text-emerald-300',
    value: 'text-emerald-700 dark:text-emerald-300'
  },
  violet: {
    accent: 'from-violet-500 to-indigo-600',
    glow: 'bg-violet-500/10 dark:bg-violet-400/10',
    icon: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/70 dark:bg-violet-950/70 dark:text-violet-300',
    value: 'text-violet-700 dark:text-violet-300'
  },
  amber: {
    accent: 'from-amber-400 to-orange-600',
    glow: 'bg-amber-500/10 dark:bg-amber-400/10',
    icon: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/70 dark:text-amber-300',
    value: 'text-amber-700 dark:text-amber-300'
  }
};

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend }) => {
  const tone = TONES[color] || TONES.blue;

  return (
    <article className="metric-tile group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <span className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${tone.accent} opacity-80`} />
      <span className={`pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full blur-2xl transition-transform duration-300 group-hover:scale-125 ${tone.glow}`} />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{title}</p>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className={`font-mono text-2xl font-black tracking-tight sm:text-[1.7rem] ${tone.value}`}>{value}</span>
            {trend && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${trend.startsWith('+') ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300'}`}>
                {trend}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border shadow-sm transition duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 ${tone.icon}`}>
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>

      {subtitle && <p className="relative mt-2.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </article>
  );
};
