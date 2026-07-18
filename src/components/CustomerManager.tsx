import React, { useState } from "react";
import { Users, Mail, Phone, Plus, UserPlus, Search, ShieldAlert } from "lucide-react";
import { Customer } from "../types";

interface CustomerManagerProps {
  customers: Customer[];
  onAddCustomer: (customer: Omit<Customer, "id" | "orgId" | "callsCount">) => Promise<void>;
  theme?: "light" | "dark";
}

export default function CustomerManager({ customers, onAddCustomer, theme = "dark" }: CustomerManagerProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("Active Partner");
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    await onAddCustomer({ name, email, phone, status });
    setName("");
    setEmail("");
    setPhone("");
    setStatus("Active Partner");
    setShowAddForm(false);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6" id="customer_manager_panel">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-bold font-display tracking-tight flex items-center gap-2 ${
            theme === "dark" ? "text-white" : "text-slate-900"
          }`}>
            <Users className="w-5.5 h-5.5 text-blue-400" />
            Customer Relations CRM
          </h2>
          <p className={`text-xs ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>
            Integrated tenant account logs & live contact indices
          </p>
        </div>
        
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <UserPlus className="w-4 h-4" />
          {showAddForm ? "Close Form" : "Add Customer"}
        </button>
      </div>

      {/* Add Contact Modal / Section */}
      {showAddForm && (
        <form 
          onSubmit={handleSubmit} 
          className={`p-5 rounded-2xl border space-y-4 max-w-xl animate-in fade-in-50 duration-200 transition-all ${
            theme === "dark" 
              ? "bg-zinc-950/80 border-zinc-800/80" 
              : "bg-white border-slate-200/80 shadow-md"
          }`}
        >
          <div className={`flex items-center gap-2 border-b pb-3 ${
            theme === "dark" ? "border-zinc-800/60" : "border-slate-100"
          }`}>
            <UserPlus className="w-4 h-4 text-blue-400" />
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${
              theme === "dark" ? "text-white" : "text-slate-800"
            }`}>Register New Customer</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={`text-[10px] uppercase font-mono tracking-wider ${
                theme === "dark" ? "text-zinc-400" : "text-slate-500"
              }`}>Full Name</label>
              <input 
                type="text" 
                required
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Patel" 
                className={`w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500/50 ${
                  theme === "dark"
                    ? "bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600"
                    : "bg-slate-50 border-slate-250 text-slate-800 placeholder-slate-400"
                }`}
              />
            </div>
            
            <div className="space-y-1">
              <label className={`text-[10px] uppercase font-mono tracking-wider ${
                theme === "dark" ? "text-zinc-400" : "text-slate-500"
              }`}>Email Address</label>
              <input 
                type="email" 
                required
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. ramesh@patel.in" 
                className={`w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500/50 ${
                  theme === "dark"
                    ? "bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600"
                    : "bg-slate-50 border-slate-250 text-slate-800 placeholder-slate-400"
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className={`text-[10px] uppercase font-mono tracking-wider ${
                theme === "dark" ? "text-zinc-400" : "text-slate-500"
              }`}>Phone Number</label>
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 99887 76655" 
                className={`w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500/50 ${
                  theme === "dark"
                    ? "bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600"
                    : "bg-slate-50 border-slate-250 text-slate-800 placeholder-slate-400"
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className={`text-[10px] uppercase font-mono tracking-wider ${
                theme === "dark" ? "text-zinc-400" : "text-slate-500"
              }`}>Account Standing</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500/50 ${
                  theme === "dark"
                    ? "bg-zinc-900 border-zinc-800 text-white"
                    : "bg-slate-50 border-slate-250 text-slate-800"
                }`}
              >
                <option value="Active Partner" className={theme === "dark" ? "bg-zinc-950 text-white" : "bg-white text-slate-900"}>Active Partner</option>
                <option value="Payment Overdue Risk" className={theme === "dark" ? "bg-zinc-950 text-white" : "bg-white text-slate-900"}>Payment Overdue Risk</option>
                <option value="Lead" className={theme === "dark" ? "bg-zinc-950 text-white" : "bg-white text-slate-900"}>Prospect Lead</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors"
            >
              Confirm Registration
            </button>
          </div>
        </form>
      )}

      {/* Filter and search */}
      <div className={`flex items-center gap-3 border rounded-xl px-3.5 py-2.5 max-w-md transition-all ${
        theme === "dark"
          ? "bg-zinc-900/30 border-zinc-800"
          : "bg-white border-slate-200 shadow-xs"
      }`}>
        <Search className={`w-4 h-4 ${theme === "dark" ? "text-zinc-500" : "text-slate-400"}`} />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers by name, phone or email..."
          className={`bg-transparent text-xs focus:outline-none w-full ${
            theme === "dark" ? "text-white placeholder-zinc-650" : "text-slate-800 placeholder-slate-400"
          }`}
        />
      </div>

      {/* CRM Database list */}
      <div className={`rounded-2xl border overflow-hidden transition-all ${
        theme === "dark" 
          ? "bg-zinc-950/80 border-zinc-800/80" 
          : "bg-white border-slate-200/80 shadow-sm"
      }`} id="customer_crm_table">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[10px] font-mono uppercase tracking-wider ${
                theme === "dark"
                  ? "border-zinc-800/60 bg-zinc-900/20 text-zinc-400"
                  : "border-slate-100 bg-slate-50/50 text-slate-500 font-bold"
              }`}>
                <th className="p-4">Customer Contact</th>
                <th className="p-4">Phone / Communication</th>
                <th className="p-4 text-center">AI Interactions</th>
                <th className="p-4">Status Standing</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-xs ${
              theme === "dark" 
                ? "divide-zinc-800/60 text-zinc-300" 
                : "divide-slate-100 text-slate-700"
            }`}>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500 font-medium">
                    No matching contacts in current workspace CRM index.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className={`transition-colors ${
                    theme === "dark" ? "hover:bg-zinc-900/20" : "hover:bg-slate-50/50"
                  }`}>
                    <td className="p-4">
                      <div>
                        <p className={`font-semibold text-sm ${theme === "dark" ? "text-white" : "text-slate-800"}`}>{cust.name}</p>
                        <p className={`text-[11px] flex items-center gap-1 mt-0.5 ${
                          theme === "dark" ? "text-zinc-400" : "text-slate-500"
                        }`}>
                          <Mail className="w-3 h-3 text-blue-400/80" />
                          {cust.email}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className={`font-mono flex items-center gap-1.5 ${theme === "dark" ? "text-zinc-200" : "text-slate-700"}`}>
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        {cust.phone}
                      </p>
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-blue-500 text-sm">
                      {cust.callsCount} calls
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold ${
                        cust.status.includes("Overdue") || cust.status.includes("Risk")
                          ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                          : cust.status.includes("Active")
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                      }`}>
                        {cust.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
