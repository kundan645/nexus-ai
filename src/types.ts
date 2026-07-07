export interface Organization {
  id: string;
  name: string;
  industry: string;
  healthScore: number;
  revenueThisMonth: number;
  revenueGrowth: number;
  todaySales?: number;
  todaySalesGrowth?: number;
  profit?: number;
  profitGrowth?: number;
  pendingPayments?: number;
  pendingPaymentsGrowth?: number;
  totalCustomers?: number;
  totalCustomersGrowth?: string;
  ordersToday?: number;
  ordersTodayGrowth?: number;
  lastMonthSales?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'employee';
  orgId: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minStock: number;
  price: number;
  orgId: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'overdue';
  date: string;
  dueDate: string;
  stripePaymentLink?: string;
  razorpayPaymentLink?: string;
  razorpayQrCodeUrl?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  paymentTime?: string;
  paymentMethod?: string;
  amountPaid?: number;
  receiptUrl?: string;
  orgId: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  callsCount: number;
  status: string; // "Active", "Lead", "Overdue client", etc.
  orgId: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  orgId: string;
}

export interface CallLog {
  id: string;
  customerName: string;
  phone: string;
  duration: string;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  status: 'completed' | 'failed' | 'scheduled';
  date: string;
  orgId: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  references?: Array<{ name: string; score: number; snippet: string }>;
}
