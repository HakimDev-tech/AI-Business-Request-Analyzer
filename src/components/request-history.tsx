"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Archive, ArrowUpRight, FileSearch, RefreshCw, Search, SlidersHorizontal } from "lucide-react";

type RequestRow = {
  id: string;
  conversation_id: string;
  decision: string;
  created_at: string;
  summary: string | null;
  product: string | null;
  quantity: string | null;
  destination: string | null;
};
type ApiResponse = { success: boolean; requests: RequestRow[]; metrics: Record<string, number> };
const labels: Record<string, string> = {
  ready_for_quote: "Ready for quotation",
  needs_clarification: "Needs clarification",
  manual_review: "Manual review",
  insufficient_stock: "Stock issue",
  no_catalog_match: "No catalog match",
};
function tag(value: string) {
  if (value === "ready_for_quote") return "status-tag status-ready";
  if (value === "needs_clarification" || value === "manual_review") return "status-tag status-review";
  if (value === "insufficient_stock" || value === "no_catalog_match") return "status-tag status-danger";
  return "status-tag status-neutral";
}

export function RequestHistory() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [decision, setDecision] = useState("all");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/requests?limit=100", { cache: "no-store" });
      const payload = await response.json() as ApiResponse;
      if (!response.ok || !payload.success) throw new Error("Request history could not be loaded");
      setRequests(payload.requests);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to reach request history");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return requests.filter(item => {
      const matchesDecision = decision === "all" || item.decision === decision;
      const matchesText = !term || [item.summary, item.product, item.destination, item.id].some(value => value?.toLowerCase().includes(term));
      return matchesDecision && matchesText;
    });
  }, [requests, search, decision]);

  return (
    <main className="page-wrap">
      <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="page-kicker mb-4">03 / Operational records</p>
          <h1 className="page-title">Request history.</h1>
          <p className="page-intro mt-3">Search and review saved analyses. Each record contains the original message, extracted fields, decision and evidence returned by the processing workflow.</p>
        </div>
        <button onClick={() => void load()} disabled={loading} className="inline-flex h-9 items-center gap-2 self-start border border-[#d5d8e0] bg-white px-3 text-[10px] font-bold text-[#555b69] hover:border-[#365dff] hover:text-[#365dff] disabled:opacity-50"><RefreshCw size={13} className={loading ? "animate-spin" : ""}/> Refresh records</button>
      </div>

      <section className="ui-panel">
        <div className="ui-panel-header">
          <div><p className="page-kicker">Saved data / 001</p><h2 className="ui-panel-title mt-1.5">Analyzed requests <span className="mono ml-1 text-[9px] font-medium text-[#8c91a0]">{requests.length}</span></h2></div>
          <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-[#737988]"><Archive size={13}/> Database records</span>
        </div>
        <div className="flex flex-col gap-3 border-b border-[#e1e3e9] bg-[#f7f8fa] p-4 md:flex-row md:items-center">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search requests</span>
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9297a2]"/>
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search summary, product, destination or record ID…" className="h-9 w-full border border-[#dfe1e7] bg-white pl-9 pr-3 text-[10px] outline-none focus:border-[#365dff]"/>
          </label>
          <label className="flex items-center gap-2 text-[9px] font-bold text-[#757b89]">
            <SlidersHorizontal size={13}/>
            <span>Outcome</span>
            <select value={decision} onChange={event => setDecision(event.target.value)} className="h-9 border border-[#dfe1e7] bg-white px-3 text-[10px] font-medium text-[#3b4050] outline-none focus:border-[#365dff]">
              <option value="all">All outcomes</option>
              <option value="ready_for_quote">Ready for quotation</option>
              <option value="needs_clarification">Needs clarification</option>
              <option value="manual_review">Manual review</option>
              <option value="insufficient_stock">Stock issue</option>
              <option value="no_catalog_match">No catalog match</option>
            </select>
          </label>
        </div>

        {error && <div role="alert" className="m-4 border border-[#f0d1ce] bg-[#fff7f6] p-3 text-[10px] text-[#a84b49]">{error} <button onClick={() => void load()} className="ml-2 font-bold underline">Retry</button></div>}

        {loading ? <div className="empty-state"><RefreshCw size={17} className="animate-spin text-[#365dff]"/><p className="mt-3 text-[10px] text-[#888e9a]">Loading request records…</p></div>
        : filtered.length ? <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Record</th><th>Product / Qty</th><th>Destination</th><th>Decision</th><th>Created</th><th></th></tr></thead>
            <tbody>{filtered.map(item => <tr key={item.id}>
              <td className="min-w-[230px]"><Link href={"/requests/" + item.id} className="block max-w-[360px] truncate font-bold text-[#292e3b] hover:text-[#365dff]">{item.summary || "Unlabelled request"}</Link><span className="mono mt-1 block text-[8px] text-[#a0a4ae]">{item.id.toUpperCase()}</span></td>
              <td className="min-w-[120px]">{item.product || "—"}{item.quantity ? <span className="mono ml-1 text-[9px] text-[#888e9a]">×{item.quantity}</span> : null}</td>
              <td className="min-w-[100px]">{item.destination || "—"}</td>
              <td><span className={tag(item.decision)}>{labels[item.decision] ?? item.decision}</span></td>
              <td className="min-w-[125px] whitespace-nowrap text-[9px] text-[#7d8390]">{new Intl.DateTimeFormat(undefined,{dateStyle:"medium",timeStyle:"short"}).format(new Date(item.created_at))}</td>
              <td><Link href={"/requests/" + item.id} className="grid size-7 place-items-center border border-[#e0e2e8] bg-white text-[#777d8b] hover:border-[#365dff] hover:text-[#365dff]" aria-label="Open record"><ArrowUpRight size={13}/></Link></td>
            </tr>)}</tbody>
          </table>
        </div> : <div className="empty-state">
          <span className="empty-symbol"><FileSearch size={18}/></span>
          <p className="mt-4 text-[12px] font-bold">{requests.length ? "No records match these filters" : "No saved request records"}</p>
          <p className="mt-2 max-w-[300px] text-[10px] leading-[1.7] text-[#8d93a0]">{requests.length ? "Adjust the search phrase or outcome filter." : "Analyses will appear here after you submit a customer message. No example records are inserted."}</p>
        </div>}
        {!loading && <div className="flex flex-col justify-between gap-2 border-t border-[#e1e3e9] bg-[#f7f8fa] px-4 py-3 text-[9px] text-[#858b98] sm:flex-row"><span>Showing {filtered.length} of {requests.length} loaded records</span><span>Most recent records first · Maximum 100 per load</span></div>}
      </section>
    </main>
  );
}
