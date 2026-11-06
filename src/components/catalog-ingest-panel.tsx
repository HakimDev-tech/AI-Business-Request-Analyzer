"use client";

import { useState } from "react";
import { FileUp, LoaderCircle, CheckCircle2, AlertCircle, FileText, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CatalogIngestPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  async function upload() {
    if (!file) return;
    setLoading(true);
    setStatus(null);
    const form = new FormData();
    form.set("file", file);
    form.set("title", title.trim() || file.name);
    try {
      const response = await fetch("/api/catalog", { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || "Indexing failed");
      setStatus({ ok: true, text: `Indexed ${payload.result.chunks} document chunks successfully.` });
      setFile(null);
      setTitle("");
      const input = document.getElementById("doc-file") as HTMLInputElement | null;
      if (input) input.value = "";
    } catch (error) {
      setStatus({ ok: false, text: error instanceof Error ? error.message : "Upload failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="catalog" className="workspace-main border-t border-[#d9dbd1] bg-[#eeeee7]">
      <div className="workspace-content !pt-9">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow mb-3">02 / Retrieval sources</p>
            <h2 className="text-[25px] font-semibold tracking-[-.045em]">Knowledge library</h2>
            <p className="mt-2 max-w-[560px] text-[12px] leading-[1.8] text-[#778177]">Add the documents your team relies on. Veyra indexes their content for semantic retrieval during request analysis.</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[#71806f]"><span className="status-dot"/> Ready to index</div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[.72fr_1.28fr]">
          <div className="border border-[#dedfd6] bg-[#fbfaf6] p-5 shadow-[0_1px_2px_rgba(24,36,31,.03)]">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-[9px] bg-[#e9eddf] text-[#526b50]"><FileUp size={16}/></span>
              <div><h3 className="text-[12px] font-semibold">Add a source document</h3><p className="mt-1 text-[10px] text-[#899188]">Create searchable knowledge</p></div>
            </div>

            <label className="field-label" htmlFor="doc-title">Document title</label>
            <input id="doc-title" value={title} onChange={event => setTitle(event.target.value)} placeholder="e.g. Product catalog — Q4" className="field-control mb-4"/>

            <label className="field-label" htmlFor="doc-file">Choose document</label>
            <label htmlFor="doc-file" className="flex min-h-[104px] cursor-pointer flex-col items-center justify-center border border-dashed border-[#cbd1c4] bg-[#f6f7f1] px-4 py-4 text-center transition hover:border-[#8fa27f] hover:bg-[#f1f4e9]">
              <FileText size={19} className="mb-2 text-[#6c8067]"/>
              <span className="text-[11px] font-semibold text-[#46574a]">{file ? file.name : "Select a file to index"}</span>
              <span className="mt-1 text-[9px] text-[#899188]">TXT, MD, CSV, JSON, PDF or DOCX · 10 MB max</span>
            </label>
            <input id="doc-file" type="file" accept=".txt,.md,.csv,.json,.pdf,.docx" onChange={event => setFile(event.target.files?.[0] ?? null)} className="sr-only"/>

            <div className="mt-5 flex flex-col gap-3">
              <Button onClick={upload} disabled={!file || loading} className="w-full">
                {loading ? <LoaderCircle size={14} className="animate-spin"/> : <FileUp size={14}/>}
                {loading ? "Indexing document" : "Index document"}
                {!loading && <ArrowUpRight size={13}/>}
              </Button>
              {status && <p role="status" className={`flex items-start gap-2 text-[10px] leading-5 ${status.ok ? "text-[#4f7858]" : "text-[#a94f48]"}`}>{status.ok ? <CheckCircle2 size={14} className="mt-0.5 shrink-0"/> : <AlertCircle size={14} className="mt-0.5 shrink-0"/>}{status.text}</p>}
            </div>
          </div>

          <div className="flex min-h-[250px] flex-col justify-between border border-[#dedfd6] bg-[#fbfaf6] p-5">
            <div>
              <div className="flex items-center justify-between">
                <div><p className="eyebrow">Supported source formats</p><h3 className="mt-2 text-[14px] font-semibold">One knowledge layer. Multiple inputs.</h3></div>
                <span className="mono text-[9px] text-[#9aa198]">INGEST / 06</span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[
                  ["PDF","Portable documents"],["DOCX","Word documents"],["CSV","Structured data"],
                  ["JSON","Application data"],["MD","Markdown notes"],["TXT","Plain text"],
                ].map(([format,detail]) => <div key={format} className="border border-[#e1e2d9] bg-white px-3 py-3">
                  <p className="mono text-[11px] font-semibold text-[#536b55]">{format}</p>
                  <p className="mt-1 text-[9px] text-[#8a9389]">{detail}</p>
                </div>)}
              </div>
            </div>
            <p className="mt-5 border-t border-[#e4e5dd] pt-4 text-[10px] leading-[1.7] text-[#879087]">Documents are converted into text chunks and indexed for semantic search. Retrieval quality depends on source clarity, document structure and metadata.</p>
          </div>
        </div>
      </div>
    </section>
  );
}