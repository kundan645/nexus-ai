import React, { useState, useEffect } from "react";
import { 
  ClipboardList, PlusCircle, Search, Trash2, Calendar, 
  User, Phone, Mail, ShoppingBag, Loader2, IndianRupee,
  CheckCircle2, AlertCircle, Sparkles, TrendingUp
} from "lucide-react";
import { LedgerItem } from "../types";

interface DailyLedgerProps {
  theme?: "light" | "dark";
  activeOrgId: string;
}

export default function DailyLedger({ theme = "dark", activeOrgId }: DailyLedgerProps) {
  const [ledger, setLedger] = useState<LedgerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form fields
  const [buyerName, setBuyerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [itemsBought, setItemsBought] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  
  // Notification states
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchLedger = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ledger", {
        headers: { "x-org-id": activeOrgId }
      });
      if (res.ok) {
        const data = await res.json();
        setLedger(data);
      }
    } catch (err) {
      console.error("Error fetching ledger items:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [activeOrgId]);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim() || !itemsBought.trim() || !amount) {
      setErrorMsg("Please fill out Name, Items Bought, and Total Price.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/ledger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-id": activeOrgId
        },
        body: JSON.stringify({
          buyerName,
          phone,
          email,
          itemsBought,
          amount: Number(amount),
          date
        })
      });

      if (res.ok) {
        const newItem = await res.json();
        setLedger((prev) => [newItem, ...prev]);
        setSuccessMsg(`Daily buyer entry for "${buyerName}" saved! AI Knowledge Base and Dashboard updated.`);
        
        // Reset form except date
        setBuyerName("");
        setPhone("");
        setEmail("");
        setItemsBought("");
        setAmount("");
        
        // Hide success message after 4s
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || "Failed to save daily buyer record.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to connect to server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    setDeletingId(id);
    setErrorMsg("");
    setSuccessMsg("");
    
    try {
      const res = await fetch(`/api/ledger/${id}`, {
        method: "DELETE",
        headers: { "x-org-id": activeOrgId }
      });

      if (res.ok) {
        setLedger((prev) => prev.filter((item) => item.id !== id));
        setSuccessMsg("Ledger transaction deleted successfully.");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setErrorMsg("Failed to delete ledger entry.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to connect to server.");
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered ledger list based on search query
  const filteredLedger = ledger.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.buyerName.toLowerCase().includes(query) ||
      item.phone.includes(query) ||
      item.email.toLowerCase().includes(query) ||
      item.itemsBought.toLowerCase().includes(query)
    );
  });

  // Calculate statistics
  const totalTransactions = filteredLedger.length;
  const totalRevenue = filteredLedger.reduce((sum, item) => sum + item.amount, 0);
  
  const todayStr = new Date().toISOString().split("T")[0];
  const todayTransactions = filteredLedger.filter(item => item.date === todayStr);
  const todayRevenue = todayTransactions.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6" id="daily_ledger_panel">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className={`text-xl font-bold font-display tracking-tight flex items-center gap-2 ${
            theme === "dark" ? "text-white" : "text-slate-900"
          }`}>
            <ClipboardList className="w-5.5 h-5.5 text-blue-400" />
            Daily Ledger & Buyer History
          </h2>
          <p className={`text-xs ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>
            Log daily buyer history, customer details, and store sales to instantly index them into your AI model and update financial metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded font-bold uppercase flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
            Auto-Embedded (RAG)
          </span>
        </div>
      </div>

      {/* Info Notice card */}
      <div className={`p-4 rounded-xl border flex items-start gap-3 ${
        theme === "dark" 
          ? "bg-zinc-950/40 border-zinc-800 text-zinc-300" 
          : "bg-blue-50/50 border-blue-100 text-slate-700"
      }`}>
        <Sparkles className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
        <div className="text-[11px] leading-relaxed">
          <strong>No PDF or invoice files to upload?</strong> No problem! This daily ledger acts as a manual input. For every customer entry you save below, the AI assistant will dynamically learn about the buyer, their purchase items, and date, allowing you to ask questions like <em>"What did Priya buy today?"</em> or <em>"Show last week's buyer logs"</em>.
        </div>
      </div>

      {/* Stats summary boxes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${
          theme === "dark" ? "bg-zinc-950/40 border-zinc-800" : "bg-white border-slate-200"
        }`}>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Total Sales (Ledger)</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[10px] text-emerald-500 font-mono">₹</span>
            <span className="text-xl font-black text-emerald-500 tracking-tight font-mono">
              {totalRevenue.toLocaleString("en-IN")}
            </span>
          </div>
          <p className="text-[9px] text-zinc-500 mt-0.5">Sum of all records</p>
        </div>

        <div className={`p-4 rounded-xl border ${
          theme === "dark" ? "bg-zinc-950/40 border-zinc-800" : "bg-white border-slate-200"
        }`}>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Today's Sales</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[10px] text-blue-400 font-mono">₹</span>
            <span className="text-xl font-black text-blue-400 tracking-tight font-mono">
              {todayRevenue.toLocaleString("en-IN")}
            </span>
          </div>
          <p className="text-[9px] text-zinc-500 mt-0.5">{todayTransactions.length} transactions today</p>
        </div>

        <div className={`p-4 rounded-xl border ${
          theme === "dark" ? "bg-zinc-950/40 border-zinc-800" : "bg-white border-slate-200"
        }`}>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Total Customers Logged</p>
          <p className="text-xl font-black text-zinc-100 dark:text-white tracking-tight mt-1">
            {totalTransactions}
          </p>
          <p className="text-[9px] text-zinc-500 mt-0.5">Unique transactions stored</p>
        </div>

        <div className={`p-4 rounded-xl border ${
          theme === "dark" ? "bg-zinc-950/40 border-zinc-800" : "bg-white border-slate-200"
        }`}>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">AI Synced Index Status</p>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400">ONLINE</span>
          </div>
          <p className="text-[9px] text-zinc-500 mt-1">Vector space fully up to date</p>
        </div>
      </div>

      {/* Main double column container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form to add buyer entry */}
        <div className={`lg:col-span-5 p-5 rounded-2xl border space-y-4 h-fit ${
          theme === "dark" ? "bg-zinc-950/80 border-zinc-800/80" : "bg-white border-slate-200"
        }`} id="add_ledger_entry_form">
          <h3 className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-2 ${
            theme === "dark" ? "text-white" : "text-slate-800"
          }`}>
            <PlusCircle className="w-4 h-4 text-blue-400" />
            Add Daily Buyer Record
          </h3>

          {/* Feedback banners */}
          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs flex items-start gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAddEntry} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Buyer / Customer Name *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <User className="w-3.5 h-3.5" />
                </span>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Rahul Gupta"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className={`w-full text-xs rounded-lg pl-9 pr-3 py-2 border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    theme === "dark" 
                      ? "bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500" 
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Phone className="w-3.5 h-3.5" />
                  </span>
                  <input 
                    type="tel"
                    placeholder="e.g. +91 99999 88888"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full text-xs rounded-lg pl-9 pr-3 py-2 border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      theme === "dark" 
                        ? "bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500" 
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Email (Gmail)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <input 
                    type="email"
                    placeholder="e.g. buyer@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full text-xs rounded-lg pl-9 pr-3 py-2 border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      theme === "dark" 
                        ? "bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500" 
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Items Bought *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-500">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </span>
                <textarea 
                  required
                  rows={2}
                  placeholder="e.g. 1x Wireless Soundbar, 2x Bluetooth Hub"
                  value={itemsBought}
                  onChange={(e) => setItemsBought(e.target.value)}
                  className={`w-full text-xs rounded-lg pl-9 pr-3 py-2 border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    theme === "dark" 
                      ? "bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500" 
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Total Paid Price (₹) *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 text-xs font-bold">
                    ₹
                  </span>
                  <input 
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 12000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`w-full text-xs rounded-lg pl-8 pr-3 py-2 border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      theme === "dark" 
                        ? "bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500" 
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Purchase Date *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Calendar className="w-3.5 h-3.5" />
                  </span>
                  <input 
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full text-xs rounded-lg pl-9 pr-3 py-2 border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      theme === "dark" 
                        ? "bg-zinc-900 border-zinc-800 text-white" 
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2.5 rounded-lg text-xs font-bold tracking-wide cursor-pointer transition-all flex items-center justify-center gap-1.5 mt-4 ${
                isSubmitting
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/10 active:scale-[0.99]"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving entry...
                </>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5" />
                  Save Ledger Record & Sync
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: List of ledger logs */}
        <div className={`lg:col-span-7 p-5 rounded-2xl border space-y-4 flex flex-col min-h-[400px] ${
          theme === "dark" ? "bg-zinc-950/80 border-zinc-800/80" : "bg-white border-slate-200"
        }`} id="ledger_database_log">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${
              theme === "dark" ? "text-white" : "text-slate-800"
            }`}>
              Daily Buyer Logs Index
            </h3>

            {/* Search Input */}
            <div className="relative max-w-xs w-full">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-zinc-500">
                <Search className="w-3 h-3" />
              </span>
              <input 
                type="text"
                placeholder="Search buyer name, item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full text-[11px] rounded-lg pl-8 pr-3 py-1.5 border focus:outline-none ${
                  theme === "dark" 
                    ? "bg-zinc-900 border-zinc-850 text-white placeholder-zinc-500 focus:border-zinc-700" 
                    : "bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-300"
                }`}
              />
            </div>
          </div>

          {/* Ledger items list container */}
          <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1 flex-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-20 gap-3">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                <p className="text-xs text-zinc-400">Loading daily shop ledger...</p>
              </div>
            ) : filteredLedger.length === 0 ? (
              <div className={`p-12 text-center border rounded-xl flex flex-col items-center gap-2 ${
                theme === "dark"
                  ? "text-zinc-500 border-zinc-850 bg-zinc-900/10"
                  : "text-slate-400 border-slate-200 bg-slate-50/30"
              }`}>
                <ClipboardList className="w-8 h-8 text-zinc-600 dark:text-zinc-700" />
                <p className="text-xs font-semibold">No daily transactions found.</p>
                <p className="text-[11px] text-zinc-500">Use the left uploader panel to input customer buyer history.</p>
              </div>
            ) : (
              filteredLedger.map((item) => {
                const isToday = item.date === todayStr;
                return (
                  <div 
                    key={item.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border gap-3 transition-colors ${
                      theme === "dark"
                        ? "bg-zinc-900/20 border-zinc-800/60 hover:bg-zinc-900/40"
                        : "bg-slate-50 border-slate-100 hover:bg-slate-100/50"
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Name Avatar */}
                      <div className="p-2 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 border border-blue-500/10 text-blue-400 rounded-xl font-bold text-xs uppercase w-9 h-9 flex items-center justify-center shrink-0">
                        {item.buyerName.substring(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`text-xs font-bold truncate ${
                            theme === "dark" ? "text-white" : "text-slate-800"
                          }`}>{item.buyerName}</p>
                          
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
                            isToday
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                          }`}>
                            <Calendar className="w-2.5 h-2.5" />
                            {item.date}
                          </span>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-[10px] text-zinc-400">
                          {item.phone && <span className="flex items-center gap-1"><Phone className="w-2.5 h-2.5" /> {item.phone}</span>}
                          {item.email && <span className="flex items-center gap-1"><Mail className="w-2.5 h-2.5 truncate max-w-[150px]" /> {item.email}</span>}
                        </div>

                        {/* Items bought display */}
                        <div className={`p-1.5 rounded-lg text-[10px] leading-tight flex items-start gap-1.5 mt-1.5 ${
                          theme === "dark" ? "bg-zinc-900/50 text-zinc-300" : "bg-slate-100 text-slate-700"
                        }`}>
                          <ShoppingBag className="w-3 h-3 text-zinc-500 shrink-0 mt-0.5" />
                          <span className="font-medium">{item.itemsBought}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 border-zinc-800/40 pt-2 sm:pt-0">
                      <span className="text-sm font-black text-emerald-400 font-mono flex items-center">
                        ₹{item.amount.toLocaleString("en-IN")}
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-bold tracking-wider uppercase font-mono px-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                          Paid
                        </span>
                        
                        <button
                          onClick={() => {
                            if (confirm(`Delete ledger record of "${item.buyerName}"? This will also remove its indexed AI context.`)) {
                              handleDeleteEntry(item.id);
                            }
                          }}
                          disabled={deletingId !== null}
                          className={`p-1.5 border rounded-lg transition-all disabled:opacity-50 ${
                            theme === "dark"
                              ? "text-zinc-500 hover:text-rose-400 bg-zinc-900/50 hover:bg-rose-500/10 border-zinc-850 hover:border-rose-500/20"
                              : "text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border-slate-200 hover:border-rose-200"
                          }`}
                          title="Delete ledger entry"
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
