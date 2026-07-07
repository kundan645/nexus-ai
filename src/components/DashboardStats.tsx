import React, { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  IndianRupee, 
  Package, 
  Activity, 
  Sparkles, 
  ArrowUpRight,
  AlertTriangle,
  RotateCw,
  CreditCard,
  Users,
  ShoppingCart,
  Heart,
  Calendar,
  ChevronDown,
  Monitor,
  Smartphone,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Info
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { Organization, InventoryItem, Invoice } from "../types";

interface DashboardStatsProps {
  currentOrg: Organization;
  inventory: InventoryItem[];
  invoices: Invoice[];
  onTriggerHealthTune: () => void;
  theme?: "light" | "dark";
}

export default function DashboardStats({ 
  currentOrg, 
  inventory, 
  invoices,
  onTriggerHealthTune,
  theme = "dark"
}: DashboardStatsProps) {
  
  const [activeSubTab, setActiveSubTab] = useState<"business" | "speed_insights">("business");
  const [chartView, setChartView] = useState<"revenue" | "profit" | "expenses">("revenue");
  
  // Speed Insights States
  const [deviceFilter, setDeviceFilter] = useState<"desktop" | "mobile">("desktop");
  const [envFilter, setEnvFilter] = useState<"production" | "development">("production");
  const [insightTimeframe, setInsightTimeframe] = useState<"7d" | "30d" | "all">("7d");
  const [metricTab, setMetricTab] = useState<"needs_improvement" | "poor" | "great">("needs_improvement");

  // Read metric fields or fallback to default seeded Lakh values
  const todaySales = currentOrg.todaySales ?? 146000;
  const todaySalesGrowth = currentOrg.todaySalesGrowth ?? 12.5;
  const revenueThisMonth = currentOrg.revenueThisMonth ?? 2892000;
  const revenueGrowth = currentOrg.revenueGrowth ?? 8.2;
  const profit = currentOrg.profit ?? 868000;
  const profitGrowth = currentOrg.profitGrowth ?? 15.3;
  const pendingPayments = currentOrg.pendingPayments ?? 356000;
  const pendingPaymentsGrowth = currentOrg.pendingPaymentsGrowth ?? -5.1;
  const totalCustomers = currentOrg.totalCustomers ?? 248;
  const totalCustomersGrowth = currentOrg.totalCustomersGrowth ?? "+32 this month";
  const ordersToday = currentOrg.ordersToday ?? 47;
  const ordersTodayGrowth = currentOrg.ordersTodayGrowth ?? 18.4;

  const currentHealthScore = currentOrg.healthScore ?? 72;

  // Format dynamic Lakh values (e.g. 146000 -> 1.46L)
  const formatLakhValue = (num: number) => {
    if (num >= 100000) {
      const lakhs = num / 100000;
      return `₹${lakhs.toFixed(2)}L`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // Sample historical data in Lakh units matching Org and chart views
  const isNexus = currentOrg.id === "org-nexus";

  const chartData = [
    { month: "Jan", revenue: isNexus ? 18.5 : 8.5, profit: isNexus ? 5.2 : 2.1, expenses: isNexus ? 13.3 : 6.4 },
    { month: "Feb", revenue: isNexus ? 22.4 : 9.2, profit: isNexus ? 6.8 : 2.6, expenses: isNexus ? 15.6 : 6.6 },
    { month: "Mar", revenue: isNexus ? 20.1 : 7.8, profit: isNexus ? 6.1 : 2.0, expenses: isNexus ? 14.0 : 5.8 },
    { month: "Apr", revenue: isNexus ? 25.8 : 11.4, profit: isNexus ? 7.9 : 3.2, expenses: isNexus ? 17.9 : 8.2 },
    { month: "May", revenue: isNexus ? 31.2 : 13.5, profit: isNexus ? 9.4 : 3.8, expenses: isNexus ? 21.8 : 9.7 },
    { month: "Jun", revenue: isNexus ? (revenueThisMonth / 100000) : 12.4, profit: isNexus ? (profit / 100000) : 3.15, expenses: isNexus ? 20.24 : 9.25 },
  ];

  // Speed Insights score timeline mock matching the selected filters
  const speedInsightsTimeline = [
    { date: "Jul 01", score: deviceFilter === "desktop" ? 68 : 61 },
    { date: "Jul 02", score: deviceFilter === "desktop" ? 70 : 62 },
    { date: "Jul 03", score: deviceFilter === "desktop" ? 72 : 60 },
    { date: "Jul 04", score: deviceFilter === "desktop" ? 71 : 63 },
    { date: "Jul 05", score: deviceFilter === "desktop" ? 75 : 66 },
    { date: "Jul 06", score: deviceFilter === "desktop" ? 73 : 64 },
    { date: "Jul 07", score: deviceFilter === "desktop" ? currentHealthScore : currentHealthScore - 8 },
  ];

  const getHealthColor = (score: number) => {
    if (score >= 90) return "stroke-emerald-500 text-emerald-500";
    if (score >= 60) return "stroke-amber-500 text-amber-500";
    return "stroke-rose-500 text-rose-500";
  };

  const getHealthBg = (score: number) => {
    if (score >= 90) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (score >= 60) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-rose-500/10 text-rose-500 border-rose-500/20";
  };

  return (
    <div className="space-y-6" id="dashboard_stats_panel">
      
      {/* Vercel-style Tab Toggle Bar */}
      <div className={`flex items-center justify-between border-b pb-1 ${
        theme === "dark" ? "border-zinc-800" : "border-slate-200"
      }`}>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setActiveSubTab("business")}
            className={`pb-3 text-xs sm:text-sm font-semibold relative transition-all ${
              activeSubTab === "business" 
                ? (theme === "dark" ? "text-white" : "text-slate-900")
                : "text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300"
            }`}
          >
            Business Standings
            {activeSubTab === "business" && (
              <span className={`absolute bottom-0 left-0 right-0 h-[2px] ${theme === "dark" ? "bg-white" : "bg-black"}`} />
            )}
          </button>
          
          <button 
            onClick={() => setActiveSubTab("speed_insights")}
            className={`pb-3 text-xs sm:text-sm font-semibold relative transition-all flex items-center gap-1.5 ${
              activeSubTab === "speed_insights" 
                ? (theme === "dark" ? "text-white" : "text-slate-900")
                : "text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300"
            }`}
          >
            Speed Insights
            <span className="px-1.5 py-0.25 text-[9px] bg-blue-500 text-white rounded font-bold animate-pulse">
              LIVE
            </span>
            {activeSubTab === "speed_insights" && (
              <span className={`absolute bottom-0 left-0 right-0 h-[2px] ${theme === "dark" ? "bg-white" : "bg-black"}`} />
            )}
          </button>
        </div>

        {/* Action Button */}
        {activeSubTab === "business" && (
          <button 
            onClick={onTriggerHealthTune}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              theme === "dark" 
                ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800" 
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            Recalculate Stats
          </button>
        )}
      </div>

      {/* ==================== VIEW 1: BUSINESS STANDINGS ==================== */}
      {activeSubTab === "business" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            
            {/* Card 1: Today's Sales */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between min-h-[125px] transition-all ${
              theme === "dark" 
                ? "bg-zinc-950/80 border-zinc-800/80" 
                : "bg-white border-slate-100 shadow-xs"
            }`}>
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Today's Sales</span>
                <div className="flex items-center gap-0.5 text-[10px] text-emerald-500 font-bold bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">
                  ↗ +{todaySalesGrowth}%
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-2xl font-extrabold font-display tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                  {formatLakhValue(todaySales)}
                </span>
              </div>
            </div>

            {/* Card 2: Monthly Revenue */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between min-h-[125px] transition-all ${
              theme === "dark" 
                ? "bg-zinc-950/80 border-zinc-800/80" 
                : "bg-white border-slate-100 shadow-xs"
            }`}>
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Monthly Revenue</span>
                <div className="flex items-center gap-0.5 text-[10px] text-emerald-500 font-bold bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">
                  ↗ +{revenueGrowth}%
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-2xl font-extrabold font-display tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                  {formatLakhValue(revenueThisMonth)}
                </span>
              </div>
            </div>

            {/* Card 3: Profit */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between min-h-[125px] transition-all ${
              theme === "dark" 
                ? "bg-zinc-950/80 border-zinc-800/80" 
                : "bg-white border-slate-100 shadow-xs"
            }`}>
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Profit Pool</span>
                <div className="flex items-center gap-0.5 text-[10px] text-emerald-500 font-bold bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">
                  ↗ +{profitGrowth}%
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-2xl font-extrabold font-display tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                  {formatLakhValue(profit)}
                </span>
              </div>
            </div>

            {/* Card 4: Pending Payments */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between min-h-[125px] transition-all ${
              theme === "dark" 
                ? "bg-zinc-950/80 border-zinc-800/80" 
                : "bg-white border-slate-100 shadow-xs"
            }`}>
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Pending Payments</span>
                <div className="flex items-center gap-0.5 text-[10px] text-rose-500 font-bold bg-rose-500/5 px-1.5 py-0.5 rounded border border-rose-500/10">
                  ↘ {pendingPaymentsGrowth}%
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-2xl font-extrabold font-display tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                  {formatLakhValue(pendingPayments)}
                </span>
              </div>
            </div>

            {/* Card 5: Total Customers */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between min-h-[125px] transition-all ${
              theme === "dark" 
                ? "bg-zinc-950/80 border-zinc-800/80" 
                : "bg-white border-slate-100 shadow-xs"
            }`}>
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Registered Customers</span>
                <div className="flex items-center gap-0.5 text-[10px] text-blue-500 font-bold bg-blue-500/5 px-1.5 py-0.5 rounded border border-blue-500/10">
                  {totalCustomersGrowth}
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-2xl font-extrabold font-display tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                  {totalCustomers}
                </span>
              </div>
            </div>

            {/* Card 6: Orders Today */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between min-h-[125px] transition-all ${
              theme === "dark" 
                ? "bg-zinc-950/80 border-zinc-800/80" 
                : "bg-white border-slate-100 shadow-xs"
            }`}>
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Orders Received</span>
                <div className="flex items-center gap-0.5 text-[10px] text-emerald-500 font-bold bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">
                  ↗ +{ordersTodayGrowth}%
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-2xl font-extrabold font-display tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                  {ordersToday}
                </span>
              </div>
            </div>

          </div>

          {/* Graphs / Metrics Split Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 8 Columns: Revenue Overview Area Chart */}
            <div className={`lg:col-span-8 p-6 rounded-2xl border ${
              theme === "dark" ? "bg-zinc-950/80 border-zinc-800/80" : "bg-white border-slate-100 shadow-xs"
            }`} id="revenue_chart_container">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h4 className={`text-sm font-semibold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                    Financial Standing Charts
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500">Historical analysis in Lakh scale</p>
                </div>
                
                {/* Chart Views Toggle buttons */}
                <div className={`flex items-center p-1 rounded-lg border text-[11px] font-semibold ${
                  theme === "dark" ? "bg-zinc-900 border-zinc-800 text-zinc-400" : "bg-slate-100 border-slate-200 text-slate-600"
                }`}>
                  <button 
                    onClick={() => setChartView("revenue")}
                    className={`px-3 py-1 rounded-md transition-all ${chartView === "revenue" ? (theme === "dark" ? "bg-zinc-800 text-white" : "bg-white text-slate-950 shadow-xs") : "hover:text-slate-800 dark:hover:text-white"}`}
                  >
                    Revenue
                  </button>
                  <button 
                    onClick={() => setChartView("profit")}
                    className={`px-3 py-1 rounded-md transition-all ${chartView === "profit" ? (theme === "dark" ? "bg-zinc-800 text-white" : "bg-white text-slate-950 shadow-xs") : "hover:text-slate-800 dark:hover:text-white"}`}
                  >
                    Profit
                  </button>
                  <button 
                    onClick={() => setChartView("expenses")}
                    className={`px-3 py-1 rounded-md transition-all ${chartView === "expenses" ? (theme === "dark" ? "bg-zinc-800 text-white" : "bg-white text-slate-950 shadow-xs") : "hover:text-slate-800 dark:hover:text-white"}`}
                  >
                    Expenses
                  </button>
                </div>
              </div>

              {/* Area Chart with dynamic values and custom YAxis Lakh formatter */}
              <div className="h-64 w-full" id="revenue_chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={theme === "dark" ? 0.2 : 0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.03)"} vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      stroke={theme === "dark" ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.4)"} 
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke={theme === "dark" ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.4)"} 
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `${val}L`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: theme === "dark" ? "#121318" : "#ffffff",
                        borderColor: theme === "dark" ? "#27272a" : "#e2e8f0",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: theme === "dark" ? "#f4f4f5" : "#0f172a"
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey={chartView} 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorMetric)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right 4 Columns: Business Health Score Gauge */}
            <div className={`lg:col-span-4 p-6 rounded-2xl border flex flex-col items-center justify-between relative ${
              theme === "dark" ? "bg-zinc-950/80 border-zinc-800/80" : "bg-white border-slate-100 shadow-xs"
            }`} id="health_gauge_panel">
              <div className="absolute top-4 right-4">
                <button 
                  onClick={onTriggerHealthTune}
                  title="Recalculate Integrity"
                  className={`p-1.5 rounded-lg transition-colors ${
                    theme === "dark" ? "bg-white/5 hover:bg-white/10 text-zinc-400" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-col items-center gap-1.5 w-full text-center">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
                <h4 className={`text-sm font-semibold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                  System Health Score
                </h4>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500">Global health of organization parameters</p>
              </div>

              <div className="relative w-36 h-36 flex items-center justify-center mt-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="38" 
                    className={`${theme === "dark" ? "stroke-zinc-800" : "stroke-slate-100"} fill-none`}
                    strokeWidth="8"
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="38" 
                    className={`fill-none transition-all duration-1000 ${getHealthColor(currentHealthScore)}`}
                    strokeWidth="8"
                    strokeDasharray="238.7"
                    strokeDashoffset={238.7 - (238.7 * currentHealthScore) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className={`text-3xl font-extrabold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-950"}`}>{currentHealthScore}%</span>
                </div>
              </div>

              <div className="text-center w-full mt-6">
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${getHealthBg(currentHealthScore)}`}>
                  {currentHealthScore >= 90 ? "Excellent Standing" : "Needs Tuning"}
                </span>
                
                <div className={`grid grid-cols-2 gap-4 mt-6 border-t pt-4 text-center font-mono text-[11px] ${
                  theme === "dark" ? "border-zinc-800/80" : "border-slate-100"
                }`}>
                  <div>
                    <div className="text-slate-400 dark:text-zinc-500 uppercase text-[9px] font-bold">API Connectors</div>
                    <div className="font-semibold text-emerald-500 mt-0.5">SECURE</div>
                  </div>
                  <div>
                    <div className="text-slate-400 dark:text-zinc-500 uppercase text-[9px] font-bold">Invoices integrity</div>
                    <div className={`font-semibold mt-0.5 ${theme === "dark" ? "text-white" : "text-slate-800"}`}>VERIFIED</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ==================== VIEW 2: VERCEL SPEED INSIGHTS OVERHAUL ==================== */}
      {activeSubTab === "speed_insights" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Top Control Bar: Desktop/Mobile Selector, Env, Timeframe */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Device Tabs */}
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded-lg border flex items-center gap-1 ${
                theme === "dark" ? "bg-zinc-950 border-zinc-800/80" : "bg-slate-100 border-slate-200"
              }`}>
                <button 
                  onClick={() => setDeviceFilter("desktop")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    deviceFilter === "desktop"
                      ? (theme === "dark" ? "bg-zinc-800 text-white" : "bg-white text-slate-950 shadow-xs")
                      : "text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  Desktop
                </button>
                <button 
                  onClick={() => setDeviceFilter("mobile")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    deviceFilter === "mobile"
                      ? (theme === "dark" ? "bg-zinc-800 text-white" : "bg-white text-slate-950 shadow-xs")
                      : "text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  Mobile
                </button>
              </div>

              {/* Env select */}
              <select
                value={envFilter}
                onChange={(e: any) => setEnvFilter(e.target.value)}
                className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border focus:outline-none cursor-pointer ${
                  theme === "dark" 
                    ? "bg-zinc-900 border-zinc-800 text-zinc-300" 
                    : "bg-white border-slate-200 text-slate-700"
                }`}
              >
                <option value="production">Production</option>
                <option value="development">Development</option>
              </select>
            </div>

            {/* Timeframe calendar bar */}
            <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-lg text-xs font-semibold ${
              theme === "dark" ? "bg-zinc-900 border-zinc-800 text-zinc-300" : "bg-white border-slate-200 text-slate-700"
            }`}>
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>Last 7 Days</span>
              <ChevronDown className="w-3.5 h-3.5 ml-1 text-slate-400" />
            </div>

          </div>

          {/* Vercel Speed Insights Main Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Column A: Score Gauge (Center-Left) */}
            <div className={`lg:col-span-4 p-6 rounded-2xl border flex flex-col justify-between ${
              theme === "dark" ? "bg-zinc-950/80 border-zinc-800/80" : "bg-white border-slate-100 shadow-xs"
            }`}>
              <div>
                <h4 className={`text-sm font-semibold tracking-tight ${theme === "dark" ? "text-zinc-100" : "text-slate-900"}`}>
                  Real Experience Score
                </h4>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                  Visits with clean layout, dynamic loading times and interactive responses
                </p>
              </div>

              {/* Circular Gauge Display */}
              <div className="flex flex-col items-center justify-center py-6">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      className={`${theme === "dark" ? "stroke-zinc-900" : "stroke-slate-100"} fill-none`}
                      strokeWidth="6"
                    />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      className={`fill-none transition-all duration-1000 ${getHealthColor(currentHealthScore)}`}
                      strokeWidth="6"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * currentHealthScore) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className={`text-4xl font-black tracking-tighter ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                      {currentHealthScore}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      / 100
                    </span>
                  </div>
                </div>

                <div className="text-center mt-4 space-y-1">
                  <span className={`text-xs font-bold ${
                    currentHealthScore >= 90 ? "text-emerald-500" : "text-amber-500"
                  }`}>
                    {currentHealthScore >= 90 ? "Optimal Standings" : "Needs Improvement"}
                  </span>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 max-w-[200px] mx-auto">
                    Below 90. Less than 75% of visits had a great experience.
                  </p>
                </div>
              </div>

              {/* Score Breakdown Footer */}
              <div className={`border-t pt-4 flex items-center justify-between text-[10px] font-mono ${
                theme === "dark" ? "border-zinc-900" : "border-slate-100"
              }`}>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-400 dark:text-zinc-500">Great (&gt;90)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-slate-400 dark:text-zinc-500">Improve (50-90)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span className="text-slate-400 dark:text-zinc-500">Poor (&lt;50)</span>
                </div>
              </div>

            </div>

            {/* Column B: Timeline Chart (Right) */}
            <div className={`lg:col-span-8 p-6 rounded-2xl border flex flex-col justify-between ${
              theme === "dark" ? "bg-zinc-950/80 border-zinc-800/80" : "bg-white border-slate-100 shadow-xs"
            }`}>
              
              <div className="flex justify-between items-start gap-4 mb-4">
                <div>
                  <h4 className={`text-sm font-semibold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                    Real Experience Score Over Time
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                    Calculated daily across {deviceFilter} visits
                  </p>
                </div>
                
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  theme === "dark" ? "bg-zinc-900 border-zinc-800 text-zinc-300" : "bg-slate-50 border-slate-200 text-slate-600"
                }`}>
                  p75 score
                </span>
              </div>

              {/* Area Chart with Target Reference Lines */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={speedInsightsTimeline} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={theme === "dark" ? 0.2 : 0.08}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.03)"} vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke={theme === "dark" ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.4)"} 
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke={theme === "dark" ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.4)"} 
                      fontSize={10}
                      domain={[0, 100]}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: theme === "dark" ? "#121318" : "#ffffff",
                        borderColor: theme === "dark" ? "#27272a" : "#e2e8f0",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: theme === "dark" ? "#f4f4f5" : "#0f172a"
                      }}
                    />
                    <ReferenceLine y={90} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Great', position: 'top', fill: '#10b981', fontSize: 9 }} />
                    <ReferenceLine y={50} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Poor', position: 'top', fill: '#f43f5e', fontSize: 9 }} />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#f59e0b" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#colorScore)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

            </div>

          </div>

          {/* Vercel-style Core Web Vitals Lists Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Vital Card 1: FCP & LCP */}
            <div className={`p-5 rounded-2xl border space-y-4 ${
              theme === "dark" ? "bg-zinc-950/80 border-zinc-800/80" : "bg-white border-slate-100 shadow-xs"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-tight uppercase font-mono text-amber-500">
                  Loading Experience
                </span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* FCP */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className={theme === "dark" ? "text-zinc-300" : "text-slate-800"}>First Contentful Paint (FCP)</span>
                  <span className="font-bold text-amber-500">4.14s</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "72%" }}></div>
                </div>
                <p className="text-[9px] text-slate-400 dark:text-zinc-500">Needs Improvement (p75 threshold is 1.8s)</p>
              </div>

              {/* LCP */}
              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className={theme === "dark" ? "text-zinc-300" : "text-slate-800"}>Largest Contentful Paint (LCP)</span>
                  <span className="font-bold text-amber-500">4.14s</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "65%" }}></div>
                </div>
                <p className="text-[9px] text-slate-400 dark:text-zinc-500">Needs Improvement (p75 threshold is 2.5s)</p>
              </div>
            </div>

            {/* Vital Card 2: INP & FID */}
            <div className={`p-5 rounded-2xl border space-y-4 ${
              theme === "dark" ? "bg-zinc-950/80 border-zinc-800/80" : "bg-white border-slate-100 shadow-xs"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-tight uppercase font-mono text-emerald-500">
                  Responsiveness
                </span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* INP */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className={theme === "dark" ? "text-zinc-300" : "text-slate-800"}>Interaction to Next Paint (INP)</span>
                  <span className="font-bold text-emerald-500">40ms</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "94%" }}></div>
                </div>
                <p className="text-[9px] text-slate-400 dark:text-zinc-500">Great (p75 threshold is 200ms)</p>
              </div>

              {/* FID */}
              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className={theme === "dark" ? "text-zinc-300" : "text-slate-800"}>First Input Delay (FID)</span>
                  <span className="font-bold text-emerald-500">20ms</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "98%" }}></div>
                </div>
                <p className="text-[9px] text-slate-400 dark:text-zinc-500">Great (p75 threshold is 100ms)</p>
              </div>
            </div>

            {/* Vital Card 3: CLS & TTFB */}
            <div className={`p-5 rounded-2xl border space-y-4 ${
              theme === "dark" ? "bg-zinc-950/80 border-zinc-800/80" : "bg-white border-slate-100 shadow-xs"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-tight uppercase font-mono text-emerald-500">
                  Visual Stability & TTFB
                </span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* CLS */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className={theme === "dark" ? "text-zinc-300" : "text-slate-800"}>Cumulative Layout Shift (CLS)</span>
                  <span className="font-bold text-emerald-500">0.00</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }}></div>
                </div>
                <p className="text-[9px] text-slate-400 dark:text-zinc-500">Great (p75 threshold is 0.1)</p>
              </div>

              {/* TTFB */}
              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className={theme === "dark" ? "text-zinc-300" : "text-slate-800"}>Time to First Byte (TTFB)</span>
                  <span className="font-bold text-amber-500">2.31s</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "68%" }}></div>
                </div>
                <p className="text-[9px] text-slate-400 dark:text-zinc-500">Needs Improvement (p75 threshold is 0.8s)</p>
              </div>
            </div>

          </div>

          {/* Vercel-style Path / Route Breakdown Table at the bottom */}
          <div className={`p-6 rounded-2xl border ${
            theme === "dark" ? "bg-zinc-950/80 border-zinc-800/80" : "bg-white border-slate-100 shadow-xs"
          }`}>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-2 border-b border-slate-100 dark:border-zinc-900">
              <div>
                <h4 className={`text-sm font-semibold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                  Routes & Paths Breakdown
                </h4>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500">Performance segmented by URL path</p>
              </div>

              {/* Path category tabs */}
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <button 
                  onClick={() => setMetricTab("needs_improvement")}
                  className={`px-2.5 py-1 rounded-md border transition-all ${
                    metricTab === "needs_improvement"
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/20 font-bold"
                      : "text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-zinc-300"
                  }`}
                >
                  Needs Improvement (3)
                </button>
                <button 
                  onClick={() => setMetricTab("poor")}
                  className={`px-2.5 py-1 rounded-md border transition-all ${
                    metricTab === "poor"
                      ? "bg-rose-500/10 text-rose-500 border-rose-500/20 font-bold"
                      : "text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-zinc-300"
                  }`}
                >
                  Poor (0)
                </button>
                <button 
                  onClick={() => setMetricTab("great")}
                  className={`px-2.5 py-1 rounded-md border transition-all ${
                    metricTab === "great"
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold"
                      : "text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-zinc-300"
                  }`}
                >
                  Great (2)
                </button>
              </div>
            </div>

            {/* List */}
            {metricTab === "needs_improvement" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 dark:text-zinc-500 border-b border-slate-100 dark:border-zinc-900 font-medium">
                      <th className="pb-2 font-semibold">PATH</th>
                      <th className="pb-2 font-semibold">SCORE</th>
                      <th className="pb-2 font-semibold text-right">WEIGHT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-900 font-medium">
                    <tr>
                      <td className={`py-3 font-mono text-[11px] ${theme === "dark" ? "text-zinc-300" : "text-slate-800"}`}>/</td>
                      <td className="py-3">
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold text-[10px]">72</span>
                      </td>
                      <td className="py-3 text-right text-slate-400 dark:text-zinc-500">100% of visits</td>
                    </tr>
                    <tr>
                      <td className={`py-3 font-mono text-[11px] ${theme === "dark" ? "text-zinc-300" : "text-slate-800"}`}>/payments</td>
                      <td className="py-3">
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold text-[10px]">76</span>
                      </td>
                      <td className="py-3 text-right text-slate-400 dark:text-zinc-500">25% of visits</td>
                    </tr>
                    <tr>
                      <td className={`py-3 font-mono text-[11px] ${theme === "dark" ? "text-zinc-300" : "text-slate-800"}`}>/copilot</td>
                      <td className="py-3">
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold text-[10px]">68</span>
                      </td>
                      <td className="py-3 text-right text-slate-400 dark:text-zinc-500">12% of visits</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {metricTab === "poor" && (
              <div className="py-6 text-center text-slate-400 dark:text-zinc-500 text-xs">
                🎉 Excellent! There are no URLs with poor scores (&lt;50).
              </div>
            )}

            {metricTab === "great" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 dark:text-zinc-500 border-b border-slate-100 dark:border-zinc-900 font-medium">
                      <th className="pb-2 font-semibold">PATH</th>
                      <th className="pb-2 font-semibold">SCORE</th>
                      <th className="pb-2 font-semibold text-right">WEIGHT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-900 font-medium">
                    <tr>
                      <td className={`py-3 font-mono text-[11px] ${theme === "dark" ? "text-zinc-300" : "text-slate-800"}`}>/inventory</td>
                      <td className="py-3">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold text-[10px]">92</span>
                      </td>
                      <td className="py-3 text-right text-slate-400 dark:text-zinc-500">40% of visits</td>
                    </tr>
                    <tr>
                      <td className={`py-3 font-mono text-[11px] ${theme === "dark" ? "text-zinc-300" : "text-slate-800"}`}>/customers</td>
                      <td className="py-3">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold text-[10px]">95</span>
                      </td>
                      <td className="py-3 text-right text-slate-400 dark:text-zinc-500">30% of visits</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
