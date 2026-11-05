/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  GitPullRequestDraft,
  Users,
  Receipt,
  TrendingUp,
  Search,
  Plus,
  RotateCcw,
  Building2,
  Check,
} from 'lucide-react';
import { CrmProvider, useCrm, TabType } from './context/CrmContext';
import { FloatingNav } from './components/Navigation/FloatingNav';
import { SpotlightModal } from './components/Navigation/SpotlightModal';
import { UndoToastBar } from './components/Common/UndoToastBar';
import { OverviewView } from './components/Overview/OverviewView';
import { PipelineView } from './components/Pipeline/PipelineView';
import { DealModal } from './components/Pipeline/DealModal';
import { CustomersView } from './components/Customers/CustomersView';
import { CustomerDetailModal } from './components/Customers/CustomerDetailModal';
import { NewCustomerModal } from './components/Customers/NewCustomerModal';
import { FinanceView } from './components/Finance/FinanceView';
import { InvoiceDetailModal } from './components/Finance/InvoiceDetailModal';
import { NewInvoiceModal } from './components/Finance/NewInvoiceModal';
import { Customer, Deal, Invoice } from './types/crm';
import { GrowthView } from './components/Growth/GrowthView';
import { HeaderProfileDropdown } from './components/Navigation/HeaderProfileDropdown';
import { CompanyProfileModal } from './components/Settings/CompanyProfileModal';
import { BUSINESS_PROFILES } from './data/mockData';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isSpotlightOpen,
    openSpotlight,
    closeSpotlight,
    currentProfile,
    setProfile,
    currency,
    setCurrency,
    deals,
    customers,
    invoices,
    resetAllData,
  } = useCrm();

  // Modals state
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [isNewDealOpen, setIsNewDealOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);

  const [isCompanySettingsOpen, setIsCompanySettingsOpen] = useState(false);
  const [companySettingsInitialTab, setCompanySettingsInitialTab] = useState<'profile' | 'notifications'>('profile');

  // Active deal to edit
  const activeDeal = deals.find((d) => d.id === selectedDealId) || null;

  return (
    <div className="min-h-screen bg-[#F9F9F7] text-[#191C1A] flex flex-col antialiased">
      {/* Top Bar Contract: Zone 1 (Brand) — Zone 2 (4-5 Nav Links) — Zone 3 (Primary Action) */}
      <header className="sticky top-0 z-30 bg-[#F9F9F7]/90 backdrop-blur-md border-b border-stone-200/70 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3">
            <a
              href="#overview"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('overview');
              }}
              className="text-base font-extrabold tracking-tight text-stone-900 whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <span className="w-7 h-7 rounded-xl bg-[#14281D] text-emerald-200 flex items-center justify-center text-xs font-bold shadow-2xs">
                🏍️
              </span>
              <span>Aura MotoMayorista</span>
            </a>
            <span className="hidden lg:inline text-xs text-stone-400 font-medium truncate max-w-[260px]">
              {currentProfile.name}
            </span>
          </div>

          {/* Zone 2: 4-5 concise single-line text nav links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-stone-600">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`hover:text-stone-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'overview'
                  ? 'text-stone-950 font-bold border-b-2 border-[#14281D] pb-1'
                  : ''
              }`}
            >
              Resumen
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pipeline')}
              className={`hover:text-stone-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'pipeline'
                  ? 'text-stone-950 font-bold border-b-2 border-[#14281D] pb-1'
                  : ''
              }`}
            >
              Embudo de Ventas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('customers')}
              className={`hover:text-stone-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'customers'
                  ? 'text-stone-950 font-bold border-b-2 border-[#14281D] pb-1'
                  : ''
              }`}
            >
              Clientes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('finance')}
              className={`hover:text-stone-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'finance'
                  ? 'text-stone-950 font-bold border-b-2 border-[#14281D] pb-1'
                  : ''
              }`}
            >
              Finanzas & Facturas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('growth')}
              className={`hover:text-stone-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'growth'
                  ? 'text-stone-950 font-bold border-b-2 border-[#14281D] pb-1'
                  : ''
              }`}
            >
              Crecimiento
            </button>
          </nav>

          {/* Zone 3: 1 primary action button + quick tools */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick Spotlight search button */}
            <button
              type="button"
              onClick={openSpotlight}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs text-stone-500 bg-white border border-stone-200/80 rounded-xl hover:text-stone-900 transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Buscar</span>
              <kbd className="text-[10px] font-mono bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded">
                ⌘K
              </kbd>
            </button>

            {/* Header Profile Dropdown */}
            <HeaderProfileDropdown
              onOpenSettingsModal={(tab = 'profile') => {
                setCompanySettingsInitialTab(tab);
                setIsCompanySettingsOpen(true);
              }}
            />

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => setIsNewDealOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-100 bg-[#14281D] rounded-xl hover:bg-[#1B382B] shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Trato</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Capsule Dock (Left side for desktop, maximized workspace) */}
      <FloatingNav />

      {/* Main Viewport Content with Smooth Motion Transitions */}
      <main className="flex-1 px-4 sm:px-8 md:pl-24 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'overview' && (
              <OverviewView
                onOpenDeal={(id) => setSelectedDealId(id)}
                onOpenNewDeal={() => setIsNewDealOpen(true)}
                onOpenInvoice={(id) => {
                  const inv = invoices.find((i) => i.id === id);
                  if (inv) setSelectedInvoice(inv);
                }}
              />
            )}

            {activeTab === 'pipeline' && (
              <PipelineView
                onOpenDeal={(id) => setSelectedDealId(id)}
                onOpenNewDeal={() => setIsNewDealOpen(true)}
              />
            )}

            {activeTab === 'customers' && (
              <CustomersView
                onOpenCustomerDetail={(cust) => setSelectedCustomer(cust)}
                onOpenNewCustomer={() => setIsNewCustomerOpen(true)}
              />
            )}

            {activeTab === 'finance' && (
              <FinanceView
                onOpenInvoiceDetail={(inv) => setSelectedInvoice(inv)}
                onOpenNewInvoice={() => setIsNewInvoiceOpen(true)}
              />
            )}

            {activeTab === 'growth' && <GrowthView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Undo Toast Action Bar */}
      <UndoToastBar />

      {/* Spotlight Global Search Modal */}
      <SpotlightModal
        isOpen={isSpotlightOpen}
        onClose={closeSpotlight}
        onSelectDeal={(id) => setSelectedDealId(id)}
        onSelectCustomer={(id) => {
          const cust = customers.find((c) => c.id === id);
          if (cust) setSelectedCustomer(cust);
        }}
        onSelectInvoice={(id) => {
          const inv = invoices.find((i) => i.id === id);
          if (inv) setSelectedInvoice(inv);
        }}
      />

      {/* Deal Modal (Create & Edit) */}
      <DealModal
        isOpen={isNewDealOpen || !!selectedDealId}
        onClose={() => {
          setIsNewDealOpen(false);
          setSelectedDealId(null);
        }}
        dealToEdit={activeDeal}
      />

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        customer={selectedCustomer}
        onOpenDeal={(dealId) => setSelectedDealId(dealId)}
      />

      {/* New Customer Modal */}
      <NewCustomerModal
        isOpen={isNewCustomerOpen}
        onClose={() => setIsNewCustomerOpen(false)}
      />

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
      />

      {/* New Invoice Modal */}
      <NewInvoiceModal
        isOpen={isNewInvoiceOpen}
        onClose={() => setIsNewInvoiceOpen(false)}
      />

      {/* Company Profile Settings Modal */}
      <CompanyProfileModal
        isOpen={isCompanySettingsOpen}
        onClose={() => setIsCompanySettingsOpen(false)}
        initialTab={companySettingsInitialTab}
      />

      {/* Quiet Footer */}
      <footer className="border-t border-stone-200/60 py-6 px-4 sm:px-8 text-center text-xs text-stone-500 md:pl-24 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span>Aura CRM & Finanzas MIPYME</span>
          <span aria-hidden="true">·</span>
          <span>{currentProfile.name}</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={resetAllData}
            title="Restaurar datos de muestra de la MIPYME"
            className="inline-flex items-center gap-1.5 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Datos Iniciales</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <CrmProvider>
      <MainLayout />
    </CrmProvider>
  );
}
