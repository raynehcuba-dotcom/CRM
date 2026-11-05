import React, { useState } from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  ShieldAlert,
  Flame,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Receipt,
  Users,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useCrm } from '../../context/CrmContext';
import { REVENUE_HISTORY_DATA } from '../../data/mockData';

interface OverviewViewProps {
  onOpenDeal: (dealId: string) => void;
  onOpenNewDeal: () => void;
  onOpenInvoice: (invoiceId: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onOpenDeal,
  onOpenNewDeal,
  onOpenInvoice,
}) => {
  const {
    deals,
    customers,
    invoices,
    currentProfile,
    formatCurrency,
    setActiveTab,
    moveDealStage,
  } = useCrm();

  const [period, setPeriod] = useState<'6m' | '12m'>('12m');

  // Filtered chart data based on period
  const chartData =
    period === '6m'
      ? REVENUE_HISTORY_DATA.slice(-6)
      : REVENUE_HISTORY_DATA;

  // Real KPI calculations
  const totalInvoicedThisMonth = invoices
    .filter((inv) => inv.issueDate.startsWith('2026-11'))
    .reduce((acc, curr) => acc + curr.total, 0);

  const totalCollectedPaid = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((acc, curr) => acc + curr.total, 0);

  const pendingCollection = invoices
    .filter((inv) => inv.status === 'pending')
    .reduce((acc, curr) => acc + curr.total, 0);

  const overdueInvoices = invoices.filter((inv) => inv.status === 'overdue');
  const overdueAmount = overdueInvoices.reduce((acc, curr) => acc + curr.total, 0);

  const activeDeals = deals.filter(
    (d) => d.stage !== 'closed_won' && d.stage !== 'closed_lost'
  );
  const activePipelineValue = activeDeals.reduce((acc, curr) => acc + curr.value, 0);

  const wonDeals = deals.filter((d) => d.stage === 'closed_won');
  const closedTotal = deals.filter((d) => d.stage === 'closed_won' || d.stage === 'closed_lost').length;
  const winRate = closedTotal > 0 ? Math.round((wonDeals.length / closedTotal) * 100) : 67;

  // Hot deals: high priority or high probability active deals
  const hotDeals = [...activeDeals]
    .sort((a, b) => b.probability * b.value - a.probability * a.value)
    .slice(0, 4);

  // Notification criteria calculations from company preferences
  const notifs = currentProfile.notificationPreferences || {
    dealCloseAlerts: true,
    daysBeforeDealClose: 7,
    dealMinProbability: 50,
    overdueInvoiceAlerts: true,
    preventiveInvoiceAlerts: true,
    inAppBanner: true,
  };

  const todayMs = new Date('2026-11-03').getTime();
  const thresholdCloseMs = todayMs + (notifs.daysBeforeDealClose || 7) * 86400000;

  const dealsNearClose = notifs.dealCloseAlerts
    ? activeDeals.filter((d) => {
        if (d.probability < (notifs.dealMinProbability || 50)) return false;
        if (!d.expectedCloseDate) return false;
        const closeMs = new Date(d.expectedCloseDate).getTime();
        return closeMs >= todayMs && closeMs <= thresholdCloseMs;
      })
    : [];

  const overdueInvs = notifs.overdueInvoiceAlerts ? overdueInvoices : [];
  const showAlertBanner = notifs.inAppBanner && (dealsNearClose.length > 0 || overdueInvs.length > 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Active Notification Preferences Alert Banner */}
      {showAlertBanner && (
        <div className="p-4 rounded-3xl bg-amber-50/70 border border-amber-200/80 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-amber-950">
                Avisos Comerciales & Financieros Activos ({dealsNearClose.length + overdueInvs.length})
              </p>
              <div className="text-amber-900/80 mt-0.5 space-y-0.5">
                {dealsNearClose.length > 0 && (
                  <p>
                    • {dealsNearClose.length} oportunidad{dealsNearClose.length === 1 ? '' : 'es'} con fecha de cierre prevista en los próximos {notifs.daysBeforeDealClose} días:{' '}
                    <span className="font-semibold">{dealsNearClose.map((d) => d.company).join(', ')}</span>.
                  </p>
                )}
                {overdueInvs.length > 0 && (
                  <p>
                    • {overdueInvs.length} factura{overdueInvs.length === 1 ? '' : 's'} vencida{overdueInvs.length === 1 ? '' : 's'} en mora:{' '}
                    <span className="font-semibold">{overdueInvs.map((i) => `${i.number} (${i.company})`).join(', ')}</span>.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            {dealsNearClose.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('pipeline')}
                className="px-3 py-1.5 bg-amber-900 text-amber-50 hover:bg-amber-950 font-semibold rounded-xl text-[11px] transition-colors cursor-pointer"
              >
                Revisar Embudo
              </button>
            )}
            {overdueInvs.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('finance')}
                className="px-3 py-1.5 bg-white border border-amber-300 text-amber-950 hover:bg-amber-100/60 font-semibold rounded-xl text-[11px] transition-colors cursor-pointer"
              >
                Gestionar Cobranza
              </button>
            )}
          </div>
        </div>
      )}

      {/* Welcome Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
            <span>{currentProfile.name}</span>
            <span aria-hidden="true">·</span>
            <span>Comercializadora Mayorista de Partes & Repuestos de Motos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Resumen Operativo & Almacén
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Seguimiento de pedidos de mayoreo, rotación de repuestos y cobranza a refaccionarias.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenNewDeal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#14281D] hover:bg-[#1B382B] text-emerald-100 font-medium text-xs rounded-2xl shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <span>+ Nuevo Trato</span>
          </button>
        </div>
      </div>

      {/* Bento Grid: Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ingresos del Mes */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-stone-500">Ingresos Proyectados Mes</span>
              <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +14.2%
              </span>
            </div>
            <p className="text-2xl font-bold tracking-tight text-stone-900 font-mono tabular-nums">
              {formatCurrency(totalInvoicedThisMonth > 0 ? totalInvoicedThisMonth : 25600)}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Cobrado real:</span>
            <span className="font-semibold text-stone-800 font-mono">
              {formatCurrency(totalCollectedPaid)}
            </span>
          </div>
        </div>

        {/* KPI 2: Pipeline Abierto */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-stone-500">Pipeline en Negociación</span>
              <span className="text-xs font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
                {activeDeals.length} tratos activos
              </span>
            </div>
            <p className="text-2xl font-bold tracking-tight text-[#14281D] font-mono tabular-nums">
              {formatCurrency(activePipelineValue)}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Valor ponderado:</span>
            <span className="font-semibold text-stone-800 font-mono">
              {formatCurrency(
                activeDeals.reduce((acc, d) => acc + (d.value * d.probability) / 100, 0)
              )}
            </span>
          </div>
        </div>

        {/* KPI 3: Tasa de Cierre (Win Rate) */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-stone-500">Efectividad de Cierre</span>
              <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                Objetivo &gt; 60%
              </span>
            </div>
            <p className="text-2xl font-bold tracking-tight text-stone-900 font-mono tabular-nums">
              {winRate}%
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Cerrados ganados:</span>
            <span className="font-semibold text-stone-800 font-mono">{wonDeals.length} cerrados</span>
          </div>
        </div>

        {/* KPI 4: Cuentas por Cobrar & Alertas */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-stone-500">Cobros Pendientes</span>
              {overdueInvoices.length > 0 ? (
                <span className="inline-flex items-center text-xs font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                  <ShieldAlert className="w-3 h-3 mr-1" /> {overdueInvoices.length} en mora
                </span>
              ) : (
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Al día
                </span>
              )}
            </div>
            <p className="text-2xl font-bold tracking-tight text-stone-900 font-mono tabular-nums">
              {formatCurrency(pendingCollection + overdueAmount)}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Vencido acumulado:</span>
            <span className={`font-semibold font-mono ${overdueAmount > 0 ? 'text-amber-700' : 'text-stone-800'}`}>
              {formatCurrency(overdueAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Bento Section: Revenue Evolution Chart + Hot Deals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Evolution Chart (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-stone-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-base font-bold text-stone-900 tracking-tight">
                  Evolución de Ingresos Mensuales
                </h2>
                <p className="text-xs text-stone-500">
                  Desglose entre servicios recurrentes (retainers) y contratos de nuevos proyectos
                </p>
              </div>

              {/* Segmented Filter Control */}
              <div className="flex items-center p-1 bg-stone-100 rounded-xl self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setPeriod('6m')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    period === '6m'
                      ? 'bg-white text-stone-900 shadow-sm font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  6 Meses
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod('12m')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    period === '12m'
                      ? 'bg-white text-stone-900 shadow-sm font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Año Completo
                </button>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-[270px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1B382B" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#1B382B" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorRecurrente" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D97706" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    stroke="#9CA3AF"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val / 1000}k`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#14281D] text-stone-100 p-3 rounded-2xl shadow-xl border border-emerald-900/60 text-xs">
                            <p className="font-semibold text-emerald-300 mb-1.5">{label} 2026</p>
                            <div className="space-y-1 font-mono">
                              <p className="flex justify-between gap-4">
                                <span className="text-stone-300">Total Ingresos:</span>
                                <span className="font-bold text-white">
                                  ${Number(payload[0]?.value).toLocaleString()}
                                </span>
                              </p>
                              {payload[1] && (
                                <p className="flex justify-between gap-4">
                                  <span className="text-amber-300">Recurrente:</span>
                                  <span className="font-medium text-amber-200">
                                    ${Number(payload[1]?.value).toLocaleString()}
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="ingresos"
                    stroke="#1B382B"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorIngresos)"
                    name="Ingresos Totales"
                  />
                  <Area
                    type="monotone"
                    dataKey="recurrente"
                    stroke="#D97706"
                    strokeWidth={1.8}
                    strokeDasharray="3 3"
                    fillOpacity={1}
                    fill="url(#colorRecurrente)"
                    name="Ingresos Recurrentes"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1B382B]" /> Total facturado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" /> Base recurrente
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('growth')}
              className="text-stone-700 hover:text-stone-950 font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              Ver proyecciones anuales <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Hot Deals Bento Card */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Flame className="w-4 h-4 fill-amber-500 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-stone-900 tracking-tight">
                    Tratos Calientes
                  </h2>
                  <p className="text-xs text-stone-500">Alta probabilidad de cierre este mes</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('pipeline')}
                className="text-xs font-semibold text-[#14281D] hover:underline cursor-pointer"
              >
                Ver Pipeline
              </button>
            </div>

            <div className="space-y-3">
              {hotDeals.map((deal) => (
                <div
                  key={deal.id}
                  onClick={() => onOpenDeal(deal.id)}
                  className="p-3.5 rounded-2xl border border-stone-200/80 hover:border-emerald-700/40 hover:bg-stone-50/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-stone-900 truncate group-hover:text-[#14281D]">
                        {deal.title}
                      </p>
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">
                        {deal.company} · {deal.contactName}
                      </p>
                      {(deal.brandCompatibility || deal.unitsCount) && (
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {deal.brandCompatibility && (
                            <span className="text-[10px] font-semibold text-stone-700 bg-stone-100 border border-stone-200/60 px-1.5 py-0.2 rounded">
                              {deal.brandCompatibility}
                            </span>
                          )}
                          {deal.unitsCount && (
                            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded">
                              {deal.unitsCount} pzas
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="font-mono text-xs font-bold text-stone-900 shrink-0">
                      {formatCurrency(deal.value)}
                    </span>
                  </div>

                  {/* Probability progress & fast move */}
                  <div className="mt-3 flex items-center justify-between gap-3 text-[11px]">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="h-1.5 flex-1 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${deal.probability}%` }}
                        />
                      </div>
                      <span className="font-mono text-stone-500 text-[10px]">
                        {deal.probability}%
                      </span>
                    </div>

                    {deal.stage === 'negotiation' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveDealStage(deal.id, 'closed_won');
                        }}
                        className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                      >
                        Cerrar Ganado
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onOpenNewDeal}
              className="w-full py-2 text-center text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer"
            >
              + Agregar nueva oportunidad
            </button>
          </div>
        </div>
      </div>

      {/* Lower Bento Row: Invoicing Alert & Cash Flow Summary + Customer Quick Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Billing & Collection Attention */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900 tracking-tight">
                  Cobranza y Facturación Inmediata
                </h2>
                <p className="text-xs text-stone-500">Facturas prioritarias por gestionar hoy</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('finance')}
              className="text-xs font-semibold text-[#14281D] hover:underline cursor-pointer"
            >
              Ir a Finanzas
            </button>
          </div>

          <div className="space-y-2.5">
            {invoices.slice(0, 3).map((inv) => (
              <div
                key={inv.id}
                onClick={() => onOpenInvoice(inv.id)}
                className="flex items-center justify-between p-3 rounded-2xl bg-stone-50/70 hover:bg-stone-100/70 transition-colors cursor-pointer"
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-stone-900">
                      {inv.number}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        inv.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.status === 'overdue'
                          ? 'bg-rose-100 text-rose-800 font-semibold'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inv.status === 'paid'
                        ? 'Pagada'
                        : inv.status === 'overdue'
                        ? 'Vencida'
                        : 'Pendiente'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 truncate mt-0.5">
                    {inv.company} · Vence: {inv.dueDate}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-mono text-xs font-bold text-stone-900">
                    {formatCurrency(inv.total)}
                  </p>
                  <span className="text-[10px] text-stone-400">Ver detalle</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Accounts & Retention */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900 tracking-tight">
                  Clientes & Cuentas Clave
                </h2>
                <p className="text-xs text-stone-500">Historial reciente y retención de cartera</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('customers')}
              className="text-xs font-semibold text-[#14281D] hover:underline cursor-pointer"
            >
              Ver Cartera
            </button>
          </div>

          <div className="space-y-2.5">
            {customers.slice(0, 3).map((cust) => (
              <div
                key={cust.id}
                onClick={() => setActiveTab('customers')}
                className="flex items-center justify-between p-3 rounded-2xl bg-stone-50/70 hover:bg-stone-100/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-semibold shrink-0"
                    style={{ backgroundColor: cust.avatarBg }}
                  >
                    {cust.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-stone-900 truncate">
                      {cust.company}
                    </p>
                    <p className="text-[11px] text-stone-500 truncate">
                      {cust.name} · {cust.industry}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-medium text-stone-600 bg-stone-200/70 px-2 py-0.5 rounded">
                    {cust.segment}
                  </span>
                  <p className="font-mono text-xs font-bold text-stone-800 mt-1">
                    LTV: {formatCurrency(cust.totalLtv)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
