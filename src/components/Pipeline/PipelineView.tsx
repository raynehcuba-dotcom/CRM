import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Clock,
  CheckCircle,
  MoreVertical,
  Flame,
  ArrowRight,
  Package,
  X,
  AlertTriangle,
} from 'lucide-react';
import { Deal, DealStage } from '../../types/crm';
import { useCrm } from '../../context/CrmContext';

interface PipelineViewProps {
  onOpenDeal: (dealId: string) => void;
  onOpenNewDeal: () => void;
}

interface ColumnDef {
  id: DealStage;
  title: string;
  subtitle: string;
  accentBg: string;
}

const COLUMNS: ColumnDef[] = [
  {
    id: 'qualification',
    title: 'Cotización / Precios',
    subtitle: 'Solicitud mayoreo & modelos de moto',
    accentBg: 'bg-stone-50',
  },
  {
    id: 'proposal',
    title: 'Apartado en Bodega',
    subtitle: 'Existencias verificadas & volumen',
    accentBg: 'bg-stone-50',
  },
  {
    id: 'negotiation',
    title: 'Negociación & Crédito',
    subtitle: 'Plazos 15/30 días & fletes',
    accentBg: 'bg-amber-50/40',
  },
  {
    id: 'closed_won',
    title: 'Despachado & Facturado',
    subtitle: 'Embarque entregado y liquidado',
    accentBg: 'bg-emerald-50/40',
  },
];

