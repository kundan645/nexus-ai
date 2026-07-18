import React, { useState, useEffect } from "react";
import { 
  Settings, User, Palette, Bell, Shield, Globe, Cpu, Link2, 
  HardDrive, RefreshCw, Monitor, Users, History, Zap, HelpCircle, 
  Info, Sparkles, CheckCircle2, AlertCircle, Save, Trash2, 
  Eye, EyeOff, ShieldAlert, Key, Plus, ChevronRight, Terminal,
  ExternalLink, Download, UploadCloud, Server, Wifi, Play, Search,
  Power, Database, Ban
} from "lucide-react";
import { 
  getSupabaseCredentials, 
  saveSupabaseOverride, 
  isSupabaseConfigured 
} from "../lib/supabase";

interface SettingsPanelProps {
  theme?: string;
  currentUser: { email: string; name: string; isSimulated: boolean } | null;
  onUpdateUser?: (user: { email: string; name: string; isSimulated: boolean }) => void;
  activeOrgId?: string;
}

type SubSection = 
  | "profile" | "appearance" | "notifications" | "security" | "language"
  | "ai" | "integrations" | "storage" | "backup" | "devices"
  | "users" | "logs" | "performance" | "help" | "about";

export default function SettingsPanel({ 
  theme = "dark", 
  currentUser, 
  onUpdateUser,
  activeOrgId = "org-nexus" 
}: SettingsPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubSection>("profile");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // States for Settings forms
  // 1. Profile
  const [profName, setProfName] = useState(currentUser?.name || "");
  const [profEmail, setProfEmail] = useState(currentUser?.email || "");
  const [profRole, setProfRole] = useState("Enterprise Administrator");
  const [avatarColor, setAvatarColor] = useState("from-blue-600 to-indigo-500");

  // 2. Appearance
  const [appTheme, setAppTheme] = useState("dark");
  const [accentColor, setAccentColor] = useState("blue");
  const [density, setDensity] = useState("standard");
  const [fontFamily, setFontFamily] = useState("sans");

  // 3. Notifications
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSound, setNotifSound] = useState(false);
  const [notifPush, setNotifPush] = useState(true);
  const [soundVolume, setSoundVolume] = useState(65);
  const [digestFreq, setDigestFreq] = useState("daily");

  // 4. Security
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionExpiry, setSessionExpiry] = useState("24h");
  const [showPwdFields, setShowPwdFields] = useState(false);

  // 5. Language
  const [sysLanguage, setSysLanguage] = useState("en");
  const [sysTimezone, setSysTimezone] = useState("IST (UTC+5:30)");
  const [currency, setCurrency] = useState("INR");

  // 6. AI Settings
  const [aiModel, setAiModel] = useState("gemini-2.5-flash");
  const [aiTemp, setAiTemp] = useState(0.3);
  const [contextLimit, setContextLimit] = useState(16000);
  const [systemPrompt, setSystemPrompt] = useState(
    "You are NovaOS Core, an elite multi-tenant enterprise system assistant with deep knowledge of Sharma Electronics."
  );

  // 7. Integrations (Supabase / Razorpay)
  const creds = getSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(creds.url);
  const [supabaseKey, setSupabaseKey] = useState(creds.anonKey);
  const [razorpayKeyId, setRazorpayKeyId] = useState(() => localStorage.getItem("override_razorpay_id") || "rzp_test_7fK82x9Lp1S");
  const [razorpaySecret, setRazorpaySecret] = useState(() => localStorage.getItem("override_razorpay_secret") || "••••••••••••••••••••");

  // 8. Storage stats
  const [storageLimit] = useState(500); // 500 MB simulated
  const [storageUsed, setStorageUsed] = useState(128.4); // 128.4 MB simulated

  // 9. Backup & Sync
  const [backupSchedule, setBackupSchedule] = useState("daily");
  const [autoSync, setAutoSync] = useState(true);

  // 10. Devices list (simulated)
  const [devices, setDevices] = useState([
    { id: "1", name: "Chrome on Windows 11 (Current Session)", ip: "103.45.201.2", location: "Mumbai, IN", active: true },
    { id: "2", name: "Safari on iPhone 15 Pro", ip: "192.168.1.104", location: "Pune, IN", active: false },
    { id: "3", name: "Nova Terminal (CLI Client)", ip: "13.233.109.41", location: "Bangalore, IN", active: false }
  ]);

  // 11. Users list (simulated)
  const [users, setUsers] = useState([
    { id: "u-1", name: currentUser?.name || "Amit Sharma", email: currentUser?.email || "admin@nova.ai", role: "Owner", status: "Active" },
    { id: "u-2", name: "Priya Patel", email: "priya@sharmaelectronics.com", role: "Billing Manager", status: "Active" },
    { id: "u-3", name: "Rohan Das", email: "rohan@sharmaelectronics.com", role: "Inventory Staff", status: "Inactive" }
  ]);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("Inventory Staff");

  // 12. Activity Log (Simulated dynamic list)
  const [logs, setLogs] = useState([
    { id: "log-1", event: "User Sign In", desc: `Successfully authenticated from ${devices[0].ip}`, time: "Today, 10:14 AM", badge: "info" },
    { id: "log-2", event: "Invoice Created", desc: "Generated invoice #INV-2026-004 for ₹12,500", time: "Today, 09:41 AM", badge: "success" },
    { id: "log-3", event: "Daily Ledger Synced", desc: "Stored daily buyer entry 'Priya Patel' into RAG", time: "Yesterday, 06:12 PM", badge: "success" },
    { id: "log-4", event: "Copilot RAG Query", desc: "System answered: 'What are Sharma Electronics top sell products?'", time: "Yesterday, 04:30 PM", badge: "ai" }
  ]);

  // 13. Performance stats
  const [cpuLoad, setCpuLoad] = useState(12);
  const [latency, setLatency] = useState(48);
  const [memUsage, setMemUsage] = useState(84.1);

  // Sync state if currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfName(currentUser.name);
      setProfEmail(currentUser.email);
    }
  }, [currentUser]);

  // Performance simulation ticks
  useEffect(() => {
    const timer = setInterval(() => {
      setCpuLoad(Math.floor(Math.random() * 15) + 8);
      setLatency(Math.floor(Math.random() * 20) + 38);
      setMemUsage(parseFloat((84.1 + (Math.random() * 0.4 - 0.2)).toFixed(2)));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const triggerNotification = (text: string, isError: boolean = false) => {
    if (isError) {
      setErrorMsg(text);
      setSuccessMsg("");
    } else {
      setSuccessMsg(text);
      setErrorMsg("");
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  // Submissions handlers
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profName.trim()) {
      triggerNotification("Profile name cannot be empty.", true);
      return;
    }
    if (onUpdateUser) {
      onUpdateUser({
        name: profName,
        email: profEmail,
        isSimulated: currentUser?.isSimulated ?? true
      });
    }
    triggerNotification("Profile details successfully updated!");
  };

  const handleSaveSupabaseIntegrations = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      saveSupabaseOverride(supabaseUrl, supabaseKey);
      
      // Store Razorpay override settings if provided
      if (razorpayKeyId) {
        localStorage.setItem("override_razorpay_id", razorpayKeyId);
      } else {
        localStorage.removeItem("override_razorpay_id");
      }
      if (razorpaySecret && razorpaySecret !== "••••••••••••••••••••") {
        localStorage.setItem("override_razorpay_secret", razorpaySecret);
      }

      const configuredNow = isSupabaseConfigured();
      if (configuredNow) {
        triggerNotification("Supabase & Razorpay API configurations updated and client re-initialized!");
      } else {
        triggerNotification("API parameters saved locally, sandbox system remains operational.");
      }
    } catch (err: any) {
      triggerNotification(`Failed to apply API rewrite: ${err.message}`, true);
    }
  };

  const handleAddSimulatedUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      triggerNotification("Please fill out both name and email.", true);
      return;
    }
    const newUser = {
      id: `u-${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      status: "Active"
    };
    setUsers([...users, newUser]);
    setNewUserName("");
    setNewUserEmail("");
    
    // Add log
    const newLog = {
      id: `log-${Date.now()}`,
      event: "User Added",
      desc: `Created new organization account for ${newUser.name} (${newUser.role})`,
      time: "Just Now",
      badge: "info"
    };
    setLogs([newLog, ...logs]);
    triggerNotification(`Successfully added ${newUserName} to the system!`);
  };

  const handleVacuumDatabase = () => {
    setStorageUsed(prev => Math.max(85.4, parseFloat((prev - 12.2).toFixed(1))));
    // Add log
    const newLog = {
      id: `log-${Date.now()}`,
      event: "Database Vacuumed",
      desc: "Cleared database junk cache files and optimized operational indexes",
      time: "Just Now",
      badge: "success"
    };
    setLogs([newLog, ...logs]);
    triggerNotification("System storage successfully vacuumed & temporary caches cleaned!");
  };

  const handleDownloadBackup = () => {
    const backupData = {
      orgId: activeOrgId,
      exportedAt: new Date().toISOString(),
      user: currentUser,
      databaseStats: { storageUsed, storageLimit },
      aiConfig: { aiModel, aiTemp, systemPrompt }
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nova-backup-${activeOrgId}-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    triggerNotification("Database backup manifest compiled and downloaded!");
  };

  const subTabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "language", label: "Language", icon: Globe },
    { id: "ai", label: "AI Settings", icon: Cpu },
    { id: "integrations", label: "Integrations", icon: Link2 },
    { id: "storage", label: "Storage", icon: HardDrive },
    { id: "backup", label: "Backup & Sync", icon: RefreshCw },
    { id: "devices", label: "Devices", icon: Monitor },
    { id: "users", label: "Users (Admin)", icon: Users },
    { id: "logs", label: "Activity Log", icon: History },
    { id: "performance", label: "Performance", icon: Zap },
    { id: "help", label: "Help", icon: HelpCircle },
    { id: "about", label: "About", icon: Info },
  ] as const;

  return (
    <div className="space-y-6" id="settings_panel_viewport">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className={`text-xl font-bold font-display tracking-tight flex items-center gap-2 ${
            theme === "dark" ? "text-white" : "text-slate-900"
          }`}>
            <Settings className="w-5.5 h-5.5 text-blue-400" />
            NovaOS System Settings
          </h2>
          <p className="text-xs text-zinc-400">
            Configure system rules, enterprise integrations, credentials, profile aesthetics, and security permissions.
          </p>
        </div>

        {/* Global Feedback Banners */}
        <div className="flex items-center gap-2">
          {successMsg && (
            <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs flex items-center gap-1.5 animate-fade-in">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Container Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Subnavigation Sidebar: 15 items */}
        <div className={`lg:col-span-3 p-3 rounded-2xl border ${
          theme === "dark" ? "bg-zinc-950/80 border-zinc-800/80" : "bg-white border-slate-200"
        } max-h-[580px] overflow-y-auto custom-scrollbar`} id="settings_sub_navigation">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-3 pb-2 mb-2 border-b border-zinc-900">
            System Subsections
          </p>
          <div className="space-y-1">
            {subTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveSubTab(tab.id);
                    setErrorMsg("");
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-medium transition-all ${
                    isActive 
                      ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/10"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-zinc-400 group-hover:text-white"}`} />
                    <span>{tab.label}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 opacity-50 ${isActive ? "text-white" : "text-zinc-500"}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active Panel Content */}
        <div className={`lg:col-span-9 p-6 rounded-2xl border min-h-[500px] flex flex-col justify-between ${
          theme === "dark" ? "bg-zinc-950/80 border-zinc-800/80" : "bg-white border-slate-200"
        }`} id="settings_active_viewport">
          
          <div className="space-y-6">
            
            {/* 1. PROFILE SECTION */}
            {activeSubTab === "profile" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-zinc-900 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-400" />
                    👤 User Profile Configuration
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Manage your administrator login identity, display name, email, and visual avatars.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                  <div className="flex items-center gap-4 py-2">
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-tr ${avatarColor} flex items-center justify-center text-lg font-black text-white shadow-xl uppercase`}>
                      {profName.split(" ").map(w => w[0]).join("").substring(0,2)}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white">Avatar Presets</p>
                      <div className="flex items-center gap-1.5">
                        {[
                          "from-blue-600 to-indigo-500",
                          "from-emerald-500 to-teal-600",
                          "from-rose-500 to-orange-500",
                          "from-violet-600 to-purple-500"
                        ].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setAvatarColor(preset)}
                            className={`w-5 h-5 rounded-full bg-gradient-to-tr ${preset} border-2 ${
                              avatarColor === preset ? "border-white" : "border-transparent"
                            } cursor-pointer hover:scale-110 transition-transform`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Display Full Name</label>
                      <input 
                        type="text"
                        required
                        value={profName}
                        onChange={(e) => setProfName(e.target.value)}
                        className="w-full text-xs rounded-xl p-2.5 border border-zinc-850 bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Email Address</label>
                      <input 
                        type="email"
                        required
                        value={profEmail}
                        onChange={(e) => setProfEmail(e.target.value)}
                        className="w-full text-xs rounded-xl p-2.5 border border-zinc-850 bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Enterprise System Role</label>
                    <input 
                      type="text"
                      disabled
                      value={profRole}
                      className="w-full text-xs rounded-xl p-2.5 border border-zinc-850 bg-zinc-900/40 text-zinc-400 cursor-not-allowed"
                    />
                    <p className="text-[9px] text-zinc-500 mt-1">Your administrator status is derived dynamically from Supabase database claims.</p>
                  </div>

                  <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/10 cursor-pointer flex items-center gap-1.5 active:scale-98 transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Profile Changes
                  </button>
                </form>
              </div>
            )}

            {/* 2. APPEARANCE SECTION */}
            {activeSubTab === "appearance" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-zinc-900 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Palette className="w-4 h-4 text-blue-400" />
                    🎨 Appearance & Themes
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Customize the theme, accent palettes, typography, and density of NovaOS's dashboard grid.
                  </p>
                </div>

                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-2">Display Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "dark", label: "Midnight Dark", desc: "Pure dark mode" },
                        { id: "light", label: "Clean Light", desc: "Light theme", disabled: true },
                        { id: "cyber", label: "Cyber Terminal", desc: "Neon green & amber", disabled: true }
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          disabled={t.disabled}
                          onClick={() => setAppTheme(t.id)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            appTheme === t.id 
                              ? "bg-blue-600/10 border-blue-500/50 text-white" 
                              : t.disabled 
                                ? "opacity-40 cursor-not-allowed border-zinc-900 bg-zinc-950"
                                : "bg-zinc-900 border-zinc-850 hover:bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          <p className="text-xs font-bold">{t.label}</p>
                          <p className="text-[9px] text-zinc-500 mt-0.5">{t.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-2">Primary Accent Color</label>
                    <div className="flex items-center gap-2">
                      {[
                        { id: "blue", class: "bg-blue-500" },
                        { id: "emerald", class: "bg-emerald-500" },
                        { id: "indigo", class: "bg-indigo-500" },
                        { id: "rose", class: "bg-rose-500" },
                        { id: "amber", class: "bg-amber-500" }
                      ].map((color) => (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => setAccentColor(color.id)}
                          className={`w-7 h-7 rounded-full ${color.class} border-2 ${
                            accentColor === color.id ? "border-white scale-110" : "border-transparent"
                          } cursor-pointer hover:scale-105 transition-all`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-2">Workspace Density</label>
                    <div className="grid grid-cols-3 gap-3">
                      {["compact", "standard", "spacious"].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDensity(d)}
                          className={`py-2 px-3 text-xs rounded-xl border capitalize cursor-pointer transition-all ${
                            density === d 
                              ? "bg-zinc-800 border-zinc-700 text-white font-semibold" 
                              : "bg-zinc-900 border-zinc-850 text-zinc-400 hover:bg-zinc-800/50"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. NOTIFICATIONS SECTION */}
            {activeSubTab === "notifications" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-zinc-900 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-400" />
                    🔔 Notification Preferences
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Control which operational events trigger sound effects, web notifications, or automated email summaries.
                  </p>
                </div>

                <div className="space-y-4 max-w-lg">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl">
                      <div>
                        <p className="text-xs font-bold text-white">Daily Ledger Activity Summary</p>
                        <p className="text-[9px] text-zinc-500">Receive an automatic end-of-day digest of daily invoice revenue</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={notifEmail}
                        onChange={(e) => setNotifEmail(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-zinc-900 border-zinc-800"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl">
                      <div>
                        <p className="text-xs font-bold text-white">Critical Alerts & Security Notifications</p>
                        <p className="text-[9px] text-zinc-500">Enable standard browser push alerts for anomalous events</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={notifPush}
                        onChange={(e) => setNotifPush(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-zinc-900 border-zinc-800"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl">
                      <div>
                        <p className="text-xs font-bold text-white">Payment Portal Audio Indicators</p>
                        <p className="text-[9px] text-zinc-500">Play an audible register chime when a customer invoice is paid successfully</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={notifSound}
                        onChange={(e) => setNotifSound(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-zinc-900 border-zinc-800"
                      />
                    </div>
                  </div>

                  {notifSound && (
                    <div className="space-y-1.5 animate-in slide-in-from-top-1">
                      <div className="flex justify-between text-[10px] text-zinc-500 font-mono font-bold">
                        <span>Chime Sound Volume</span>
                        <span>{soundVolume}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={soundVolume}
                        onChange={(e) => setSoundVolume(Number(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1.5">Digest Report Schedule</label>
                    <select
                      value={digestFreq}
                      onChange={(e) => setDigestFreq(e.target.value)}
                      className="w-full text-xs rounded-xl p-2.5 border border-zinc-850 bg-zinc-900 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="hourly">Hourly Batch Logs</option>
                      <option value="daily">Daily Shop Digest</option>
                      <option value="weekly">Weekly Ledger Analytics</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 4. SECURITY SECTION */}
            {activeSubTab === "security" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-zinc-900 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    🔒 Security & Token Lifetimes
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Audit security parameters, reset passwords, or enable Two-Factor authentication.
                  </p>
                </div>

                <div className="space-y-4 max-w-lg">
                  <div className="p-4 rounded-xl border border-blue-500/10 bg-blue-500/5 text-xs text-blue-400 leading-relaxed flex items-start gap-2.5">
                    <Shield className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <strong>Cryptographic Security Statement:</strong> Account security credentials and password assertions are stored in heavily hashed PBKDF2/scrypt schemas in the production database.
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setShowPwdFields(!showPwdFields)}
                      className="w-full flex items-center justify-between p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl hover:bg-zinc-900/50 transition-all text-xs text-left"
                    >
                      <div>
                        <p className="font-bold text-white">Reset Account Password</p>
                        <p className="text-[9px] text-zinc-500">Initiate an override for current password credentials</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-zinc-500 transform transition-transform ${showPwdFields ? "rotate-90" : ""}`} />
                    </button>

                    {showPwdFields && (
                      <div className="p-4 border border-zinc-900 bg-zinc-950 rounded-xl space-y-3 animate-in slide-in-from-top-1">
                        <div>
                          <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1">Current Password</label>
                          <input 
                            type="password" 
                            placeholder="••••••••"
                            value={currentPwd}
                            onChange={(e) => setCurrentPwd(e.target.value)}
                            className="w-full text-xs rounded-xl p-2 border border-zinc-850 bg-zinc-900 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1">New Password</label>
                          <input 
                            type="password" 
                            placeholder="••••••••"
                            value={newPwd}
                            onChange={(e) => setNewPwd(e.target.value)}
                            className="w-full text-xs rounded-xl p-2 border border-zinc-850 bg-zinc-900 text-white"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!currentPwd || !newPwd) {
                              triggerNotification("Please fill in both fields.", true);
                              return;
                            }
                            setCurrentPwd("");
                            setNewPwd("");
                            setShowPwdFields(false);
                            triggerNotification("Password successfully updated in credentials database.");
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                        >
                          Submit Password Change
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl">
                      <div>
                        <p className="text-xs font-bold text-white">Two-Factor Authentication (2FA)</p>
                        <p className="text-[9px] text-zinc-500">Require an authenticator app code on login</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={twoFactor}
                        onChange={(e) => setTwoFactor(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-zinc-900 border-zinc-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Inactivity Session Timeout</label>
                      <select
                        value={sessionExpiry}
                        onChange={(e) => setSessionExpiry(e.target.value)}
                        className="w-full text-xs rounded-xl p-2.5 border border-zinc-850 bg-zinc-900 text-white focus:outline-none"
                      >
                        <option value="1h">1 Hour (High Security)</option>
                        <option value="24h">24 Hours (Standard)</option>
                        <option value="7d">7 Days (Continuous)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. LANGUAGE SECTION */}
            {activeSubTab === "language" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-zinc-900 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    🌐 Localization & Currency Rules
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Configure the language locale and native billing currency for customer invoices.
                  </p>
                </div>

                <div className="space-y-4 max-w-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Workspace Language</label>
                      <select
                        value={sysLanguage}
                        onChange={(e) => setSysLanguage(e.target.value)}
                        className="w-full text-xs rounded-xl p-2.5 border border-zinc-850 bg-zinc-900 text-white focus:outline-none"
                      >
                        <option value="en">English (US/UK)</option>
                        <option value="hi">हिंदी (India)</option>
                        <option value="es">Español (Spain)</option>
                        <option value="ja">日本語 (Japanese)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Billing Currency Code</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full text-xs rounded-xl p-2.5 border border-zinc-850 bg-zinc-900 text-white focus:outline-none"
                      >
                        <option value="INR">INR (₹) Rupees</option>
                        <option value="USD">USD ($) Dollars</option>
                        <option value="EUR">EUR (€) Euros</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Workspace Timezone</label>
                    <select
                      value={sysTimezone}
                      onChange={(e) => setSysTimezone(e.target.value)}
                      className="w-full text-xs rounded-xl p-2.5 border border-zinc-850 bg-zinc-900 text-white focus:outline-none"
                    >
                      <option value="IST (UTC+5:30)">Indian Standard Time (IST - UTC+5:30)</option>
                      <option value="EST (UTC-5:00)">Eastern Standard Time (EST - UTC-5:00)</option>
                      <option value="GMT (UTC+0:00)">Greenwich Mean Time (GMT - UTC+0:00)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 6. AI SETTINGS SECTION */}
            {activeSubTab === "ai" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-zinc-900 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-400" />
                    🤖 Gemini LLM Configurator & RAG Params
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Manage the default temperature thresholds, system contexts, and search parameters for the Copilot AI.
                  </p>
                </div>

                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1.5">Gemini Foundation Model</label>
                    <select
                      value={aiModel}
                      onChange={(e) => setAiModel(e.target.value)}
                      className="w-full text-xs rounded-xl p-2.5 border border-zinc-850 bg-zinc-900 text-white focus:outline-none"
                    >
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ultra-Fast RAG Reasoning)</option>
                      <option value="gemini-2.5-pro">Gemini 2.5 Pro (Enterprise Coding & Planning)</option>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash (Legacy Model)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-[10px] text-zinc-500 font-mono font-bold mb-1">
                        <span>Creative Temperature</span>
                        <span>{aiTemp}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.1"
                        value={aiTemp}
                        onChange={(e) => setAiTemp(Number(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Max Dynamic Token Limit</label>
                      <input 
                        type="number"
                        value={contextLimit}
                        onChange={(e) => setContextLimit(Number(e.target.value))}
                        className="w-full text-xs rounded-xl p-2 border border-zinc-850 bg-zinc-900 text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Static AI System Instruction Context</label>
                    <textarea 
                      rows={3}
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      className="w-full text-xs rounded-xl p-2.5 border border-zinc-850 bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <p className="text-[9px] text-zinc-500 mt-1">This prompt permanently bootstraps every query evaluated by our vector search loop.</p>
                  </div>
                </div>
              </div>
            )}

            {/* 7. INTEGRATIONS (CRITICAL FOR KEY REWRITING) */}
            {activeSubTab === "integrations" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-zinc-900 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-blue-400" />
                    🔗 Supabase API Credentials & Client Setup
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Rewrite or save your project's active Supabase URL, Anon Key, and Razorpay billing identifiers.
                  </p>
                </div>

                <form onSubmit={handleSaveSupabaseIntegrations} className="space-y-4 max-w-lg">
                  <div className="p-3.5 bg-zinc-950 border border-zinc-900 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-emerald-500/10 text-emerald-400 rounded-lg">
                        <Database className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-white">Active Database Connection Status</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <div className={`w-2 h-2 rounded-full ${isSupabaseConfigured() ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                      <span className={isSupabaseConfigured() ? "text-emerald-400 font-semibold" : "text-amber-500"}>
                        {isSupabaseConfigured() ? "Connected & Synchronized" : "Local Sandbox Offline Mode"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">VITE_SUPABASE_URL</label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. https://xyz.supabase.co"
                        value={supabaseUrl}
                        onChange={(e) => setSupabaseUrl(e.target.value)}
                        className="w-full text-xs font-mono rounded-xl p-2.5 border border-zinc-850 bg-zinc-900 text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">VITE_SUPABASE_ANON_KEY</label>
                      <input 
                        type="password"
                        required
                        placeholder="eyJhbGciOiJIUzI1NiIs..."
                        value={supabaseKey}
                        onChange={(e) => setSupabaseKey(e.target.value)}
                        className="w-full text-xs font-mono rounded-xl p-2.5 border border-zinc-850 bg-zinc-900 text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">RAZORPAY_KEY_ID (TEST)</label>
                        <input 
                          type="text"
                          placeholder="rzp_test_..."
                          value={razorpayKeyId}
                          onChange={(e) => setRazorpayKeyId(e.target.value)}
                          className="w-full text-xs font-mono rounded-xl p-2.5 border border-zinc-850 bg-zinc-900 text-white placeholder-zinc-700 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">RAZORPAY_SECRET</label>
                        <input 
                          type="password"
                          placeholder="Secret Webhook Chime"
                          value={razorpaySecret}
                          onChange={(e) => setRazorpaySecret(e.target.value)}
                          className="w-full text-xs font-mono rounded-xl p-2.5 border border-zinc-850 bg-zinc-900 text-white placeholder-zinc-700 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button 
                      type="submit"
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/10 cursor-pointer flex items-center gap-1.5 active:scale-98 transition-all"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Rewrite & Sync API Credentials
                    </button>

                    {(supabaseUrl || supabaseKey) && (
                      <button 
                        type="button"
                        onClick={() => {
                          setSupabaseUrl("");
                          setSupabaseKey("");
                          saveSupabaseOverride("", "");
                          triggerNotification("Supabase overrides removed. Reverting to local fallback.");
                        }}
                        className="px-4 py-2.5 bg-zinc-900 hover:bg-rose-950/40 text-rose-400 border border-zinc-850 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                      >
                        Clear Overrides
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* 8. STORAGE SECTION */}
            {activeSubTab === "storage" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-zinc-900 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-blue-400" />
                    💾 Workspace Storage Utilization
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Monitor your database allocation, guideline document caches, and invoice log volumes.
                  </p>
                </div>

                <div className="space-y-5 max-w-lg">
                  {/* Gauge indicator */}
                  <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/30 space-y-3">
                    <div className="flex justify-between text-xs font-semibold text-white">
                      <span>Total Allocated File Storage</span>
                      <span className="font-mono">{storageUsed} MB / {storageLimit} MB</span>
                    </div>
                    
                    <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${(storageUsed / storageLimit) * 100}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                      <span>Percentage Used: {((storageUsed / storageLimit) * 100).toFixed(1)}%</span>
                      <span>Estimated Nodes Remaining: ~3,400</span>
                    </div>
                  </div>

                  {/* Storage breakdown details */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Storage Distribution</h4>
                    {[
                      { type: "Document RAG Indexes", size: "74.1 MB", files: "14 vectors" },
                      { type: "Invoice Ledgers Cache", size: "32.4 MB", files: "41 records" },
                      { type: "Simulated Logs Repository", size: "21.9 MB", files: "1,204 logs" }
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between items-center p-2.5 rounded-lg border border-zinc-900/50 bg-zinc-950/40 text-xs">
                        <span className="text-zinc-300 font-medium">{row.type}</span>
                        <div className="flex items-center gap-2 font-mono text-zinc-500 text-[11px]">
                          <span>{row.files}</span>
                          <span className="text-zinc-400 font-bold">{row.size}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleVacuumDatabase}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white hover:text-white rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
                    Clean Temporary Cache (Vacuum)
                  </button>
                </div>
              </div>
            )}

            {/* 9. BACKUP & SYNC SECTION */}
            {activeSubTab === "backup" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-zinc-900 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-blue-400" />
                    📁 Backup Manifests & Recovery
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Compile a download of your customer databases, inventory caches, and system states.
                  </p>
                </div>

                <div className="space-y-4 max-w-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Automated Backup Frequency</label>
                      <select
                        value={backupSchedule}
                        onChange={(e) => setBackupSchedule(e.target.value)}
                        className="w-full text-xs rounded-xl p-2.5 border border-zinc-850 bg-zinc-900 text-white focus:outline-none"
                      >
                        <option value="hourly">Hourly Cloud Sync</option>
                        <option value="daily">Daily Cron Backup</option>
                        <option value="weekly">Weekly Export</option>
                      </select>
                    </div>

                    <div className="flex flex-col justify-end">
                      <div className="flex items-center gap-2 p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl">
                        <input 
                          type="checkbox" 
                          checked={autoSync}
                          onChange={(e) => setAutoSync(e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-zinc-900 border-zinc-800"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">Enable Realtime Sync</p>
                          <p className="text-[9px] text-zinc-500">Auto-push entries</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 space-y-3">
                    <h4 className="text-xs font-bold text-zinc-300">Trigger Immediate Snapshot</h4>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">
                      Download a fully portable system state file. You can load this backup file to recover your ledger configuration instantly.
                    </p>
                    
                    <button
                      type="button"
                      onClick={handleDownloadBackup}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/10 cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export Database Snapshot
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 10. DEVICES SECTION */}
            {activeSubTab === "devices" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-zinc-900 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-blue-400" />
                    📱 Active Devices & Sessions
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Manage the logged-in devices currently holding access authorizations to your organization workspace.
                  </p>
                </div>

                <div className="space-y-4 max-w-xl">
                  <div className="space-y-2">
                    {devices.map((dev) => (
                      <div key={dev.id} className="p-3 rounded-xl border border-zinc-900 bg-zinc-950/40 flex items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${dev.active ? "bg-blue-500/10 text-blue-400" : "bg-zinc-900 text-zinc-500"}`}>
                            <Monitor className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-white">{dev.name}</p>
                            <p className="text-[9px] text-zinc-500 font-mono mt-0.5">{dev.ip} • {dev.location}</p>
                          </div>
                        </div>

                        {dev.active ? (
                          <span className="text-[8px] font-bold tracking-wider font-mono px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                            CURRENT
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setDevices(devices.filter(d => d.id !== dev.id));
                              triggerNotification("Terminated access session for device.");
                            }}
                            className="px-2.5 py-1 hover:bg-rose-500/10 border border-zinc-850 hover:border-rose-500/20 text-zinc-400 hover:text-rose-400 text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 11. USERS (ADMIN) */}
            {activeSubTab === "users" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-zinc-900 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    👥 Organization User Management
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Assign access levels, invite staff, or view permissions across the multi-tenant electronic ledger.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left: list of active users */}
                  <div className="md:col-span-7 space-y-2">
                    <h4 className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Active Organization Staff</h4>
                    <div className="space-y-2">
                      {users.map((u) => (
                        <div key={u.id} className="p-3 rounded-xl border border-zinc-900 bg-zinc-950/40 flex items-center justify-between text-xs gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-white truncate">{u.name}</p>
                              <span className="text-[8px] font-bold font-mono px-1 bg-zinc-800 text-zinc-400 rounded">
                                {u.role}
                              </span>
                            </div>
                            <p className="text-[9px] text-zinc-500 truncate font-mono mt-0.5">{u.email}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[9px] font-mono text-emerald-400">{u.status}</span>
                            {u.role !== "Owner" && (
                              <button
                                onClick={() => {
                                  setUsers(users.filter(x => x.id !== u.id));
                                  triggerNotification(`Revoked access for user: ${u.name}`);
                                }}
                                className="p-1 hover:bg-rose-500/15 text-zinc-500 hover:text-rose-400 rounded cursor-pointer transition-colors"
                                title="Deactivate User"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: add user form */}
                  <form onSubmit={handleAddSimulatedUser} className="md:col-span-5 p-4 rounded-xl border border-zinc-900 bg-zinc-950/20 space-y-3 h-fit">
                    <h4 className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-blue-400" />
                      Add Workspace User
                    </h4>

                    <div>
                      <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1">Full Name</label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. Rajat Kumar"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        className="w-full text-xs rounded-lg p-2 border border-zinc-850 bg-zinc-900 text-white placeholder-zinc-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1">Email (Gmail)</label>
                      <input 
                        type="email"
                        required
                        placeholder="rajat@sharma.com"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        className="w-full text-xs rounded-lg p-2 border border-zinc-850 bg-zinc-900 text-white placeholder-zinc-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1">Access Role</label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value)}
                        className="w-full text-xs rounded-lg p-2 border border-zinc-850 bg-zinc-900 text-white focus:outline-none"
                      >
                        <option value="Inventory Staff">Inventory Staff</option>
                        <option value="Billing Manager">Billing Manager</option>
                        <option value="Enterprise Administrator">Enterprise Admin</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer transition-colors"
                    >
                      Provision User Account
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* 12. ACTIVITY LOG */}
            {activeSubTab === "logs" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-zinc-900 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-blue-400" />
                    📜 Core Operation & Audit Logs
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Track transactional state changes, active vector insertions, and administrator sign-in sessions.
                  </p>
                </div>

                <div className="space-y-2 max-w-xl">
                  {logs.map((log) => (
                    <div key={log.id} className="p-3 rounded-xl border border-zinc-900 bg-zinc-950/40 text-xs flex items-start gap-3">
                      <div className="p-1 rounded bg-zinc-900 text-zinc-400 shrink-0 mt-0.5">
                        <Terminal className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="font-bold text-white truncate">{log.event}</p>
                          <span className="text-[9px] font-mono text-zinc-500">{log.time}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{log.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 13. PERFORMANCE SECTION */}
            {activeSubTab === "performance" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-zinc-900 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-400" />
                    ⚡ Real-time Performance Telemetry
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Monitor container resource footprints, database query latencies, and active server connections.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 text-center space-y-1">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Dynamic CPU Load</p>
                    <p className="text-2xl font-black text-blue-400 tracking-tight font-mono">{cpuLoad}%</p>
                    <p className="text-[9px] text-zinc-500">Node cluster execution</p>
                  </div>

                  <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 text-center space-y-1">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">API Roundtrip Latency</p>
                    <p className="text-2xl font-black text-emerald-400 tracking-tight font-mono">{latency} ms</p>
                    <p className="text-[9px] text-zinc-500">Sharma database fetch speed</p>
                  </div>

                  <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 text-center space-y-1">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Static Heap Allocation</p>
                    <p className="text-2xl font-black text-purple-400 tracking-tight font-mono">{memUsage} MB</p>
                    <p className="text-[9px] text-zinc-500">Virtual engine headroom</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/20 text-xs text-zinc-400 leading-relaxed max-w-xl">
                  <strong>Network Ingress Routing Status:</strong> Direct reverse proxy routing is operational. Node.js backend port 3000 is listening to 0.0.0.0 ingress endpoints. Websocket HMR connections are disabled by control-plane policy.
                </div>
              </div>
            )}

            {/* 14. HELP SECTION */}
            {activeSubTab === "help" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-zinc-900 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-400" />
                    ❓ Help Desk & FAQ
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Quickly answer questions regarding Daily Ledger embedding, database connections, and invoices.
                  </p>
                </div>

                <div className="space-y-3 max-w-xl">
                  {[
                    { q: "How do customer purchases automatically train the AI?", a: "Every record saved into the Daily Ledger or document uploaded to the Context Vault is parsed and dynamically split into standard semantic chunks. These are embedded and stored in-memory, permitting the Copilot screen to search them in real time using RAG." },
                    { q: "Is my payment system in live mode?", a: "Currently, our invoices support test simulations. You can configure your custom Razorpay API credentials in Settings > Integrations to test production callbacks." },
                    { q: "My Supabase client says disconnected. How do I fix it?", a: "Navigate to Settings > Integrations and verify your Supabase URL and Anon Key are pasted exactly. Clicking 'Rewrite & Sync' will reconfigure the connection instantly." }
                  ].map((faq, i) => (
                    <div key={i} className="p-3.5 rounded-xl border border-zinc-900 bg-zinc-950/40 space-y-1.5 text-xs">
                      <p className="font-bold text-white">Q: {faq.q}</p>
                      <p className="text-zinc-400 leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 15. ABOUT SECTION */}
            {activeSubTab === "about" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-zinc-900 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-400" />
                    ℹ️ About NovaOS & Licenses
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Technical metadata, version controls, and software distribution parameters.
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-zinc-900 bg-zinc-950/40 max-w-lg space-y-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-lg">
                      ▲
                    </div>
                    <div>
                      <p className="font-extrabold text-white text-sm">NovaOS Enterprise Core</p>
                      <p className="text-[10px] text-zinc-500">Modular Workspace Intelligence Suite</p>
                    </div>
                  </div>

                  <div className="border-t border-zinc-900 pt-3 space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">System Version:</span>
                      <span className="text-zinc-300">v3.4.2-build.82</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Runtime Engine:</span>
                      <span className="text-zinc-300">Node v20.12.0 (React 18)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">License Model:</span>
                      <span className="text-zinc-300">Proprietary Commercial License</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Tenant Namespace:</span>
                      <span className="text-blue-400 font-bold">{activeOrgId}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-500 leading-relaxed italic pt-2">
                    Designed and optimized for elite customer records management, instant cognitive search loops, and lightning-fast digital invoices with integrated secure checkout gateways.
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Footer Save / Feedback indicator */}
          <div className="border-t border-zinc-900 pt-4 mt-6 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span>Tenant Namespace: <strong className="text-blue-400">{activeOrgId}</strong></span>
            <span>NovaOS Core Admin Terminal</span>
          </div>

        </div>

      </div>
    </div>
  );
}
