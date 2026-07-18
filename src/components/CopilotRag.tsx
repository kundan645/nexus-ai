import React, { useState, useRef } from "react";
import { 
  Sparkles, 
  Send, 
  UploadCloud, 
  FileText, 
  Paperclip, 
  Loader2, 
  Bot, 
  User, 
  Compass, 
  ExternalLink,
  BookOpen,
  Globe
} from "lucide-react";
import { Document, ChatMessage } from "../types";

interface CopilotRagProps {
  documents: Document[];
  chatHistory: ChatMessage[];
  onUploadFile: (file: File) => Promise<void>;
  onSendMessage: (text: string, language?: string) => Promise<void>;
  isLoading: boolean;
  theme?: "light" | "dark";
}

export default function CopilotRag({
  documents,
  chatHistory,
  onUploadFile,
  onSendMessage,
  isLoading,
  theme = "dark"
}: CopilotRagProps) {
  const [inputText, setInputText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText, selectedLanguage);
    setInputText("");
  };

  // Drag and drop events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await handleUpload(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      await onUploadFile(file);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto" id="copilot_rag_panel">
      
      {/* RAG Chat Assistant (Full Width) */}
      <div className={`p-6 rounded-2xl flex flex-col justify-between h-[560px] transition-colors duration-200 ${
        theme === "light" 
          ? "bg-white border border-slate-200 shadow-sm" 
          : "glass-panel border border-white/10"
      }`} id="copilot_conversation_box">
        
        {/* Chat Header */}
        <div className={`flex items-center justify-between border-b pb-3 ${
          theme === "light" ? "border-slate-200" : "border-white/5"
        }`}>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-500" />
            <div>
              <h3 className={`text-sm font-bold font-display tracking-tight ${
                theme === "light" ? "text-black" : "text-white"
              }`}>
                NovaOS Copilot
              </h3>
              <p className={`text-[10px] ${theme === "light" ? "text-slate-800 font-semibold" : "text-gray-400"}`}>
                Real-time enterprise RAG assistant
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Language Selection Dropdown */}
            <div className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className={`text-[11px] font-semibold rounded-md border py-1 px-1.5 cursor-pointer transition-all focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  theme === "light"
                    ? "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 font-bold"
                    : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Marathi">Marathi (मराठी)</option>
                <option value="Spanish">Spanish (Español)</option>
                <option value="French">French (Français)</option>
                <option value="German">German (Deutsch)</option>
              </select>
            </div>

            <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono hidden sm:flex ${
              theme === "light" 
                ? "bg-slate-100 text-slate-800 border border-slate-200 font-bold" 
                : "bg-white/5 text-gray-400"
            }`}>
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              Brain: gemini-3.5-flash
            </div>
          </div>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scroll-smooth" id="chat_feed_container">
          {chatHistory.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-3 max-w-[85%] ${
                msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 h-fit ${
                msg.sender === "user" 
                  ? "bg-blue-600 text-white" 
                  : theme === "light"
                    ? "bg-slate-200 border border-slate-300 text-blue-600 shadow-2xs"
                    : "bg-white/5 border border-white/10 text-blue-400"
              }`}>
                {msg.sender === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              <div className="space-y-1.5">
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === "user" 
                    ? "bg-blue-600 text-white rounded-tr-none shadow-xs" 
                    : theme === "light"
                      ? "bg-slate-100 text-black border border-slate-300 rounded-tl-none shadow-xs font-semibold"
                      : "bg-white/5 text-gray-100 border border-white/5 rounded-tl-none"
                }`}>
                  {msg.text}
                </div>

                {/* References Display */}
                {msg.references && msg.references.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <span className={`text-[9px] uppercase font-mono self-center mr-1 ${
                      theme === "light" ? "text-slate-800 font-bold" : "text-gray-400"
                    }`}>RAG Citations:</span>
                    {msg.references.map((ref, idx) => (
                      <div 
                        key={idx} 
                        title={ref.snippet}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] cursor-help font-mono border transition-colors ${
                          theme === "light"
                            ? "bg-blue-100 hover:bg-blue-200 text-blue-900 border-blue-300 font-bold shadow-2xs"
                            : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20"
                        }`}
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>{ref.name} ({ref.score}%)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 mr-auto max-w-[85%]">
              <div className={`p-2 rounded-lg shrink-0 h-fit ${
                theme === "light"
                  ? "bg-slate-200 border border-slate-300 text-blue-600"
                  : "bg-white/5 border border-white/10 text-blue-400"
              }`}>
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className={`p-3.5 rounded-2xl text-xs border rounded-tl-none italic animate-pulse ${
                theme === "light"
                  ? "bg-slate-100 text-slate-800 border-slate-300 font-semibold"
                  : "bg-white/5 text-gray-400 border-white/5"
              }`}>
                NovaOS vector search evaluating document embeddings...
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSubmitMessage} className={`flex gap-2 border-t pt-3 ${
          theme === "light" ? "border-slate-200" : "border-white/5"
        }`}>
          <input 
            type="text" 
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder="Ask anything about terms of service, invoices or active stock levels..."
            className={`flex-1 rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-colors ${
              theme === "light"
                ? "bg-slate-100 border border-slate-300 text-black placeholder-slate-600 focus:border-blue-500 focus:bg-white font-bold"
                : "bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500"
            }`}
          />
          <button 
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className={`p-2.5 rounded-xl transition-all ${
              !inputText.trim() || isLoading
                ? theme === "light"
                  ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                  : "bg-white/5 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 text-white"
            }`}
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>

      </div>

    </div>
  );
}
