import React, { useState } from "react";
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  Trash2, 
  Edit3, 
  X, 
  ChevronDown,
  Percent,
  TrendingUp,
  Tag
} from "lucide-react";
import { InventoryItem } from "../types";

interface InventoryManagerProps {
  inventory: InventoryItem[];
  onAddItem: (item: Omit<InventoryItem, "id" | "orgId">) => void;
  onUpdateItem: (id: string, updates: Partial<InventoryItem>) => void;
  onDeleteItem: (id: string) => void;
}

export default function InventoryManager({
  inventory,
  onAddItem,
  onUpdateItem,
  onDeleteItem
}: InventoryManagerProps) {
  const [search, setSearch] = useState("");
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // New Item Form State
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState("");
  const [minStock, setMinStock] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || !price) return;
    onAddItem({
      name,
      sku: sku.toUpperCase(),
      stock: Number(stock) || 0,
      minStock: Number(minStock) || 0,
      price: Number(price) || 0,
    });
    // Reset Form
    setName("");
    setSku("");
    setStock("");
    setMinStock("");
    setPrice("");
    setIsAdding(false);
  };

  const handleStartEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setName(item.name);
    setSku(item.sku);
    setStock(String(item.stock));
    setMinStock(String(item.minStock));
    setPrice(String(item.price));
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    onUpdateItem(editingItem.id, {
      name,
      sku: sku.toUpperCase(),
      stock: Number(stock) || 0,
      minStock: Number(minStock) || 0,
      price: Number(price) || 0,
    });
    setEditingItem(null);
    setName("");
    setSku("");
    setStock("");
    setMinStock("");
    setPrice("");
  };

  // Filter items
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesLowStock = !filterLowStock || (item.stock <= item.minStock);
    return matchesSearch && matchesLowStock;
  });

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10" id="inventory_manager">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-400" />
            Inventory Hub
          </h2>
          <p className="text-xs text-gray-400">Isolated physical asset tracking and levels control</p>
        </div>

        <button 
          onClick={() => {
            setEditingItem(null);
            setIsAdding(!isAdding);
          }}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-display text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isAdding ? "Close Panel" : "Register New Asset"}
        </button>
      </div>

      {/* Forms Drawer */}
      {(isAdding || editingItem) && (
        <form 
          onSubmit={editingItem ? handleSubmitEdit : handleSubmitAdd}
          className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200"
          id="inventory_form"
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-400 font-display">
            {editingItem ? `Modify Asset: ${editingItem.name}` : "Asset Enrollment Form"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Asset Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                placeholder="Enterprise Module" 
                required
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">SKU Code</label>
              <input 
                type="text" 
                value={sku} 
                onChange={e => setSku(e.target.value)}
                placeholder="NEX-NODE-PRO" 
                required
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Current Stock</label>
              <input 
                type="number" 
                value={stock} 
                onChange={e => setStock(e.target.value)}
                placeholder="50" 
                required
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Restock Threshold</label>
              <input 
                type="number" 
                value={minStock} 
                onChange={e => setMinStock(e.target.value)}
                placeholder="10" 
                required
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Unit Price (₹)</label>
              <input 
                type="number" 
                value={price} 
                onChange={e => setPrice(e.target.value)}
                placeholder="1200" 
                required
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button 
              type="button" 
              onClick={() => {
                setIsAdding(false);
                setEditingItem(null);
              }}
              className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
            >
              {editingItem ? "Save Changes" : "Commit Record"}
            </button>
          </div>
        </form>
      )}

      {/* Control Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4" id="inventory_filters">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by Name or SKU..."
            className="w-full bg-black/30 border border-white/5 hover:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>

        <button 
          onClick={() => setFilterLowStock(!filterLowStock)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs transition-colors w-full sm:w-auto justify-center ${
            filterLowStock 
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" 
              : "bg-white/5 text-gray-300 border border-white/5 hover:bg-white/10"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          {filterLowStock ? "Showing Low Stock" : "All Stock Levels"}
        </button>
      </div>

      {/* Asset Table */}
      <div className="overflow-x-auto rounded-xl border border-white/5">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-white/5 text-gray-400 uppercase tracking-wider font-mono text-[10px] border-b border-white/5">
              <th className="p-4 font-semibold">Asset Detail</th>
              <th className="p-4 font-semibold">SKU Code</th>
              <th className="p-4 font-semibold">Unit Price</th>
              <th className="p-4 font-semibold text-center">Stock Levels</th>
              <th className="p-4 font-semibold text-center">Threshold</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredInventory.length > 0 ? (
              filteredInventory.map((item) => {
                const isLow = item.stock <= item.minStock;
                return (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isLow ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"}`}>
                          <Tag className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{item.name}</p>
                          {isLow && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 mt-0.5 font-mono animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              Critical Level Reached
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-gray-300 uppercase">{item.sku}</td>
                    <td className="p-4 font-mono text-gray-200 font-semibold">₹{item.price.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full font-mono font-bold ${
                        isLow ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {item.stock} Units
                      </span>
                    </td>
                    <td className="p-4 text-center font-mono text-gray-400">{item.minStock} Units</td>
                    <td className="p-4 text-right space-x-1.5">
                      <button 
                        onClick={() => handleStartEdit(item)}
                        title="Edit Record"
                        className="p-1.5 hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 rounded-lg transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDeleteItem(item.id)}
                        title="De-enroll Asset"
                        className="p-1.5 hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500 font-display">
                  No assets match current active query filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
