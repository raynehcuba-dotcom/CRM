import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  BusinessProfile,
  CurrencyCode,
  Customer,
  CustomerInteraction,
  Deal,
  DealStage,
  Invoice,
  InvoiceStatus,
  UndoAction,
} from '../types/crm';
import {
  BUSINESS_PROFILES,
  INITIAL_CUSTOMERS,
  INITIAL_DEALS,
  INITIAL_INVOICES,
  MOTO_PARTS_CATALOG,
} from '../data/mockData';
import { MotoPart } from '../types/crm';

export type TabType = 'overview' | 'pipeline' | 'customers' | 'finance' | 'growth';

interface CrmContextType {
  // Navigation & View
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isSpotlightOpen: boolean;
  openSpotlight: () => void;
  closeSpotlight: () => void;

  // Wholesale Moto Catalog
  partsCatalog: MotoPart[];

  // Business Profile & Currency
  currentProfile: BusinessProfile;
  profiles: BusinessProfile[];
  setProfile: (profileId: string) => void;
  updateBusinessProfile: (updated: BusinessProfile) => void;
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  formatCurrency: (amount: number) => string;

  // Deals
  deals: Deal[];
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'daysInStage'>) => void;
  updateDeal: (deal: Deal) => void;
  deleteDeal: (id: string) => void;
  moveDealStage: (id: string, newStage: DealStage) => void;

  // Customers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'interactions'>) => void;
  updateCustomer: (customer: Customer) => void;
  addInteraction: (customerId: string, interaction: Omit<CustomerInteraction, 'id' | 'date'>) => void;

  // Invoices
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'number'>) => void;
  updateInvoice: (invoice: Invoice) => void;
  markInvoiceAsPaid: (id: string) => void;
  changeInvoiceStatus: (id: string, status: InvoiceStatus) => void;

  // Undo Toast Bar
  activeUndo: UndoAction | null;
  triggerUndo: () => void;
  dismissUndo: () => void;

  // Reset to sample data
  resetAllData: () => void;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export const CrmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);

  // Business profiles list with localStorage persistence (auto-refreshing if old agency data)
  const [profiles, setProfiles] = useState<BusinessProfile[]>(() => {
    const saved = localStorage.getItem('aura_crm_profiles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed[0]?.industry?.includes('Motocicletas')) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return BUSINESS_PROFILES;
  });

  const [currentProfile, setCurrentProfile] = useState<BusinessProfile>(() => {
    const saved = localStorage.getItem('aura_crm_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.industry?.includes('Motocicletas')) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return profiles[0] || BUSINESS_PROFILES[0];
  });

  const [currency, setCurrency] = useState<CurrencyCode>(currentProfile.currency || 'USD');

  // Core collections with localStorage persistence
  const [deals, setDeals] = useState<Deal[]>(() => {
    const saved = localStorage.getItem('aura_crm_deals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed[0]?.title?.includes('Arrastre')) {
          return parsed;
        }
      } catch (e) { console.error(e); }
    }
    return INITIAL_DEALS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('aura_crm_customers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed[0]?.company?.includes('Biker')) {
          return parsed;
        }
      } catch (e) { console.error(e); }
    }
    return INITIAL_CUSTOMERS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('aura_crm_invoices');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed[0]?.items[0]?.description?.includes('SKU-')) {
          return parsed;
        }
      } catch (e) { console.error(e); }
    }
    return INITIAL_INVOICES;
  });

  // Undo system
  const [activeUndo, setActiveUndo] = useState<UndoAction | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('aura_crm_deals', JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem('aura_crm_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('aura_crm_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('aura_crm_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('aura_crm_profile', JSON.stringify(currentProfile));
  }, [currentProfile]);

  // Handle keyboard shortcut for Spotlight: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSpotlightOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openSpotlight = useCallback(() => setIsSpotlightOpen(true), []);
  const closeSpotlight = useCallback(() => setIsSpotlightOpen(false), []);

  const setProfile = useCallback((profileId: string) => {
    const found = profiles.find((p) => p.id === profileId) || BUSINESS_PROFILES.find((p) => p.id === profileId);
    if (found) {
      setCurrentProfile(found);
      setCurrency(found.currency);
    }
  }, [profiles]);

  // Update business profile handler with undo capability
  const updateBusinessProfile = useCallback((updated: BusinessProfile) => {
    const previousProfile = currentProfile;
    const previousCurrency = currency;

    setCurrentProfile(updated);
    setCurrency(updated.currency);

    setProfiles((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );

    showUndo(
      `Perfil de "${updated.name}" actualizado correctamente`,
      () => {
        setCurrentProfile(previousProfile);
        setCurrency(previousCurrency);
        setProfiles((prev) =>
          prev.map((p) => (p.id === previousProfile.id ? previousProfile : p))
        );
      }
    );
  }, [currentProfile, currency]);

  const formatCurrency = useCallback((amount: number): string => {
    const symbol = currency === 'EUR' ? '€' : '$';
    const formatted = new Intl.NumberFormat('es-MX', {
      maximumFractionDigits: 0,
    }).format(amount);
    return `${symbol}${formatted} ${currency}`;
  }, [currency]);

  // Set undo notification with 5-second auto-expiry
  const showUndo = useCallback((message: string, undoCallback: () => void) => {
    const undoItem: UndoAction = {
      id: String(Date.now()),
      message,
      executeUndo: undoCallback,
      timestamp: Date.now(),
    };
    setActiveUndo(undoItem);
  }, []);

  const triggerUndo = useCallback(() => {
    if (activeUndo) {
      activeUndo.executeUndo();
      setActiveUndo(null);
    }
  }, [activeUndo]);

  const dismissUndo = useCallback(() => {
    setActiveUndo(null);
  }, []);

  // Deals operations
  const addDeal = useCallback((dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'daysInStage'>) => {
    const newDeal: Deal = {
      ...dealData,
      id: `deal-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      daysInStage: 0,
    };
    setDeals((prev) => [newDeal, ...prev]);

    // Also link to customer if matching company exists
    setCustomers((prev) =>
      prev.map((c) =>
        c.company.toLowerCase() === newDeal.company.toLowerCase()
          ? { ...c, activeDealsCount: c.activeDealsCount + 1 }
          : c
      )
    );
  }, []);

  const updateDeal = useCallback((updated: Deal) => {
    setDeals((prev) => prev.map((d) => (d.id === updated.id ? { ...updated, updatedAt: new Date().toISOString().split('T')[0] } : d)));
  }, []);

  const deleteDeal = useCallback((id: string) => {
    const target = deals.find((d) => d.id === id);
    if (!target) return;

    setDeals((prev) => prev.filter((d) => d.id !== id));
    showUndo(`Trato "${target.title}" eliminado`, () => {
      setDeals((prev) => [target, ...prev]);
    });
  }, [deals, showUndo]);

  const moveDealStage = useCallback((id: string, newStage: DealStage) => {
    const target = deals.find((d) => d.id === id);
    if (!target || target.stage === newStage) return;

    const previousStage = target.stage;
    const stageLabels: Record<DealStage, string> = {
      qualification: 'Calificación',
      proposal: 'Propuesta',
      negotiation: 'Negociación',
      closed_won: 'Cierre Ganado',
      closed_lost: 'Cierre Perdido',
    };

    setDeals((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              stage: newStage,
              daysInStage: 0,
              updatedAt: new Date().toISOString().split('T')[0],
              probability:
                newStage === 'closed_won' ? 100 : newStage === 'closed_lost' ? 0 : d.probability,
            }
          : d
      )
    );

    // Provide immediate Undo
    showUndo(
      `"${target.title}" movido a ${stageLabels[newStage]}`,
      () => {
        setDeals((prev) =>
          prev.map((d) => (d.id === id ? { ...d, stage: previousStage } : d))
        );
      }
    );
  }, [deals, showUndo]);

  // Customers operations
  const addCustomer = useCallback((customerData: Omit<Customer, 'id' | 'interactions'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      interactions: [
        {
          id: `int-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'note',
          title: 'Cliente registrado en sistema',
          description: 'Registro inicial de perfil comercial.',
          author: 'Sistema',
        },
      ],
    };
    setCustomers((prev) => [newCustomer, ...prev]);
  }, []);

  const updateCustomer = useCallback((updated: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }, []);

  const addInteraction = useCallback((customerId: string, interactionData: Omit<CustomerInteraction, 'id' | 'date'>) => {
    const newInteraction: CustomerInteraction = {
      ...interactionData,
      id: `int-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };

    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? {
              ...c,
              lastContactDate: newInteraction.date,
              interactions: [newInteraction, ...c.interactions],
            }
          : c
      )
    );
  }, []);

  // Invoices operations
  const addInvoice = useCallback((invoiceData: Omit<Invoice, 'id' | 'number'>) => {
    const count = invoices.length + 1;
    const number = `FAC-2026-${String(count + 40).padStart(3, '0')}`;
    const newInvoice: Invoice = {
      ...invoiceData,
      id: `inv-${Date.now()}`,
      number,
    };
    setInvoices((prev) => [newInvoice, ...prev]);
  }, [invoices.length]);

  const updateInvoice = useCallback((updated: Invoice) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)));
  }, []);

  const markInvoiceAsPaid = useCallback((id: string) => {
    const target = invoices.find((inv) => inv.id === id);
    if (!target) return;

    const previousStatus = target.status;
    const previousPaidDate = target.paidDate;
    const today = new Date().toISOString().split('T')[0];

    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              status: 'paid',
              paidDate: today,
            }
          : inv
      )
    );

    // Undo action
    showUndo(
      `Factura ${target.number} marcada como Pagada`,
      () => {
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.id === id
              ? {
                  ...inv,
                  status: previousStatus,
                  paidDate: previousPaidDate,
                }
              : inv
          )
        );
      }
    );
  }, [invoices, showUndo]);

  const changeInvoiceStatus = useCallback((id: string, status: InvoiceStatus) => {
    const target = invoices.find((inv) => inv.id === id);
    if (!target) return;
    const previous = target.status;

    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status } : inv))
    );

    showUndo(`Estado de ${target.number} actualizado a ${status}`, () => {
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, status: previous } : inv))
      );
    });
  }, [invoices, showUndo]);

  const resetAllData = useCallback(() => {
    setDeals(INITIAL_DEALS);
    setCustomers(INITIAL_CUSTOMERS);
    setInvoices(INITIAL_INVOICES);
    localStorage.removeItem('aura_crm_deals');
    localStorage.removeItem('aura_crm_customers');
    localStorage.removeItem('aura_crm_invoices');
  }, []);

  return (
    <CrmContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isSpotlightOpen,
        openSpotlight,
        closeSpotlight,
        partsCatalog: MOTO_PARTS_CATALOG,
        currentProfile,
        profiles,
        setProfile,
        updateBusinessProfile,
        currency,
        setCurrency,
        formatCurrency,
        deals,
        addDeal,
        updateDeal,
        deleteDeal,
        moveDealStage,
        customers,
        addCustomer,
        updateCustomer,
        addInteraction,
        invoices,
        addInvoice,
        updateInvoice,
        markInvoiceAsPaid,
        changeInvoiceStatus,
        activeUndo,
        triggerUndo,
        dismissUndo,
        resetAllData,
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
};
