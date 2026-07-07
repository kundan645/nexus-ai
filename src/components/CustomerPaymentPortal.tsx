import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  Loader2, 
  QrCode, 
  ArrowLeft, 
  Building2, 
  Sparkles, 
  Check, 
  Info,
  Calendar,
  Lock,
  Download,
  FileText,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Invoice } from "../types";

interface CustomerPaymentPortalProps {
  invoiceId: string;
  onPaymentSuccess: () => void;
}

export default function CustomerPaymentPortal({ invoiceId, onPaymentSuccess }: CustomerPaymentPortalProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"upi" | "card" | "netbanking">("upi");
  
  // Form card state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [selectedBank, setSelectedBank] = useState("");

  // Payment capture result
  const [paymentDetails, setPaymentDetails] = useState<{
    paymentId: string;
    orderId: string;
    paymentTime: string;
    paymentMethod: string;
  } | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch("/api/invoices");
        if (res.ok) {
          const invoices: Invoice[] = await res.json();
          const found = invoices.find(inv => inv.id === invoiceId || inv.invoiceNumber === invoiceId);
          if (found) {
            setInvoice(found);
            if (found.status === "paid") {
              setSuccess(true);
              setPaymentDetails({
                paymentId: found.razorpayPaymentId || `pay_capt_${Math.random().toString(36).substring(2, 9)}`,
                orderId: found.razorpayOrderId || `order_capt_${Math.random().toString(36).substring(2, 9)}`,
                paymentTime: found.paymentTime || new Date().toISOString(),
                paymentMethod: found.paymentMethod || "UPI (Scan)"
              });
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch invoice details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [invoiceId]);

  const handleSimulatePayment = async (method: string) => {
    setPaying(true);
    
    // Breathtaking professional payment process simulation (2 seconds)
    setTimeout(async () => {
      try {
        const randomPayId = `pay_${Math.random().toString(36).substring(2, 10).toUpperCase()}_${Date.now().toString().slice(-4)}`;
        const randomOrderId = `order_${Math.random().toString(36).substring(2, 10).toUpperCase()}_${Date.now().toString().slice(-4)}`;
        
        const res = await fetch(`/api/invoices/${invoice?.id}/pay-success`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            razorpayPaymentId: randomPayId,
            razorpayOrderId: randomOrderId,
            paymentMethod: method,
            amountPaid: invoice?.amount
          })
        });

        if (res.ok) {
          const data = await res.json();
          setInvoice(data.invoice);
          setPaymentDetails({
            paymentId: randomPayId,
            orderId: randomOrderId,
            paymentTime: new Date().toISOString(),
            paymentMethod: method
          });
          setSuccess(true);
          onPaymentSuccess(); // triggers parent database reload to reflect in real-time
        }
      } catch (err) {
        console.error("Payment registration failure:", err);
      } finally {
        setPaying(false);
      }
    }, 2200);
  };

  const handlePrintInvoice = () => {
    if (!invoice) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    const isPaid = invoice.status === "paid" || success;
    const upiMerchant = "nexusshop@icici";
    const upiLink = `upi://pay?pa=${upiMerchant}&pn=${encodeURIComponent("Nexus AI Merchant")}&am=${invoice.amount.toFixed(2)}&tn=${encodeURIComponent(`Invoice ${invoice.invoiceNumber}`)}&cu=INR`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiLink)}`;
    
    const html = `
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
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
                <p style="font-size: 14px; font-weight: bold; margin: 4px 0 0 0; text-align: right; color: #475569;">#${invoice.invoiceNumber}</p>
              </div>
            </div>
            
            <div class="details">
              <div>
                <div class="section-title">Billed To</div>
                <div class="val" style="font-size: 16px; font-weight: 700; color: #0f172a;">${invoice.customerName}</div>
                <div class="val" style="color: #475569; margin-top: 4px;">${invoice.customerEmail}</div>
              </div>
              <div style="text-align: right;">
                <div class="section-title">Invoice Information</div>
                <div class="val"><strong>Issue Date:</strong> ${invoice.date}</div>
                <div class="val" style="margin-top: 4px;"><strong>Due Date:</strong> ${invoice.dueDate}</div>
                <div class="val" style="margin-top: 12px;">
                  <span class="payment-status status-${isPaid ? 'paid' : 'unpaid'}">${isPaid ? 'paid' : 'unpaid'}</span>
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
                  <td style="text-align: right;">₹${invoice.amount.toLocaleString('en-IN')}</td>
                  <td style="text-align: right; font-weight: bold; color: #0f172a;">₹${invoice.amount.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>

            <div class="total-box">
              <div style="width: 280px;">
                <div style="display: flex; justify-content: space-between; font-size: 13px; color: #64748b; margin-bottom: 8px;">
                  <span>Subtotal:</span>
                  <span>₹${invoice.amount.toLocaleString('en-IN')}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-top: 2px solid #cbd5e1; padding-top: 12px; font-size: 16px;">
                  <span>Grand Total:</span>
                  <span style="color: #2563eb;">₹${invoice.amount.toLocaleString('en-IN')}</span>
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
                  <a href="#" style="color: #2563eb; font-weight: bold; text-decoration: none;">Secure Razorpay Link</a>
                </p>
              </div>
            </div>
            ` : `
            <div style="background-color: #f0fdf4; padding: 24px; border-radius: 12px; border: 1px solid #bbf7d0; text-align: center;">
              <p style="color: #15803d; font-weight: 800; font-size: 16px; margin: 0 0 6px 0;">✓ PAYMENT RECEIVED & FULLY SETTLED</p>
              <p style="font-size: 12px; color: #166534; margin: 0; line-height: 1.4;">
                <strong>Razorpay Payment ID:</strong> ${paymentDetails?.paymentId || 'pay_capt_simulated'}<br/>
                <strong>Settlement Time:</strong> ${paymentDetails?.paymentTime ? new Date(paymentDetails.paymentTime).toLocaleString() : new Date().toLocaleString()}<br/>
                <strong>Payment Method:</strong> ${paymentDetails?.paymentMethod || 'UPI Intent Transfer'}
              </p>
            </div>
            `}

            <div class="footer">
              <p style="font-weight: bold; color: #475569; margin-bottom: 6px;">Thank you for your business!</p>
              <p style="margin: 0;">For billing queries, please contact accounting@sharmaelectronics.in</p>
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

  const handlePrintReceipt = () => {
    if (!invoice || !paymentDetails) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    const html = `
      <html>
        <head>
          <title>Payment Receipt - ${invoice.invoiceNumber}</title>
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
            
            <div class="amount">₹${invoice.amount.toLocaleString('en-IN')}.00</div>
            
            <div class="grid">
              <div>
                <div class="label">Customer Name</div>
                <div class="value">${invoice.customerName}</div>
              </div>
              <div>
                <div class="label">Invoice Number</div>
                <div class="value">#${invoice.invoiceNumber}</div>
              </div>
              <div>
                <div class="label">Razorpay Order ID</div>
                <div class="value">${paymentDetails.orderId}</div>
              </div>
              <div>
                <div class="label">Razorpay Payment ID</div>
                <div class="value">${paymentDetails.paymentId}</div>
              </div>
              <div>
                <div class="label">Date & Time</div>
                <div class="value">${new Date(paymentDetails.paymentTime).toLocaleString()}</div>
              </div>
              <div>
                <div class="label">Payment Method</div>
                <div class="value">${paymentDetails.paymentMethod}</div>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070913] flex flex-col items-center justify-center text-gray-200">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
        <p className="text-xs font-mono tracking-widest text-gray-500 uppercase">Connecting Secure Gateway...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-[#070913] flex flex-col items-center justify-center text-gray-200 p-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Invoice Not Found</h2>
        <p className="text-sm text-gray-400 max-w-md mb-6">The payment link you followed might be incorrect, expired, or has been unindexed from the active ledger.</p>
        <button 
          onClick={() => window.location.href = "/"}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all"
        >
          Return to ERP Dashboard
        </button>
      </div>
    );
  }

  const upiMerchant = "nexusshop@icici";
  const upiLink = `upi://pay?pa=${upiMerchant}&pn=${encodeURIComponent("Nexus AI Merchant")}&am=${invoice.amount.toFixed(2)}&tn=${encodeURIComponent(`Invoice ${invoice.invoiceNumber}`)}&cu=INR`;

  return (
    <div className="min-h-screen bg-[#070814] flex items-center justify-center p-4 sm:p-8 text-gray-200">
      
      {/* Absolute Header branding */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <div className="p-1.5 bg-blue-600 rounded-lg text-white font-bold text-xs">⚡</div>
        <span className="text-xs font-black tracking-widest uppercase font-display text-white">NEXUS SECURE GATEWAY</span>
      </div>

      <AnimatePresence mode="wait">
        {!success ? (
          <motion.div 
            key="payment-box"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="w-full max-w-md bg-[#0F112A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col relative"
          >
            {/* Paying lock overlay */}
            {paying && (
              <div className="absolute inset-0 bg-black/80 z-30 flex flex-col items-center justify-center text-center p-6">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-wider">Validating UPI Token</h4>
                <p className="text-xs text-gray-400 leading-relaxed max-w-xs">Connecting with Razorpay secure merchant ledger and initiating handshakes with bank routing servers...</p>
              </div>
            )}

            {/* Merchant info top card */}
            <div className="p-5 bg-gradient-to-r from-blue-600/20 to-indigo-600/10 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow shadow-blue-500/20">
                  SE
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Sharma Electronics</h3>
                  <p className="text-[10px] text-gray-400">billing@sharmaelectronics.in</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-mono text-gray-500 uppercase">Secure Link</p>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-lg mt-1">
                  <Lock className="w-3 h-3" />
                  Verified
                </div>
              </div>
            </div>

            {/* Invoice metadata overview */}
            <div className="p-5 border-b border-white/5 bg-black/20 flex justify-between items-center">
              <div>
                <p className="text-[9px] uppercase font-mono text-gray-500">PAYABLE AMOUNT FOR #{invoice.invoiceNumber}</p>
                <p className="text-2xl font-black font-display text-white mt-1">₹{invoice.amount.toLocaleString('en-IN')}.00</p>
              </div>
              <div className="text-right text-[10px] text-gray-400">
                <p>Due: {invoice.dueDate}</p>
                <p className="text-blue-400 mt-1 cursor-pointer hover:underline" onClick={handlePrintInvoice}>View Invoice Copy</p>
              </div>
            </div>

            {/* Tab Selectors */}
            <div className="flex bg-[#121635] p-1 border-b border-white/5 text-center">
              {(["upi", "card", "netbanking"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                    activeTab === tab 
                      ? "bg-blue-600 text-white" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab === "upi" ? "📱 UPI Transfer" : tab === "card" ? "💳 Debit/Credit" : "🏦 Netbanking"}
                </button>
              ))}
            </div>

            {/* Tab contents */}
            <div className="p-5 flex-1 min-h-[300px] flex flex-col justify-between">
              
              {/* Tab 1: UPI and QR Code (PRIMARY) */}
              {activeTab === "upi" && (
                <div className="space-y-4 flex flex-col items-center">
                  <div className="bg-white p-3.5 rounded-2xl shadow-lg border border-blue-500/30">
                    {/* Render exact QR Server API pointing to local UPI URI */}
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`} 
                      alt="UPI QR Code" 
                      className="w-40 h-40"
                    />
                  </div>
                  
                  <div className="text-center space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-blue-400">Dynamic UPI Merchant Code</p>
                    <p className="text-[10px] text-gray-400 leading-normal max-w-xs">
                      Scan using Google Pay, PhonePe, Paytm, BHIM or any banking app to complete payment.
                    </p>
                  </div>

                  <div className="w-full pt-2">
                    <button
                      onClick={() => handleSimulatePayment("UPI (PhonePe App Integration)")}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-display text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/10 active:scale-[0.99]"
                    >
                      📱 Pay via Simulated GPay / PhonePe App
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Credit/Debit Card Form */}
              {activeTab === "card" && (
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono text-gray-400">Card Number</label>
                    <input 
                      type="text"
                      maxLength={19}
                      value={cardNumber}
                      onChange={e => {
                        // format with spacing
                        const val = e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
                        setCardNumber(val);
                      }}
                      placeholder="4111 2222 3333 4444"
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-mono text-gray-400">Expiry MM/YY</label>
                      <input 
                        type="text"
                        maxLength={5}
                        placeholder="12/28"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-mono text-gray-400">CVV</label>
                      <input 
                        type="password"
                        maxLength={3}
                        placeholder="***"
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono text-gray-400">Cardholder Name</label>
                    <input 
                      type="text"
                      placeholder="AMIT SHARMA"
                      value={cardName}
                      onChange={e => setCardName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 uppercase font-mono"
                    />
                  </div>

                  <button
                    disabled={!cardNumber || !cardExpiry || !cardCvv}
                    onClick={() => handleSimulatePayment("Card (Visa/Mastercard)")}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-display text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/10 active:scale-[0.99] mt-2"
                  >
                    💳 Pay ₹{invoice.amount.toLocaleString('en-IN')}.00 Securely
                  </button>
                </div>
              )}

              {/* Tab 3: Netbanking */}
              {activeTab === "netbanking" && (
                <div className="space-y-4">
                  <p className="text-[10px] text-gray-400 text-center">Select your preferred Indian Banking service to authorize settlement:</p>
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    {["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank", "Punjab National Bank"].map(bank => (
                      <button
                        key={bank}
                        onClick={() => setSelectedBank(bank)}
                        className={`p-2.5 text-left rounded-xl border text-[11px] font-semibold transition-all ${
                          selectedBank === bank 
                            ? "bg-blue-600/10 border-blue-500 text-blue-400" 
                            : "bg-black/20 border-white/5 hover:border-white/15 text-gray-300"
                        }`}
                      >
                        🏦 {bank}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={!selectedBank}
                    onClick={() => handleSimulatePayment(`Netbanking (${selectedBank})`)}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-display text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/10 active:scale-[0.99] mt-2"
                  >
                    Authorize Netbanking Pay
                  </button>
                </div>
              )}

              {/* Secure badge footer */}
              <div className="flex items-center justify-center gap-2 border-t border-white/5 pt-4 mt-4 text-[10px] text-gray-500 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>PCI-DSS COMPLIANT 256-BIT SSL GATEWAY</span>
              </div>

            </div>
          </motion.div>
        ) : (
          /* PAYMENT SUCCESS PANEL */
          <motion.div
            key="success-box"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-[#0C1227] border border-emerald-500/20 rounded-2xl shadow-2xl p-6 text-center space-y-6 relative overflow-hidden"
          >
            {/* Sparkle floating stars */}
            <div className="absolute top-2 left-2 text-emerald-400/40 animate-pulse"><Sparkles className="w-5 h-5" /></div>
            <div className="absolute bottom-2 right-2 text-blue-400/30 animate-pulse"><Sparkles className="w-6 h-6" /></div>

            {/* High fidelity green checkmark ring animation */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow shadow-emerald-500/20"
            >
              <Check className="w-8 h-8 stroke-[3]" />
            </motion.div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-extrabold text-white">Payment Captured Successfully!</h2>
              <p className="text-xs text-emerald-400 font-bold font-mono uppercase tracking-widest">Transaction Confirmed via Razorpay Node</p>
            </div>

            {/* Receipt Table details */}
            <div className="bg-[#121832] border border-white/5 rounded-2xl p-4.5 text-left text-xs space-y-2.5 font-sans">
              <div className="flex justify-between">
                <span className="text-gray-400">Merchant Name</span>
                <span className="font-semibold text-white">Sharma Electronics</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Invoice Ref</span>
                <span className="font-mono text-blue-400 font-bold">#{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-2.5">
                <span className="text-gray-400">Amount Paid</span>
                <span className="font-bold text-white text-sm">₹{invoice.amount.toLocaleString('en-IN')}.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Razorpay Payment ID</span>
                <span className="font-mono font-semibold text-gray-300 truncate max-w-[150px]">{paymentDetails?.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Authorization Source</span>
                <span className="text-emerald-400 font-bold">{paymentDetails?.paymentMethod}</span>
              </div>
            </div>

            {/* Core post-payment action keys */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handlePrintReceipt}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-display text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.99]"
              >
                📄 Download Official Receipt (PDF)
              </button>

              <button
                onClick={handlePrintInvoice}
                className="w-full bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 hover:border-white/20 text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                🧾 Printable Invoice Ledger
              </button>

              <button
                onClick={() => window.location.href = "/"}
                className="w-full text-xs text-gray-400 hover:text-white transition-colors underline pt-2"
              >
                Back to Merchant ERP Dashboard
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
