import React, { useState, useRef, useEffect } from "react";
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
  Info,
  Send,
  MessageSquare,
  Bot,
  ArrowLeft,
  Mic,
  Volume2,
  Globe,
  Settings2,
  Check
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
  currentOrg: any;
  inventory: any[];
  invoices: any[];
  onTriggerHealthTune: () => void;
  onRefreshData?: () => void;
  theme?: "light" | "dark";
}

export default function DashboardStats({ 
  currentOrg, 
  inventory, 
  invoices,
  onTriggerHealthTune,
  onRefreshData,
  theme = "dark"
}: DashboardStatsProps) {
  
  const [activeSubTab, setActiveSubTab] = useState<"business" | "speed_insights">("business");
  const [chartView, setChartView] = useState<"revenue" | "profit" | "expenses">("revenue");

  // Out of stock tracking & local simulation state
  const [reorderedItems, setReorderedItems] = useState<Record<string, boolean>>({});
  const [localStockOverrides, setLocalStockOverrides] = useState<Record<string, number>>({});
  const [restockingId, setRestockingId] = useState<string | null>(null);

  const handleReorder = (itemId: string, name: string) => {
    setRestockingId(itemId);
    setTimeout(() => {
      setLocalStockOverrides(prev => ({
        ...prev,
        [itemId]: 40
      }));
      setReorderedItems(prev => ({
        ...prev,
        [itemId]: true
      }));
      setRestockingId(null);
    }, 1200);
  };

  // Compute actual stock levels reflecting any local quick restocks
  const lowStockProducts = (inventory || []).map(item => ({
    ...item,
    stock: localStockOverrides[item.id] !== undefined ? localStockOverrides[item.id] : item.stock
  })).filter(item => item.stock <= (item.minStock || 15));

  // --- NOVA OS VOICE HUB STATES & REF INTEGRATION ---
  const [voiceActive, setVoiceActive] = useState(false);
  const [interactiveLang, setInteractiveLang] = useState("hi-IN");
  const [isInteractiveListening, setIsInteractiveListening] = useState(false);
  const [interactiveTranscript, setInteractiveTranscript] = useState<Array<{ role: "user" | "assistant"; text: string; date: string }>>([
    {
      role: "assistant",
      text: "Hello! I am your Nova AI Voice Agent. Select your preferred language, click on the microphone orb, and start speaking to me! I will talk back to you in the same language.",
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [currentRecognitionText, setCurrentRecognitionText] = useState("");
  const [voicePersona, setVoicePersona] = useState<"female" | "male">("female");
  const [voicePitch, setVoicePitch] = useState<number>(1.0);
  const [voiceRate, setVoiceRate] = useState<number>(0.95);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState("");

  const recognitionInstanceRef = useRef<any>(null);
  const interactiveSpeechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionTranscriptRef = useRef<string>("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const INTERACTIVE_LANGUAGES = [
    { code: "hi-IN", name: "Hindi (हिंदी)", native: "हिंदी", flag: "🇮🇳" },
    { code: "en-US", name: "English (US)", native: "English", flag: "🇺🇸" },
    { code: "mr-IN", name: "Marathi (मराठी)", native: "मराठी", flag: "🇮🇳" },
    { code: "es-ES", name: "Spanish (Español)", native: "Español", flag: "🇪🇸" },
    { code: "fr-FR", name: "French (Français)", native: "Français", flag: "🇫🇷" },
    { code: "de-DE", name: "German (Deutsch)", native: "Deutsch", flag: "🇩🇪" },
    { code: "ja-JP", name: "Japanese (日本語)", native: "日本語", flag: "🇯🇵" },
    { code: "zh-CN", name: "Chinese (简体中文)", native: "简体中文", flag: "🇨🇳" },
    { code: "ar-SA", name: "Arabic (العربية)", native: "العربية", flag: "🇸🇦" },
    { code: "pt-BR", name: "Portuguese (Português)", native: "Português", flag: "🇧🇷" },
    { code: "bn-IN", name: "Bengali (বাংলা)", native: "বাংলা", flag: "🇮🇳" },
    { code: "ta-IN", name: "Tamil (தமிழ்)", native: "தமிழ்", flag: "🇮🇳" },
    { code: "te-IN", name: "Telugu (తెలుగు)", native: "తెలుగు", flag: "🇮🇳" }
  ];

  // Load browser voices
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Auto-select best voice when language changes or voices load
  useEffect(() => {
    if (availableVoices.length === 0) return;
    const bestVoice = findBestNaturalVoice(interactiveLang, voicePersona);
    if (bestVoice) {
      setSelectedVoiceName(bestVoice.name);
    }
  }, [interactiveLang, voicePersona, availableVoices]);

  // Auto scroll to bottom of dialogue history
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [interactiveTranscript, isAiProcessing, voiceActive]);

  // Cleanup synthesizer speech and recognition on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionInstanceRef.current) {
        try {
          recognitionInstanceRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const getLocalizedGreeting = (langCode: string) => {
    const langPrefix = langCode.split("-")[0].toLowerCase();
    switch (langPrefix) {
      case "hi":
        return "नमस्ते! मैं आपकी क्या मदद कर सकती हूँ?";
      case "mr":
        return "नमस्कार! मी तुमची काय मदत करू शकते?";
      case "es":
        return "Hola, ¿cómo posso ayudarte?";
      case "fr":
        return "Bonjour, comment puis-je vous aider ?";
      case "de":
        return "Hallo, wie kann ich Ihnen helfen?";
      case "ja":
        return "こんにちは、どのようなご用件でしょうか？";
      case "zh":
        return "您好，我能为您做些什么？";
      case "ar":
        return "مرحباً، كيف يمكنني مساعدتك؟";
      case "pt":
        return "Olá, como posso ajudar você?";
      case "bn":
        return "নমস্কার, আমি আপনাকে কীভাবে সাহায্য করতে পারি?";
      case "ta":
        return "வணக்கம், நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?";
      case "te":
        return "నమస్కారం, నేను మీకు ఎలా సహాయపడగలను?";
      default:
        return "Hello! How can I help you today?";
    }
  };

  const findBestNaturalVoice = (langCode: string, persona: "female" | "male") => {
    if (typeof window === "undefined" || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = langCode.split("-")[0].toLowerCase();

    const langVoices = voices.filter(v => v.lang.toLowerCase().startsWith(langPrefix) || v.lang.toLowerCase().includes(langPrefix));
    
    if (langVoices.length === 0) {
      const enVoices = voices.filter(v => v.lang.toLowerCase().startsWith("en") || v.lang.toLowerCase().includes("en"));
      if (enVoices.length > 0) {
        return findBestInList(enVoices, persona);
      }
      return voices[0] || null;
    }

    return findBestInList(langVoices, persona);
  };

  const findBestInList = (list: SpeechSynthesisVoice[], persona: "female" | "male") => {
    const naturalKeywords = ["natural", "neural", "google", "siri", "samantha", "daniel", "jenny", "guy", "aria", "premium"];
    const personaKeywords = persona === "female" 
      ? ["female", "samantha", "siri", "zira", "kalpana", "heera", "hazel", "jenny", "aria", "haruka", "karen"]
      : ["male", "david", "guy", "hemant", "george", "ravi", "mark", "daniel", "microsoft"];

    for (const pKeyword of personaKeywords) {
      for (const nKeyword of naturalKeywords) {
        const matched = list.find(v => {
          const nameLower = v.name.toLowerCase();
          return nameLower.includes(pKeyword) && nameLower.includes(nKeyword);
        });
        if (matched) return matched;
      }
    }

    for (const pKeyword of personaKeywords) {
      const matched = list.find(v => v.name.toLowerCase().includes(pKeyword));
      if (matched) return matched;
    }

    for (const nKeyword of naturalKeywords) {
      const matched = list.find(v => v.name.toLowerCase().includes(nKeyword));
      if (matched) return matched;
    }

    return list[0];
  };

  const speakGreetingAndThenListen = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      startInteractiveListening();
      return;
    }

    window.speechSynthesis.cancel();
    setIsAiSpeaking(false);
    setIsInteractiveListening(false);
    recognitionTranscriptRef.current = "";

    const greetingText = getLocalizedGreeting(interactiveLang);

    const assistantMsg = {
      role: "assistant" as const,
      text: greetingText,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setInteractiveTranscript(prev => [...prev, assistantMsg]);

    const cleanText = greetingText.trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    interactiveSpeechUtteranceRef.current = utterance;

    const bestVoice = findBestNaturalVoice(interactiveLang, voicePersona);
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.rate = voiceRate;
    utterance.pitch = voicePitch;

    utterance.onstart = () => {
      setIsAiSpeaking(true);
    };

    utterance.onend = () => {
      setIsAiSpeaking(false);
      setTimeout(() => {
        startInteractiveListening();
      }, 150);
    };

    utterance.onerror = () => {
      setIsAiSpeaking(false);
      startInteractiveListening();
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleCoreNodeClick = () => {
    if (isInteractiveListening) {
      stopInteractiveListening();
    } else if (isAiSpeaking) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsAiSpeaking(false);
    } else {
      speakGreetingAndThenListen();
    }
  };

  const startInteractiveListening = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsAiSpeaking(false);
    }

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      alert("Voice input is not supported in this browser. Please use Google Chrome, Safari or Microsoft Edge.");
      return;
    }

    try {
      const rec = new SpeechRecognitionClass();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = interactiveLang;

      rec.onstart = () => {
        setIsInteractiveListening(true);
        setCurrentRecognitionText("");
        recognitionTranscriptRef.current = "";
      };

      rec.onresult = (event: any) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const textValue = final || interim;
        setCurrentRecognitionText(textValue);
        recognitionTranscriptRef.current = textValue;
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event);
        setIsInteractiveListening(false);
      };

      rec.onend = () => {
        setIsInteractiveListening(false);
        const finalSpokenText = recognitionTranscriptRef.current;
        if (finalSpokenText && finalSpokenText.trim()) {
          handleProcessUserSpeech(finalSpokenText);
        }
        setCurrentRecognitionText("");
        recognitionTranscriptRef.current = "";
      };

      recognitionInstanceRef.current = rec;
      rec.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
      setIsInteractiveListening(false);
    }
  };

  const stopInteractiveListening = () => {
    if (recognitionInstanceRef.current) {
      recognitionInstanceRef.current.stop();
    }
    setIsInteractiveListening(false);
  };

  const handleProcessUserSpeech = async (text: string) => {
    if (!text.trim()) return;

    const userMsg = {
      role: "user" as const,
      text: text,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setInteractiveTranscript(prev => [...prev, userMsg]);
    setIsAiProcessing(true);

    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-id": currentOrg.id || "org-nexus"
        },
        body: JSON.stringify({
          message: text,
          chatHistory: interactiveTranscript.map(t => ({
            sender: t.role === "user" ? "user" : "assistant",
            text: t.text
          }))
        })
      });

      if (!response.ok) {
        throw new Error("Voice assistant API call failed");
      }

      const data = await response.json();
      const botReply = data.text || "I was unable to process a vocal response.";

      const assistantMsg = {
        role: "assistant" as const,
        text: botReply,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setInteractiveTranscript(prev => [...prev, assistantMsg]);
      setIsAiProcessing(false);

      speakInteractiveResponse(botReply);

    } catch (err) {
      console.error("Interactive voice handler error:", err);
      setIsAiProcessing(false);
      const errorMsg = "I am sorry, but there was a connection glitch speaking to the core. Please try again.";
      setInteractiveTranscript(prev => [
        ...prev,
        {
          role: "assistant",
          text: errorMsg,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      speakInteractiveResponse(errorMsg);
    }
  };

  const speakInteractiveResponse = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/\*\*?/g, "")
      .replace(/#/g, "")
      .replace(/`{1,3}[\s\S]*?`{1,3}/g, "")
      .replace(/\[([\s\S]*?)\]\([\s\S]*?\)/g, "$1")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    interactiveSpeechUtteranceRef.current = utterance;

    const bestVoice = findBestNaturalVoice(interactiveLang, voicePersona);
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.rate = voiceRate;
    utterance.pitch = voicePitch;

    utterance.onstart = () => {
      setIsAiSpeaking(true);
    };

    utterance.onend = () => {
      setIsAiSpeaking(false);
    };

    utterance.onerror = () => {
      setIsAiSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const clearInteractiveTranscript = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsAiSpeaking(false);
    setIsInteractiveListening(false);
    setInteractiveTranscript([
      {
        role: "assistant",
        text: "Transcript cleared. Speak to me whenever you are ready!",
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleDeactivateVoice = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (recognitionInstanceRef.current) {
      try {
        recognitionInstanceRef.current.stop();
      } catch (e) {}
    }
    setIsInteractiveListening(false);
    setIsAiSpeaking(false);
    setIsAiProcessing(false);
    setVoiceActive(false);
  };
  
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
            
            {/* Left 8 Columns: Products Running Out of Stock */}
            <div className={`lg:col-span-8 p-6 rounded-2xl border flex flex-col justify-between ${
              theme === "dark" ? "bg-zinc-950/80 border-zinc-800/80" : "bg-white border-slate-100 shadow-xs"
            }`} id="low_stock_products_container">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h4 className={`text-sm font-semibold tracking-tight flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                      <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
                      Critical Stock Alerts
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500">Products currently running low or out of stock</p>
                  </div>
                  
                  <span className={`text-[10px] font-mono px-2 py-1 rounded-full ${
                    lowStockProducts.length > 0 
                      ? (theme === "dark" ? "bg-amber-500/10 border border-amber-500/20 text-amber-400" : "bg-amber-500/5 border border-amber-500/10 text-amber-600")
                      : (theme === "dark" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-emerald-500/5 border border-emerald-500/10 text-emerald-600")
                  }`}>
                    {lowStockProducts.length} {lowStockProducts.length === 1 ? 'Product Needs Restock' : 'Products Need Restock'}
                  </span>
                </div>

                {lowStockProducts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className={`text-[10px] uppercase font-mono tracking-wider border-b ${
                          theme === "dark" ? "border-zinc-800/60 text-zinc-500" : "border-slate-100 text-slate-400"
                        }`}>
                          <th className="pb-3 pl-2">Product Name</th>
                          <th className="pb-3 text-center">SKU</th>
                          <th className="pb-3 text-center">Stock / Min Stock</th>
                          <th className="pb-3 text-right pr-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-850/40">
                        {lowStockProducts.map((item) => {
                          const percent = Math.min(100, Math.round((item.stock / (item.minStock || 15)) * 100));
                          const isOutOfStock = item.stock === 0;
                          
                          return (
                            <tr 
                              key={item.id} 
                              className="text-xs transition-colors hover:bg-zinc-850/10 dark:hover:bg-zinc-900/10"
                            >
                              <td className="py-4 pl-2 font-medium">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`} />
                                  <div>
                                    <span className={theme === "dark" ? "text-zinc-200" : "text-slate-800"}>
                                      {item.name}
                                    </span>
                                    <div className="text-[10px] text-slate-400 dark:text-zinc-500 block mt-0.5">
                                      Price: ₹{item.price?.toLocaleString('en-IN') || 'N/A'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              
                              <td className="py-4 text-center font-mono text-[11px] text-slate-400 dark:text-zinc-400">
                                {item.sku}
                              </td>
                              
                              <td className="py-4">
                                <div className="flex flex-col items-center justify-center max-w-[120px] mx-auto">
                                  <div className="flex justify-between w-full text-[10px] mb-1 text-slate-400 dark:text-zinc-400 font-mono">
                                    <span className={`font-semibold ${isOutOfStock ? 'text-rose-500' : 'text-amber-500'}`}>
                                      {item.stock} left
                                    </span>
                                    <span>
                                      Min: {item.minStock || 15}
                                    </span>
                                  </div>
                                  <div className={`w-full h-1.5 rounded-full ${
                                    theme === "dark" ? "bg-zinc-800" : "bg-slate-100"
                                  } overflow-hidden`}>
                                    <div 
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        isOutOfStock ? 'bg-rose-500' : 'bg-amber-500'
                                      }`}
                                      style={{ width: `${percent}%` }}
                                    />
                                  </div>
                                </div>
                              </td>

                              <td className="py-4 text-right pr-2">
                                <button
                                  onClick={() => handleReorder(item.id, item.name)}
                                  disabled={restockingId === item.id}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                                    restockingId === item.id
                                      ? "bg-zinc-850 text-zinc-500 cursor-not-allowed"
                                      : "bg-blue-600 hover:bg-blue-500 text-white shadow-xs hover:shadow active:scale-95 cursor-pointer"
                                  }`}
                                >
                                  {restockingId === item.id ? (
                                    <span className="flex items-center gap-1 justify-end">
                                      <RotateCw className="w-3 h-3 animate-spin" />
                                      Ordering...
                                    </span>
                                  ) : "Quick Restock"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    </div>
                    <h5 className={`text-sm font-semibold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                      All Products Fully Stocked
                    </h5>
                    <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 max-w-sm">
                      Every single product meets or exceeds your organization's safety stock requirements. Nice job!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right 4 Columns: Nova OS Voice Hub */}
            <div className={`lg:col-span-4 p-5 rounded-2xl border flex flex-col justify-between relative min-h-[450px] overflow-hidden ${
              theme === "dark" ? "bg-zinc-950/90 border-zinc-800/80 text-zinc-200" : "bg-white border-slate-100 shadow-sm text-slate-800"
            }`} id="nova_voice_hub_panel">
              
              {!voiceActive ? (
                /* INACTIVE STATE: Nova OS Logo Trigger for Voice Hub */
                <div className="flex flex-col items-center justify-center flex-1 py-4 text-center">
                  <button 
                    onClick={() => {
                      setVoiceActive(true);
                      speakGreetingAndThenListen();
                    }}
                    className="group relative flex items-center justify-center p-3 rounded-full bg-zinc-900/50 hover:bg-zinc-900/80 dark:hover:bg-zinc-800/40 border border-zinc-800/60 transition-all duration-300 animate-in fade-in"
                    title="Click to activate Nova OS Voice Hub"
                  >
                    <div className="absolute inset-0 rounded-full bg-purple-500/10 blur-xl group-hover:bg-purple-500/20 transition-all duration-300 animate-pulse"></div>
                    <svg className="w-20 h-20 filter drop-shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all duration-300 group-hover:scale-105" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="novaGradVoice" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#c084fc" />
                        </linearGradient>
                      </defs>
                      <circle cx="50" cy="50" r="44" className="fill-none stroke-[1.5] stroke-[url(#novaGradVoice)] stroke-dasharray-[12_6] animate-[spin_30s_linear_infinite]" />
                      <circle cx="50" cy="50" r="36" className="fill-none stroke-[0.75] stroke-zinc-700/50 stroke-dasharray-[4_4]" />
                      <path d="M35 30 V70 L50 48 L65 70 V30" className="stroke-[url(#novaGradVoice)] stroke-[6.5] fill-none stroke-linecap-round stroke-linejoin-round" />
                    </svg>
                  </button>

                  <div className="mt-5 space-y-2">
                    <h4 className={`text-base font-extrabold tracking-tight flex items-center justify-center gap-1.5 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                      <Mic className="w-4.5 h-4.5 text-purple-400 animate-pulse" />
                      Nova OS Voice Hub
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 max-w-[240px] leading-relaxed mx-auto">
                      Real-time multilingual voice intelligence agent. Tap to activate direct human-sounding conversation.
                    </p>
                  </div>

                  <button 
                    onClick={() => {
                      setVoiceActive(true);
                      speakGreetingAndThenListen();
                    }}
                    className="mt-6 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-500 hover:to-purple-500 shadow-md shadow-purple-500/10 hover:shadow-purple-500/20 transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                  >
                    Activate Voice Agent
                  </button>
                </div>
              ) : (
                /* ACTIVE STATE: Multilingual Voice Hub Client */
                <div className="flex flex-col h-full flex-1 justify-between gap-3 animate-in fade-in duration-200 w-full">
                  {/* Assistant Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 w-full">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-zinc-950 animate-pulse"></span>
                        <div className="p-1 rounded-lg bg-purple-500/10 text-purple-400">
                          <Bot className="w-4 h-4" />
                        </div>
                      </div>
                      <div>
                        <h4 className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Nova Voice Hub</h4>
                        <p className="text-[9px] text-emerald-500 font-mono font-bold animate-pulse">● AUTHORIZED LINE</p>
                      </div>
                    </div>

                    <button 
                      onClick={handleDeactivateVoice}
                      title="Deactivate Voice Hub"
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        theme === "dark" ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-400" : "bg-slate-100 hover:bg-slate-200 text-slate-500"
                      }`}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Compact Configuration Panel */}
                  <div className={`p-2.5 rounded-xl border space-y-2 text-[10px] w-full ${
                    theme === "dark" ? "bg-zinc-900/40 border-zinc-800/60" : "bg-slate-50 border-slate-200"
                  }`}>
                    {/* Language Dropdown & Persona Selector */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <span className={`text-[8px] uppercase font-mono tracking-wider block ${theme === "dark" ? "text-zinc-500" : "text-slate-500 font-semibold"}`}>Language</span>
                        <select
                          value={interactiveLang}
                          onChange={(e) => {
                            setInteractiveLang(e.target.value);
                            if (isInteractiveListening) stopInteractiveListening();
                          }}
                          className={`w-full border rounded-lg px-2 py-1 text-[10px] focus:outline-none ${
                            theme === "dark" 
                              ? "bg-zinc-900 border-zinc-800 text-white" 
                              : "bg-white border-slate-200 text-slate-800"
                          }`}
                        >
                          {INTERACTIVE_LANGUAGES.map((lang) => (
                            <option key={lang.code} value={lang.code} className={theme === "dark" ? "bg-zinc-950 text-white" : "bg-white text-slate-900"}>
                              {lang.flag} {lang.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <span className={`text-[8px] uppercase font-mono tracking-wider block ${theme === "dark" ? "text-zinc-500" : "text-slate-500 font-semibold"}`}>Persona Tone</span>
                        <div className="grid grid-cols-2 gap-1">
                          <button
                            type="button"
                            onClick={() => setVoicePersona("female")}
                            className={`py-1 rounded-lg text-[9px] font-bold border transition-all cursor-pointer text-center ${
                              voicePersona === "female"
                                ? "bg-purple-500/15 border-purple-500 text-purple-400 font-bold"
                                : (theme === "dark" ? "bg-zinc-900 border-zinc-800 text-zinc-400" : "bg-white border-slate-250 text-slate-500")
                            }`}
                          >
                            ♀ Female
                          </button>
                          <button
                            type="button"
                            onClick={() => setVoicePersona("male")}
                            className={`py-1 rounded-lg text-[9px] font-bold border transition-all cursor-pointer text-center ${
                              voicePersona === "male"
                                ? "bg-purple-500/15 border-purple-500 text-purple-400 font-bold"
                                : (theme === "dark" ? "bg-zinc-900 border-zinc-800 text-zinc-400" : "bg-white border-slate-250 text-slate-500")
                            }`}
                          >
                            ♂ Male
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Compact Speed & Pitch sliders */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-dashed border-zinc-800/40">
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[8px] uppercase font-mono text-zinc-400">
                          <span>Speed</span>
                          <span className="text-purple-400">{voiceRate}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.6"
                          max="1.4"
                          step="0.05"
                          value={voiceRate}
                          onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                          className="w-full accent-purple-500 h-1 bg-zinc-300 dark:bg-zinc-800 rounded-lg cursor-pointer"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[8px] uppercase font-mono text-zinc-400">
                          <span>Pitch</span>
                          <span className="text-purple-400">{voicePitch}</span>
                        </div>
                        <input
                          type="range"
                          min="0.7"
                          max="1.3"
                          step="0.05"
                          value={voicePitch}
                          onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                          className="w-full accent-purple-500 h-1 bg-zinc-300 dark:bg-zinc-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Voice Orb section */}
                  <div className="flex flex-col items-center justify-center py-2 text-center flex-1 w-full">
                    <div className="relative flex items-center justify-center">
                      {/* Outer breathing background circle */}
                      <div className={`absolute rounded-full blur-xl transition-all duration-1000 ${
                        isInteractiveListening 
                          ? "w-28 h-28 bg-rose-500/25 animate-ping" 
                          : isAiProcessing
                          ? "w-28 h-28 bg-amber-500/25 animate-pulse"
                          : isAiSpeaking
                          ? "w-28 h-28 bg-emerald-500/25 animate-pulse"
                          : "w-24 h-24 bg-purple-500/10"
                      }`}></div>

                      {/* The interactive animated AI core node */}
                      <button 
                        onClick={handleCoreNodeClick}
                        disabled={isAiProcessing}
                        className={`relative z-10 p-4 rounded-full border transition-all duration-300 flex items-center justify-center shadow-lg cursor-pointer ${
                          isInteractiveListening 
                            ? "bg-rose-950/80 border-rose-500 text-rose-400 shadow-rose-500/10 scale-105" 
                            : isAiSpeaking
                            ? "bg-emerald-950/80 border-emerald-500 text-emerald-400 shadow-emerald-500/10"
                            : "bg-zinc-900 hover:bg-zinc-800 border-purple-500/40 hover:border-purple-500 text-purple-400 shadow-purple-500/10 hover:shadow-purple-500/20"
                        }`}
                        title={isInteractiveListening ? "Stop listening" : isAiSpeaking ? "Stop speaking" : "Start speaking"}
                      >
                        {isInteractiveListening ? (
                          <Mic className="w-7 h-7 animate-pulse text-rose-400" />
                        ) : isAiProcessing ? (
                          <Bot className="w-7 h-7 animate-spin text-amber-400" />
                        ) : isAiSpeaking ? (
                          <Volume2 className="w-7 h-7 animate-bounce text-emerald-400" />
                        ) : (
                          <Mic className="w-7 h-7 text-purple-400" />
                        )}
                      </button>
                    </div>

                    <div className="mt-3 space-y-1">
                      <h3 className="text-xs font-bold tracking-tight">
                        {isInteractiveListening ? (
                          <span className="text-rose-400 flex items-center justify-center gap-1 animate-pulse">
                            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                            Listening...
                          </span>
                        ) : isAiProcessing ? (
                          <span className="text-amber-400 animate-pulse">Thinking...</span>
                        ) : isAiSpeaking ? (
                          <span className="text-emerald-400 flex items-center justify-center gap-1 animate-pulse">
                            <Volume2 className="w-3.5 h-3.5" />
                            Speaking...
                          </span>
                        ) : (
                          <span className="text-purple-400">Tap Core to Talk</span>
                        )}
                      </h3>
                    </div>

                    {/* Subtitles / Realtime speech box */}
                    {(isInteractiveListening || currentRecognitionText) && (
                      <div className="mt-2.5 p-2 w-full max-w-xs rounded-lg border border-dashed border-purple-500/30 bg-purple-500/5 animate-in fade-in zoom-in-95">
                        <p className="text-[8px] font-mono tracking-widest text-purple-400 uppercase font-bold mb-0.5">Live Input</p>
                        <p className="text-[10px] font-mono text-zinc-300 italic truncate" title={currentRecognitionText}>
                          "{currentRecognitionText || "Listening for speech..."}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Chat Transcript Timeline container */}
                  <div className="space-y-2 mt-2 border-t border-zinc-800/40 pt-2 flex-1 flex flex-col justify-end w-full">
                    <div className="flex items-center justify-between text-[9px] font-mono">
                      <span className="text-purple-400 font-bold flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> Transcript
                      </span>
                      <button 
                        onClick={clearInteractiveTranscript}
                        className="text-zinc-500 hover:text-purple-400 transition-colors px-1.5 py-0.5 rounded border border-purple-500/10 bg-purple-500/5 cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>

                    {/* Chat items list */}
                    <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 flex-1 w-full">
                      {interactiveTranscript.map((chat, idx) => (
                        <div 
                          key={idx} 
                          className={`flex flex-col ${chat.role === "user" ? "items-end" : "items-start"}`}
                        >
                          <div className={`max-w-[90%] px-3 py-1.5 rounded-xl text-[10px] leading-relaxed ${
                            chat.role === "user"
                              ? "bg-purple-600 text-white rounded-tr-xs"
                              : (theme === "dark"
                                  ? "bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-xs"
                                  : "bg-slate-150 text-slate-800 rounded-tl-xs")
                          }`}>
                            {chat.text}
                          </div>
                          <span className="text-[7px] text-zinc-500 font-mono px-1 mt-0.5">{chat.date}</span>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                  </div>
                </div>
              )}
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
                      : theme === "dark"
                        ? "text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-white/5"
                        : "text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  Needs Improvement (3)
                </button>
                <button 
                  onClick={() => setMetricTab("poor")}
                  className={`px-2.5 py-1 rounded-md border transition-all ${
                    metricTab === "poor"
                      ? "bg-rose-500/10 text-rose-500 border-rose-500/20 font-bold"
                      : theme === "dark"
                        ? "text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-white/5"
                        : "text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  Poor (0)
                </button>
                <button 
                  onClick={() => setMetricTab("great")}
                  className={`px-2.5 py-1 rounded-md border transition-all ${
                    metricTab === "great"
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold"
                      : theme === "dark"
                        ? "text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-white/5"
                        : "text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100"
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
