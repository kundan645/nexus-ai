import React, { useState } from "react";
import { 
  FileText, 
  Plus, 
  Search, 
  CreditCard, 
  ExternalLink, 
  X, 
  Calendar, 
  AlertCircle, 
  Clock, 
  CheckCircle2,
  Copy,
  Check,
  Share2,
  Download,
  QrCode,
  MessageSquare,
  Printer,
  ChevronRight,
  Sparkles,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Invoice } from "../types";

interface InvoiceManagerProps {
  invoices: Invoice[];
  onAddInvoice: (invoice: Omit<Invoice, "id" | "orgId" | "invoiceNumber">) => void;
  onUpdateInvoiceStatus: (id: string, status: 'paid' | 'unpaid' | 'overdue') => void;
  onTriggerStripeLink: (invoiceId: string, amount: number) => void;
}

export default function InvoiceManager({
  invoices,
  onAddInvoice,
  onUpdateInvoiceStatus,
  onTriggerStripeLink
}: InvoiceManagerProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAdding, setIsAdding] = useState(false);
  
  // Selected invoice for detail drawer
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrType, setQrType] = useState<"razorpay" | "upi">("razorpay");

  // New Invoice Form State
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !amount) return;
    onAddInvoice({
      customerName,
      customerEmail,
      amount: Number(amount),
      date: new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      status: "unpaid"
    });
    setCustomerName("");
    setCustomerEmail("");
    setAmount("");
    setDueDate("");
    setIsAdding(false);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "overdue":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse";
      default:
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="w-3.5 h-3.5 mr-1" />;
      case "overdue":
        return <AlertCircle className="w-3.5 h-3.5 mr-1" />;
      default:
        return <Clock className="w-3.5 h-3.5 mr-1" />;
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.customerName.toLowerCase().includes(search.toLowerCase()) || 
                          inv.invoiceNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCopyLink = (inv: Invoice) => {
    const link = inv.razorpayPaymentLink || `http://${window.location.host}/pay/${inv.id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(inv.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getWhatsAppShareUrl = (inv: Invoice) => {
    const link = inv.razorpayPaymentLink || `http://${window.location.host}/pay/${inv.id}`;
    const text = `Hello ${inv.customerName},\n\nYour invoice #${inv.invoiceNumber} for ₹${inv.amount.toLocaleString('en-IN')} is ready.\n\nYou can pay using either:\n\n✅ Scan the attached QR Code\n\nOR\n\n✅ Click this secure payment link\n\n${link}\n\nThank you for choosing us.`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  // HTML print-out generation for invoice
  const handlePrintInvoice = (inv: Invoice) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    const isPaid = inv.status === "paid";
    const upiMerchant = "nexusshop@icici";
    const upiLink = `upi://pay?pa=${upiMerchant}&pn=${encodeURIComponent("Nexus AI Merchant")}&am=${inv.amount.toFixed(2)}&tn=${encodeURIComponent(`Invoice ${inv.invoiceNumber}`)}&cu=INR`;
    
    // Choose QR code based on type or fall back to secure page
    const payLink = inv.razorpayPaymentLink || `http://${window.location.host}/pay/${inv.id}`;
    const qrTarget = qrType === "upi" ? upiLink : payLink;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrTarget)}`;
    
    const html = `
      <html>
        <head>
          <title>Invoice ${inv.invoiceNumber}</title>
          <style>
            body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; }
            .container { max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
            .header { display: flex; justify-content: space-between; border-b: 2px solid #e2e8f0; padding-bottom: 24px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; letter-spacing: -0.5px; }
            .title { font-size: 28px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; text-align: right; color: #0f172a; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .section-title { font-size: 11px; text-transform: uppercase; font-weight: bold; color: #64748b; margin-bottom: 8px; letter-spacing: 1px; }
            .val { font-size: 14px; font-weight: 500; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            .table th { background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; padding: 12px; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #475569; text-align: left; }
            .table td { padding: 16px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
            .total-box { display: flex; justify-content: flex-end; font-size: 18px; font-weight: bold; margin-bottom: 40px; }
            .payment-status { display: inline-block; padding: 6px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
            .status-paid { background-color: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
            .status-unpaid { background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
            .status-overdue { background-color: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
            .qr-panel { display: flex; align-items: center; gap: 24px; background-color: #f8fafc; padding: 24px; border-radius: 12px; border: 1px dashed #cbd5e1; }
            .footer { border-top: 1px solid #e2e8f0; padding-top: 24px; text-align: center; font-size: 12px; color: #64748b; margin-top: 50px; }
            .btn-group { margin-top: 30px; display: flex; justify-content: center; gap: 12px; }
            button { padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer; border: none; font-size: 14px; transition: all 0.2s; }
            .btn-primary { background-color: #2563eb; color: white; }
            .btn-primary:hover { background-color: #1d4ed8; }
            .btn-secondary { background-color: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
            .btn-secondary:hover { background-color: #e2e8f0; }
            @media print {
              body { padding: 0; background: white; }
              .container { border: none; padding: 0; box-shadow: none; }
              .btn-group { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div>
                <div class="logo">⚡ NEXUS AI</div>
                <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">Sharma Electronics Enterprise ERP</p>
              </div>
              <div>
                <div class="title">Invoice</div>
                <p style="font-size: 14px; font-weight: bold; margin: 4px 0 0 0; text-align: right; color: #475569;">#${inv.invoiceNumber}</p>
              </div>
            </div>
            
            <div class="details">
              <div>
                <div class="section-title">Billed To</div>
                <div class="val" style="font-size: 16px; font-weight: 700; color: #0f172a;">${inv.customerName}</div>
                <div class="val" style="color: #475569; margin-top: 4px;">${inv.customerEmail}</div>
              </div>
              <div style="text-align: right;">
                <div class="section-title">Invoice Information</div>
                <div class="val"><strong>Issue Date:</strong> ${inv.date}</div>
                <div class="val" style="margin-top: 4px;"><strong>Due Date:</strong> ${inv.dueDate}</div>
                <div class="val" style="margin-top: 12px;">
                  <span class="payment-status status-${inv.status}">${inv.status}</span>
                </div>
              </div>
            </div>

            <table class="table">
              <thead>
                <tr>
                  <th style="width: 60%">Item Description</th>
                  <th style="text-align: right;">Qty</th>
                  <th style="text-align: right;">Rate</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div style="font-weight: 600; color: #0f172a;">Corporate Digital Hardware Supplies</div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Premium high-performance electronics inventory batch. Automated wholesale fulfillment.</div>
                  </td>
                  <td style="text-align: right;">1</td>
                  <td style="text-align: right;">₹${inv.amount.toLocaleString('en-IN')}</td>
                  <td style="text-align: right; font-weight: bold; color: #0f172a;">₹${inv.amount.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>

            <div class="total-box">
              <div style="width: 280px;">
                <div style="display: flex; justify-content: space-between; font-size: 13px; color: #64748b; margin-bottom: 8px;">
                  <span>Subtotal:</span>
                  <span>₹${inv.amount.toLocaleString('en-IN')}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13px; color: #64748b; margin-bottom: 8px;">
                  <span>Tax (0% IGST):</span>
                  <span>₹0.00</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-top: 2px solid #cbd5e1; padding-top: 12px; font-size: 16px;">
                  <span>Grand Total:</span>
                  <span style="color: #2563eb;">₹${inv.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            ${!isPaid ? `
            <div class="qr-panel">
              <img src="${qrUrl}" style="width: 110px; height: 110px; border: 1px solid #cbd5e1; border-radius: 8px; padding: 4px; background: white;" />
              <div>
                <div class="section-title">Dynamic UPI & Gateway QR</div>
                <p style="font-size: 13px; margin: 4px 0 8px 0; font-weight: 600; color: #1e293b;">Scan using Google Pay, PhonePe, Paytm, or BHIM.</p>
                <p style="font-size: 11px; color: #64748b; margin: 0; line-height: 1.4;">
                  This is a dynamic instant UPI settlement code. Alternatively, pay online at:<br/>
                  <a href="${payLink}" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: none;">${payLink}</a>
                </p>
              </div>
            </div>
            ` : `
            <div style="background-color: #f0fdf4; padding: 24px; border-radius: 12px; border: 1px solid #bbf7d0; text-align: center;">
              <p style="color: #15803d; font-weight: 800; font-size: 16px; margin: 0 0 6px 0;">✓ PAYMENT RECEIVED & FULLY SETTLED</p>
              <p style="font-size: 12px; color: #166534; margin: 0; line-height: 1.4;">
                <strong>Razorpay Payment ID:</strong> ${inv.razorpayPaymentId || 'pay_live_simulated'}<br/>
                <strong>Settlement Time:</strong> ${inv.paymentTime ? new Date(inv.paymentTime).toLocaleString() : new Date().toLocaleString()}<br/>
                <strong>Payment Method:</strong> ${inv.paymentMethod || 'UPI Intent Transfer'}
              </p>
            </div>
            `}

            <div class="footer">
              <p style="font-weight: bold; color: #475569; margin-bottom: 6px;">Thank you for your business!</p>
              <p style="margin: 0;">For billing queries, please contact accounting@sharmaelectronics.in</p>
              <p style="font-size: 10px; color: #94a3b8; margin-top: 14px;">Automated invoice copy generated securely by Nexus ERP.</p>
            </div>
          </div>

          <div class="btn-group">
            <button class="btn-primary" onclick="window.print()">Print Invoice</button>
            <button class="btn-secondary" onclick="window.close()">Close Document</button>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // HTML print-out generation for payment receipt
  const handlePrintReceipt = (inv: Invoice) => {
    if (inv.status !== "paid") return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    const html = `
      <html>
        <head>
          <title>Payment Receipt - ${inv.invoiceNumber}</title>
          <style>
            body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; padding: 40px; background: #f8fafc; }
            .receipt-card { max-width: 550px; margin: 0 auto; background: white; border: 1px solid #e2e8f0; padding: 40px; border-radius: 16px; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); text-align: center; }
            .success-icon { width: 64px; height: 64px; background: #dcfce7; color: #166534; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 20px auto; font-weight: bold; }
            .title { font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
            .subtitle { font-size: 13px; color: #64748b; margin-bottom: 24px; }
            .amount { font-size: 36px; font-weight: 800; color: #2563eb; margin-bottom: 30px; font-family: monospace; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 20px 0; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; text-align: left; margin-bottom: 30px; }
            .label { font-size: 11px; text-transform: uppercase; font-weight: bold; color: #64748b; margin-bottom: 4px; }
            .value { font-size: 13px; font-weight: 600; color: #1e293b; }
            .footer { font-size: 11px; color: #94a3b8; }
            .btn-group { margin-top: 30px; display: flex; justify-content: center; gap: 12px; }
            button { padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer; border: none; font-size: 13px; }
            .btn-primary { background-color: #2563eb; color: white; }
            .btn-secondary { background-color: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
            @media print {
              body { padding: 0; background: white; }
              .receipt-card { border: none; padding: 0; box-shadow: none; max-width: 100%; }
              .btn-group { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <div class="success-icon">✓</div>
            <div class="title">Transaction Receipt</div>
            <div class="subtitle">Your payment has been successfully captured by Razorpay.</div>
            
            <div class="amount">₹${inv.amount.toLocaleString('en-IN')}.00</div>
            
            <div class="grid">
              <div>
                <div class="label">Customer Name</div>
                <div class="value">${inv.customerName}</div>
              </div>
              <div>
                <div class="label">Invoice Number</div>
                <div class="value">#${inv.invoiceNumber}</div>
              </div>
              <div>
                <div class="label">Razorpay Order ID</div>
                <div class="value">${inv.razorpayOrderId || 'order_capture_simulated'}</div>
              </div>
              <div>
                <div class="label">Razorpay Payment ID</div>
                <div class="value">${inv.razorpayPaymentId || 'pay_capture_simulated'}</div>
              </div>
              <div>
                <div class="label">Date & Time</div>
                <div class="value">${inv.paymentTime ? new Date(inv.paymentTime).toLocaleString() : new Date().toLocaleString()}</div>
              </div>
              <div>
                <div class="label">Payment Method</div>
                <div class="value">${inv.paymentMethod || 'UPI (GPay / PhonePe)'}</div>
              </div>
            </div>

            <p style="font-size: 12px; color: #166534; font-weight: bold; margin-bottom: 30px;">Status: Fully Settled & Confirmed</p>
            
            <div class="footer">
              <p>NEXUS ERP Billing Gateway • Sharma Electronics Ltd.</p>
            </div>
          </div>

          <div class="btn-group">
            <button class="btn-primary" onclick="window.print()">Print Receipt</button>
            <button class="btn-secondary" onclick="window.close()">Close Receipt</button>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10 relative" id="invoice_manager">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Billing & Invoices
          </h2>
          <p className="text-xs text-gray-400">Manage invoices, share payment links, and track UPI settlements in real-time</p>
        </div>

        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-display text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isAdding ? "Close Form" : "Create New Invoice"}
        </button>
      </div>

      {/* Invoice creation form */}
      {isAdding && (
        <form 
          onSubmit={handleSubmit}
          className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200"
          id="invoice_form"
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-400 font-display flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Draft Invoice & Auto-Generate Payment link
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Client Organization</label>
              <input 
                type="text" 
                value={customerName} 
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Client Corp" 
                required
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Client Email</label>
              <input 
                type="email" 
                value={customerEmail} 
                onChange={e => setCustomerEmail(e.target.value)}
                placeholder="finance@corp.com" 
                required
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Total Amount (₹)</label>
              <input 
                type="number" 
                value={amount} 
                onChange={e => setAmount(e.target.value)}
                placeholder="4500" 
                required
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Due Date</label>
              <input 
                type="date" 
                value={dueDate} 
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-2.5 items-start">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-gray-300 leading-normal">
              Publishing this invoice will instantly trigger the <strong>Razorpay Engine</strong> to output a secure Payment Link and map a corresponding high-contrast <strong>Dynamic UPI QR code</strong> for instant GPay/PhonePe settlements.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-gray-300"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 shadow shadow-blue-500/10"
            >
              Publish & Generate Gateway
            </button>
          </div>
        </form>
      )}

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4" id="invoice_filters">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by client or Invoice ID..."
            className="w-full bg-black/30 border border-white/5 hover:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/5 w-full sm:w-auto">
          {["all", "paid", "unpaid", "overdue"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider font-mono font-semibold transition-all flex-1 sm:flex-initial ${
                statusFilter === status 
                  ? "bg-blue-600 text-white shadow" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice list */}
      <div className="overflow-x-auto rounded-xl border border-white/5">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-white/5 text-gray-400 uppercase tracking-wider font-mono text-[10px] border-b border-white/5">
              <th className="p-4 font-semibold">Invoice ID</th>
              <th className="p-4 font-semibold">Client</th>
              <th className="p-4 font-semibold">Date / Due</th>
              <th className="p-4 font-semibold">Amount</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Actions / Gateway</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((inv) => (
                <tr 
                  key={inv.id} 
                  onClick={() => setSelectedInvoice(inv)}
                  className="hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <td className="p-4 font-mono font-semibold text-blue-400 uppercase group-hover:text-blue-300">
                    <span className="flex items-center gap-1.5">
                      {inv.invoiceNumber}
                      <ChevronRight className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-white">{inv.customerName}</p>
                    <p className="text-[10px] text-gray-400">{inv.customerEmail}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-gray-300">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      <span>{inv.date}</span>
                    </div>
                    <p className="text-[10px] text-rose-400/80 mt-0.5">Due: {inv.dueDate}</p>
                  </td>
                  <td className="p-4 font-mono font-bold text-white text-sm">
                    ₹{inv.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClass(inv.status)}`}>
                        {getStatusIcon(inv.status)}
                        {inv.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <select 
                        value={inv.status}
                        onChange={(e) => onUpdateInvoiceStatus(inv.id, e.target.value as any)}
                        className="bg-black/60 border border-white/10 text-gray-300 rounded p-1 text-[11px] hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="overdue">Overdue</option>
                      </select>

                      <button 
                        onClick={() => setSelectedInvoice(inv)}
                        className="inline-flex items-center gap-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 hover:border-blue-500/40 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-all"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        Pay Panel
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500 font-display">
                  No invoices matched active search filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* INVOICE DETAILS DRAWER MODAL */}
      <AnimatePresence>
        {selectedInvoice && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInvoice(null)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Sidebar drawer container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="fixed top-0 bottom-0 right-0 w-full sm:w-[480px] bg-[#0c0e1e] border-l border-white/10 z-50 flex flex-col shadow-2xl h-full overflow-hidden text-gray-200"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#11142B]">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="font-bold text-sm text-white">Invoice Gateway Manager</h3>
                    <p className="text-[10px] font-mono text-gray-400">#{selectedInvoice.invoiceNumber}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Meta details cards */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4.5 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                    <span className="text-[11px] font-mono uppercase text-gray-400">Payment Status</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClass(selectedInvoice.status)}`}>
                      {getStatusIcon(selectedInvoice.status)}
                      {selectedInvoice.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] uppercase font-mono text-gray-500">Customer Name</p>
                      <p className="text-xs font-bold text-white mt-0.5">{selectedInvoice.customerName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono text-gray-500">Customer Email</p>
                      <p className="text-xs font-medium text-gray-300 mt-0.5 truncate">{selectedInvoice.customerEmail}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono text-gray-500">Issue Date</p>
                      <p className="text-xs font-semibold text-gray-300 mt-0.5">{selectedInvoice.date}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono text-gray-500">Due Date</p>
                      <p className="text-xs font-semibold text-rose-400 mt-0.5">{selectedInvoice.dueDate}</p>
                    </div>
                  </div>
                </div>

                {/* Big Amount Panel */}
                <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/20 rounded-2xl p-5 text-center relative overflow-hidden">
                  <div className="absolute top-1 right-2 p-1 text-[8px] font-mono bg-blue-500/10 border border-blue-500/25 rounded text-blue-400">INR</div>
                  <p className="text-xs text-gray-400 font-semibold mb-1">Invoice Payable Value</p>
                  <p className="text-3xl font-extrabold font-display text-white tracking-tight">
                    ₹{selectedInvoice.amount.toLocaleString('en-IN')}
                  </p>
                </div>

                {/* QR Code Container Block */}
                {selectedInvoice.status !== "paid" && (
                  <div className="bg-[#080914] border border-white/10 rounded-2xl p-5 flex flex-col items-center">
                    
                    {/* QR Type Selector Switcher Tabs */}
                    <div className="flex gap-1 bg-white/5 border border-white/5 p-1 rounded-xl mb-4 w-full">
                      <button
                        onClick={() => setQrType("razorpay")}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                          qrType === "razorpay" 
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" 
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        Razorpay Secure QR
                      </button>
                      <button
                        onClick={() => setQrType("upi")}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                          qrType === "upi" 
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" 
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        Direct UPI QR
                      </button>
                    </div>

                    {/* QR Image Frame */}
                    <div className="bg-white p-3 rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300 mb-3 border border-blue-500/30">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                          qrType === "upi"
                            ? `upi://pay?pa=nexusshop@icici&pn=Nexus%20Merchant&am=${selectedInvoice.amount.toFixed(2)}&tn=Invoice%20${selectedInvoice.invoiceNumber}&cu=INR`
                            : (selectedInvoice.razorpayPaymentLink || `http://${window.location.host}/pay/${selectedInvoice.id}`)
                        )}`} 
                        alt="Secure Payment QR Code" 
                        className="w-44 h-44"
                      />
                    </div>

                    {/* QR Details */}
                    <div className="text-center space-y-1 mt-1 mb-3">
                      <p className="text-[10px] uppercase font-mono font-bold tracking-widest text-blue-400">Scan using any UPI App</p>
                      <p className="text-[9px] text-gray-500">Google Pay • PhonePe • Paytm • BHIM • WhatsApp UPI</p>
                    </div>
                  </div>
                )}

                {/* Successful Payment Metrics and Receipt Details */}
                {selectedInvoice.status === "paid" && (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 space-y-3.5">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Automated Settlement Lock</h4>
                        <p className="text-[10px] text-gray-400">Transaction verified via active Webhooks</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3.5 text-xs border-t border-white/5 pt-3.5">
                      <div>
                        <span className="text-[10px] text-gray-500 font-mono uppercase block">Razorpay Order ID</span>
                        <span className="font-mono font-bold text-gray-300 mt-0.5 block truncate" title={selectedInvoice.razorpayOrderId}>
                          {selectedInvoice.razorpayOrderId || "order_capt_sim_1"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 font-mono uppercase block">Razorpay Payment ID</span>
                        <span className="font-mono font-bold text-gray-300 mt-0.5 block truncate" title={selectedInvoice.razorpayPaymentId}>
                          {selectedInvoice.razorpayPaymentId || "pay_capt_sim_1"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 font-mono uppercase block">Transaction Time</span>
                        <span className="font-medium text-gray-300 mt-0.5 block">
                          {selectedInvoice.paymentTime ? new Date(selectedInvoice.paymentTime).toLocaleTimeString() : new Date().toLocaleTimeString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 font-mono uppercase block">Payment Method</span>
                        <span className="font-bold text-emerald-400 mt-0.5 block">
                          {selectedInvoice.paymentMethod || "UPI Intent App"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Core Workflow Buttons */}
                <div className="space-y-2.5">
                  
                  {/* PAY NOW IF UNPAID */}
                  {selectedInvoice.status !== "paid" && (
                    <a 
                      href={selectedInvoice.razorpayPaymentLink || `http://${window.location.host}/pay/${selectedInvoice.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-display text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-500/25 active:scale-[0.99]"
                    >
                      <CreditCard className="w-4 h-4" />
                      💳 Pay Now Online
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {/* DOWNLOAD RECEIPT IF PAID */}
                  {selectedInvoice.status === "paid" && (
                    <button
                      onClick={() => handlePrintReceipt(selectedInvoice)}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-display text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-[0.99]"
                    >
                      <Check className="w-4 h-4" />
                      📄 Download Official Receipt
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {/* COPY PAYMENT LINK */}
                    {selectedInvoice.status !== "paid" ? (
                      <button
                        onClick={() => handleCopyLink(selectedInvoice)}
                        className="bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border border-white/10 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                      >
                        {copiedId === selectedInvoice.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied Link!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-blue-400" />
                            <span>Copy Gateway Link</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="bg-white/5 opacity-40 text-gray-400 border border-white/5 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Link Expired</span>
                      </button>
                    )}

                    {/* SHARE ON WHATSAPP */}
                    {selectedInvoice.status !== "paid" ? (
                      <a
                        href={getWhatsAppShareUrl(selectedInvoice)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Share on WhatsApp</span>
                      </a>
                    ) : (
                      <button
                        disabled
                        className="bg-white/5 opacity-40 text-gray-400 border border-white/5 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp Shared</span>
                      </button>
                    )}
                  </div>

                  {/* DOWNLOAD INVOICE (ALWAYS AVAILABLE) */}
                  <button
                    onClick={() => handlePrintInvoice(selectedInvoice)}
                    className="w-full bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 hover:border-white/20 text-xs font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-400" />
                    🧾 Download Print Invoice (PDF)
                  </button>

                </div>

              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 bg-[#070810] text-center shrink-0">
                <p className="text-[9px] font-mono text-gray-500">NEXUS SECURE GATEWAY ENVELOPE VER: 2.1.0-C</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
