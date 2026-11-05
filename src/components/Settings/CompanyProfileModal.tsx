import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Building2,
  Coins,
  MapPin,
  Mail,
  Phone,
  Check,
  Info,
  Bell,
  BellRing,
  AlertTriangle,
  Clock,
  Calendar,
  Flame,
  ShieldAlert,
} from 'lucide-react';
import { BusinessProfile, CurrencyCode, NotificationPreferences } from '../../types/crm';
import { useCrm } from '../../context/CrmContext';

interface CompanyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'profile' | 'notifications';
}

export const CompanyProfileModal: React.FC<CompanyProfileModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'profile',
}) => {
  const { currentProfile, updateBusinessProfile, deals, invoices, formatCurrency } = useCrm();

  const [activeTab, setActiveTab] = useState<'profile' | 'notifications'>(initialTab);

  // Business profile form fields
  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [industry, setIndustry] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Notification preferences fields
  const [dealCloseAlerts, setDealCloseAlerts] = useState(true);
  const [daysBeforeDealClose, setDaysBeforeDealClose] = useState(7);
  const [dealMinProbability, setDealMinProbability] = useState(50);
  const [overdueInvoiceAlerts, setOverdueInvoiceAlerts] = useState(true);
  const [preventiveInvoiceAlerts, setPreventiveInvoiceAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);
  const [inAppBanner, setInAppBanner] = useState(true);

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (currentProfile) {
      setName(currentProfile.name || '');
      setLegalName(currentProfile.legalName || '');
      setTaxId(currentProfile.taxId || '');
      setIndustry(currentProfile.industry || '');
      setCurrency(currentProfile.currency || 'USD');
      setAddress(currentProfile.address || '');
      setCity(currentProfile.city || '');
      setContactEmail(currentProfile.contactEmail || '');
      setContactPhone(currentProfile.contactPhone || '');

      const notifs = currentProfile.notificationPreferences || {
        dealCloseAlerts: true,
        daysBeforeDealClose: 7,
        dealMinProbability: 50,
        overdueInvoiceAlerts: true,
        preventiveInvoiceAlerts: true,
        emailDigest: true,
        inAppBanner: true,
      };

      setDealCloseAlerts(notifs.dealCloseAlerts);
      setDaysBeforeDealClose(notifs.daysBeforeDealClose);
      setDealMinProbability(notifs.dealMinProbability);
      setOverdueInvoiceAlerts(notifs.overdueInvoiceAlerts);
      setPreventiveInvoiceAlerts(notifs.preventiveInvoiceAlerts);
      setEmailDigest(notifs.emailDigest);
      setInAppBanner(notifs.inAppBanner);

      setSavedSuccess(false);
    }
  }, [currentProfile, isOpen]);

  if (!isOpen) return null;

  // Calculate live matching alerts based on current preference thresholds
  const todayMs = new Date('2026-11-03').getTime(); // Using consistent current date
  const thresholdCloseMs = todayMs + daysBeforeDealClose * 86400000;

  const qualifyingDeals = deals.filter((d) => {
    if (d.stage === 'closed_won' || d.stage === 'closed_lost') return false;
    if (d.probability < dealMinProbability) return false;
    if (!d.expectedCloseDate) return false;
    const closeMs = new Date(d.expectedCloseDate).getTime();
    return closeMs >= todayMs && closeMs <= thresholdCloseMs;
  });

  const qualifyingInvoices = invoices.filter((inv) => {
    if (inv.status === 'paid' || inv.status === 'draft') return false;
    if (inv.status === 'overdue') return overdueInvoiceAlerts;
    if (inv.status === 'pending' && preventiveInvoiceAlerts) {
      const dueMs = new Date(inv.dueDate).getTime();
      return dueMs <= todayMs + 3 * 86400000;
    }
    return false;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const notificationPreferences: NotificationPreferences = {
      dealCloseAlerts,
      daysBeforeDealClose,
      dealMinProbability,
      overdueInvoiceAlerts,
      preventiveInvoiceAlerts,
      emailDigest,
      inAppBanner,
    };

    updateBusinessProfile({
      ...currentProfile,
      name: name.trim(),
      legalName: legalName.trim() || name.trim(),
      taxId: taxId.trim(),
      industry: industry.trim(),
      currency,
      address: address.trim(),
      city: city.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      notificationPreferences,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden z-10 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#14281D] text-emerald-100 flex items-center justify-center font-bold text-sm shadow-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                  Configuración Operativa
                </span>
                <h2 className="text-lg font-bold text-stone-900">
                  Perfil de Empresa & Alertas
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Segmented Tab Controls */}
          <div className="px-6 pt-3 pb-1 border-b border-stone-100 bg-white">
            <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-2xl w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Datos de Empresa & Moneda</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('notifications')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer relative ${
                  activeTab === 'notifications'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Preferencias de Alertas</span>
                {(qualifyingDeals.length > 0 || qualifyingInvoices.length > 0) && (
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                )}
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'profile' ? (
              /* TAB 1: Business Profile & Currency */
              <>
                {/* Live Branding Preview Bento Banner */}
                <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-[#14281D] text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {name
                        .split(' ')
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase() || 'MI'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-stone-900 truncate">
                        {name || 'Nombre de la Empresa'}
                      </p>
                      <p className="text-[11px] text-stone-500 truncate">
                        {industry || 'Sector o actividad principal'} · Moneda base: {currency}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      Emisor Fiscal Activo
                    </span>
                  </div>
                </div>

                {/* Section 1: Business Identity */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                    <Building2 className="w-4 h-4 text-stone-500" />
                    <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                      Identidad Comercial y Fiscal
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Nombre Comercial de la MIPYME *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="ej. Aura Estudio Creativo"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900 transition-colors"
                      />
                      <p className="text-[10px] text-stone-400 mt-1">
                        Se muestra en encabezados, presupuestos y reportes.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Razón Social / Entidad Legal
                      </label>
                      <input
                        type="text"
                        value={legalName}
                        onChange={(e) => setLegalName(e.target.value)}
                        placeholder="ej. Aura Innovación y Diseño S.A.P.I. de C.V."
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Identificador Fiscal (RFC / NIF / Tax ID)
                      </label>
                      <input
                        type="text"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        placeholder="ej. AID-240118-8A3"
                        className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900 uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Giro / Industria Comercial
                      </label>
                      <input
                        type="text"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        placeholder="ej. Consultoría y Servicios Digitales"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Currency */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                    <Coins className="w-4 h-4 text-stone-500" />
                    <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                      Moneda Base del Sistema
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-2">
                      Selecciona la divisa contable por defecto
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(
                        [
                          { code: 'USD', name: 'Dólar Estadounidense', symbol: '$' },
                          { code: 'MXN', name: 'Peso Mexicano', symbol: '$' },
                          { code: 'EUR', name: 'Euro', symbol: '€' },
                        ] as const
                      ).map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => setCurrency(c.code)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            currency === c.code
                              ? 'border-[#14281D] bg-[#14281D] text-white shadow-sm'
                              : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-sm font-bold">{c.code}</span>
                            <span
                              className={`text-xs font-semibold ${
                                currency === c.code ? 'text-emerald-300' : 'text-stone-400'
                              }`}
                            >
                              {c.symbol}
                            </span>
                          </div>
                          <p
                            className={`text-[11px] mt-1 truncate ${
                              currency === c.code ? 'text-stone-200' : 'text-stone-500'
                            }`}
                          >
                            {c.name}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section 3: Contact */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                    <MapPin className="w-4 h-4 text-stone-500" />
                    <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                      Dirección y Contacto
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Dirección Física / Domicilio Fiscal *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="ej. Av. Álvaro Obregón 151, Piso 4, Roma Norte"
                        className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Ciudad y Región
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="ej. Ciudad de México, CDMX"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Email Comercial
                      </label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="contacto@miempresa.com"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="+52 55 0000 0000"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* TAB 2: Notification & Alert Preferences */
              <div className="space-y-6">
                {/* Top Explanatory Banner */}
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/60 flex items-start gap-3 text-xs text-emerald-950">
                  <Bell className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Centro de Alertas de Negocio</p>
                    <p className="text-emerald-800/80 mt-0.5 leading-relaxed">
                      Configura avisos automáticos para anticiparte al cierre de contratos y
                      prevenir la morosidad de tus cuentas por cobrar.
                    </p>
                  </div>
                </div>

                {/* Preference 1: Tratos Cercanos al Cierre */}
                <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                        <Flame className="w-4 h-4 fill-amber-500 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-stone-900">
                          Alertas sobre Tratos Cercanos al Cierre
                        </h4>
                        <p className="text-[11px] text-stone-500">
                          Avisos preventivos sobre oportunidades que requieren acción comercial inmediata.
                        </p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={dealCloseAlerts}
                      onClick={() => setDealCloseAlerts(!dealCloseAlerts)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        dealCloseAlerts ? 'bg-[#14281D]' : 'bg-stone-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          dealCloseAlerts ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {dealCloseAlerts && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-3 border-t border-stone-100 space-y-4"
                    >
                      {/* Días de anticipación */}
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                          <span className="text-stone-700">Días de anticipación para la alerta</span>
                          <span className="font-mono font-bold text-stone-900">
                            {daysBeforeDealClose} días antes
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {[3, 7, 14].map((days) => (
                            <button
                              key={days}
                              type="button"
                              onClick={() => setDaysBeforeDealClose(days)}
                              className={`py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                                daysBeforeDealClose === days
                                  ? 'bg-[#14281D] text-white border-[#14281D]'
                                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                              }`}
                            >
                              {days} días
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Probabilidad mínima */}
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1 font-medium">
                          <span className="text-stone-700">Filtrar por probabilidad mínima</span>
                          <span className="font-mono font-bold text-emerald-800">
                            &ge; {dealMinProbability}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="80"
                          step="10"
                          value={dealMinProbability}
                          onChange={(e) => setDealMinProbability(Number(e.target.value))}
                          className="w-full accent-[#14281D]"
                        />
                        <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-0.5">
                          <span>20% (Todo)</span>
                          <span>50% (Ponderados)</span>
                          <span>80% (Muy probables)</span>
                        </div>
                      </div>

                      {/* Live preview badge */}
                      <div className="p-3 bg-stone-50 rounded-xl text-xs flex items-center justify-between border border-stone-100">
                        <span className="text-stone-500">
                          Tratos que calificarían para alerta hoy:
                        </span>
                        <span className="font-mono font-bold text-stone-900 bg-white border border-stone-200 px-2 py-0.5 rounded-md">
                          {qualifyingDeals.length} oportunidad{qualifyingDeals.length === 1 ? '' : 'es'}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Preference 2: Facturas Vencidas y Cobranza */}
                <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-stone-900">
                          Alertas sobre Facturas Vencidas y Cobranza
                        </h4>
                        <p className="text-[11px] text-stone-500">
                          Notificación sobre facturas impagas y cuentas por cobrar en mora.
                        </p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={overdueInvoiceAlerts}
                      onClick={() => setOverdueInvoiceAlerts(!overdueInvoiceAlerts)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        overdueInvoiceAlerts ? 'bg-[#14281D]' : 'bg-stone-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          overdueInvoiceAlerts ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {overdueInvoiceAlerts && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-3 border-t border-stone-100 space-y-3"
                    >
                      {/* Checkbox: Preventive 3 days alert */}
                      <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-700">
                        <input
                          type="checkbox"
                          checked={preventiveInvoiceAlerts}
                          onChange={(e) => setPreventiveInvoiceAlerts(e.target.checked)}
                          className="mt-0.5 rounded text-[#14281D] focus:ring-[#14281D]"
                        />
                        <div>
                          <span className="font-semibold block text-stone-900">
                            Aviso preventivo 3 días antes del vencimiento
                          </span>
                          <span className="text-[11px] text-stone-500">
                            Para enviar recordatorios de cortesía a clientes antes de que caigan en mora.
                          </span>
                        </div>
                      </label>

                      {/* Live preview badge */}
                      <div className="p-3 bg-stone-50 rounded-xl text-xs flex items-center justify-between border border-stone-100">
                        <span className="text-stone-500">
                          Facturas en alerta de cobro hoy:
                        </span>
                        <span className="font-mono font-bold text-rose-700 bg-white border border-stone-200 px-2 py-0.5 rounded-md">
                          {qualifyingInvoices.length} factura{qualifyingInvoices.length === 1 ? '' : 's'}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Preference 3: Canales de Notificación */}
                <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-3">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
                    Canales de Envío
                  </h4>

                  <label className="flex items-center justify-between text-xs text-stone-700 cursor-pointer p-2 hover:bg-stone-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <BellRing className="w-4 h-4 text-stone-400" />
                      <span>Notificaciones destacadas en la aplicación (In-App)</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={inAppBanner}
                      onChange={(e) => setInAppBanner(e.target.checked)}
                      className="rounded text-[#14281D] focus:ring-[#14281D]"
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs text-stone-700 cursor-pointer p-2 hover:bg-stone-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-stone-400" />
                      <div>
                        <span>Resumen matutino por correo electrónico</span>
                        <p className="text-[10px] text-stone-400">
                          Enviado a: {contactEmail || currentProfile.contactEmail}
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailDigest}
                      onChange={(e) => setEmailDigest(e.target.checked)}
                      className="rounded text-[#14281D] focus:ring-[#14281D]"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <span className="text-[11px] text-stone-400">
                {activeTab === 'profile'
                  ? '* Aplica en cotizaciones y facturas digitales.'
                  : '* Las alertas se actualizan de forma continua según el estado del CRM.'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savedSuccess}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-emerald-100 bg-[#14281D] hover:bg-[#1B382B] rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-80"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>¡Guardado!</span>
                    </>
                  ) : (
                    <span>Guardar Preferencias</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
