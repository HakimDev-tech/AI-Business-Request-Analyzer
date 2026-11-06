"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowRight, ArrowUpRight, FileSearch, Layers3, RefreshCw, ShieldAlert
} from "lucide-react";

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
type Payload = {
  success: boolean;
  metrics: { total: number; ready: number; clarification: number; review: number; stock_issues: number; no_match: number };
  documents: { total: number; indexed: number; chunks: number };
  catalog: { products: number; stock_units: number };
  requests: RequestRow[];
};

const decisionText: Record<string, string> = {
  ready_for_quote: "Ready for quote",
  needs_clarification: "Needs clarification",
  manual_review: "Manual review",
  insufficient_stock: "Stock issue",
  no_catalog_match: "No catalog match",
};

function statusClass(value: string) {
  if (value === "ready_for_quote") return "status-tag status-ready";
  if (value === "insufficient_stock" || value === "no_catalog_match") return "status-tag status-danger";
  if (value === "needs_clarification" || value === "manual_review") return "status-tag status-review";
  return "status-tag status-neutral";
}
function dateLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function WorkspaceDashboard() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/requests?limit=8", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error ?? "Could not load workspace");
      setData(payload);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Workspace data unavailable");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function initialLoad() {
      try {
        const response = await fetch("/api/requests?limit=8", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok || !payload.success) throw new Error(payload.error ?? "Could not load workspace");
        if (!cancelled) setData(payload);
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Workspace data unavailable");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void initialLoad();
    return () => { cancelled = true; };
  }, []);

  const metrics = data?.metrics;
  const reviewCount = metrics ? metrics.clarification + metrics.review + metrics.stock_issues : 0;
  const distribution = useMemo(() => {
    if (!metrics || !metrics.total) return [];
    return [
      { label: "Ready for quote", value: metrics.ready, color: "#365dff" },
      { label: "Clarification", value: metrics.clarification, color: "#cf8b36" },
      { label: "Manual review", value: metrics.review, color: "#8b75d7" },
      { label: "Stock issue", value: metrics.stock_issues, color: "#d15c50" },
      { label: "No catalog match", value: metrics.no_match, color: "#9298a6" },
    ];
  }, [metrics]);

  return (
    <main className="page-wrap">
      <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <p className="page-kicker mb-4">01 / Operations overview</p>
          <h1 className="page-title">Know what needs<br/><span className="text-[#365dff]">your attention.</span></h1>
          <p className="page-intro mt-4">A live view of incoming commercial requests, decision outcomes and the knowledge sources supporting your team.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => void load()} disabled={loading} className="inline-flex h-10 items-center gap-2 border border-[#d5d8e0] bg-white px-3 text-[10px] font-bold text-[#555b69] hover:border-[#365dff] hover:text-[#365dff] disabled:opacity-50">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""}/> Refresh
          </button>
          <Link href="/analyzer" className="inline-flex h-10 items-center gap-2 bg-[#365dff] px-4 text-[10px] font-bold text-white hover:bg-[#274ce5]">
            <FileSearch size={14}/> Analyze a request <ArrowUpRight size={13}/>
          </Link>
        </div>
      </div>

      {error && <div role="alert" className="mb-5 flex items-center justify-between border border-[#f0d1ce] bg-[#fff8f7] px-4 py-3 text-[11px] text-[#a84b49]"><span>{error}</span><button onClick={() => void load()} className="font-bold underline">Retry</button></div>}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="stat-tile"><p className="stat-label">Requests analyzed</p><p className="stat-value">{loading ? "—" : metrics?.total ?? 0}</p><p className="mt-2 text-[9px] text-[#8b909d]">Persisted request records</p></div>
        <div className="stat-tile"><p className="stat-label">Ready for quotation</p><p className="stat-value text-[#365dff]">{loading ? "—" : metrics?.ready ?? 0}</p><p className="mt-2 text-[9px] text-[#8b909d]">Catalog and stock checks passed</p></div>
        <div className="stat-tile"><p className="stat-label">Needs attention</p><p className="stat-value text-[#b77b2d]">{loading ? "—" : reviewCount}</p><p className="mt-2 text-[9px] text-[#8b909d]">Clarification, review or stock issue</p></div>
        <div className="stat-tile"><p className="stat-label">Active products</p><p className="stat-value">{loading ? "—" : data?.catalog.products ?? 0}</p><p className="mt-2 text-[9px] text-[#8b909d]">{data?.catalog.stock_units ?? 0} available units</p></div>
        <div className="stat-tile"><p className="stat-label">Indexed documents</p><p className="stat-value">{loading ? "—" : data?.documents.indexed ?? 0}</p><p className="mt-2 text-[9px] text-[#8b909d]">{data?.documents.chunks ?? 0} searchable chunks</p></div>
      </div>

      <div className="grid items-start gap-4 2xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,.75fr)]">
        <section className="ui-panel min-w-0">
          <div className="ui-panel-header">
            <div><p className="page-kicker">Activity / 001</p><h2 className="ui-panel-title mt-1.5">Recent requests</h2><p className="ui-panel-subtitle">Most recent analyses saved to this workspace.</p></div>
            <Link href="/requests" className="inline-flex items-center gap-1 text-[10px] font-bold text-[#365dff] hover:underline">View history <ArrowRight size={12}/></Link>
          </div>
          {loading ? <div className="empty-state"><RefreshCw size={17} className="animate-spin text-[#365dff]"/><p className="mt-3 text-[10px] text-[#777d8b]">Loading persisted records…</p></div>
          : data?.requests.length ? (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Request</th><th>Product</th><th>Outcome</th><th>Received</th><th></th></tr></thead>
                <tbody>{data.requests.map(item => (
                  <tr key={item.id}>
                    <td className="min-w-[210px]"><Link href={`/requests/${item.id}`} className="block max-w-[310px] truncate font-semibold text-[#262a36] hover:text-[#365dff]">{item.summary || "Untitled request"}</Link><span className="mono mt-1 block text-[8px] text-[#a0a4ae]">{item.id.slice(0, 8).toUpperCase()}</span></td>
                    <td className="min-w-[110px]">{item.product || "—"}{item.quantity ? <span className="mono ml-1 text-[9px] text-[#9196a2]">×{item.quantity}</span> : null}</td>
                    <td><span className={statusClass(item.decision)}>{decisionText[item.decision] ?? item.decision}</span></td>
                    <td className="min-w-[110px] whitespace-nowrap text-[#777d8b]">{dateLabel(item.created_at)}</td>
                    <td><Link href={`/requests/${item.id}`} aria-label="Open request" className="grid size-7 place-items-center border border-[#e0e2e8] bg-white text-[#707684] hover:border-[#365dff] hover:text-[#365dff]"><ArrowUpRight size={13}/></Link></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-symbol"><FileSearch size={19}/></span>
              <p className="mt-4 text-[12px] font-bold">No requests have been analyzed</p>
              <p className="mt-1 max-w-[260px] text-[10px] leading-[1.7] text-[#8d93a0]">New customer messages will appear here after analysis. Nothing has been preloaded.</p>
              <Link href="/analyzer" className="mt-4 inline-flex items-center gap-2 bg-[#365dff] px-3 py-2.5 text-[10px] font-bold text-white">Create first analysis <ArrowRight size={12}/></Link>
            </div>
          )}
        </section>

        <div className="space-y-4">
          <section className="ui-panel">
            <div className="ui-panel-header">
              <div><p className="page-kicker">Outcomes / 002</p><h2 className="ui-panel-title mt-1.5">Decision distribution</h2></div>
              <Activity size={15} className="text-[#858b99]"/>
            </div>
            {loading ? <div className="p-5 text-[10px] text-[#888e9a]">Loading decision counts…</div>
            : metrics?.total ? <div className="p-5">
              <div className="mb-5 flex items-end justify-between"><span className="font-mono text-[9px] uppercase tracking-[.1em] text-[#888e9a]">Total analyzed</span><span className="font-[var(--font-space)] text-[29px] font-semibold leading-none tracking-[-.06em]">{metrics.total}</span></div>
              <div className="mb-5 flex h-2 w-full overflow-hidden bg-[#e7e9ef]">{distribution.map(item => <span key={item.label} title={item.label} style={{ width: (item.value / metrics.total * 100) + "%", background: item.color }}/>)}</div>
              <div className="space-y-3">{distribution.map(item => <div key={item.label} className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-[10px] text-[#626877]"><span className="size-2" style={{ background: item.color }}/>{item.label}</span><span className="mono text-[10px] font-semibold">{item.value}</span></div>)}</div>
            </div> : <div className="p-5 text-[10px] leading-[1.7] text-[#8d93a0]">No decisions to summarize yet. This panel will populate from saved analyses.</div>}
          </section>

          <section className="ui-panel">
            <div className="ui-panel-header">
              <div><p className="page-kicker">Knowledge / 003</p><h2 className="ui-panel-title mt-1.5">Source library</h2></div>
              <Layers3 size={15} className="text-[#858b99]"/>
            </div>
            <div className="p-5">
              <div className="flex items-end justify-between"><div><p className="font-[var(--font-space)] text-[28px] font-semibold leading-none tracking-[-.06em]">{loading ? "—" : data?.documents.total ?? 0}</p><p className="mt-2 text-[9px] text-[#878d9a]">Documents uploaded</p></div><div className="text-right"><p className="mono text-[18px] font-semibold">{loading ? "—" : data?.documents.chunks ?? 0}</p><p className="mt-1 text-[9px] text-[#878d9a]">Indexed chunks</p></div></div>
              <div className="mt-4 border-t border-[#e6e8ed] pt-3"><Link href="/catalog" className="inline-flex items-center gap-2 text-[10px] font-bold text-[#365dff] hover:underline">Manage knowledge base <ArrowRight size={12}/></Link></div>
            </div>
          </section>

          <section className="border border-[#d9def0] bg-[#edf0ff] p-4">
            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.12em] text-[#365dff]"><ShieldAlert size={13}/> Decision control</div>
            <p className="mt-2 text-[10px] leading-[1.7] text-[#59627b]">A model extraction is not a commercial approval. Inventory checks and business rules determine the recorded outcome.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
