export type CurrencyCode = 'USD' | 'MXN' | 'EUR';

export type DealStage = 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface Deal {
  id: string;
  title: string;
  company: string;
  contactName: string;
  contactEmail: string;
  value: number;
  stage: DealStage;
  probability: number; // 0 - 100
  expectedCloseDate: string;
  owner: {
    name: string;
    avatarBg: string;
    initials: string;
  };
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  daysInStage: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Motorcycle Wholesale Specifics
  brandCompatibility?: string; // ej. Bajaj Pulsar, Italika FT/DM, Honda Cargo, Yamaha
  partCategory?: string; // ej. Transmisión, Motor & Cilindros, Frenos, Neumáticos, Eléctrico
  unitsCount?: number; // Cantidad total de piezas / lotes al mayoreo
}

export type CustomerSegment = 'Enterprise' | 'Mid-market' | 'SMB';
export type CustomerStatus = 'active' | 'negotiating' | 'at_risk' | 'new';
export type MotoCustomerType =
  | 'Cadena de Refaccionarias'
  | 'Taller Mecánico & Servicio'
  | 'Flota Delivery & Mensajería'
  | 'Distribuidor Regional';

export interface CustomerInteraction {
  id: string;
  date: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  title: string;
  description: string;
  author: string;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  segment: CustomerSegment;
  status: CustomerStatus;
  email: string;
  phone: string;
  city: string;
  industry: string;
  totalLtv: number;
  monthlyRevenue: number;
  activeDealsCount: number;
  dealsWonCount: number;
  lastContactDate: string;
  avatarBg: string;
  notes: string;
  interactions: CustomerInteraction[];
  // Wholesale Motorcycle Attributes
  customerType?: MotoCustomerType;
  creditLimit?: number; // Límite de crédito comercial autorizado
  creditDays?: number; // Plazo de crédito (ej. 15, 30, 45 días)
  mainBrands?: string[]; // Marcas de motos con mayor rotación
}

export interface MotoPart {
  sku: string;
  name: string;
  category: string;
  compatibleModels: string;
  wholesalePrice: number;
  retailPrice: number;
  stock: number;
  minOrderQty: number;
}

export type InvoiceStatus = 'draft' | 'pending' | 'overdue' | 'paid';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  number: string; // e.g. FAC-2026-081
  customerId: string;
  customerName: string;
  company: string;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}

export interface NotificationPreferences {
  dealCloseAlerts: boolean; // Alertas sobre tratos cercanos al cierre
  daysBeforeDealClose: number; // Días de anticipación (ej. 3, 7, 14)
  dealMinProbability: number; // Probabilidad mínima para alertar (ej. 50%)
  overdueInvoiceAlerts: boolean; // Alertas sobre facturas vencidas
  preventiveInvoiceAlerts: boolean; // Avisar 3 días antes de que venza la factura
  emailDigest: boolean; // Resumen por correo electrónico
  inAppBanner: boolean; // Banners destacados en la app
}

export interface BusinessProfile {
  id: string;
  name: string;
  legalName: string;
  taxId: string;
  industry: string;
  currency: CurrencyCode;
  address: string;
  city: string;
  contactEmail: string;
  contactPhone: string;
  notificationPreferences?: NotificationPreferences;
}

export interface UndoAction {
  id: string;
  message: string;
  executeUndo: () => void;
  timestamp: number;
}
