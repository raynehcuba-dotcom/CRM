import React, { useState } from 'react';
import {
  TrendingUp,
  PieChart as PieIcon,
  Target,
  Sparkles,
  Download,
  Share2,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Sliders,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import { useCrm } from '../../context/CrmContext';
import {
  LEAD_SOURCES_DATA,
  SEGMENT_REVENUE_DATA,
  MOTO_BRAND_SHARE_DATA,
} from '../../data/mockData';

export const GrowthView: React.FC = () => {
  const { customers, deals, formatCurrency, currentProfile } = useCrm();

  // Growth Simulator State
  const [simLeadsPerMonth, setSimLeadsPerMonth] = useState(15);
  const [simConversionRate, setSimConversionRate] = useState(30);
  const [simAverageDealSize, setSimAverageDealSize] = useState(8500);

  // Projected Annual Calculation
  const projectedDealsPerMonth = (simLeadsPerMonth * simConversionRate) / 100;
  const projectedMonthlyRevenue = projectedDealsPerMonth * simAverageDealSize;
  const projectedAnnualRevenue = projectedMonthlyRevenue * 12;

  // Key Acquisition Metrics
  const estimatedCAC = 1250;
  const averageLTV =
    customers.length > 0
      ? Math.round(customers.reduce((acc, c) => acc + c.totalLtv, 0) / customers.length)
      : 28000;
  const ltvCacRatio = (averageLTV / estimatedCAC).toFixed(1);
  const paybackMonths = 2.8;

  // Export report
  const handleExportReport = () => {
    const reportData = {
      empresa: currentProfile.name,
      fecha: new Date().toISOString(),
      metricas: {
        cac_estimado: estimatedCAC,
        ltv_promedio: averageLTV,
        ratio_ltv_cac: ltvCacRatio,
        payback_meses: paybackMonths,
      },
      clientes: customers.map((c) => ({
        nombre: c.name,
        empresa: c.company,
        segmento: c.segment,
        ltv: c.totalLtv,
      })),
      tratos: deals.map((d) => ({
        titulo: d.title,
        empresa: d.company,
        etapa: d.stage,
        valor: d.value,
      })),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aura_Reporte_Crecimiento_${currentProfile.id}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Informes de Rendimiento & Crecimiento
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Economía unitaria, rentabilidad de adquisición y simulador de escalamiento comercial.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200/90 hover:bg-stone-50 text-stone-800 font-medium text-xs rounded-2xl shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Informe JSON</span>
          </button>
        </div>
      </div>

      {/* Top 4 Unit Economics Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-stone-500">Costo Adquisición (CAC)</span>
              <span className="text-[10px] text-stone-400 font-mono">B2B Eficiente</span>
            </div>
            <p className="text-2xl font-bold text-stone-900 font-mono mt-1">
              {formatCurrency(estimatedCAC)}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-500">
            <span>Inversión comercial promedio</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-stone-500">Valor de Vida (LTV)</span>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                Saludable
              </span>
            </div>
            <p className="text-2xl font-bold text-[#14281D] font-mono mt-1">
              {formatCurrency(averageLTV)}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-500">
            <span>Retorno total por cuenta</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-stone-500">Ratio LTV : CAC</span>
              <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                Óptimo &gt; 3.0x
              </span>
            </div>
            <p className="text-2xl font-bold text-stone-900 font-mono mt-1">
              {ltvCacRatio}x
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-500">
            <span>Cada $1 invertido rinde ${ltvCacRatio}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-stone-500">Periodo de Recuperación</span>
              <span className="text-[10px] text-stone-400 font-mono">Meses</span>
            </div>
            <p className="text-2xl font-bold text-stone-900 font-mono mt-1">
              {paybackMonths} m
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-500">
            <span>Recuperación de inversión en ~84 días</span>
          </div>
        </div>
      </div>

      {/* Mid Bento Section: Lead Source Pie Chart + Segment Revenue Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Sources Donut Chart */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-stone-900 tracking-tight">
                Canales de Captación de Leads
              </h2>
              <p className="text-xs text-stone-500">
                Distribución porcentual de procedencia de nuevos contactos comerciales
              </p>
            </div>
          </div>

          <div className="h-56 w-full flex items-center">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie
                  data={LEAD_SOURCES_DATA}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {LEAD_SOURCES_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#14281D] text-white p-2.5 rounded-xl text-xs font-mono">
                          <p className="font-semibold">{payload[0].name}</p>
                          <p className="text-emerald-300 font-bold">{payload[0].value}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Custom Legend */}
            <div className="flex-1 space-y-2 text-xs">
              {LEAD_SOURCES_DATA.map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-stone-700 truncate">{entry.name}</span>
                  </div>
                  <span className="font-mono font-bold text-stone-900">{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue by Customer Segment */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-stone-900 tracking-tight">
                Ingresos por Segmento de Cliente
              </h2>
              <p className="text-xs text-stone-500">
                Aporte a la facturación total entre Enterprise, Mid-market y PyMEs
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {SEGMENT_REVENUE_DATA.map((seg, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-800">{seg.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-stone-500">{seg.percentage}% del total</span>
                    <span className="font-mono font-bold text-stone-900">
                      {formatCurrency(seg.revenue)}
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      idx === 0 ? 'bg-[#14281D]' : idx === 1 ? 'bg-[#2D4A3E]' : 'bg-[#CA8A04]'
                    }`}
                    style={{ width: `${seg.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-3.5 bg-stone-50 rounded-2xl border border-stone-100 text-xs text-stone-600 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
            <p>
              Recomendación estratégica: Cadenas de refaccionarias aportan 48% del volumen en lotes cerrados, mientras que talleres independientes tienen un ciclo de cobro más corto (15 días).
            </p>
          </div>
        </div>
      </div>

      {/* Motorcycle Brand Market Share & Inventory Planning */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
              <span>Inteligencia de Producto & Inventario Mayorista</span>
            </div>
            <h2 className="text-base font-bold text-stone-900 tracking-tight">
              Demanda de Repuestos por Marca de Motocicleta en Cartera
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Participación del volumen despachado según el parque vehicular de refaccionarias y flotillas
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-xl self-start sm:self-auto">
            Top 2: Bajaj + Italika = 64%
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {MOTO_BRAND_SHARE_DATA.map((brand, idx) => (
            <div
              key={idx}
              className="p-4 bg-stone-50/80 rounded-2xl border border-stone-200/60 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: brand.color }}
                  />
                  <span className="font-mono text-base font-bold text-stone-900">
                    {brand.percentage}%
                  </span>
                </div>
                <h3 className="text-xs font-bold text-stone-900 leading-snug">
                  {brand.name}
                </h3>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-200/60">
                <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${brand.percentage}%`,
                      backgroundColor: brand.color,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Growth Simulator */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#14281D] flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 tracking-tight">
                Simulador Interactivo de Metas de Crecimiento
              </h2>
              <p className="text-xs text-stone-500">
                Ajusta las palancas clave del negocio para proyectar la facturación anual esperada
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Sliders */}
          <div className="space-y-5 lg:col-span-2">
            {/* Slider 1: Leads Mensuales */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-stone-700">Leads Calificados por Mes</span>
                <span className="font-mono font-bold text-stone-900">{simLeadsPerMonth} leads</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={simLeadsPerMonth}
                onChange={(e) => setSimLeadsPerMonth(Number(e.target.value))}
                className="w-full accent-[#14281D]"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-1 font-mono">
                <span>5 leads</span>
                <span>25 leads</span>
                <span>50 leads</span>
              </div>
            </div>

            {/* Slider 2: Tasa de Conversión */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-stone-700">Tasa de Conversión del Embudo</span>
                <span className="font-mono font-bold text-[#14281D]">{simConversionRate}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="70"
                step="5"
                value={simConversionRate}
                onChange={(e) => setSimConversionRate(Number(e.target.value))}
                className="w-full accent-[#14281D]"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-1 font-mono">
                <span>10% (Conservador)</span>
                <span>40% (Promedio)</span>
                <span>70% (Óptimo)</span>
              </div>
            </div>

            {/* Slider 3: Ticket Promedio */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-stone-700">Ticket Promedio por Trato</span>
                <span className="font-mono font-bold text-stone-900">
                  {formatCurrency(simAverageDealSize)}
                </span>
              </div>
              <input
                type="range"
                min="2000"
                max="30000"
                step="500"
                value={simAverageDealSize}
                onChange={(e) => setSimAverageDealSize(Number(e.target.value))}
                className="w-full accent-[#14281D]"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-1 font-mono">
                <span>$2,000</span>
                <span>$15,000</span>
                <span>$30,000</span>
              </div>
            </div>
          </div>

          {/* Outcome Projection Box */}
          <div className="p-6 bg-[#14281D] text-white rounded-3xl flex flex-col justify-between shadow-lg">
            <div>
              <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block mb-2">
                Proyección Dinámica
              </span>

              <div className="space-y-4">
                <div>
                  <span className="text-xs text-stone-300">Tratos cerrados al mes:</span>
                  <p className="text-2xl font-bold font-mono text-white mt-0.5">
                    {projectedDealsPerMonth.toFixed(1)} cierres
                  </p>
                </div>

                <div>
                  <span className="text-xs text-stone-300">Facturación mensual proyectada:</span>
                  <p className="text-2xl font-bold font-mono text-emerald-300 mt-0.5">
                    {formatCurrency(Math.round(projectedMonthlyRevenue))}
                  </p>
                </div>

                <div className="pt-3 border-t border-emerald-900/60">
                  <span className="text-xs text-stone-300 font-medium">
                    Run-Rate Anual Proyectado (ARR):
                  </span>
                  <p className="text-3xl font-bold font-mono text-white mt-1">
                    {formatCurrency(Math.round(projectedAnnualRevenue))}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-emerald-200/70 mt-6 pt-4 border-t border-emerald-900/40">
              * Estimación basada en la eficiencia de tu tasa de cierre y ticket de venta actual.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
