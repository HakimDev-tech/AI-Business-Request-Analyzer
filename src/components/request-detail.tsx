"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Clock3, FileText, RefreshCw, ShieldCheck } from "lucide-react";

type SavedRequest = {
  id: string;
  conversation_id: string;
  original_message: string;
  extracted_data: {
    request_type: string;
    product: string | null;
    quantity: number | null;
    unit: string | null;
    technical_requirements: { name: string; value: string; operator: string }[];
    destination: string | null;
    requested_delivery_date: string | null;
    missing_information: string[];
    summary: string;
    confidence: number;
  };
  decision: string;
  decision_payload: {
    catalogMatches?: { id: string; sku: string; name: string; price_amount: string | null; price_currency: string | null }[];
    stockChecks?: { status: string; available: number; requestedQuantity: number; product: { name: string } }[];
    documentContext?: { source_title: string; content: string; similarity: number }[];
    decisionRationale?: string[];
    toolResults?: unknown[];
  };
  created_at: string;
};

const labels: Record<string, string> = {
  ready_for_quote: "Ready for quotation",
  needs_clarification: "Clarification required",
  manual_review: "Manual review",
  insufficient_stock: "Insufficient stock",
  no_catalog_match: "No catalog match",
};
function outcomeClass(value: string) {
  if (value === "ready_for_quote") return "status-tag status-ready";
  if (value === "needs_clarification" || value === "manual_review") return "status-tag status-review";
  if (value === "insufficient_stock" || value === "no_catalog_match") return "status-tag status-danger";
  return "status-tag status-neutral";
}

