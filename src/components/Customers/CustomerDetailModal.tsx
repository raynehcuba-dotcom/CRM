import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MessageSquare,
  Plus,
  PhoneCall,
  Video,
  FileText,
  DollarSign,
  Briefcase,
  GitPullRequestDraft,
} from 'lucide-react';
import { Customer, CustomerInteraction } from '../../types/crm';
import { useCrm } from '../../context/CrmContext';

interface CustomerDetailModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenDeal?: (dealId: string) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  isOpen,
  onClose,
  onOpenDeal,
}) => {
  const { deals, formatCurrency, addInteraction } = useCrm();

  // New interaction form state
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteType, setNoteType] = useState<'call' | 'email' | 'meeting' | 'note'>('meeting');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDescription, setNoteDescription] = useState('');

  if (!isOpen || !customer) return null;

  // Associated deals for this customer
  const customerDeals = deals.filter(
    (d) => d.company.toLowerCase() === customer.company.toLowerCase()
  );

  const handleCreateInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    addInteraction(customer.id, {
      type: noteType,
      title: noteTitle,
      description: noteDescription,
      author: 'Mateo Rivas',
    });

    setNoteTitle('');
    setNoteDescription('');
    setIsAddingNote(false);
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

        {/* Modal Sheet */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden z-10 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-stone-100 flex items-start justify-between bg-stone-50/50">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-sm"
                style={{ backgroundColor: customer.avatarBg }}
              >
                {customer.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-stone-900">{customer.name}</h2>
                  <span className="text-[11px] font-semibold text-stone-700 bg-stone-200/70 px-2 py-0.5 rounded-md">
                    {customer.segment}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      customer.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : customer.status === 'negotiating'
                        ? 'bg-amber-100 text-amber-800'
                        : customer.status === 'at_risk'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {customer.status === 'active'
                      ? 'Activo'
                      : customer.status === 'negotiating'
                      ? 'En Negociación'
                      : customer.status === 'at_risk'
                      ? 'En Riesgo'
                      : 'Nuevo'}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-0.5 font-medium">
                  {customer.company} · {customer.industry}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-100">
                <span className="text-[11px] text-stone-500 font-medium">Valor de Vida (LTV)</span>
                <p className="text-lg font-bold text-stone-900 font-mono mt-0.5">
                  {formatCurrency(customer.totalLtv)}
                </p>
              </div>
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-100">
                <span className="text-[11px] text-stone-500 font-medium">Facturación Mensual</span>
                <p className="text-lg font-bold text-[#14281D] font-mono mt-0.5">
                  {customer.monthlyRevenue > 0
                    ? formatCurrency(customer.monthlyRevenue)
                    : 'Bajo Demanda'}
                </p>
              </div>
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-100">
                <span className="text-[11px] text-stone-500 font-medium">Tratos Concretados</span>
                <p className="text-lg font-bold text-stone-900 font-mono mt-0.5">
                  {customer.dealsWonCount} ganados
                </p>
              </div>
            </div>

            {/* Contact Details Grid */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200/80">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">
                Información de Contacto
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="flex items-center gap-2 text-stone-600">
                  <Mail className="w-4 h-4 text-stone-400 shrink-0" />
                  <a href={`mailto:${customer.email}`} className="truncate hover:underline">
                    {customer.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-stone-600">
                  <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-600">
                  <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>{customer.city}</span>
                </div>
              </div>

              {/* Motorcycle Wholesale & Commercial Terms */}
              <div className="mt-3 pt-3 border-t border-stone-100">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-stone-50/70 p-3 rounded-xl border border-stone-100">
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">
                      Tipo de Mayorista
                    </span>
                    <span className="text-xs font-semibold text-stone-800">
                      {customer.customerType || 'Cadena de Refaccionarias'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">
                      Línea de Crédito & Plazo
                    </span>
                    <span className="text-xs font-bold font-mono text-[#14281D]">
                      {customer.creditLimit ? formatCurrency(customer.creditLimit) : '$0'}
                      <span className="text-stone-500 font-normal"> · {customer.creditDays || 30} días</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-400 font-bold uppercase block mb-1">
                      Marcas de Mayor Rotación
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(customer.mainBrands && customer.mainBrands.length > 0
                        ? customer.mainBrands
                        : ['Bajaj', 'Italika', 'Honda']
                      ).map((b) => (
                        <span
                          key={b}
                          className="text-[10px] font-semibold bg-white border border-stone-200 text-stone-700 px-1.5 py-0.2 rounded"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {customer.notes && (
                <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-600">
                  <span className="font-semibold text-stone-800">Nota clave: </span>
                  {customer.notes}
                </div>
              )}
            </div>

            {/* Associated Deals */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Tratos Asociados ({customerDeals.length})
                </h3>
              </div>

              {customerDeals.length === 0 ? (
                <div className="p-4 bg-stone-50 rounded-2xl text-center text-xs text-stone-500">
                  No hay tratos comerciales activos vinculados a este cliente actualmente.
                </div>
              ) : (
                <div className="space-y-2">
                  {customerDeals.map((deal) => (
                    <div
                      key={deal.id}
                      onClick={() => {
                        onClose();
                        onOpenDeal?.(deal.id);
                      }}
                      className="flex items-center justify-between p-3 rounded-2xl border border-stone-200/80 hover:bg-stone-50 transition-colors cursor-pointer group"
                    >
                      <div className="min-w-0 pr-3">
                        <p className="text-xs font-bold text-stone-900 group-hover:text-[#14281D]">
                          {deal.title}
                        </p>
                        <p className="text-[11px] text-stone-500">
                          Etapa: {deal.stage} · {deal.probability}% prob.
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono text-xs font-bold text-stone-900">
                          {formatCurrency(deal.value)}
                        </span>
                        <p className="text-[10px] text-stone-400">Ver trato</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Interaction History & Activity Timeline */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Historial de Interacciones & Bitácora
                </h3>

                {!isAddingNote && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNote(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Registrar Interacción</span>
                  </button>
                )}
              </div>

              {/* Add Interaction Form */}
              {isAddingNote && (
                <motion.form
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleCreateInteraction}
                  className="mb-4 p-4 rounded-2xl border border-stone-300 bg-stone-50/70 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    {(
                      [
                        { id: 'meeting', label: 'Reunión', icon: Video },
                        { id: 'call', label: 'Llamada', icon: PhoneCall },
                        { id: 'email', label: 'Email', icon: Mail },
                        { id: 'note', label: 'Nota', icon: FileText },
                      ] as const
                    ).map((t) => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setNoteType(t.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                            noteType === t.id
                              ? 'bg-stone-900 text-white font-semibold'
                              : 'bg-white text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <input
                    type="text"
                    required
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Título breve (ej. Revisión de propuesta comercial)"
                    className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900"
                  />

                  <textarea
                    rows={2}
                    value={noteDescription}
                    onChange={(e) => setNoteDescription(e.target.value)}
                    placeholder="Puntos clave abordados, acuerdos o compromisos..."
                    className="w-full p-2.5 text-xs bg-white rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingNote(false)}
                      className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-200 rounded-xl"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold text-emerald-100 bg-[#14281D] rounded-xl hover:bg-[#1B382B]"
                    >
                      Guardar en Historial
                    </button>
                  </div>
                </motion.form>
              )}

              {/* Timeline Items */}
              <div className="space-y-3">
                {customer.interactions.map((int) => (
                  <div
                    key={int.id}
                    className="flex gap-3 p-3.5 rounded-2xl bg-stone-50/70 border border-stone-100"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center shrink-0 text-stone-600">
                      {int.type === 'call' ? (
                        <PhoneCall className="w-4 h-4" />
                      ) : int.type === 'email' ? (
                        <Mail className="w-4 h-4" />
                      ) : int.type === 'meeting' ? (
                        <Video className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-stone-900">{int.title}</p>
                        <span className="text-[10px] text-stone-400 font-mono">{int.date}</span>
                      </div>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        {int.description}
                      </p>
                      <span className="text-[10px] text-stone-400 mt-1.5 block">
                        Por: {int.author}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