export const PipelineView: React.FC<PipelineViewProps> = ({
  onOpenDeal,
  onOpenNewDeal,
}) => {
  const { deals, formatCurrency, moveDealStage, partsCatalog } = useCrm();

  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [showLostColumn, setShowLostColumn] = useState(false);
  const [showPartsCatalog, setShowPartsCatalog] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');

  // Filter deals
  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (deal.brandCompatibility && deal.brandCompatibility.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (deal.partCategory && deal.partCategory.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPriority = priorityFilter === 'all' || deal.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  // Calculate stats
  const totalValue = deals
    .filter((d) => d.stage !== 'closed_lost')
    .reduce((acc, curr) => acc + curr.value, 0);

  const weightedValue = deals
    .filter((d) => d.stage !== 'closed_lost')
    .reduce((acc, curr) => acc + (curr.value * curr.probability) / 100, 0);

  const activeCount = deals.filter(
    (d) => d.stage !== 'closed_won' && d.stage !== 'closed_lost'
  ).length;

  // Advance stage helper
  const getNextStage = (current: DealStage): DealStage | null => {
    switch (current) {
      case 'qualification':
        return 'proposal';
      case 'proposal':
        return 'negotiation';
      case 'negotiation':
        return 'closed_won';
      default:
        return null;
    }
  };

  const getPrevStage = (current: DealStage): DealStage | null => {
    switch (current) {
      case 'closed_won':
        return 'negotiation';
      case 'negotiation':
        return 'proposal';
      case 'proposal':
        return 'qualification';
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header and Summary Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
            <span>Mayoreo de Repuestos & Partes de Moto</span>
            <span aria-hidden="true">·</span>
            <span>Ventas B2B</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Embudo de Pedidos Mayoristas
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Gestión comercial de pedidos por lote para refaccionarias, talleres mecánicos y flotillas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPartsCatalog(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white border border-stone-200/90 hover:bg-stone-50 text-stone-800 font-medium text-xs rounded-2xl shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <span>📦 Catálogo & Stock Bodega</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewDeal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#14281D] hover:bg-[#1B382B] text-emerald-100 font-medium text-xs rounded-2xl shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Pedido Mayorista</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-stone-200/70 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 font-medium">Volumen Total en Embudo</span>
            <p className="text-xl font-bold text-stone-900 font-mono tabular-nums mt-0.5">
              {formatCurrency(totalValue)}
            </p>
          </div>
          <span className="text-xs text-stone-500 font-mono bg-stone-100 px-2.5 py-1 rounded-xl">
            {deals.length} tratos
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200/70 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 font-medium">Valor Ponderado (Probabilidad)</span>
            <p className="text-xl font-bold text-[#14281D] font-mono tabular-nums mt-0.5">
              {formatCurrency(weightedValue)}
            </p>
          </div>
          <span className="text-xs text-emerald-800 font-mono bg-emerald-50 px-2.5 py-1 rounded-xl">
            {activeCount} en curso
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200/70 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 font-medium">Ticket Promedio por Trato</span>
            <p className="text-xl font-bold text-stone-900 font-mono tabular-nums mt-0.5">
              {formatCurrency(deals.length > 0 ? Math.round(totalValue / deals.length) : 0)}
            </p>
          </div>
          <span className="text-xs text-amber-800 font-mono bg-amber-50 px-2.5 py-1 rounded-xl">
            Promedio
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3 border border-stone-200/70 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por oportunidad o cliente..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-stone-50 border border-transparent focus:border-stone-300 focus:bg-white focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl">
            {(['all', 'high', 'medium', 'low'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  priorityFilter === p
                    ? 'bg-white text-stone-900 shadow-sm font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {p === 'all'
                  ? 'Todas'
                  : p === 'high'
                  ? 'Alta'
                  : p === 'medium'
                  ? 'Media'
                  : 'Baja'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowLostColumn(!showLostColumn)}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors cursor-pointer ${
              showLostColumn
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {showLostColumn ? 'Ocultar Perdidos' : 'Ver Perdidos'}
          </button>
        </div>
      </div>

      {/* Kanban Board Horizontal Scroll Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colDeals = filteredDeals.filter((d) => d.stage === col.id);
          const colTotal = colDeals.reduce((acc, curr) => acc + curr.value, 0);

          return (
            <div
              key={col.id}
              className={`rounded-3xl p-3.5 border border-stone-200/80 ${col.accentBg} flex flex-col min-h-[550px] shadow-[0_2px_12px_-2px_rgba(0,0,0,0.02)]`}
            >
              {/* Column Header */}
              <div className="px-1.5 pb-3 mb-2 border-b border-stone-200/60">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-stone-900 tracking-tight uppercase">
                    {col.title}
                  </h3>
                  <span className="text-[11px] font-mono font-semibold text-stone-600 bg-white/80 border border-stone-200 px-2 py-0.5 rounded-full shadow-2xs">
                    {colDeals.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-500 mt-1">
                  <span className="truncate">{col.subtitle}</span>
                  <span className="font-mono font-bold text-stone-800 shrink-0">
                    {formatCurrency(colTotal)}
                  </span>
                </div>
              </div>

              {/* Column Cards Container */}
              <div className="flex-1 space-y-3 overflow-y-auto">
                {colDeals.length === 0 ? (
                  <div className="h-36 flex flex-col items-center justify-center text-center p-4 border border-dashed border-stone-300 rounded-2xl">
                    <p className="text-xs text-stone-400">Sin tratos en esta etapa</p>
                    <button
                      type="button"
                      onClick={onOpenNewDeal}
                      className="mt-2 text-[11px] font-semibold text-emerald-900 hover:underline cursor-pointer"
                    >
                      + Añadir trato
                    </button>
                  </div>
                ) : (
                  colDeals.map((deal) => {
                    const next = getNextStage(deal.stage);
                    const prev = getPrevStage(deal.stage);

                    return (
                      <div
                        key={deal.id}
                        onClick={() => onOpenDeal(deal.id)}
                        className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-emerald-800/40 transition-all cursor-pointer group"
                      >
                        {/* Company & Priority */}
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[11px] font-medium text-stone-500 truncate">
                            {deal.company}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${
                              deal.priority === 'high'
                                ? 'bg-amber-100 text-amber-900'
                                : deal.priority === 'medium'
                                ? 'bg-stone-100 text-stone-700'
                                : 'bg-stone-50 text-stone-500'
                            }`}
                          >
                            {deal.priority === 'high'
                              ? 'Alta'
                              : deal.priority === 'medium'
                              ? 'Media'
                              : 'Baja'}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-bold text-stone-900 leading-snug group-hover:text-[#14281D] transition-colors mb-1.5">
                          {deal.title}
                        </h4>

                        {/* Motorcycle Wholesale Specs */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                          {deal.brandCompatibility && (
                            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200/60 px-2 py-0.5 rounded-md truncate max-w-[180px]">
                              🏍️ {deal.brandCompatibility}
                            </span>
                          )}
                          {deal.unitsCount && (
                            <span className="text-[10px] font-mono font-semibold bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded-md">
                              {deal.unitsCount} piezas
                            </span>
                          )}
                        </div>

                        {/* Monetary Value & Probability */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-mono text-sm font-bold text-[#14281D]">
                            {formatCurrency(deal.value)}
                          </span>
                          <span className="text-[11px] font-mono text-stone-500">
                            {deal.probability}% prob.
                          </span>
                        </div>

                        {/* Metadata: Owner & Days */}
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div
                              className="w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0"
                              style={{ backgroundColor: deal.owner.avatarBg }}
                            >
                              {deal.owner.initials}
                            </div>
                            <span className="truncate">{deal.owner.name}</span>
                          </div>

                          <span className="text-[10px] text-stone-400 font-mono">
                            {deal.daysInStage}d en etapa
                          </span>
                        </div>

                        {/* Quick Stage Controls (Immediate Undo Supported) */}
                        <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          {prev ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveDealStage(deal.id, prev);
                              }}
                              title="Retroceder etapa"
                              className="p-1 hover:bg-stone-100 text-stone-400 hover:text-stone-800 rounded-lg transition-colors cursor-pointer"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <div className="w-5" />
                          )}

                          <span className="text-[10px] text-stone-400">
                            {deal.expectedCloseDate ? `Cierre: ${deal.expectedCloseDate.slice(5)}` : ''}
                          </span>

                          {next ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveDealStage(deal.id, next);
                              }}
                              title="Avanzar etapa (con Undo)"
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-semibold rounded-lg transition-colors cursor-pointer"
                            >
                              <span>Avanzar</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          ) : deal.stage === 'closed_won' ? (
                            <span className="inline-flex items-center text-[10px] text-emerald-700 font-semibold">
                              <CheckCircle className="w-3 h-3 mr-1" /> Ganado
                            </span>
                          ) : (
                            <div className="w-5" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}

        {/* Closed Lost Optional Column */}
        {showLostColumn && (
          <div className="rounded-3xl p-3.5 border border-rose-200/80 bg-rose-50/30 flex flex-col min-h-[550px]">
            <div className="px-1.5 pb-3 mb-2 border-b border-rose-200/60">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-rose-900 tracking-tight uppercase">
                  Cerrado Perdido
                </h3>
                <span className="text-[11px] font-mono font-semibold text-rose-700 bg-white border border-rose-200 px-2 py-0.5 rounded-full">
                  {filteredDeals.filter((d) => d.stage === 'closed_lost').length}
                </span>
              </div>
              <p className="text-[11px] text-rose-600 mt-1">Oportunidades no concretadas</p>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto">
              {filteredDeals
                .filter((d) => d.stage === 'closed_lost')
                .map((deal) => (
                  <div
                    key={deal.id}
                    onClick={() => onOpenDeal(deal.id)}
                    className="bg-white rounded-2xl p-4 border border-rose-200 shadow-sm opacity-80 hover:opacity-100 transition-all cursor-pointer"
                  >
                    <p className="text-[11px] text-stone-500">{deal.company}</p>
                    <h4 className="text-xs font-bold text-stone-900">{deal.title}</h4>
                    <p className="font-mono text-xs font-semibold text-stone-600 mt-1">
                      {formatCurrency(deal.value)}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveDealStage(deal.id, 'qualification');
                      }}
                      className="mt-2 text-[10px] font-semibold text-stone-700 hover:text-stone-950 underline"
                    >
                      Reactivar a Calificación
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Parts & Warehouse Inventory Modal */}
      {showPartsCatalog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowPartsCatalog(false)}
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden z-10 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#14281D] text-emerald-300 flex items-center justify-center shadow-sm">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                      Existencias en Bodega Central
                    </span>
                    <span className="text-xs text-stone-400 font-mono">
                      {partsCatalog.length} SKUs activos
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-stone-900">
                    Catálogo Mayorista de Repuestos y Partes de Moto
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPartsCatalog(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Stats */}
            <div className="p-4 border-b border-stone-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Buscar por SKU, nombre, cilindrada o modelo..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-stone-50 border border-transparent focus:border-stone-300 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div className="text-xs text-stone-500 font-medium">
                Tarifas de mayoreo con MOQ (Pedido Mínimo) para refaccionarias y talleres autorizados
              </div>
            </div>

            {/* Parts Table */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {partsCatalog
                  .filter((p) => {
                    const q = catalogSearch.toLowerCase();
                    return (
                      p.name.toLowerCase().includes(q) ||
                      p.sku.toLowerCase().includes(q) ||
                      p.compatibleModels.toLowerCase().includes(q) ||
                      p.category.toLowerCase().includes(q)
                    );
                  })
                  .map((part) => {
                    const margin = Math.round(
                      ((part.retailPrice - part.wholesalePrice) / part.wholesalePrice) * 100
                    );
                    const isLowStock = part.stock < 50;

                    return (
                      <div
                        key={part.sku}
                        className="bg-stone-50/70 hover:bg-stone-50 border border-stone-200/80 rounded-2xl p-4 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="font-mono text-[11px] font-bold text-stone-800 bg-white border border-stone-200 px-2 py-0.5 rounded-lg shadow-2xs">
                              {part.sku}
                            </span>
                            <span className="text-[10px] font-medium text-stone-600 bg-stone-200/60 px-2 py-0.5 rounded-md">
                              {part.category}
                            </span>
                          </div>

                          <h3 className="text-xs font-bold text-stone-900 leading-snug">
                            {part.name}
                          </h3>

                          <p className="text-[11px] text-stone-600 mt-1 flex items-center gap-1 font-medium">
                            <span className="text-stone-400">Compatibilidad:</span>
                            <span className="text-[#14281D] font-semibold truncate">
                              {part.compatibleModels}
                            </span>
                          </p>
                        </div>

                        <div className="mt-3 pt-3 border-t border-stone-200/60 flex items-end justify-between">
                          <div>
                            <span className="text-[10px] text-stone-400 uppercase font-semibold">
                              Precio Mayoreo
                            </span>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-sm font-bold text-[#14281D] font-mono">
                                {formatCurrency(part.wholesalePrice)}
                              </span>
                              <span className="text-[10px] text-stone-400 line-through font-mono">
                                {formatCurrency(part.retailPrice)} PVP
                              </span>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                                +{margin}% mg.
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center justify-end gap-1 text-[11px]">
                              {isLowStock ? (
                                <span className="inline-flex items-center text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-lg">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Stock: {part.stock} pzas
                                </span>
                              ) : (
                                <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg">
                                  Stock: {part.stock} pzas
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-stone-400 mt-0.5 block">
                              Mínimo orden: {part.minOrderQty} pzas
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-100 bg-stone-50/80 flex items-center justify-between">
              <span className="text-xs text-stone-500">
                Precios antes de IVA. Envíos consolidados a toda la república desde Tlalnepantla.
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowPartsCatalog(false);
                  onOpenNewDeal();
                }}
                className="px-4 py-2 bg-[#14281D] hover:bg-[#1B382B] text-emerald-100 font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
              >
                + Cotizar Pedido con estos SKUs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