export function RequestDetail({ id }: { id: string }) {
  const [record, setRecord] = useState<SavedRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/requests/" + id, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error ?? "Record could not be loaded");
      setRecord(payload.request);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load this record");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { void load(); }, [id]);

  if (loading) return <main className="page-wrap"><div className="empty-state"><RefreshCw size={18} className="animate-spin text-[#365dff]"/><p className="mt-3 text-[10px] text-[#7d8390]">Loading saved request…</p></div></main>;
  if (error || !record) return <main className="page-wrap"><Link href="/requests" className="mb-6 inline-flex items-center gap-2 text-[10px] font-bold text-[#365dff]"><ArrowLeft size={13}/> Back to request history</Link><div role="alert" className="border border-[#f0d1ce] bg-[#fff7f6] p-5 text-[11px] text-[#a84b49]">{error || "Record not found"} <button onClick={() => void load()} className="ml-2 underline">Retry</button></div></main>;

  const extracted = record.extracted_data;
  const payload = record.decision_payload ?? {};

  return (
    <main className="page-wrap">
      <Link href="/requests" className="mb-6 inline-flex items-center gap-2 text-[10px] font-bold text-[#365dff] hover:underline"><ArrowLeft size={13}/> Back to request history</Link>
      <div className="mb-7 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div><p className="page-kicker mb-3">04 / Request record</p><h1 className="page-title">Saved analysis.</h1><p className="mono mt-3 break-all text-[9px] text-[#8b909d]">{record.id.toUpperCase()}</p></div>
        <div className="flex items-center gap-3"><span className={outcomeClass(record.decision)}>{labels[record.decision] ?? record.decision}</span><span className="flex items-center gap-1.5 text-[9px] text-[#858b98]"><Clock3 size={12}/>{new Intl.DateTimeFormat(undefined,{dateStyle:"long",timeStyle:"short"}).format(new Date(record.created_at))}</span></div>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(280px,.75fr)]">
        <div className="space-y-4">
          <section className="ui-panel">
            <div className="ui-panel-header"><div><p className="page-kicker">Original source / 01</p><h2 className="ui-panel-title mt-1.5">Customer message</h2></div><FileText size={15} className="text-[#7f8592]"/></div>
            <div className="whitespace-pre-wrap p-5 text-[11px] leading-[1.9] text-[#3c4250]">{record.original_message}</div>
          </section>
          <section className="ui-panel">
            <div className="ui-panel-header"><div><p className="page-kicker">Extraction / 02</p><h2 className="ui-panel-title mt-1.5">Structured requirements</h2></div><span className="mono text-[9px] text-[#8c91a0]">{Math.round(extracted.confidence * 100)}% CONFIDENCE</span></div>
            <div className="grid gap-px bg-[#e1e3e9] sm:grid-cols-2">
              {[
                ["Summary", extracted.summary],
                ["Request type", extracted.request_type],
                ["Product", extracted.product],
                ["Quantity", extracted.quantity ? extracted.quantity + " " + (extracted.unit ?? "") : null],
                ["Destination", extracted.destination],
                ["Requested delivery", extracted.requested_delivery_date],
              ].map(([label,value])=><div key={label} className="bg-white p-4"><p className="page-kicker !text-[8px]">{label}</p><p className="mt-2 break-words text-[11px] font-semibold text-[#303543]">{value || "Not specified"}</p></div>)}
            </div>
            <div className="border-t border-[#e1e3e9] p-4"><p className="mb-3 page-kicker !text-[8px]">Technical requirements</p>{extracted.technical_requirements.length ? <div className="flex flex-wrap gap-2">{extracted.technical_requirements.map((item,index)=><span key={index} className="border border-[#e1e3e9] px-3 py-2 text-[9px] text-[#555b69]">{item.name}: <b className="text-[#252a36]">{item.value}</b></span>)}</div> : <p className="text-[10px] text-[#8e93a0]">No technical requirements extracted.</p>}</div>
            <div className="border-t border-[#e1e3e9] p-4"><p className="mb-3 page-kicker !text-[8px]">Missing information</p>{extracted.missing_information.length ? <div className="flex flex-wrap gap-2">{extracted.missing_information.map(item=><span key={item} className="border border-[#f0dfbd] bg-[#fffbf3] px-2.5 py-1.5 text-[9px] text-[#956a2f]">{item}</span>)}</div> : <p className="text-[10px] text-[#27875a]">No missing fields detected.</p>}</div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="ui-panel">
            <div className="ui-panel-header"><div><p className="page-kicker">Decision / 03</p><h2 className="ui-panel-title mt-1.5">Business outcome</h2></div><ShieldCheck size={15} className="text-[#365dff]"/></div>
            <div className="p-5"><p className="text-[12px] font-bold leading-[1.7]">{extracted.summary}</p><div className="mt-4 border-t border-[#e3e5eb] pt-4">{(payload.decisionRationale ?? []).map((item,index)=><p key={index} className="mb-2 flex gap-2 text-[9px] leading-[1.7] text-[#6f7583]"><Check size={12} className="mt-0.5 shrink-0 text-[#365dff]"/>{item}</p>)}</div></div>
          </section>

          <section className="ui-panel">
            <div className="ui-panel-header"><div><p className="page-kicker">Catalog / 04</p><h2 className="ui-panel-title mt-1.5">Product matches</h2></div></div>
            <div className="p-4">{payload.catalogMatches?.length ? payload.catalogMatches.map(item=><div key={item.id} className="border-b border-[#e7e8ed] py-3 last:border-0"><p className="text-[10px] font-bold">{item.name}</p><div className="mt-1 flex justify-between gap-2"><span className="mono text-[8px] text-[#8b909d]">{item.sku}</span><span className="mono text-[8px] text-[#586071]">{item.price_amount ? item.price_amount + " " + (item.price_currency ?? "") : "No listed price"}</span></div></div>) : <p className="text-[10px] text-[#8d93a0]">No catalog products matched.</p>}</div>
          </section>

          <section className="ui-panel">
            <div className="ui-panel-header"><div><p className="page-kicker">Inventory / 05</p><h2 className="ui-panel-title mt-1.5">Stock checks</h2></div></div>
            <div className="p-4">{payload.stockChecks?.length ? payload.stockChecks.map((item,index)=><div key={index} className="mb-2 flex justify-between gap-2 text-[9px]"><span className="font-semibold">{item.product.name}</span><span className={item.status === "sufficient" ? "text-[#27875a]" : "text-[#b14846]"}>{item.available} available / {item.requestedQuantity} needed</span></div>) : <p className="text-[10px] text-[#8d93a0]">No inventory check was performed.</p>}</div>
          </section>

          <section className="ui-panel">
            <div className="ui-panel-header"><div><p className="page-kicker">Knowledge / 06</p><h2 className="ui-panel-title mt-1.5">Retrieved evidence</h2></div></div>
            <div className="p-4">{payload.documentContext?.length ? payload.documentContext.map((item,index)=><div key={index} className="mb-3 border-b border-[#e7e8ed] pb-3 last:border-0"><div className="flex justify-between gap-2"><p className="text-[9px] font-bold">{item.source_title}</p><span className="mono text-[8px] text-[#8c91a0]">{Math.round(item.similarity*100)}%</span></div><p className="mt-2 line-clamp-4 text-[9px] leading-[1.7] text-[#737988]">{item.content}</p></div>) : <p className="text-[10px] text-[#8d93a0]">No knowledge excerpts were retrieved.</p>}</div>
          </section>
        </div>
      </div>
    </main>
  );
}
