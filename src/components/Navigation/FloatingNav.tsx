import React from 'react';
import {
  LayoutDashboard,
  GitPullRequestDraft,
  Users,
  Receipt,
  TrendingUp,
  Search,
  Sparkles,
  Building2,
} from 'lucide-react';
import { useCrm, TabType } from '../../context/CrmContext';
import { BUSINESS_PROFILES } from '../../data/mockData';

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
  { id: 'pipeline', label: 'Embudo de Ventas', icon: GitPullRequestDraft },
  { id: 'customers', label: 'Clientes', icon: Users },
  { id: 'finance', label: 'Finanzas & Facturas', icon: Receipt },
  { id: 'growth', label: 'Crecimiento', icon: TrendingUp },
];

export const FloatingNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    openSpotlight,
    currency,
    setCurrency,
    currentProfile,
    profiles,
    setProfile,
  } = useCrm();

  return (
    <aside className="fixed left-5 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center">
      {/* Floating Capsule Container */}
      <div className="bg-white/95 backdrop-blur-md border border-stone-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl p-2.5 flex flex-col items-center gap-2">
        {/* Brand Monogram */}
        <div
          title={currentProfile.name}
          className="w-10 h-10 rounded-2xl bg-[#14281D] flex items-center justify-center text-emerald-100 font-bold text-sm tracking-wider shadow-sm mb-1 select-none"
        >
          AU
        </div>

        {/* Global Search Button */}
        <button
          type="button"
          onClick={openSpotlight}
          title="Búsqueda Rápida (Cmd + K)"
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-100/80 transition-all cursor-pointer relative group"
        >
          <Search className="w-4 h-4" />
          <span className="sr-only">Búsqueda rápida</span>
          {/* Tooltip */}
          <span className="absolute left-14 px-2.5 py-1 bg-stone-900 text-stone-100 text-[11px] font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md z-50">
            Buscar (Cmd+K)
          </span>
        </button>

        <div className="w-6 h-px bg-stone-200/80 my-1" />

        {/* Primary Nav Links */}
        <div className="flex flex-col gap-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer relative group ${
                  isActive
                    ? 'bg-[#14281D] text-emerald-300 shadow-sm'
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100/80'
                }`}
                aria-label={item.label}
              >
                <Icon className="w-4 h-4 stroke-[2]" />
                
                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-3 bg-emerald-600 rounded-r-full" />
                )}

                {/* Tooltip */}
                <span className="absolute left-14 px-2.5 py-1 bg-stone-900 text-stone-100 text-[11px] font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md z-50">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="w-6 h-px bg-stone-200/80 my-1" />

        {/* Currency Switcher Pill */}
        <button
          type="button"
          onClick={() => {
            const next = currency === 'USD' ? 'MXN' : currency === 'MXN' ? 'EUR' : 'USD';
            setCurrency(next);
          }}
          title={`Moneda actual: ${currency}. Clic para cambiar`}
          className="w-10 h-10 rounded-2xl flex flex-col items-center justify-center text-stone-600 hover:text-stone-950 hover:bg-stone-100/80 transition-all cursor-pointer relative group"
        >
          <span className="text-[10px] font-bold tracking-tight">{currency}</span>
          {/* Tooltip */}
          <span className="absolute left-14 px-2.5 py-1 bg-stone-900 text-stone-100 text-[11px] font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md z-50">
            Moneda: {currency} (Cambiar)
          </span>
        </button>

        {/* Business Profile Selector */}
        <div className="relative group">
          <button
            type="button"
            title="Seleccionar Empresa"
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100/80 transition-all cursor-pointer"
          >
            <Building2 className="w-4 h-4" />
          </button>

          {/* Profile Quick Popover on Hover */}
          <div className="absolute left-14 bottom-0 p-2 bg-white rounded-2xl shadow-xl border border-stone-200 min-w-[220px] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
            <p className="text-[10px] font-semibold text-stone-400 px-2 py-1 uppercase tracking-wider">
              Empresa Activa
            </p>
            <div className="flex flex-col gap-1 mt-1">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => setProfile(profile.id)}
                  className={`text-left px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    currentProfile.id === profile.id
                      ? 'bg-emerald-50 text-emerald-950 font-semibold'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <p className="truncate">{profile.name}</p>
                  <p className="text-[10px] text-stone-400 truncate">{profile.industry}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
