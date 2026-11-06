"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowRight, ArrowUpRight, BadgeCheck, Check, CircleAlert,
  ClipboardCheck, FileSearch, LoaderCircle, ShieldCheck, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

type AnalysisResult = {
  requestId?: string;
  extracted: {
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
  catalogMatches: { id: string; sku: string; name: string; price_amount: string | null; price_currency: string | null }[];
  stockChecks: { status: string; available: number; requestedQuantity: number; product: { name: string } }[];
  documentContext: { source_title: string; content: string; similarity: number }[];
  decisionRationale: string[];
};

const outcomeLabel: Record<string, string> = {
  ready_for_quote: "Ready for quotation",
  needs_clarification: "Clarification required",
  no_catalog_match: "No catalog match",
  insufficient_stock: "Insufficient stock",
  manual_review: "Manual review",
};
const outcomeClass: Record<string, string> = {
  ready_for_quote: "status-tag status-ready",
  needs_clarification: "status-tag status-review",
  manual_review: "status-tag status-review",
  no_catalog_match: "status-tag status-danger",
  insufficient_stock: "status-tag status-danger",
};

function DataField({ label, value }: { label: string; value: string | number | null }) {
  return <div className="border border-[#e1e3e9] bg-white p-3"><p className="page-kicker !text-[8px]">{label}</p><p className="mt-2 break-words text-[11px] font-bold text-[#272b38]">{value ?? "Not specified"}</p></div>;
}

export function AnalyzerWorkspace() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [conversationId, setConversationId] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (message.trim().length < 12 || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    setSaved(false);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim(), conversationId }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error ?? "Analysis could not be completed");
      setConversationId(payload.conversationId);
      setResult(payload.result);
      setSaved(Boolean(payload.result.requestId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unexpected error during analysis");
    } finally {
      setLoading(false);
    }
  }

  const confidence = result ? Math.max(0, Math.min(100, Math.round(result.extracted.confidence * 100))) : 0;

  return (
    <main className="page-wrap">
      <div className="mb-7 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="page-kicker mb-4">02 / Request processing</p>
          <h1 className="page-title">From incoming message<br/><span className="text-[#365dff]">to an actionable record.</span></h1>
          <p className="page-intro mt-4">Submit the original customer request. Veyra extracts requirements, searches your catalog, checks available inventory and stores the resulting decision.</p>
        </div>
        <div className="flex items-center gap-2 border-l-2 border-[#ff795c] bg-[#fbfbfc] px-4 py-3">
          <ShieldCheck size={17} className="text-[#365dff]"/>
          <div><p className="text-[10px] font-bold">Traceable processing</p><p className="mt-1 text-[9px] text-[#838896]">Every completed analysis is stored.</p></div>
        </div>
      </div>

      <div className="grid items-start gap-4 2xl:grid-cols-[minmax(360px,.82fr)_minmax(510px,1.18fr)]">
        <section className="ui-panel">
          <div className="ui-panel-header">
            <div><p className="page-kicker">Input / 01</p><h2 className="ui-panel-title mt-1.5">Customer message</h2><p className="ui-panel-subtitle">Paste the source text without rewriting it.</p></div>
            <span className="mono text-[8px] text-[#969ba7]">RAW INPUT</span>
          </div>
          <form onSubmit={submit} className="p-5">
            <label className="field-label" htmlFor="request-message">Original request</label>
            <textarea id="request-message" value={message} onChange={event => setMessage(event.target.value)} rows={13} maxLength={12000} minLength={12} required placeholder="Paste the customer email, RFQ, purchase inquiry or message here…" className="field-control min-h-[270px] resize-y leading-[1.85]"/>
            <div className="mt-2 flex items-center justify-between"><span className="field-hint">Minimum 12 characters · Maximum 12,000</span><span className="mono field-hint">{message.length.toLocaleString()} / 12,000</span></div>
            {error && <div role="alert" className="mt-4 flex items-start gap-2 border border-[#f0d1ce] bg-[#fff7f6] p-3 text-[10px] leading-[1.7] text-[#a84b49]"><CircleAlert size={14} className="mt-0.5 shrink-0"/>{error}</div>}
            <div className="mt-5 flex flex-col gap-3 border-t border-[#e5e7ed] pt-4">
              <div className="flex items-start gap-2 text-[9px] leading-[1.6] text-[#838997]"><ShieldCheck size={13} className="mt-0.5 shrink-0 text-[#365dff]"/> The original message is stored with the analysis record for traceability.</div>
              <Button type="submit" disabled={loading || message.trim().length < 12} className="w-full">
                {loading ? <LoaderCircle size={14} className="animate-spin"/> : <Sparkles size={14}/>}
                {loading ? "Processing request…" : "Analyze and save record"}
                {!loading && <ArrowUpRight size={13}/>}
              </Button>
            </div>
          </form>
          <div className="grid grid-cols-3 border-t border-[#e0e2e8] bg-[#f6f7f9]">
            {["Extract","Match","Verify"].map((item,index) => <div key={item} className={"px-3 py-3 text-center " + (index ? "border-l border-[#e0e2e8]" : "")}><p className="mono text-[8px] text-[#969ba7]">0{index+1}</p><p className="mt-1 text-[9px] font-bold text-[#4d5362]">{item}</p></div>)}
          </div>
        </section>

        <section className="ui-panel min-h-[570px]">
          <div className="ui-panel-header">
            <div><p className="page-kicker">Output / 02</p><h2 className="ui-panel-title mt-1.5">Decision record</h2><p className="ui-panel-subtitle">Structured fields, operational checks and supporting evidence.</p></div>
            {result?.requestId && <span className="status-tag status-ready"><Check size={10}/> Saved</span>}
          </div>

          {!result && !loading && <div className="empty-state min-h-[510px]">
            <span className="empty-symbol"><FileSearch size={19}/></span>
            <p className="mt-4 text-[12px] font-bold">Analysis output will appear here</p>
            <p className="mt-2 max-w-[270px] text-[10px] leading-[1.7] text-[#8d93a0]">No sample result is loaded. Submit a real customer message to create a persistent analysis record.</p>
          </div>}

          {loading && <div className="empty-state min-h-[510px]">
            <span className="empty-symbol"><LoaderCircle size={20} className="animate-spin"/></span>
            <p className="mt-4 text-[12px] font-bold">Processing customer request</p>
            <p className="mt-2 text-[10px] text-[#8d93a0]">Extraction · Catalog retrieval · Inventory verification</p>
          </div>}

          {result && <div className="space-y-5 p-5">
            <div className="border border-[#dce1f5] bg-[#f0f2ff] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3"><span className="page-kicker !text-[#6375b9]">Recorded business outcome</span><span className={outcomeClass[result.decision] ?? "status-tag status-neutral"}>{outcomeLabel[result.decision] ?? result.decision}</span></div>
              <p className="mt-3 text-[12px] font-bold leading-[1.7] text-[#242a3a]">{result.extracted.summary}</p>
              <div className="mt-5 flex items-center justify-between"><span className="page-kicker !text-[8px]">Extraction confidence</span><span className="mono text-[10px] font-semibold">{confidence}%</span></div>
              <div className="mt-2 metric-bar"><span style={{width: confidence + "%"}}/></div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between"><h3 className="text-[10px] font-bold">Extracted request fields</h3><span className="page-kicker !text-[8px]">01 / Structured data</span></div>
              <div className="grid grid-cols-2 gap-2">
                <DataField label="Request type" value={result.extracted.request_type.replaceAll("_"," ")}/>
                <DataField label="Product" value={result.extracted.product}/>
                <DataField label="Quantity" value={result.extracted.quantity ? result.extracted.quantity + " " + (result.extracted.unit ?? "") : null}/>
                <DataField label="Destination" value={result.extracted.destination}/>
                <DataField label="Requested delivery" value={result.extracted.requested_delivery_date}/>
                <DataField label="Missing fields" value={result.extracted.missing_information.length || "None"}/>
              </div>
            </div>

            <div className="section-rule pt-4">
              <div className="mb-3 flex items-center justify-between"><h3 className="text-[10px] font-bold">Technical requirements</h3><span className="page-kicker !text-[8px]">02 / Specifications</span></div>
              {result.extracted.technical_requirements.length ? <div className="grid gap-2 sm:grid-cols-2">{result.extracted.technical_requirements.map((item,index)=><div key={index} className="flex items-center justify-between gap-3 border border-[#e1e3e9] bg-white p-3"><span className="text-[10px] text-[#737988]">{item.name}</span><b className="text-[10px]">{item.operator === "minimum" ? "≥ " : item.operator === "maximum" ? "≤ " : ""}{item.value}</b></div>)}</div> : <p className="text-[10px] text-[#8d93a0]">No technical specifications detected.</p>}
            </div>

            <div className="section-rule pt-4">
              <div className="mb-3 flex items-center justify-between"><h3 className="text-[10px] font-bold">Catalog matches</h3><span className="mono text-[8px] text-[#8d93a0]">{result.catalogMatches.length} RESULTS</span></div>
              {result.catalogMatches.length ? <div className="overflow-x-auto"><table className="data-table"><thead><tr><th>Product</th><th>SKU</th><th>Listed price</th></tr></thead><tbody>{result.catalogMatches.map(item=><tr key={item.id}><td className="font-bold text-[#2b3040]">{item.name}</td><td className="mono">{item.sku}</td><td className="mono">{item.price_amount ? item.price_amount + " " + (item.price_currency ?? "") : "Not listed"}</td></tr>)}</tbody></table></div> : <p className="border border-[#f0dfbd] bg-[#fffbf3] p-3 text-[10px] text-[#956a2f]">No matching product was found in the current catalog.</p>}
            </div>

            <div className="section-rule pt-4">
              <div className="mb-3 flex items-center justify-between"><h3 className="text-[10px] font-bold">Inventory verification</h3><span className="page-kicker !text-[8px]">03 / Availability</span></div>
              {result.stockChecks.length ? <div className="space-y-2">{result.stockChecks.map((item,index)=><div key={index} className="flex flex-wrap items-center justify-between gap-2 border border-[#e1e3e9] bg-white p-3"><span className="text-[10px] font-bold">{item.product.name}</span><span className={item.status === "sufficient" ? "text-[9px] font-bold text-[#27875a]" : "text-[9px] font-bold text-[#b14846]"}>{item.available} available / {item.requestedQuantity} requested · {item.status}</span></div>)}</div> : <p className="text-[10px] text-[#8d93a0]">Inventory was not checked because a product or quantity could not be resolved.</p>}
            </div>

            <div className="section-rule pt-4">
              <div className="mb-3 flex items-center justify-between"><h3 className="text-[10px] font-bold">Knowledge evidence</h3><span className="mono text-[8px] text-[#8d93a0]">{result.documentContext.length} SOURCES</span></div>
              {result.documentContext.length ? <div className="space-y-2">{result.documentContext.map((item,index)=><div key={index} className="border border-[#e1e3e9] bg-white p-3"><div className="flex flex-wrap justify-between gap-2"><span className="text-[10px] font-bold">{item.source_title}</span><span className="mono text-[8px] text-[#7d8391]">{Math.round(item.similarity*100)}% match</span></div><p className="mt-2 line-clamp-3 text-[9px] leading-[1.7] text-[#727887]">{item.content}</p></div>)}</div> : <p className="text-[10px] text-[#8d93a0]">No relevant document excerpts were retrieved.</p>}
            </div>

            <div className="section-rule pt-4">
              <div className="mb-3 flex items-center justify-between"><h3 className="text-[10px] font-bold">Missing information</h3><span className="page-kicker !text-[8px]">04 / Follow-up</span></div>
              {result.extracted.missing_information.length ? <div className="flex flex-wrap gap-2">{result.extracted.missing_information.map(item=><span key={item} className="border border-[#f0dfbd] bg-[#fffbf3] px-2.5 py-1.5 text-[9px] font-semibold text-[#956a2f]">{item}</span>)}</div> : <p className="flex items-center gap-2 text-[10px] text-[#27875a]"><BadgeCheck size={14}/> No missing fields detected.</p>}
            </div>

            <div className="section-rule pt-4">
              <h3 className="mb-3 text-[10px] font-bold">Decision rationale</h3>
              <div className="space-y-2">{result.decisionRationale.map((item,index)=><p key={index} className="flex gap-2 text-[9px] leading-[1.7] text-[#6f7583]"><Check size={12} className="mt-0.5 shrink-0 text-[#365dff]"/>{item}</p>)}</div>
            </div>

            {saved && result.requestId && <div className="flex flex-col gap-3 border-t border-[#e1e3e9] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-[9px] text-[#27875a]"><ClipboardCheck size={14}/> Persisted in request history</div>
              <Link href={"/requests/" + result.requestId} className="inline-flex h-9 items-center justify-center gap-2 bg-[#171923] px-3 text-[10px] font-bold text-white hover:bg-[#303443]">Open saved record <ArrowRight size={12}/></Link>
            </div>}
          </div>}
        </section>
      </div>
    </main>
  );
}
