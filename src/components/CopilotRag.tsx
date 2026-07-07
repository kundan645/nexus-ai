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
  BookOpen
} from "lucide-react";
import { Document, ChatMessage } from "../types";

interface CopilotRagProps {
  documents: Document[];
  chatHistory: ChatMessage[];
  onUploadFile: (file: File) => Promise<void>;
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
}

export default function CopilotRag({
  documents,
  chatHistory,
  onUploadFile,
  onSendMessage,
  isLoading
}: CopilotRagProps) {
  const [inputText, setInputText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText);
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="copilot_rag_panel">
      
      {/* File Upload / Source Database Manager (Left 1 column) */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between" id="rag_knowledge_vault">
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              Knowledge Vault
            </h2>
            <p className="text-xs text-gray-400">RAG-system database: documents chunked & stored in pgvector</p>
          </div>

          {/* Drag & Drop Zone */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              dragActive 
                ? "border-blue-500 bg-blue-500/10 scale-[0.99]" 
                : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" 
              accept=".txt,.csv,.json,.md"
            />
            
            <div className="flex flex-col items-center gap-2">
              {isUploading ? (
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              ) : (
                <UploadCloud className="w-8 h-8 text-gray-400" />
              )}
              <p className="text-xs font-semibold text-gray-200">
                {isUploading ? "Splitting & Embedding..." : "Click or Drag File to Upload"}
              </p>
              <p className="text-[10px] text-gray-500">Supports .txt, .csv, .json, .md up to 10MB</p>
            </div>
          </div>

          {/* List of uploaded files */}
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Active SLA & Guidelines</h4>
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {documents.map((doc) => (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs"
                >
                  <div className="flex items-center gap-2 text-gray-300 min-w-0">
                    <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="truncate font-mono text-[11px]">{doc.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 shrink-0">
                    {(doc.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 bg-blue-950/20 border border-blue-500/10 rounded-xl text-[10px] text-blue-300/80 leading-normal font-mono mt-6">
          System automatically executes custom RecursiveCharacterTextSplitter on text, requests 768-dimension embeddings via gemini-embedding-2-preview, and maps to isolated schema tables.
        </div>
      </div>

      {/* RAG Chat Assistant (Right 2 columns) */}
      <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between h-[480px]" id="copilot_conversation_box">
        
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-semibold font-display text-white tracking-tight">NovaOS Copilot</h3>
              <p className="text-[10px] text-gray-400">Real-time enterprise RAG assistant</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md text-[10px] font-mono text-gray-400">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
            Brain: gemini-3.5-flash
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
                msg.sender === "user" ? "bg-blue-600 text-white" : "bg-white/5 border border-white/10 text-blue-400"
              }`}>
                {msg.sender === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              <div className="space-y-1.5">
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === "user" 
                    ? "bg-blue-600 text-white rounded-tr-none" 
                    : "bg-white/5 text-gray-100 border border-white/5 rounded-tl-none"
                }`}>
                  {msg.text}
                </div>

                {/* References Display */}
                {msg.references && msg.references.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <span className="text-[9px] uppercase font-mono text-gray-400 self-center mr-1">RAG Citations:</span>
                    {msg.references.map((ref, idx) => (
                      <div 
                        key={idx} 
                        title={ref.snippet}
                        className="inline-flex items-center gap-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] cursor-help font-mono"
                      >
                        <Compass className="w-3 h-3" />
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
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-blue-400 shrink-0 h-fit">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl text-xs bg-white/5 text-gray-400 border border-white/5 rounded-tl-none italic animate-pulse">
                NovaOS vector search evaluating document embeddings...
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSubmitMessage} className="flex gap-2 border-t border-white/5 pt-3">
          <input 
            type="text" 
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder="Ask anything about terms of service, invoices or active stock levels..."
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
          />
          <button 
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className={`p-2.5 rounded-xl transition-all ${
              !inputText.trim() || isLoading
                ? "bg-white/5 text-gray-500 cursor-not-allowed"
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
