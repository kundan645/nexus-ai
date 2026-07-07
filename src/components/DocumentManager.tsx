import React, { useState, useRef } from "react";
import { FolderOpen, FileText, UploadCloud, Loader2, Database, Sparkles, Trash2 } from "lucide-react";
import { Document } from "../types";

interface DocumentManagerProps {
  documents: Document[];
  onUploadFile: (file: File) => Promise<void>;
  onDeleteDocument: (id: string) => Promise<void>;
}

export default function DocumentManager({ documents, onUploadFile, onDeleteDocument }: DocumentManagerProps) {
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
        <h2 className="text-xl font-bold font-display text-white tracking-tight flex items-center gap-2">
          <FolderOpen className="w-5.5 h-5.5 text-blue-400" />
          RAG Knowledge Base
        </h2>
        <p className="text-xs text-gray-400">Contextual knowledge bases parsed, embedded in pgvector, and synced with LLM agent</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Upload Container (1 column) */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4 h-fit" id="document_uploader">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-400" />
            Ingest Context Documents
          </h3>
          <p className="text-xs text-gray-400">Upload standard policy sheets, SLAs, operational guides, or pricing cards to embed them for the AI.</p>
          
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
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
            
            <div className="flex flex-col items-center gap-3">
              {isUploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                  <div>
                    <p className="text-xs text-white font-semibold">Chunking and Ingesting...</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Calculating vector embeddings</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-white font-semibold">Drag & drop context files</p>
                    <p className="text-[10px] text-gray-400 mt-1">Accepts .txt, .json, .csv, .md (Max 5MB)</p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 text-[11px] text-gray-400 flex gap-2">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>Files undergo automatic semantic partition splitting and cosine similarity indexing against prompt matrices.</span>
          </div>
        </div>

        {/* Documents Database (2 columns) */}
        <div className="md:col-span-2 glass-panel p-5 rounded-2xl border border-white/10 space-y-4" id="document_index_list">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
            Context Vault Index ({documents.length} Files Active)
          </h3>
          
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {documents.length === 0 ? (
              <div className="p-12 text-center text-gray-500 font-medium border border-white/5 rounded-xl bg-white/[0.01]">
                No operational guidelines uploaded. Use the uploader to index context.
              </div>
            ) : (
              documents.map((doc) => (
                <div 
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-[320px]">{doc.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">
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
                      className="p-1.5 text-gray-400 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 rounded-lg transition-all disabled:opacity-50"
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
