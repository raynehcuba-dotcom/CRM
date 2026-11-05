import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Printer,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Building,
  User,
  Calendar,
  FileCheck,
} from 'lucide-react';
import { Invoice } from '../../types/crm';
import { useCrm } from '../../context/CrmContext';

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  isOpen,
  onClose,
}) => {
  const { currentProfile, formatCurrency, markInvoiceAsPaid } = useCrm();

  if (!isOpen || !invoice) return null;

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

        {/* Modal Window styled like an elegant invoice paper */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden z-10 max-h-[92vh] flex flex-col"
        >
          {/* Header Action Bar */}
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-stone-900">{invoice.number}</span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  invoice.status === 'paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : invoice.status === 'overdue'
                    ? 'bg-rose-100 text-rose-800 font-bold'
                    : invoice.status === 'pending'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                {invoice.status === 'paid'
                  ? 'Pagada'
                  : invoice.status === 'overdue'
                  ? 'Vencida'
                  : invoice.status === 'pending'
                  ? 'Por Cobrar'
                  : 'Borrador'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir / PDF</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Invoice Sheet Body */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white">
            {/* Top row: Emisor & Receptor */}
            <div className="grid grid-cols-2 gap-8 text-xs">
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                  Emisor (Nuestra Empresa)
                </p>
                <p className="font-bold text-stone-900 text-sm">{currentProfile.legalName}</p>
                <p className="text-stone-500 mt-0.5">RFC/NIF: {currentProfile.taxId}</p>
                <p className="text-stone-500">{currentProfile.address}</p>
                <p className="text-stone-500">{currentProfile.city}</p>
                <p className="text-stone-400 text-[11px] mt-1">{currentProfile.contactEmail} · {currentProfile.contactPhone}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                  Cliente / Receptor
                </p>
                <p className="font-bold text-stone-900 text-sm">{invoice.company}</p>
                <p className="text-stone-500 mt-0.5">Atención: {invoice.customerName}</p>
                <p className="text-stone-500">ID Cliente: {invoice.customerId}</p>
              </div>
            </div>

            {/* Dates row */}
            <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100 text-xs">
              <div>
                <span className="text-[10px] text-stone-400 font-medium">Fecha de Emisión</span>
                <p className="font-semibold text-stone-800 font-mono mt-0.5">{invoice.issueDate}</p>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-medium">Fecha de Vencimiento</span>
                <p
                  className={`font-semibold font-mono mt-0.5 ${
                    invoice.status === 'overdue' ? 'text-rose-700' : 'text-stone-800'
                  }`}
                >
                  {invoice.dueDate}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-medium">Fecha de Liquidación</span>
                <p className="font-semibold text-stone-800 font-mono mt-0.5">
                  {invoice.paidDate ? invoice.paidDate : 'Pendiente'}
                </p>
              </div>
            </div>

            {/* Invoice Line Items */}
            <div>
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                Conceptos y Servicios
              </p>
              <table className="w-full text-left text-xs border border-stone-200 rounded-xl overflow-hidden">
                <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-3">Descripción</th>
                    <th className="py-2.5 px-3 text-center">Cant.</th>
                    <th className="py-2.5 px-3 text-right">Precio Unit.</th>
                    <th className="py-2.5 px-3 text-right">Importe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/50">
                      <td className="py-2.5 px-3 font-medium text-stone-800">{item.description}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-stone-900">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Subtotal, Tax & Total */}
            <div className="flex justify-end text-xs">
              <div className="w-64 space-y-2 border-t border-stone-200 pt-3">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold">{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Impuestos (16% IVA):</span>
                  <span className="font-mono font-semibold">{formatCurrency(invoice.tax)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-900 border-t border-stone-200 pt-2">
                  <span>Total Facturado:</span>
                  <span className="font-mono text-base text-[#14281D]">
                    {formatCurrency(invoice.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600">
                <span className="font-semibold text-stone-800">Condiciones de Pago: </span>
                {invoice.notes}
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between bg-stone-50/50">
            <span className="text-[11px] text-stone-500">
              {invoice.status === 'paid'
                ? 'Comprobante fiscal liquidado'
                : 'Pendiente de acreditación'}
            </span>

            <div className="flex items-center gap-2">
              {invoice.status !== 'paid' && (
                <button
                  type="button"
                  onClick={() => {
                    markInvoiceAsPaid(invoice.id);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-100 bg-[#14281D] hover:bg-[#1B382B] rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Marcar como Pagada (con Undo)</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
