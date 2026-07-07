import React, { useState } from "react";
import { Users, Mail, Phone, Plus, UserPlus, Search, ShieldAlert } from "lucide-react";
import { Customer } from "../types";

interface CustomerManagerProps {
  customers: Customer[];
  onAddCustomer: (customer: Omit<Customer, "id" | "orgId" | "callsCount">) => Promise<void>;
}

export default function CustomerManager({ customers, onAddCustomer }: CustomerManagerProps) {
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
          <h2 className="text-xl font-bold font-display text-white tracking-tight flex items-center gap-2">
            <Users className="w-5.5 h-5.5 text-blue-400" />
            Customer Relations CRM
          </h2>
          <p className="text-xs text-gray-400">Integrated tenant account logs & live contact indices</p>
        </div>
        
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20"
        >
          <UserPlus className="w-4 h-4" />
          {showAddForm ? "Close Form" : "Add Customer"}
        </button>
      </div>

      {/* Add Contact Modal / Section */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4 max-w-xl animate-in fade-in-50 duration-200">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <UserPlus className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Register New Customer</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Full Name</label>
              <input 
                type="text" 
                required
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Patel" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Email Address</label>
              <input 
                type="email" 
                required
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. ramesh@patel.in" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Phone Number</label>
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 99887 76655" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Account Standing</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
              >
                <option value="Active Partner" className="bg-gray-950 text-white">Active Partner</option>
                <option value="Payment Overdue Risk" className="bg-gray-950 text-white">Payment Overdue Risk</option>
                <option value="Lead" className="bg-gray-950 text-white">Prospect Lead</option>
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
      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 max-w-md">
        <Search className="w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers by name, phone or email..."
          className="bg-transparent text-xs text-white focus:outline-none w-full"
        />
      </div>

      {/* CRM Database list */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden" id="customer_crm_table">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-[10px] font-mono uppercase tracking-wider text-gray-400">
                <th className="p-4">Customer Contact</th>
                <th className="p-4">Phone / Communication</th>
                <th className="p-4 text-center">AI Interactions</th>
                <th className="p-4">Status Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-gray-300">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500 font-medium">
                    No matching contacts in current workspace CRM index.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-white text-sm">{cust.name}</p>
                        <p className="text-gray-400 text-[11px] flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-blue-400/80" />
                          {cust.email}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-mono text-gray-200 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        {cust.phone}
                      </p>
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-blue-400 text-sm">
                      {cust.callsCount} calls
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold ${
                        cust.status.includes("Overdue") || cust.status.includes("Risk")
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : cust.status.includes("Active")
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
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
