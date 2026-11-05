import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Building, Mail, Phone, MapPin, Tag } from 'lucide-react';
import { CustomerSegment, CustomerStatus, MotoCustomerType } from '../../types/crm';
import { useCrm } from '../../context/CrmContext';

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewCustomerModal: React.FC<NewCustomerModalProps> = ({ isOpen, onClose }) => {
  const { addCustomer } = useCrm();

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [customerType, setCustomerType] = useState<MotoCustomerType>('Cadena de Refaccionarias');
  const [segment, setSegment] = useState<CustomerSegment>('SMB');
  const [status, setStatus] = useState<CustomerStatus>('new');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [industry, setIndustry] = useState('Refacciones y Motopartes');
  const [creditLimit, setCreditLimit] = useState(50000);
  const [creditDays, setCreditDays] = useState(30);
  const [mainBrands, setMainBrands] = useState('Bajaj, Italika, Honda');
  const [monthlyRevenue, setMonthlyRevenue] = useState(15000);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company.trim()) return;

    const colors = ['#1B382B', '#2D4A3E', '#364F42', '#244535', '#3F5E50'];
    const randomBg = colors[Math.floor(Math.random() * colors.length)];

    addCustomer({
      name,
      company,
      segment,
      status,
      customerType,
      creditLimit: Number(creditLimit),
      creditDays: Number(creditDays),
      mainBrands: mainBrands.split(',').map((b) => b.trim()).filter(Boolean),
      email: email || 'compras@refaccionaria.com',
      phone: phone || '+52 55 0000 0000',
      city: city || 'Ciudad de México',
      industry: industry || 'Refacciones y Motopartes',
      totalLtv: monthlyRevenue * 6 || 15000,
      monthlyRevenue: Number(monthlyRevenue),
      activeDealsCount: 0,
      dealsWonCount: 0,
      lastContactDate: new Date().toISOString().split('T')[0],
      avatarBg: randomBg,
      notes,
    });

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
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
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
            <div>
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Cartera Comercial
              </span>
              <h2 className="text-lg font-bold text-stone-900">Registrar Nuevo Cliente</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nombre de Contacto *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ej. Mariana Vega"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nombre de la Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="ej. Alimentos del Sol"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Tipo de Cuenta Mayorista
                </label>
                <select
                  value={customerType}
                  onChange={(e) => setCustomerType(e.target.value as MotoCustomerType)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900 bg-white"
                >
                  <option value="Cadena de Refaccionarias">Cadena de Refaccionarias</option>
                  <option value="Taller Mecánico & Servicio">Taller Mecánico & Servicio</option>
                  <option value="Flota Delivery & Mensajería">Flota Delivery & Mensajería</option>
                  <option value="Distribuidor Regional">Distribuidor Regional</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Segmento de Cliente
                </label>
                <select
                  value={segment}
                  onChange={(e) => setSegment(e.target.value as CustomerSegment)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900 bg-white"
                >
                  <option value="Enterprise">Enterprise (Gran Cadena)</option>
                  <option value="Mid-market">Mid-market (Mediana Refaccionaria)</option>
                  <option value="SMB">SMB (Taller / Refaccionaria Local)</option>
                </select>
              </div>
            </div>

            {/* Wholesale Credit Conditions */}
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
              <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                Condiciones de Crédito y Marcas Autorizadas
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Línea de Crédito ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-none bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Plazo de Pago (Días)
                  </label>
                  <select
                    value={creditDays}
                    onChange={(e) => setCreditDays(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-none bg-white font-mono"
                  >
                    <option value={0}>Contado / Anticipado (0 días)</option>
                    <option value={15}>15 días comerciales</option>
                    <option value={30}>30 días comerciales</option>
                    <option value={45}>45 días comerciales</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Marcas de Moto
                  </label>
                  <input
                    type="text"
                    value={mainBrands}
                    onChange={(e) => setMainBrands(e.target.value)}
                    placeholder="Bajaj, Italika, Honda"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-none bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mariana@empresa.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+52 55 1234 5678"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Ciudad</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="ej. Guadalajara"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Facturación Mensual Recurrente Estimada
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={monthlyRevenue}
                onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                placeholder="0 si es por proyecto único"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Notas y Antecedentes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Preferencias de contacto, cómo nos conocieron..."
                className="w-full p-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900"
              />
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-emerald-100 bg-[#14281D] hover:bg-[#1B382B] rounded-xl shadow-sm"
              >
                Guardar Cliente
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
