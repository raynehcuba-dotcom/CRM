import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, Calendar, DollarSign } from 'lucide-react';
import { InvoiceItem, InvoiceStatus } from '../../types/crm';
import { useCrm } from '../../context/CrmContext';

interface NewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewInvoiceModal: React.FC<NewInvoiceModalProps> = ({ isOpen, onClose }) => {
  const { customers, addInvoice, formatCurrency, partsCatalog } = useCrm();

  const [selectedCustomerId, setSelectedCustomerId] = useState(
    customers[0]?.id || ''
  );
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [status, setStatus] = useState<InvoiceStatus>('pending');
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      description: 'SKU-ARR-428H - Kit Arrastre Reforzado 428H-128L (Pulsar/Italika)',
      quantity: 25,
      unitPrice: 285,
      amount: 7125,
    },
    {
      description: 'SKU-BAT-GEL12 - Batería de Gel Sellada 12V 7Ah (Universal)',
      quantity: 15,
      unitPrice: 320,
      amount: 4800,
    },
  ]);
  const [notes, setNotes] = useState(
    'Condición de crédito comercial a 30 días para refaccionaria. Despacho vía embarque consolidado.'
  );

  if (!isOpen) return null;

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      current.amount = Number(current.quantity) * Number(current.unitPrice);
    }
    updated[index] = current;
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 500, amount: 500 }]);
  };

  const handleAddPartFromCatalog = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sku = e.target.value;
    if (!sku) return;
    const part = partsCatalog.find((p) => p.sku === sku);
    if (part) {
      setItems([
        ...items,
        {
          description: `${part.sku} - ${part.name} (${part.compatibleModels.split(',')[0]})`,
          quantity: part.minOrderQty,
          unitPrice: part.wholesalePrice,
          amount: part.minOrderQty * part.wholesalePrice,
        },
      ]);
    }
    e.target.value = '';
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const subtotal = items.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
  const tax = Math.round(subtotal * 0.16);
  const total = subtotal + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

    addInvoice({
      customerId: customer?.id || 'cust-1',
      customerName: customer?.name || 'Cliente Comercial',
      company: customer?.company || 'Empresa Cliente',
      issueDate,
      dueDate,
      status,
      items,
      subtotal,
      tax,
      total,
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

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden z-10 max-h-[92vh] flex flex-col"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
            <div>
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Emisión de Facturación
              </span>
              <h2 className="text-lg font-bold text-stone-900">Crear Nueva Factura</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Customer select */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Seleccionar Cliente *
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company} — {c.name} ({c.segment})
                  </option>
                ))}
              </select>
            </div>

            {/* Dates & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Fecha Emisión
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Fecha Vencimiento
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Estado Inicial
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white"
                >
                  <option value="pending">Por Cobrar (Pendiente)</option>
                  <option value="draft">Borrador</option>
                  <option value="paid">Pagada de Contado</option>
                </select>
              </div>
            </div>

            {/* Invoice Line Items */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <label className="text-xs font-semibold text-stone-700">
                  Conceptos / Repuestos Facturados
                </label>
                <div className="flex items-center gap-2">
                  <select
                    onChange={handleAddPartFromCatalog}
                    defaultValue=""
                    className="text-[11px] font-medium px-2 py-1 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 focus:outline-none"
                  >
                    <option value="" disabled>
                      + Añadir desde Catálogo Mayorista...
                    </option>
                    {partsCatalog.map((p) => (
                      <option key={p.sku} value={p.sku}>
                        {p.sku} - {p.name} ({formatCurrency(p.wholesalePrice)})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Línea Manual</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      placeholder="Descripción del servicio entregado"
                      className="flex-3 px-3 py-1.5 text-xs rounded-xl border border-stone-200"
                    />
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                      className="w-16 px-2 py-1.5 text-xs rounded-xl border border-stone-200 text-center font-mono"
                    />
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                      className="w-24 px-2 py-1.5 text-xs rounded-xl border border-stone-200 font-mono"
                    />
                    <span className="w-24 text-right font-mono text-xs font-bold text-stone-800">
                      {formatCurrency(item.amount)}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 text-stone-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations preview */}
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 flex justify-between items-center text-xs">
              <span className="text-stone-500">Subtotal + IVA 16%:</span>
              <span className="font-mono text-sm font-bold text-[#14281D]">
                Total: {formatCurrency(total)}
              </span>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Condiciones y Notas
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-stone-200"
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
                Emitir Factura
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
