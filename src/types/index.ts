import type { ReactNode } from 'react';

// ─── Core Data Models ─────────────────────────────────────────────────────────

export interface InventoryItem {
  id?: number;
  product_id: number;
  name: string;
  category: string;
  stock_level: number;
  reorder_point: number;
  base_price: number;
  avg_weekly_sales: number;
}

export interface Supplier {
  id: number;
  name: string;
  contact?: string;
  reliability_score: number;
  delivery_days: number;
  avg_price_index: number;
}

export interface Order {
  id: number;
  product_id: number;
  supplier_id: number;
  quantity: number;
  status: OrderStatus;
  order_date: string;
  total_price?: number;
  products?: { name: string; base_price: number } | { name: string; base_price: number }[];
  suppliers?: { name: string } | { name: string }[];
}

export type OrderStatus = 'pending' | 'approved' | 'processing' | 'shipped' | 'delivered';

export interface PipelineStage {
  stage: string;
  count: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  order_id?: number;
  vendor: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_percentage: number;
  total_amount: number;
  ai_check_status: 'verified_clean' | 'error_detected' | 'ok' | 'error' | 'pending';
  ai_error_message?: string;
  items: InvoiceItem[];
  po_reference?: string;
}

export interface InvoiceItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

// ─── Proposals ────────────────────────────────────────────────────────────────

export interface Proposal {
  product_id: number;
  product_name: string;
  current_stock: number;
  avg_weekly_sales: number;
  predicted_stockout_days: number;
  reorder_point: number;
  recommended_order: number;
  suggested_supplier: ProposalSupplier;
  alternatives: ProposalSupplier[];
  reasoning: string;
}

export interface ProposalSupplier {
  id?: number;
  supplier_id?: number;
  name: string;
  price: number;
  delivery_days: number;
  reliability_score: number;
  contact?: string;
}

// ─── Sales & Customers ────────────────────────────────────────────────────────

export interface SalesDataItem {
  id: number;
  date: string;
  product_name: string;
  sales: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  total_orders: number;
  status: 'Active' | 'Inactive';
}

export interface CustomerOrder {
  id: string;
  customer_id: string;
  product_name: string;
  amount: number;
  order_date: string;
  price: number;
}

// ─── UI / Dashboard ───────────────────────────────────────────────────────────

export type ActiveTab =
  | 'dashboard'
  | 'proposals'
  | 'orders'
  | 'inventory'
  | 'suppliers'
  | 'invoices'
  | 'customers'
  | 'sales';

export interface KPIs {
  totalRevenue: number;
  revGrowth: number;
  stockTurnover: number;
  doi: number;
  stockRiskPct: number;
  lowStockCount: number;
  avgReliability: number;
  avgLeadTime: number;
  aiErrorRate: number;
}

export interface ExecutiveInsight {
  type: 'warning' | 'success' | 'info';
  message: string;
  subtext: string;
  icon: ReactNode;
}

export interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  type: 'danger' | 'warning' | 'info';
}

// ─── Supplier comparison modal ────────────────────────────────────────────────

export interface AvailableSupplier {
  price: number;
  delivery_days: number;
  supplier_id: number;
  supplierName: string;
  reliability_score: number;
  reasons: string[];
  overallScore: number;
  isBestOverall?: boolean;
}
