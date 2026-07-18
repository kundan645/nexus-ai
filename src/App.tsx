import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  PhoneCall, 
  Bot, 
  Sparkles, 
  Building2, 
  Menu, 
  ChevronDown,
  Search,
  Bell,
  Settings,
  Users,
  CreditCard,
  LogOut,
  FolderOpen,
  X,
  Sun,
  Moon,
  Laptop,
  ClipboardList
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Types
import { Organization, User, InventoryItem, Invoice, Customer, Document, CallLog, ChatMessage } from "./types";

// Components
import DashboardStats from "./components/DashboardStats";
import InventoryManager from "./components/InventoryManager";
import InvoiceManager from "./components/InvoiceManager";
import VoiceAgent from "./components/VoiceAgent";
import CopilotRag from "./components/CopilotRag";
import CustomerManager from "./components/CustomerManager";
import DocumentManager from "./components/DocumentManager";
import CustomerPaymentPortal from "./components/CustomerPaymentPortal";
import DailyLedger from "./components/DailyLedger";
import LoginScreen from "./components/LoginScreen";
import SettingsPanel from "./components/SettingsPanel";
import { getSupabaseClient, isSupabaseConfigured } from "./lib/supabase";

export default function App() {
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string; isSimulated: boolean } | null>({
    email: "admin@nova.ai",
    name: "Administrator",
    isSimulated: true
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "copilot" | "documents" | "customers" | "payments" | "inventory" | "voice" | "ledger" | "settings"
  >("dashboard");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrgId, setActiveOrgId] = useState<string>("org-nexus");
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);

  // Theme state: permanently set to dark mode
  const theme = "dark";

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add("dark");
    localStorage.setItem("nexus-theme", "dark");
  }, []);

  // Tenant-isolated states
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  
  // Chat state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Hello! I am NovaOS, your unified business co-pilot. I have full knowledge of your SLA, product lines, inventory levels, outstanding customer invoices, and outbound voice campaigns. Ask me anything!",
      timestamp: new Date().toLocaleTimeString(),
    }
  ]);

  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Common Headers with tenant org isolation
  const getHeaders = () => {
    return {
      "Content-Type": "application/json",
      "x-org-id": activeOrgId,
    };
  };

  // Helper to safely fetch JSON, validating status and content-type
  const fetchJson = async (url: string, options?: RequestInit) => {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`Invalid content-type: ${contentType || "none"}`);
    }
    return res.json();
  };

  // Fetch all domain states corresponding to the active tenant
  const fetchTenantData = async () => {
    setIsRefreshing(true);
    try {
      // Get current active organization
      try {
        const orgData = await fetchJson("/api/organizations/current", { headers: getHeaders() });
        setCurrentOrg(orgData);
      } catch (err) {
        console.warn("Failed to load current organization:", err instanceof Error ? err.message : err);
      }

      // Get Inventory
      try {
        const invData = await fetchJson("/api/inventory", { headers: getHeaders() });
        setInventory(invData);
      } catch (err) {
        console.warn("Failed to load inventory:", err instanceof Error ? err.message : err);
      }

      // Get Invoices
      try {
        const billsData = await fetchJson("/api/invoices", { headers: getHeaders() });
        setInvoices(billsData);
      } catch (err) {
        console.warn("Failed to load invoices:", err instanceof Error ? err.message : err);
      }

      // Get Customers
      try {
        const custData = await fetchJson("/api/customers", { headers: getHeaders() });
        setCustomers(custData);
      } catch (err) {
        console.warn("Failed to load customers:", err instanceof Error ? err.message : err);
      }

      // Get Calls
      try {
        const callsData = await fetchJson("/api/calls", { headers: getHeaders() });
        setCallLogs(callsData);
      } catch (err) {
        console.warn("Failed to load calls:", err instanceof Error ? err.message : err);
      }

      // Get Documents
      try {
        const docsData = await fetchJson("/api/documents", { headers: getHeaders() });
        setDocuments(docsData);
      } catch (err) {
        console.warn("Failed to load documents:", err instanceof Error ? err.message : err);
      }

    } catch (err) {
      console.error("Failed to load tenant context database from NovaOS backend:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const data = await fetchJson("/api/organizations");
        setOrganizations(data);
        if (data.length > 0) {
          setActiveOrgId(data[0].id);
        }
      } catch (err) {
        console.warn("Failed to load organizations lookup:", err instanceof Error ? err.message : err);
      }
    };
    fetchOrgs();
  }, []);

  // Sync state whenever active tenant org changes
  useEffect(() => {
    fetchTenantData();
    // Clear chat history on tenant switch to keep contexts strict
    setChatHistory([
      {
        id: "welcome",
        sender: "assistant",
        text: `Switched workspace. I am now acting as the automated business assistant for ${activeOrgId === "org-nexus" ? "Sharma Electronics" : "Varma Logistics"}. I am ready to evaluate assets, construct invoices, or launch dialer campaigns!`,
        timestamp: new Date().toLocaleTimeString(),
      }
    ]);
  }, [activeOrgId]);

  // Periodic status polling to refresh the dashboard
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTenantData();
    }, 5000);
    return () => clearInterval(interval);
  }, [activeOrgId]);

  // Inventory CRUD triggers
  const handleAddItem = async (item: Omit<InventoryItem, "id" | "orgId">) => {
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(item),
      });
      if (res.ok) {
        const data = await res.json();
        setInventory(prev => [...prev, data]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setInventory(prev => prev.map(i => i.id === id ? data : i));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (res.ok) {
        setInventory(prev => prev.filter(i => i.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Invoices CRUD triggers
  const handleAddInvoice = async (invoice: Omit<Invoice, "id" | "orgId" | "invoiceNumber">) => {
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(invoice),
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(prev => [...prev, data]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateInvoiceStatus = async (id: string, status: 'paid' | 'unpaid' | 'overdue') => {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(prev => prev.map(i => i.id === id ? data : i));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerStripeLink = async (invoiceId: string, amount: number) => {
    try {
      const res = await fetch("/api/stripe/payment-link", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ invoiceId, amount }),
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(prev => prev.map(i => i.id === invoiceId ? { ...i, stripePaymentLink: data.paymentLink } : i));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Customer CRM registration trigger
  const handleAddCustomer = async (cust: Omit<Customer, "id" | "orgId" | "callsCount">) => {
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(cust),
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers(prev => [...prev, data]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Document upload
  const handleUploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        headers: {
          "x-org-id": activeOrgId,
        },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(prev => [...prev, data.document]);
        
        // Add info system message
        setChatHistory(prev => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            sender: "assistant",
            text: `Successfully ingested knowledge asset "${file.name}". Chunker parsed ${data.chunksCount} recursive segments and indexed vector indices. Core RAG queries are now grounded in this documentation!`,
            timestamp: new Date().toLocaleTimeString(),
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (res.ok) {
        const deletedDoc = documents.find(d => d.id === id);
        setDocuments(prev => prev.filter(d => d.id !== id));
        
        // Add info system message
        setChatHistory(prev => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            sender: "assistant",
            text: `Document "${deletedDoc ? deletedDoc.name : 'Unknown'}" has been successfully purged from the Context Vault. Its associated text chunks and vector embeddings have been un-indexed from RAG groundings.`,
            timestamp: new Date().toLocaleTimeString(),
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Chat message sending
  const handleSendMessage = async (text: string, language: string = "English") => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString(),
    };
    setChatHistory(prev => [...prev, userMsg]);
    setIsLoadingChat(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          message: text,
          chatHistory: chatHistory,
          language,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: "assistant",
          text: data.text,
          timestamp: new Date().toLocaleTimeString(),
          references: data.references,
        };
        setChatHistory(prev => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Trigger outbound calling
  const handleTriggerCall = async (customerId: string, invoiceId: string, customScript?: string) => {
    try {
      await fetch("/api/vapi/trigger-call", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ customerId, invoiceId, customScript }),
      });
      // Instantly pull call list to show pending
      const res = await fetch("/api/calls", { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setCallLogs(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Recalculate health index manually
  const handleTriggerHealthTune = async () => {
    if (!currentOrg) return;
    const randomizedScore = Math.floor(Math.random() * 15) + 82; // Simulate healthy level
    try {
      const res = await fetch("/api/organizations/current/health", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ score: randomizedScore }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentOrg(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignOut = async () => {
    // Authentication is bypassed as requested by the user.
    // We keep the user logged in as Administrator.
    setCurrentUser({
      email: "admin@nova.ai",
      name: "Administrator",
      isSimulated: true
    });
  };

  // Check if we are on the secure customer-facing payment checkout page
  const isPayPortal = window.location.pathname.startsWith("/pay/");
  const payInvoiceId = isPayPortal ? window.location.pathname.split("/pay/")[1] : null;

  if (isPayPortal && payInvoiceId) {
    return (
      <CustomerPaymentPortal 
        invoiceId={payInvoiceId} 
        onPaymentSuccess={fetchTenantData} 
      />
    );
  }

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans transition-colors duration-200 ${
      theme === "dark" 
        ? "bg-[#000000] text-zinc-200" 
        : "bg-[#f8fafc] text-slate-800"
    }`}>
      
      {/* Mobile sidebar overlay backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 z-50 lg:hidden backdrop-blur-xs"
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar drawer overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed top-0 bottom-0 left-0 w-64 border-r flex flex-col justify-between z-50 lg:hidden h-full transition-colors duration-200 ${
              theme === "dark" 
                ? "bg-[#0a0b0e] border-[#1f202e]" 
                : "bg-[#fafafa] border-slate-200"
            }`}
          >
            <div className="flex flex-col flex-1 overflow-y-auto">
              
              {/* Logo Brand Header & Org Picker */}
              <div className={`px-4 py-3 border-b flex items-center justify-between ${
                theme === "dark" ? "border-zinc-800/60" : "border-slate-200"
              }`}>
                <div className="flex items-center gap-2 w-full min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-sm shrink-0">
                    ▲
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <select 
                      value={activeOrgId}
                      onChange={(e) => setActiveOrgId(e.target.value)}
                      className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer w-full text-slate-900 dark:text-slate-100 font-display truncate"
                    >
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id} className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-slate-100 text-xs">
                          {org.name}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold tracking-wide">
                      ● Pro Trial
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    theme === "dark" ? "text-zinc-400 hover:text-white hover:bg-white/5" : "text-slate-500 hover:text-black hover:bg-slate-100"
                  }`}
                  aria-label="Close sidebar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Vercel Search bar mock */}
              <div className="px-4 py-3">
                <div className={`flex items-center justify-between gap-2 border rounded-lg px-2.5 py-1.5 w-full ${
                  theme === "dark" ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-slate-200"
                }`}>
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                    <input 
                      type="text" 
                      placeholder="Find..." 
                      className="bg-transparent text-xs focus:outline-none w-full text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-zinc-500"
                    />
                  </div>
                  <span className={`text-[9px] font-mono px-1 py-0.5 rounded border leading-none ${
                    theme === "dark" ? "text-zinc-500 bg-zinc-800 border-zinc-700" : "text-slate-400 bg-slate-100 border-slate-200"
                  }`}>F</span>
                </div>
              </div>

              {/* Navigation Items grouped */}
              <div className="px-4 py-4 space-y-6">
                
                {/* GROUP 1 */}
                <div className="space-y-1">
                  <p className={`text-[9px] uppercase font-bold tracking-widest px-3 mb-2 ${
                    theme === "dark" ? "text-zinc-500" : "text-slate-500"
                  }`}>Core Insights</p>
                  
                  <button 
                    onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-all text-xs font-medium ${
                      activeTab === "dashboard" 
                        ? (theme === "dark" ? "bg-white/10 text-white font-semibold" : "bg-slate-200/75 text-slate-900 font-semibold")
                        : (theme === "dark" ? "text-zinc-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-black hover:bg-slate-100")
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </button>

                  <button 
                    onClick={() => { setActiveTab("copilot"); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-all text-xs font-medium ${
                      activeTab === "copilot" 
                        ? (theme === "dark" ? "bg-white/10 text-white font-semibold" : "bg-slate-200/75 text-slate-900 font-semibold")
                        : (theme === "dark" ? "text-zinc-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-black hover:bg-slate-100")
                    }`}
                  >
                    <Bot className="w-4 h-4" />
                    <span>AI Assistant</span>
                  </button>

                  <button 
                    onClick={() => { setActiveTab("documents"); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-all text-xs font-medium ${
                      activeTab === "documents" 
                        ? (theme === "dark" ? "bg-white/10 text-white font-semibold" : "bg-slate-200/75 text-slate-900 font-semibold")
                        : (theme === "dark" ? "text-zinc-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-black hover:bg-slate-100")
                    }`}
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>Documents</span>
                  </button>

                  <button 
                    onClick={() => { setActiveTab("ledger"); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-all text-xs font-medium ${
                      activeTab === "ledger" 
                        ? (theme === "dark" ? "bg-white/10 text-white font-semibold" : "bg-slate-200/75 text-slate-900 font-semibold")
                        : (theme === "dark" ? "text-zinc-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-black hover:bg-slate-100")
                    }`}
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span>Daily Ledger</span>
                  </button>
                </div>

                {/* GROUP 2 */}
                <div className="space-y-1">
                  <p className={`text-[9px] uppercase font-bold tracking-widest px-3 mb-2 ${
                    theme === "dark" ? "text-zinc-500" : "text-slate-500"
                  }`}>Business Engines</p>

                  <button 
                    onClick={() => { setActiveTab("customers"); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-all text-xs font-medium ${
                      activeTab === "customers" 
                        ? (theme === "dark" ? "bg-white/10 text-white font-semibold" : "bg-slate-200/75 text-slate-900 font-semibold")
                        : (theme === "dark" ? "text-zinc-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-black hover:bg-slate-100")
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Customers</span>
                  </button>

                  <button 
                    onClick={() => { setActiveTab("payments"); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-all text-xs font-medium ${
                      activeTab === "payments" 
                        ? (theme === "dark" ? "bg-white/10 text-white font-semibold" : "bg-slate-200/75 text-slate-900 font-semibold")
                        : (theme === "dark" ? "text-zinc-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-black hover:bg-slate-100")
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Payments</span>
                  </button>

                  <button 
                    onClick={() => { setActiveTab("inventory"); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-all text-xs font-medium ${
                      activeTab === "inventory" 
                        ? (theme === "dark" ? "bg-white/10 text-white font-semibold" : "bg-slate-200/75 text-slate-900 font-semibold")
                        : (theme === "dark" ? "text-zinc-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-black hover:bg-slate-100")
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    <span>Inventory</span>
                  </button>
                </div>

                {/* GROUP 3 */}
                <div className="space-y-1">
                  <p className={`text-[9px] uppercase font-bold tracking-widest px-3 mb-2 ${
                    theme === "dark" ? "text-zinc-500" : "text-slate-500"
                  }`}>Tools</p>

                  <button 
                    onClick={() => { setActiveTab("voice"); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-all text-xs font-medium ${
                      activeTab === "voice" 
                        ? (theme === "dark" ? "bg-white/10 text-white font-semibold" : "bg-slate-200/75 text-slate-900 font-semibold")
                        : (theme === "dark" ? "text-zinc-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-black hover:bg-slate-100")
                    }`}
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>AI Calling Agent</span>
                  </button>

                  <button 
                    onClick={() => { setActiveTab("settings"); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-all text-xs font-medium ${
                      activeTab === "settings" 
                        ? (theme === "dark" ? "bg-white/10 text-white font-semibold" : "bg-slate-200/75 text-slate-900 font-semibold")
                        : (theme === "dark" ? "text-zinc-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-black hover:bg-slate-100")
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Theme permanently configured as dark */}

            {/* Mobile Profile Footer */}
            <div className={`p-4 border-t flex items-center justify-between gap-3 shrink-0 ${
              theme === "dark" ? "border-zinc-800 bg-[#06070a]" : "border-slate-200 bg-slate-100"
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                  {(currentUser?.name || "User").split(" ").map(w => w[0]).join("").substring(0,2)}
                </div>
                <div>
                  <p className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{currentUser?.name}</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate max-w-[120px]">{currentUser?.email}</p>
                </div>
              </div>
              <button 
                title="Sign out"
                onClick={handleSignOut}
                className={`p-1.5 rounded-lg transition-colors ${
                  theme === "dark" ? "text-zinc-400 hover:text-white hover:bg-white/5" : "text-slate-500 hover:text-black hover:bg-slate-200"
                }`}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 1. Desktop Left Sidebar Navigation */}
      <aside className={`w-64 border-r flex flex-col justify-between shrink-0 h-full hidden lg:flex transition-colors duration-200 ${
        theme === "dark" 
          ? "bg-[#090a0f] border-zinc-800/80 text-zinc-100" 
          : "bg-[#fafafa] border-slate-200/80 text-slate-900"
      }`}>
        <div className="flex flex-col flex-1 overflow-y-auto">
          
          {/* Vercel-style Top Switcher Header */}
          <div className={`px-4 py-3 border-b flex items-center justify-between ${
            theme === "dark" ? "border-zinc-800/60" : "border-slate-200"
          }`}>
            <div className="flex items-center gap-2.5 w-full min-w-0">
              <div className="w-7 h-7 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-sm shrink-0">
                ▲
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <select 
                  value={activeOrgId}
                  onChange={(e) => setActiveOrgId(e.target.value)}
                  className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer w-full text-slate-900 dark:text-slate-100 font-display truncate"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id} className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-slate-100 text-xs">
                      {org.name}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold tracking-wide flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Pro Trial
                </span>
              </div>
            </div>
          </div>

          {/* Vercel Search bar mock */}
          <div className="px-4 py-3">
            <div className={`flex items-center justify-between gap-2 border rounded-lg px-2.5 py-1.5 w-full ${
              theme === "dark" ? "bg-zinc-900/40 border-zinc-800/80" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="Find..." 
                  className="bg-transparent text-xs focus:outline-none w-full text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-zinc-500"
                />
              </div>
              <span className={`text-[9px] font-mono px-1 py-0.5 rounded border leading-none ${
                theme === "dark" ? "text-zinc-500 bg-zinc-800 border-zinc-700" : "text-slate-400 bg-slate-100 border-slate-200"
              }`}>F</span>
            </div>
          </div>

          {/* Navigation Items grouped */}
          <div className="px-4 py-4 space-y-6">
            
            {/* GROUP 1 */}
            <div className="space-y-1">
              <p className={`text-[9px] uppercase font-bold tracking-widest px-3 mb-2 ${
                theme === "dark" ? "text-zinc-500" : "text-slate-500"
              }`}>Core Insights</p>
              
              <button 
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-all text-xs font-medium ${
                  activeTab === "dashboard" 
                    ? (theme === "dark" ? "bg-white/10 text-white font-semibold" : "bg-slate-200/75 text-slate-900 font-semibold")
                    : (theme === "dark" ? "text-zinc-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-black hover:bg-slate-100")
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button 
                onClick={() => setActiveTab("copilot")}
                className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-all text-xs font-medium ${
                  activeTab === "copilot" 
                    ? (theme === "dark" ? "bg-white/10 text-white font-semibold" : "bg-slate-200/75 text-slate-900 font-semibold")
                    : (theme === "dark" ? "text-zinc-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-black hover:bg-slate-100")
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>AI Assistant</span>
              </button>

              <button 
                onClick={() => setActiveTab("documents")}
                className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-all text-xs font-medium ${
                  activeTab === "documents" 
                    ? (theme === "dark" ? "bg-white/10 text-white font-semibold" : "bg-slate-200/75 text-slate-900 font-semibold")
                    : (theme === "dark" ? "text-zinc-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-black hover:bg-slate-100")
                }`}
              >
                <FolderOpen className="w-4 h-4" />
                <span>Documents</span>
              </button>

              <button 
                onClick={() => setActiveTab("ledger")}
                className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-all text-xs font-medium ${
                  activeTab === "ledger" 
                    ? (theme === "dark" ? "bg-white/10 text-white font-semibold" : "bg-slate-200/75 text-slate-900 font-semibold")
                    : (theme === "dark" ? "text-zinc-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-black hover:bg-slate-100")
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>Daily Ledger</span>
              </button>
            </div>

            {/* GROUP 2 */}
            <div className="space-y-1">
              <p className={`text-[9px] uppercase font-bold tracking-widest px-3 mb-2 ${
                theme === "dark" ? "text-zinc-500" : "text-slate-500"
              }`}>Business Engines</p>

              <button 
                onClick={() => setActiveTab("customers")}
                className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-all text-xs font-medium ${
                  activeTab === "customers" 
                    ? (theme === "dark" ? "bg-white/10 text-white font-semibold" : "bg-slate-200/75 text-slate-900 font-semibold")
                    : (theme === "dark" ? "text-zinc-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-black hover:bg-slate-100")
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Customers</span>
              </button>

              <button 
                onClick={() => setActiveTab("payments")}
                className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-all text-xs font-medium ${
                  activeTab === "payments" 
                    ? (theme === "dark" ? "bg-white/10 text-white font-semibold" : "bg-slate-200/75 text-slate-900 font-semibold")
                    : (theme === "dark" ? "text-zinc-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-black hover:bg-slate-100")
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Payments</span>
              </button>

              <button 
                onClick={() => setActiveTab("inventory")}
                className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-all text-xs font-medium ${
                  activeTab === "inventory" 
                    ? (theme === "dark" ? "bg-white/10 text-white font-semibold" : "bg-slate-200/75 text-slate-900 font-semibold")
                    : (theme === "dark" ? "text-zinc-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-black hover:bg-slate-100")
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Inventory</span>
              </button>
            </div>

            {/* GROUP 3 */}
            <div className="space-y-1">
              <p className={`text-[9px] uppercase font-bold tracking-widest px-3 mb-2 ${
                theme === "dark" ? "text-zinc-500" : "text-slate-500"
              }`}>Tools</p>

              <button 
                onClick={() => setActiveTab("voice")}
                className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-all text-xs font-medium ${
                  activeTab === "voice" 
                    ? (theme === "dark" ? "bg-white/10 text-white font-semibold" : "bg-slate-200/75 text-slate-900 font-semibold")
                    : (theme === "dark" ? "text-zinc-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-black hover:bg-slate-100")
                }`}
              >
                <PhoneCall className="w-4 h-4" />
                <span>AI Calling Agent</span>
              </button>

              <button 
                onClick={() => setActiveTab("settings")}
                className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-all text-xs font-medium ${
                  activeTab === "settings" 
                    ? (theme === "dark" ? "bg-white/10 text-white font-semibold" : "bg-slate-200/75 text-slate-900 font-semibold")
                    : (theme === "dark" ? "text-zinc-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-black hover:bg-slate-100")
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>

          </div>
        </div>

        {/* Theme permanently configured as dark */}

        {/* Sidebar Footer: Profile Widget (Dynamic Logged In User) */}
        <div className={`p-4 border-t flex items-center justify-between gap-3 shrink-0 ${
          theme === "dark" ? "border-zinc-800 bg-[#06070a]" : "border-slate-200 bg-slate-50"
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-xs uppercase">
              {(currentUser?.name || "User").split(" ").map(w => w[0]).join("").substring(0,2)}
            </div>
            <div>
              <p className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{currentUser?.name}</p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate max-w-[120px]">{currentUser?.email}</p>
            </div>
          </div>
          <button 
            title="Sign out"
            className={`p-1.5 rounded-lg transition-all ${
              theme === "dark" ? "text-zinc-400 hover:text-white hover:bg-white/5" : "text-slate-500 hover:text-black hover:bg-slate-200"
            }`}
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </aside>

      {/* 2. Main Viewport Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header Controls Bar */}
        <header className={`h-16 border-b backdrop-blur px-4 sm:px-8 flex items-center justify-between shrink-0 gap-4 transition-colors duration-200 ${
          theme === "dark" 
            ? "bg-[#000000]/80 border-zinc-800/80" 
            : "bg-white/80 border-slate-200"
        }`}>
          
          <div className="flex items-center gap-3">
            {/* Hamburger trigger for mobile */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className={`p-2 border rounded-xl lg:hidden ${
                theme === "dark" ? "text-zinc-400 hover:text-white bg-zinc-900 border-zinc-800" : "text-slate-600 hover:text-black bg-slate-100 border-slate-200"
              }`}
              aria-label="Open sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-1.5 lg:hidden">
              <span className="font-bold text-sm text-blue-500">▲</span>
              <span className={`text-xs font-extrabold tracking-wider uppercase font-display ${theme === "dark" ? "text-white" : "text-slate-950"}`}>Nexus</span>
            </div>

            {/* Topbar Left: Page Title Indicator instead of duplicate search */}
            <div className="hidden sm:flex items-center gap-2 font-mono text-xs">
              <span className="text-slate-400 dark:text-zinc-500">projects</span>
              <span className="text-slate-300 dark:text-zinc-700">/</span>
              <span className="font-semibold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">{activeTab}</span>
            </div>
          </div>

          {/* Topbar Right: Controls & Active Workspace indicator */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Speed Status indicator (just like the Vercel Speed Insights screen) */}
            <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
              theme === "dark" ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              All Systems Operational
            </div>

            {/* Active Workspace / Org Indicator */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${
              theme === "dark" ? "bg-zinc-900 border border-zinc-800 text-zinc-100" : "bg-white border border-slate-200 text-slate-800"
            }`}>
              <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="max-w-[120px] truncate">{currentOrg?.name || "Sharma Electronics"}</span>
            </div>

            {/* Notification Bell */}
            <button className={`relative p-2 border rounded-xl transition-all ${
              theme === "dark" ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-black"
            }`}>
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span>
            </button>

             {/* Settings Icon */}
            <button 
              onClick={() => setActiveTab("settings")}
              className={`hidden sm:block p-2 border rounded-xl transition-all ${
                activeTab === "settings"
                  ? "bg-blue-600 border-blue-500 text-white"
                  : theme === "dark" ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-black"
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>

          </div>
        </header>

        {/* Workspace Live Main Panel */}
        <main className="flex-1 p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto">
          
          {/* Welcome greeting dashboard block (only on Dashboard tab) */}
          {activeTab === "dashboard" && (
            <div className="space-y-1 animate-in fade-in duration-200">
              <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2 ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}>
                Good Morning, {(currentUser?.name || "User").split(" ")[0]}! <span className="animate-bounce">👋</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                Here's what's happening with <span className="text-blue-500 dark:text-blue-400 font-semibold">{currentOrg?.name || "Sharma Electronics"}</span> today.
              </p>
            </div>
          )}

          {/* Active Tab rendering router with slide transitions */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="h-full"
              >
                {activeTab === "dashboard" && currentOrg && (
                  <DashboardStats 
                    currentOrg={currentOrg}
                    inventory={inventory}
                    invoices={invoices}
                    onTriggerHealthTune={handleTriggerHealthTune}
                    onRefreshData={fetchTenantData}
                    theme={theme}
                  />
                )}

                {activeTab === "copilot" && (
                  <CopilotRag 
                    documents={documents}
                    chatHistory={chatHistory}
                    onUploadFile={handleUploadFile}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoadingChat}
                    theme={theme}
                  />
                )}

                {activeTab === "documents" && (
                  <DocumentManager 
                    documents={documents}
                    onUploadFile={handleUploadFile}
                    onDeleteDocument={handleDeleteDocument}
                    theme={theme}
                    onSwitchToLedger={() => setActiveTab("ledger")}
                  />
                )}

                {activeTab === "ledger" && (
                  <DailyLedger 
                    theme={theme}
                    activeOrgId={activeOrgId}
                  />
                )}

                {activeTab === "customers" && (
                  <CustomerManager 
                    customers={customers}
                    onAddCustomer={handleAddCustomer}
                    theme={theme}
                  />
                )}

                {activeTab === "payments" && (
                  <InvoiceManager 
                    invoices={invoices}
                    onAddInvoice={handleAddInvoice}
                    onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
                    onTriggerStripeLink={handleTriggerStripeLink}
                    theme={theme}
                  />
                )}

                {activeTab === "inventory" && (
                  <InventoryManager 
                    inventory={inventory}
                    onAddItem={handleAddItem}
                    onUpdateItem={handleUpdateItem}
                    onDeleteItem={handleDeleteItem}
                  />
                )}

                {activeTab === "voice" && (
                  <VoiceAgent 
                    customers={customers}
                    invoices={invoices}
                    callLogs={callLogs}
                    onTriggerCall={handleTriggerCall}
                    isLoading={isRefreshing}
                    theme={theme}
                  />
                )}

                {activeTab === "settings" && (
                  <SettingsPanel 
                    theme={theme}
                    currentUser={currentUser}
                    onUpdateUser={setCurrentUser}
                    activeOrgId={activeOrgId}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

        </main>

        {/* Small footer */}
        <footer className="border-t border-white/5 py-4 px-8 flex items-center justify-between text-[11px] text-gray-500 font-mono shrink-0">
          <p>© 2026 Nexus AI SaaS ERP Business Operating System.</p>
          <p className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-500 animate-pulse" />
            Designed with Premium Cosmic Dark Layout & Interactive Panels
          </p>
        </footer>

      </div>

    </div>
  );
}
