"use client";

import { useEffect, useState } from "react";
import { AlertCircle, ArrowUpRight, CheckCircle2, FileArchive, FileText, FileUp, LoaderCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type DocumentRow = {
  id: string;
  title: string;
  source_type: string;
  status: "processing" | "indexed" | "failed";
  chunk_count: number;
  created_at: string;
};

function documentStatus(status: string) {
  if (status === "indexed") return "status-tag status-ready";
  if (status === "failed") return "status-tag status-danger";
  return "status-tag status-review";
}

export function CatalogIngestPanel() {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [error, setError] = useState("");

  async function loadDocuments() {
    setRefreshing(true);
    setError("");
    try {
      const response = await fetch("/api/catalog", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error ?? "Could not load documents");
      setDocuments(payload.documents ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Document library unavailable");
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => { void loadDocuments(); }, []);

  async function upload() {
    if (!file || loading) return;
    if (file.size > 10 * 1024 * 1024) {
      setStatus({ ok: false, text: "The selected file exceeds the 10 MB limit." });
      return;
    }
    setLoading(true);
    setStatus(null);
    const form = new FormData();
    form.set("file", file);
    form.set("title", title.trim() || file.name);
    try {
      const response = await fetch("/api/catalog", { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || "Indexing failed");
      setStatus({ ok: true, text: "Document indexed. " + payload.result.chunks + " text chunks are now searchable." });
      setFile(null);
      setTitle("");
      const input = document.getElementById("doc-file") as HTMLInputElement | null;
      if (input) input.value = "";
      await loadDocuments();
    } catch (cause) {
      setStatus({ ok: false, text: cause instanceof Error ? cause.message : "Upload failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-wrap">
      <div className="mb-7 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="page-kicker mb-4">05 / Retrieval sources</p>
          <h1 className="page-title">Knowledge base.</h1>
          <p className="page-intro mt-3">Manage the commercial documents used as retrieval sources during request analysis. Indexed content is searchable by semantic similarity.</p>
        </div>
        <button onClick={() => void loadDocuments()} disabled={refreshing} className="inline-flex h-9 items-center gap-2 self-start border border-[#d5d8e0] bg-white px-3 text-[10px] font-bold text-[#555b69] hover:border-[#365dff] hover:text-[#365dff] disabled:opacity-50"><RefreshCw size={13} className={refreshing ? "animate-spin" : ""}/> Refresh library</button>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="stat-tile"><p className="stat-label">Documents</p><p className="stat-value">{documents.length}</p><p className="mt-2 text-[9px] text-[#8b909d]">Stored sources</p></div>
        <div className="stat-tile"><p className="stat-label">Indexed</p><p className="stat-value text-[#27875a]">{documents.filter(item => item.status === "indexed").length}</p><p className="mt-2 text-[9px] text-[#8b909d]">Available to retrieval</p></div>
        <div className="stat-tile"><p className="stat-label">Searchable chunks</p><p className="stat-value">{documents.reduce((sum,item) => sum + (item.status === "indexed" ? item.chunk_count : 0), 0)}</p><p className="mt-2 text-[9px] text-[#8b909d]">Vector-indexed passages</p></div>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(300px,.75fr)_minmax(430px,1.25fr)]">
        <section className="ui-panel">
          <div className="ui-panel-header"><div><p className="page-kicker">Ingestion / 01</p><h2 className="ui-panel-title mt-1.5">Add a source document</h2><p className="ui-panel-subtitle">Index product and commercial knowledge.</p></div><FileUp size={16} className="text-[#365dff]"/></div>
          <div className="p-5">
            <label className="field-label" htmlFor="doc-title">Document title</label>
            <input id="doc-title" value={title} onChange={event => setTitle(event.target.value)} placeholder="e.g. Product catalog — 2026" className="field-control mb-4"/>
            <label className="field-label" htmlFor="doc-file">Source file</label>
            <input id="doc-file" type="file" accept=".txt,.md,.csv,.json,.pdf,.docx" onChange={event => setFile(event.target.files?.[0] ?? null)} className="file-input block w-full border border-[#dfe1e7] bg-white p-2 text-[10px] text-[#626878]"/>
            <p className="mt-2 field-hint">PDF, DOCX, CSV, JSON, Markdown or TXT · 10 MB maximum</p>
            {file && <div className="mt-3 flex items-center justify-between gap-2 border border-[#e1e3e9] bg-[#f7f8fa] p-2.5"><span className="truncate text-[9px] font-semibold">{file.name}</span><span className="mono shrink-0 text-[8px] text-[#858b98]">{(file.size / 1024 / 1024).toFixed(2)} MB</span></div>}
            {status && <p role="status" className={"mt-4 flex items-start gap-2 text-[9px] leading-[1.7] " + (status.ok ? "text-[#27875a]" : "text-[#b14846]")}>{status.ok ? <CheckCircle2 size={13} className="mt-0.5 shrink-0"/> : <AlertCircle size={13} className="mt-0.5 shrink-0"/>}{status.text}</p>}
            <Button onClick={upload} disabled={!file || loading} className="mt-5 w-full">{loading ? <LoaderCircle size={14} className="animate-spin"/> : <FileUp size={14} />}{loading ? "Indexing document…" : "Upload and index"}{!loading && <ArrowUpRight size={13}/>}</Button>
          </div>
          <div className="border-t border-[#e1e3e9] bg-[#f6f7f9] px-5 py-3 text-[9px] leading-[1.7] text-[#818795]">Documents are extracted, segmented and embedded. A failed ingestion remains visible so the issue is not hidden.</div>
        </section>

        <section className="ui-panel min-w-0">
          <div className="ui-panel-header"><div><p className="page-kicker">Repository / 02</p><h2 className="ui-panel-title mt-1.5">Stored documents</h2><p className="ui-panel-subtitle">Live records from the workspace database.</p></div><span className="mono text-[8px] text-[#9297a3]">{documents.length} RECORDS</span></div>
          {error && <div role="alert" className="m-4 border border-[#f0d1ce] bg-[#fff7f6] p-3 text-[10px] text-[#a84b49]">{error}</div>}
          {refreshing ? <div className="empty-state"><RefreshCw size={17} className="animate-spin text-[#365dff]"/><p className="mt-3 text-[10px] text-[#888e9a]">Loading stored documents…</p></div>
          : documents.length ? <div className="divide-y divide-[#e6e8ed]">
            {documents.map(item => <article key={item.id} className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center border border-[#dfe1e7] bg-[#f6f7fa] text-[#64708a]"><FileArchive size={16}/></span>
                <div className="min-w-0"><p className="truncate text-[11px] font-bold text-[#303543]">{item.title}</p><p className="mono mt-1 text-[8px] text-[#9297a3]">{item.source_type.toUpperCase()} · {item.chunk_count} CHUNKS · {new Intl.DateTimeFormat(undefined,{dateStyle:"medium"}).format(new Date(item.created_at))}</p></div>
              </div>
              <span className={documentStatus(item.status)}>{item.status}</span>
            </article>)}
          </div> : <div className="empty-state"><span className="empty-symbol"><FileText size={18}/></span><p className="mt-4 text-[12px] font-bold">The knowledge base is empty</p><p className="mt-2 max-w-[270px] text-[10px] leading-[1.7] text-[#8d93a0]">Upload actual product catalogs, technical sheets or commercial terms. No demo documents are added automatically.</p></div>}
          <div className="border-t border-[#e1e3e9] bg-[#f7f8fa] px-4 py-3 text-[9px] text-[#858b98]">Supported formats are validated by the ingestion API.</div>
        </section>
      </div>
    </main>
  );
}
