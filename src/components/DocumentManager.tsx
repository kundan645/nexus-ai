import React, { useState, useRef } from "react";
import { FolderOpen, FileText, UploadCloud, Loader2, Database, Sparkles, Trash2, ClipboardList } from "lucide-react";
import { Document } from "../types";

interface DocumentManagerProps {
  documents: Document[];
  onUploadFile: (file: File) => Promise<void>;
  onDeleteDocument: (id: string) => Promise<void>;
  theme?: "light" | "dark";
  onSwitchToLedger?: () => void;
}

export default function DocumentManager({ 
  documents, 
  onUploadFile, 
  onDeleteDocument, 
  theme = "dark",
  onSwitchToLedger
}: DocumentManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDeleteDocument(id);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6" id="document_vault_panel">
      
      {/* Title */}
      <div>
        <h2 className={`text-xl font-bold font-display tracking-tight flex items-center gap-2 ${
          theme === "dark" ? "text-white" : "text-slate-900"
        }`}>
          <FolderOpen className="w-5.5 h-5.5 text-blue-400" />
          RAG Knowledge Base
        </h2>
        <p className={`text-xs ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>
          Contextual knowledge bases parsed, embedded in pgvector, and synced with LLM agent
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Upload Container (1 column) */}
        <div className={`p-5 rounded-2xl border space-y-4 h-fit transition-all ${
          theme === "dark" 
            ? "bg-zinc-950/80 border-zinc-800/80" 
            : "bg-white border-slate-200/80 shadow-sm"
        }`} id="document_uploader">
          <h3 className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-2 ${
            theme === "dark" ? "text-white" : "text-slate-800"
          }`}>
            <Database className="w-4 h-4 text-blue-400" />
            Ingest Context Documents
          </h3>
          <p className={`text-xs ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>
            Upload standard policy sheets, SLAs, operational guides, or pricing cards to embed them for the AI.
          </p>
          
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragActive 
                ? "border-blue-500 bg-blue-500/10 scale-[0.99]" 
                : theme === "dark"
                  ? "border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-zinc-700"
                  : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300"
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" 
              accept=".txt,.csv,.json,.md"
            />
            
            <div className="flex flex-col items-center gap-3">
              {isUploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                  <div>
                    <p className={`text-xs font-semibold ${theme === "dark" ? "text-white" : "text-slate-800"}`}>
                      Chunking and Ingesting...
                    </p>
                    <p className={`text-[10px] mt-0.5 ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>
                      Calculating vector embeddings
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${theme === "dark" ? "text-white" : "text-slate-800"}`}>
                      Drag & drop context files
                    </p>
                    <p className={`text-[10px] mt-1 ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>
                      Accepts .txt, .json, .csv, .md (Max 5MB)
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className={`p-3 rounded-xl border text-[11px] flex gap-2 ${
            theme === "dark"
              ? "bg-blue-500/5 border-blue-500/10 text-zinc-400"
              : "bg-blue-50/50 border-blue-100 text-slate-600"
          }`}>
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>Files undergo automatic semantic partition splitting and cosine similarity indexing against prompt matrices.</span>
          </div>
        </div>

        {/* Documents Database (2 columns) */}
        <div className={`md:col-span-2 p-5 rounded-2xl border space-y-4 transition-all ${
          theme === "dark" 
            ? "bg-zinc-950/80 border-zinc-800/80" 
            : "bg-white border-slate-200/80 shadow-sm"
        }`} id="document_index_list">
          <h3 className={`text-xs font-semibold uppercase tracking-wider ${
            theme === "dark" ? "text-white" : "text-slate-800"
          }`}>
            Context Vault Index ({documents.length} Files Active)
          </h3>
          
           <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {documents.length === 0 ? (
              <div className={`p-8 text-center font-medium border rounded-xl flex flex-col items-center gap-3 ${
                theme === "dark"
                  ? "text-zinc-500 border-zinc-850 bg-zinc-900/10"
                  : "text-slate-400 border-slate-200 bg-slate-50/30"
              }`}>
                <span>No operational guidelines uploaded. Use the uploader to index context.</span>
                
                {onSwitchToLedger && (
                  <button
                    onClick={onSwitchToLedger}
                    className="mt-2 text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1.5 px-3 py-1.5 border border-zinc-800 rounded-lg hover:bg-zinc-900/40 cursor-pointer"
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    Switch to Daily Shop Ledger instead
                  </button>
                )}
              </div>
            ) : (
              documents.map((doc) => (
                <div 
                  key={doc.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                    theme === "dark"
                      ? "bg-zinc-900/30 border-zinc-800/60 hover:bg-zinc-900/60"
                      : "bg-slate-50 border-slate-100 hover:bg-slate-100/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-xs font-semibold truncate max-w-[200px] sm:max-w-[320px] ${
                        theme === "dark" ? "text-white" : "text-slate-800"
                      }`}>{doc.name}</p>
                      <p className={`text-[10px] font-mono mt-0.5 ${
                        theme === "dark" ? "text-zinc-400" : "text-slate-500"
                      }`}>
                        Size: {formatBytes(doc.size)} | Ingested: {doc.uploadedAt}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline-block text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold uppercase">
                      Indexed
                    </span>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${doc.name}"? This will permanently un-index all of its semantic text chunks from the AI database.`)) {
                          handleDelete(doc.id);
                        }
                      }}
                      disabled={deletingId !== null}
                      className={`p-1.5 border rounded-lg transition-all disabled:opacity-50 ${
                        theme === "dark"
                          ? "text-zinc-400 hover:text-rose-400 bg-zinc-900/50 hover:bg-rose-500/10 border-zinc-800 hover:border-rose-500/20"
                          : "text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border-slate-250 hover:border-rose-200"
                      }`}
                      title="Delete document"
                    >
                      {deletingId === doc.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
