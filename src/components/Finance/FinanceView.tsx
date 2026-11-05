import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Send,
  FileText,
  DollarSign,
  Download,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Invoice, InvoiceStatus } from '../../types/crm';
import { useCrm } from '../../context/CrmContext';

interface FinanceViewProps {
  onOpenInvoiceDetail: (invoice: Invoice) => void;
  onOpenNewInvoice: () => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  onOpenInvoiceDetail,
  onOpenNewInvoice,
}) => {
  const { invoices, formatCurrency, markInvoiceAsPaid, changeInvoiceStatus } = useCrm();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Financial aggregates
  const totalInvoiced = invoices.reduce((acc, curr) => acc + curr.total, 0);
  const totalPaid = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((acc, curr) => acc + curr.total, 0);
  const totalPending = invoices
    .filter((inv) => inv.status === 'pending')
    .reduce((acc, curr) => acc + curr.total, 0);
  const totalOverdue = invoices
    .filter((inv) => inv.status === 'overdue')
    .reduce((acc, curr) => acc + curr.total, 0);

  // Aging analysis data
  const agingData = [
    { bracket: '0-30 días (Vigente)', amount: totalPending, color: '#1B382B' },
    { bracket: '31-60 días (Mora Leve)', amount: totalOverdue, color: '#D97706' },
    { bracket: '+60 días (Mora Crítica)', amount: 0, color: '#DC2626' },
  ];

  const handleSendReminder = (inv: Invoice) => {
    setReminderToast(`Recordatorio de cobro para ${inv.company} (${inv.number}) enviado exitosamente vía correo.`);
    setTimeout(() => setReminderToast(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Reminder notification */}
      {reminderToast && (
        <div className="p-3.5 bg-emerald-900 text-emerald-100 rounded-2xl text-xs font-medium flex items-center justify-between shadow-lg">
          <span>{reminderToast}</span>
          <button
            type="button"
            onClick={() => setReminderToast(null)}
            className="text-emerald-300 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Control Financiero & Facturación
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Flujo de caja, ciclo de cobranza de facturas y análisis de antigüedad de saldos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenNewInvoice}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#14281D] hover:bg-[#1B382B] text-emerald-100 font-medium text-xs rounded-2xl shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Emitir Factura</span>
          </button>
        </div>
      </div>

      {/* Cash Flow Bento Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          <span className="text-xs font-medium text-stone-500">Total Facturado</span>
          <p className="text-2xl font-bold tracking-tight text-stone-900 font-mono mt-1">
            {formatCurrency(totalInvoiced)}
          </p>
          <span className="text-[11px] text-stone-400 mt-2 block">
            {invoices.length} facturas emitidas
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          <span className="text-xs font-medium text-stone-500">Cobrado (Efectivo en Caja)</span>
          <p className="text-2xl font-bold tracking-tight text-[#14281D] font-mono mt-1">
            {formatCurrency(totalPaid)}
          </p>
          <span className="text-[11px] text-emerald-700 font-medium mt-2 block">
            {(totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0).toFixed(0)}% cobrado con éxito
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          <span className="text-xs font-medium text-stone-500">Por Cobrar (Corriente)</span>
          <p className="text-2xl font-bold tracking-tight text-stone-800 font-mono mt-1">
            {formatCurrency(totalPending)}
          </p>
          <span className="text-[11px] text-stone-400 mt-2 block">Dentro de plazo normal</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Vencido en Mora</span>
            {totalOverdue > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            )}
          </div>
          <p className="text-2xl font-bold tracking-tight text-rose-700 font-mono mt-1">
            {formatCurrency(totalOverdue)}
          </p>
          <span className="text-[11px] text-rose-600 font-medium mt-2 block">
            Requiere gestión de cobro
          </span>
        </div>
      </div>

      {/* Aging of Accounts Receivable (Antigüedad de Cobros) Bento Chart */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-stone-900 tracking-tight">
              Antigüedad de Cobros (Aging de Facturas)
            </h2>
            <p className="text-xs text-stone-500">
              Distribución de cuentas por cobrar según días transcurridos desde vencimiento
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-stone-500">Total en riesgo de mora: </span>
            <span className="font-mono text-xs font-bold text-stone-800">
              {formatCurrency(totalPending + totalOverdue)}
            </span>
          </div>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={agingData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
            >
              <XAxis
                type="number"
                tickFormatter={(val) => `$${val / 1000}k`}
                stroke="#9CA3AF"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="bracket"
                stroke="#4B5563"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={150}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#14281D] text-white p-3 rounded-2xl shadow-xl border border-emerald-900 text-xs">
                        <p className="font-semibold text-emerald-300">
                          {payload[0].payload.bracket}
                        </p>
                        <p className="font-mono mt-1 text-sm font-bold">
                          ${Number(payload[0].value).toLocaleString()}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="amount" radius={[0, 8, 8, 0]}>
                {agingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Invoices Table Section */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Table Filter Controls */}
        <div className="p-4 border-b border-stone-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por número FAC, cliente, empresa..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-stone-50 border border-transparent focus:border-stone-300 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl">
              {(['all', 'pending', 'paid', 'overdue', 'draft'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    statusFilter === s
                      ? 'bg-white text-stone-900 shadow-sm font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {s === 'all'
                    ? 'Todas'
                    : s === 'pending'
                    ? 'Por Cobrar'
                    : s === 'paid'
                    ? 'Pagadas'
                    : s === 'overdue'
                    ? 'Vencidas'
                    : 'Borradores'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Folio Factura</th>
                <th className="py-3 px-4">Cliente / Empresa</th>
                <th className="py-3 px-4">Fechas</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Importe Total</th>
                <th className="py-3 px-4 text-right">Acciones Directas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-stone-50/80 transition-colors group cursor-pointer"
                  onClick={() => onOpenInvoiceDetail(inv)}
                >
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-stone-900 group-hover:text-[#14281D]">
                      {inv.number}
                    </span>
                    <p className="text-[10px] text-stone-400">
                      {inv.items.length} concepto{inv.items.length > 1 ? 's' : ''}
                    </p>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-stone-900">{inv.company}</p>
                    <p className="text-[11px] text-stone-500">{inv.customerName}</p>
                  </td>

                  <td className="py-3.5 px-4 text-stone-600 font-mono text-[11px]">
                    <p>Emisión: {inv.issueDate}</p>
                    <p className={inv.status === 'overdue' ? 'text-rose-600 font-bold' : 'text-stone-400'}>
                      Vence: {inv.dueDate}
                    </p>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        inv.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-800'
                          : inv.status === 'overdue'
                          ? 'bg-rose-50 text-rose-800 font-bold'
                          : inv.status === 'pending'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {inv.status === 'paid'
                        ? 'Pagada'
                        : inv.status === 'overdue'
                        ? 'Vencida'
                        : inv.status === 'pending'
                        ? 'Por Cobrar'
                        : 'Borrador'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-stone-900">
                    {formatCurrency(inv.total)}
                  </td>

                  {/* Direct Actions Cell */}
                  <td
                    className="py-3.5 px-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      {inv.status !== 'paid' && (
                        <button
                          type="button"
                          onClick={() => markInvoiceAsPaid(inv.id)}
                          title="Marcar como pagada (con opción de Deshacer)"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Cobrado</span>
                        </button>
                      )}

                      {inv.status === 'overdue' && (
                        <button
                          type="button"
                          onClick={() => handleSendReminder(inv)}
                          title="Enviar recordatorio de pago"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Recordar</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onOpenInvoiceDetail(inv)}
                        className="px-2 py-1 text-[11px] font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                      >
                        Ver
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
