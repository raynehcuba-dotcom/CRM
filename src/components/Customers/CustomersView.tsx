import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  LayoutGrid,
  List,
  Building,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Tag,
} from 'lucide-react';
import { Customer, CustomerSegment, CustomerStatus, MotoCustomerType } from '../../types/crm';
import { useCrm } from '../../context/CrmContext';

interface CustomersViewProps {
  onOpenCustomerDetail: (customer: Customer) => void;
  onOpenNewCustomer: () => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  onOpenCustomerDetail,
  onOpenNewCustomer,
}) => {
  const { customers, formatCurrency } = useCrm();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<CustomerSegment | 'all'>('all');
  const [customerTypeFilter, setCustomerTypeFilter] = useState<MotoCustomerType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'all'>('all');

  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch =
      cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cust.customerType && cust.customerType.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cust.mainBrands && cust.mainBrands.join(' ').toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSegment = segmentFilter === 'all' || cust.segment === segmentFilter;
    const matchesType = customerTypeFilter === 'all' || cust.customerType === customerTypeFilter;
    const matchesStatus = statusFilter === 'all' || cust.status === statusFilter;

    return matchesSearch && matchesSegment && matchesType && matchesStatus;
  });

  const totalLtvSum = customers.reduce((acc, c) => acc + c.totalLtv, 0);
  const activeCount = customers.filter((c) => c.status === 'active').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Cartera de Clientes
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Gestión de cuentas, perfiles de contacto e historial de relaciones comerciales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenNewCustomer}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#14281D] hover:bg-[#1B382B] text-emerald-100 font-medium text-xs rounded-2xl shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* Quick Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-stone-200/70 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 font-medium">Clientes Totales</span>
            <p className="text-xl font-bold text-stone-900 font-mono mt-0.5">
              {customers.length} cuentas
            </p>
          </div>
          <span className="text-xs text-emerald-800 font-medium bg-emerald-50 px-2.5 py-1 rounded-xl">
            {activeCount} activos
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200/70 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 font-medium">LTV Acumulado de Cartera</span>
            <p className="text-xl font-bold text-[#14281D] font-mono mt-0.5">
              {formatCurrency(totalLtvSum)}
            </p>
          </div>
          <span className="text-xs text-stone-600 font-medium bg-stone-100 px-2.5 py-1 rounded-xl">
            Histórico
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200/70 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 font-medium">LTV Promedio por Cliente</span>
            <p className="text-xl font-bold text-stone-900 font-mono mt-0.5">
              {formatCurrency(customers.length > 0 ? Math.round(totalLtvSum / customers.length) : 0)}
            </p>
          </div>
          <span className="text-xs text-amber-800 font-medium bg-amber-50 px-2.5 py-1 rounded-xl">
            Promedio
          </span>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/70 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, empresa, ciudad..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-stone-50 border border-transparent focus:border-stone-300 focus:bg-white focus:outline-none transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-3 justify-end">
          {/* Segment Filter */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl">
            {(['all', 'Enterprise', 'Mid-market', 'SMB'] as const).map((seg) => (
              <button
                key={seg}
                type="button"
                onClick={() => setSegmentFilter(seg)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  segmentFilter === seg
                    ? 'bg-white text-stone-900 shadow-sm font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {seg === 'all' ? 'Todos' : seg}
              </button>
            ))}
          </div>

          {/* Wholesale Customer Type Filter */}
          <select
            value={customerTypeFilter}
            onChange={(e) => setCustomerTypeFilter(e.target.value as MotoCustomerType | 'all')}
            className="px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white text-stone-700 focus:outline-none"
          >
            <option value="all">Todos los tipos mayoristas</option>
            <option value="Cadena de Refaccionarias">Cadenas de Refaccionarias</option>
            <option value="Taller Mecánico & Servicio">Talleres y Servicio</option>
            <option value="Flota Delivery & Mensajería">Flotas Delivery</option>
            <option value="Distribuidor Regional">Distribuidores Regionales</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CustomerStatus | 'all')}
            className="px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white text-stone-700 focus:outline-none"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="negotiating">En Negociación</option>
            <option value="at_risk">En Riesgo</option>
            <option value="new">Nuevos</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-stone-100 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Vista cuadrícula Bento"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="Vista de lista tabular"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Customers Content: Grid or List */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/70">
          <p className="text-sm font-semibold text-stone-700">No se encontraron clientes</p>
          <p className="text-xs text-stone-400 mt-1">Prueba cambiando los filtros de búsqueda</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((cust) => (
            <div
              key={cust.id}
              onClick={() => onOpenCustomerDetail(cust)}
              className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-emerald-800/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Header card */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0"
                      style={{ backgroundColor: cust.avatarBg }}
                    >
                      {cust.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-stone-900 group-hover:text-[#14281D] transition-colors truncate">
                        {cust.name}
                      </h3>
                      <p className="text-xs text-stone-500 truncate mt-0.5">{cust.company}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${
                      cust.status === 'active'
                        ? 'bg-emerald-50 text-emerald-800'
                        : cust.status === 'negotiating'
                        ? 'bg-amber-50 text-amber-800'
                        : cust.status === 'at_risk'
                        ? 'bg-rose-50 text-rose-800 font-bold'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {cust.status === 'active'
                      ? 'Activo'
                      : cust.status === 'negotiating'
                      ? 'Negociando'
                      : cust.status === 'at_risk'
                      ? 'En Riesgo'
                      : 'Nuevo'}
                  </span>
                </div>

                {/* Wholesale badges & credit line */}
                <div className="flex items-center gap-1.5 flex-wrap my-2.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                    {cust.customerType || 'Cadena de Refaccionarias'}
                  </span>
                  {cust.creditLimit ? (
                    <span className="text-[10px] font-mono font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Crédito: {formatCurrency(cust.creditLimit)} ({cust.creditDays || 30}d)
                    </span>
                  ) : null}
                </div>

                {/* Motorcycle brands */}
                {cust.mainBrands && cust.mainBrands.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap mb-3">
                    <span className="text-[10px] text-stone-400 font-medium">Marcas:</span>
                    {cust.mainBrands.slice(0, 3).map((brand) => (
                      <span
                        key={brand}
                        className="text-[10px] font-semibold text-stone-600 bg-stone-100 border border-stone-200/60 px-1.5 py-0.2 rounded"
                      >
                        {brand}
                      </span>
                    ))}
                  </div>
                )}

                {/* Info row */}
                <div className="space-y-1.5 text-xs text-stone-600 my-2">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{cust.industry}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{cust.city}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Metrics & Action */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-stone-400 block font-medium">LTV Acumulado</span>
                  <span className="font-mono text-xs font-bold text-stone-900">
                    {formatCurrency(cust.totalLtv)}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-600 group-hover:text-[#14281D]">
                  <span>Ver perfil</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Cliente & Empresa</th>
                  <th className="py-3 px-4">Tipo Mayorista</th>
                  <th className="py-3 px-4">Crédito Comercial</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4 text-right">LTV Histórico</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    onClick={() => onOpenCustomerDetail(cust)}
                    className="hover:bg-stone-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ backgroundColor: cust.avatarBg }}
                        >
                          {cust.name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <div>
                          <p className="font-bold text-stone-900 group-hover:text-[#14281D]">
                            {cust.name}
                          </p>
                          <p className="text-[11px] text-stone-500">{cust.company}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                        {cust.customerType || 'Cadena Refaccionaria'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {cust.creditLimit ? (
                        <span className="font-mono text-xs font-bold text-stone-800">
                          {formatCurrency(cust.creditLimit)}
                          <span className="text-[10px] text-stone-400 font-normal"> ({cust.creditDays || 30}d)</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-stone-400">Contado</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                          cust.status === 'active'
                            ? 'bg-emerald-50 text-emerald-800'
                            : cust.status === 'negotiating'
                            ? 'bg-amber-50 text-amber-800'
                            : cust.status === 'at_risk'
                            ? 'bg-rose-50 text-rose-800 font-bold'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {cust.status === 'active'
                          ? 'Activo'
                          : cust.status === 'negotiating'
                          ? 'Negociación'
                          : cust.status === 'at_risk'
                          ? 'En Riesgo'
                          : 'Nuevo'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-stone-600">
                      <p>{cust.email}</p>
                      <p className="text-[11px] text-stone-400">{cust.city}</p>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-stone-900">
                      {formatCurrency(cust.totalLtv)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        className="text-stone-400 group-hover:text-stone-800 font-medium text-[11px] inline-flex items-center gap-1"
                      >
                        <span>Detalle</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
