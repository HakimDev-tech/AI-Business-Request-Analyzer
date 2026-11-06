"use client";
import { useState } from "react";
import { FileUp, LoaderCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CatalogIngestPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ok:boolean;text:string}|null>(null);

  async function upload() {
    if (!file) return;
    setLoading(true); setStatus(null);
    const form = new FormData();
    form.set("file", file);
    form.set("title", title.trim() || file.name);
    try {
      const response = await fetch("/api/catalog", { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || "Indexing failed");
      setStatus({ ok: true, text: `Indexed ${payload.result.chunks} document chunks successfully.` });
      setFile(null); setTitle("");
    } catch (error) {
      setStatus({ ok: false, text: error instanceof Error ? error.message : "Upload failed" });
    } finally { setLoading(false); }
  }

  return (
    <section className="border-t border-slate-200 bg-white px-5 py-10 md:px-10">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-5 flex items-start gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><FileUp size={18}/></div>
          <div><h2 className="text-sm font-semibold">Knowledge base documents</h2><p className="mt-1 text-xs text-slate-500">Add product catalogs, technical sheets or commercial terms for semantic retrieval.</p></div>
        </div>
        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:grid-cols-[1fr_1.4fr_auto] md:items-end">
          <div><label className="mb-2 block text-[11px] font-medium text-slate-600" htmlFor="doc-title">Document title</label><input id="doc-title" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Product catalog Q4" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-300"/></div>
          <div><label className="mb-2 block text-[11px] font-medium text-slate-600" htmlFor="doc-file">Choose file <span className="font-normal text-slate-400">· TXT, MD, CSV, JSON, PDF, DOCX · max 10 MB</span></label><input id="doc-file" type="file" accept=".txt,.md,.csv,.json,.pdf,.docx" onChange={e=>setFile(e.target.files?.[0]??null)} className="block h-11 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-medium"/></div>
          <Button onClick={upload} disabled={!file||loading}>{loading?<LoaderCircle size={15} className="animate-spin"/>:<FileUp size={15}/>}Index document</Button>
          {status&&<p className={`flex items-center gap-2 text-xs md:col-span-3 ${status.ok?"text-emerald-700":"text-rose-700"}`}>{status.ok?<CheckCircle2 size={14}/>:<AlertCircle size={14}/ >}{status.text}</p>}
        </div>
      </div>
    </section>
  );
}