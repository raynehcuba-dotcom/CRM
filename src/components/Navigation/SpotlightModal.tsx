import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, GitPullRequestDraft, Users, Receipt, ArrowRight } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

interface SpotlightProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDeal?: (id: string) => void;
  onSelectCustomer?: (id: string) => void;
  onSelectInvoice?: (id: string) => void;
}

export const SpotlightModal: React.FC<SpotlightProps> = ({
  isOpen,
  onClose,
  onSelectDeal,
  onSelectCustomer,
  onSelectInvoice,
}) => {
  const { deals, customers, invoices, setActiveTab, formatCurrency } = useCrm();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const q = query.trim().toLowerCase();

  const matchingDeals = deals.filter(
    (d) =>
      d.title.toLowerCase().includes(q) ||
      d.company.toLowerCase().includes(q) ||
      d.contactName.toLowerCase().includes(q)
  ).slice(0, 4);

  const matchingCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q)
  ).slice(0, 4);

  const matchingInvoices = invoices.filter(
    (inv) =>
      inv.number.toLowerCase().includes(q) ||
      inv.company.toLowerCase().includes(q) ||
      inv.customerName.toLowerCase().includes(q)
  ).slice(0, 4);

  const totalResults = matchingDeals.length + matchingCustomers.length + matchingInvoices.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden z-10"
          >
            {/* Search Input Box */}
            <div className="flex items-center px-4 py-3.5 border-b border-stone-100">
              <Search className="w-5 h-5 text-stone-400 mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar tratos, clientes, facturas o empresas..."
                className="w-full text-sm font-medium text-stone-800 placeholder-stone-400 bg-transparent focus:outline-none"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar modal"
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results container */}
            <div className="max-h-[380px] overflow-y-auto p-3 space-y-4">
              {q.length === 0 ? (
                <div className="py-6 px-4 text-center">
                  <p className="text-xs text-stone-500">
                    Escribe para buscar al instante oportunidades comerciales, clientes o cuentas por cobrar.
                  </p>
                  <div className="flex justify-center gap-2 mt-3 text-[11px] text-stone-400 font-mono">
                    <span className="px-2 py-0.5 bg-stone-100 rounded">ESC para salir</span>
                    <span className="px-2 py-0.5 bg-stone-100 rounded">Cmd + K</span>
                  </div>
                </div>
              ) : totalResults === 0 ? (
                <div className="py-8 text-center text-sm text-stone-400">
                  No se encontraron resultados para "{query}"
                </div>
              ) : (
                <>
                  {/* Matching Deals */}
                  {matchingDeals.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider px-3 mb-1">
                        Tratos & Oportunidades
                      </p>
                      <div className="space-y-1">
                        {matchingDeals.map((deal) => (
                          <button
                            key={deal.id}
                            type="button"
                            onClick={() => {
                              setActiveTab('pipeline');
                              onSelectDeal?.(deal.id);
                              onClose();
                            }}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-50 text-left transition-colors group cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#14281D] flex items-center justify-center shrink-0">
                                <GitPullRequestDraft className="w-4 h-4" />
                              </div>
                              <div className="truncate">
                                <p className="text-xs font-semibold text-stone-900 truncate">
                                  {deal.title}
                                </p>
                                <p className="text-[11px] text-stone-500 truncate">
                                  {deal.company} · {deal.contactName}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono text-xs font-semibold text-stone-800">
                                {formatCurrency(deal.value)}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-700 transition-colors" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Customers */}
                  {matchingCustomers.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider px-3 mb-1">
                        Clientes
                      </p>
                      <div className="space-y-1">
                        {matchingCustomers.map((cust) => (
                          <button
                            key={cust.id}
                            type="button"
                            onClick={() => {
                              setActiveTab('customers');
                              onSelectCustomer?.(cust.id);
                              onClose();
                            }}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-50 text-left transition-colors group cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                                <Users className="w-4 h-4" />
                              </div>
                              <div className="truncate">
                                <p className="text-xs font-semibold text-stone-900 truncate">
                                  {cust.name}
                                </p>
                                <p className="text-[11px] text-stone-500 truncate">
                                  {cust.company} · {cust.city}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                                {cust.segment}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-700 transition-colors" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Invoices */}
                  {matchingInvoices.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider px-3 mb-1">
                        Facturas
                      </p>
                      <div className="space-y-1">
                        {matchingInvoices.map((inv) => (
                          <button
                            key={inv.id}
                            type="button"
                            onClick={() => {
                              setActiveTab('finance');
                              onSelectInvoice?.(inv.id);
                              onClose();
                            }}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-50 text-left transition-colors group cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                                <Receipt className="w-4 h-4" />
                              </div>
                              <div className="truncate">
                                <p className="text-xs font-semibold text-stone-900 truncate font-mono">
                                  {inv.number}
                                </p>
                                <p className="text-[11px] text-stone-500 truncate">
                                  {inv.company} · {inv.customerName}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono text-xs font-semibold text-stone-800">
                                {formatCurrency(inv.total)}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-700 transition-colors" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
