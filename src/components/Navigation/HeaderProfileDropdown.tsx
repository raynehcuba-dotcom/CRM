import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  ChevronDown,
  Settings,
  Check,
  MapPin,
  Coins,
  ArrowRight,
  ShieldCheck,
  BellRing,
  Flame,
} from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

interface HeaderProfileDropdownProps {
  onOpenSettingsModal: (tab?: 'profile' | 'notifications') => void;
}

export const HeaderProfileDropdown: React.FC<HeaderProfileDropdownProps> = ({
  onOpenSettingsModal,
}) => {
  const {
    currentProfile,
    profiles,
    setProfile,
    currency,
    setCurrency,
    deals,
    invoices,
  } = useCrm();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Notification criteria calculations
  const notifs = currentProfile.notificationPreferences || {
    dealCloseAlerts: true,
    daysBeforeDealClose: 7,
    dealMinProbability: 50,
    overdueInvoiceAlerts: true,
    preventiveInvoiceAlerts: true,
  };

  const todayMs = new Date('2026-11-03').getTime();
  const thresholdCloseMs = todayMs + (notifs.daysBeforeDealClose || 7) * 86400000;

  const dealsNearClose = notifs.dealCloseAlerts
    ? deals.filter((d) => {
        if (d.stage === 'closed_won' || d.stage === 'closed_lost') return false;
        if (d.probability < (notifs.dealMinProbability || 50)) return false;
        if (!d.expectedCloseDate) return false;
        const closeMs = new Date(d.expectedCloseDate).getTime();
        return closeMs >= todayMs && closeMs <= thresholdCloseMs;
      })
    : [];

  const overdueInvs = notifs.overdueInvoiceAlerts
    ? invoices.filter((inv) => inv.status === 'overdue')
    : [];

  const totalActiveAlerts = dealsNearClose.length + overdueInvs.length;

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const initials = currentProfile.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 bg-white hover:bg-stone-50 border border-stone-200/90 rounded-2xl transition-all cursor-pointer shadow-2xs group relative"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="w-6 h-6 rounded-lg bg-[#14281D] text-emerald-200 flex items-center justify-center text-[10px] font-bold tracking-tight shrink-0">
          {initials}
        </div>

        <div className="hidden sm:block text-left max-w-[130px] truncate">
          <p className="text-xs font-semibold text-stone-900 truncate leading-tight group-hover:text-stone-950">
            {currentProfile.name}
          </p>
        </div>

        <span className="font-mono text-[10px] font-bold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded-md">
          {currency}
        </span>

        {/* Alert Counter Indicator */}
        {totalActiveAlerts > 0 && (
          <span
            title={`${totalActiveAlerts} alertas activas de tratos o facturas`}
            className="w-2 h-2 rounded-full bg-amber-500 shrink-0"
          />
        )}

        <ChevronDown
          className={`w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-stone-200/90 py-2 z-50 overflow-hidden"
          >
            {/* Active Company Header Preview */}
            <div className="px-4 py-3 bg-stone-50/70 border-b border-stone-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  MIPYME Seleccionada
                </span>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-mono">
                  {currency}
                </span>
              </div>
              <p className="text-xs font-bold text-stone-900 truncate">
                {currentProfile.name}
              </p>
              <p className="text-[11px] text-stone-500 truncate mt-0.5">
                {currentProfile.legalName}
              </p>
              {currentProfile.address && (
                <div className="flex items-center gap-1.5 text-[10px] text-stone-500 mt-2 truncate">
                  <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                  <span className="truncate">{currentProfile.address}</span>
                </div>
              )}
            </div>

            {/* Direct Configuration Launchers */}
            <div className="p-2 border-b border-stone-100 space-y-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenSettingsModal('profile');
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-stone-50 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#14281D] text-emerald-200 flex items-center justify-center shrink-0">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900 group-hover:text-stone-950">
                      Perfil de Empresa
                    </p>
                    <p className="text-[10px] text-stone-500">
                      Nombre, moneda base y dirección
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-800 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenSettingsModal('notifications');
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-amber-50/50 hover:bg-amber-50 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                    <BellRing className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-stone-900 group-hover:text-stone-950">
                        Preferencias de Alertas
                      </p>
                      {totalActiveAlerts > 0 && (
                        <span className="text-[9px] font-bold font-mono bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded-full">
                          {totalActiveAlerts} activas
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-stone-500">
                      Tratos por vencer y facturas morosas
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-800 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>

            {/* Quick Currency Switch */}
            <div className="px-4 py-2.5 border-b border-stone-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  Cambio Rápido de Moneda
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(['USD', 'MXN', 'EUR'] as const).map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setCurrency(curr)}
                    className={`py-1 px-2 text-xs font-mono font-semibold rounded-xl text-center transition-colors cursor-pointer ${
                      currency === curr
                        ? 'bg-[#14281D] text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            {/* Switch Active Business */}
            <div className="p-2">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-2 py-1">
                Empresas Registradas
              </p>
              <div className="space-y-1 mt-1">
                {profiles.map((p) => {
                  const isSelected = p.id === currentProfile.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setProfile(p.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-stone-100/90 text-stone-900 font-semibold'
                          : 'hover:bg-stone-50 text-stone-600'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <p className="text-xs truncate">{p.name}</p>
                        <p className="text-[10px] text-stone-400 truncate">{p.industry}</p>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
