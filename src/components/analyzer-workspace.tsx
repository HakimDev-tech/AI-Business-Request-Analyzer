"use client";

import { useState } from "react";
import {
  Activity, ArrowUpRight, Boxes, Check, CheckCircle2, CircleHelp, ClipboardList,
  FileText, LoaderCircle, PackageSearch, ShieldCheck, Sparkles, WandSparkles,
  AlertCircle, Database, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Result = {
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

const sample = "Hello, we need 50 business laptops with at least 16 GB RAM and 512 GB SSD. Please deliver to Algiers before December 15 and send your best quotation.";
const labels: Record<string, string> = {
  ready_for_quote: "Ready for quotation",
  needs_clarification: "Clarification required",
  no_catalog_match: "No catalog match",
  insufficient_stock: "Insufficient stock",
  manual_review: "Manual review",
};

function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <span className={small ? "grid size-8 shrink-0 place-items-center rounded-[9px] bg-[#d7ed86] text-[#18241f]" : "grid size-10 shrink-0 place-items-center rounded-[11px] bg-[#d7ed86] text-[#18241f]"}>
      <svg viewBox="0 0 28 28" width={small ? 19 : 23} height={small ? 19 : 23} fill="none" aria-hidden="true">
        <path d="M5 5h8.5c5.25 0 9.5 4.25 9.5 9.5S18.75 24 13.5 24H5V5Z" stroke="currentColor" strokeWidth="2.2"/>
        <path d="M5 14h12M13 8.5l5.5 5.5-5.5 5.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square"/>
      </svg>
    </span>
  );
}

function Sidebar({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
  return (
    <aside className={mobile
      ? "fixed inset-0 z-50 bg-[#18241f] px-5 py-5 text-white lg:hidden"
      : "fixed inset-y-0 left-0 z-30 hidden w-[258px] flex-col border-r border-white/10 bg-[#18241f] px-[19px] py-6 text-white lg:flex"}>
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <BrandMark />
          <div>
            <p className="text-[16px] font-semibold tracking-[-.04em]">veyra<span className="text-[#d7ed86]">.</span></p>
            <p className="mt-0.5 text-[9px] uppercase tracking-[.16em] text-[#9ba89e]">Commercial intelligence</p>
          </div>
        </div>
        {mobile && <button onClick={onClose} aria-label="Close navigation" className="rounded-lg p-2 text-[#9ba89e] hover:bg-white/10 hover:text-white"><X size={18}/></button>}
      </div>

      <div className="mt-12">
        <p className="mb-3 px-3 font-mono text-[9px] uppercase tracking-[.16em] text-[#75847a]">Workspace</p>
        <a href="#analyzer" aria-current="page" onClick={onClose} className="nav-link"><Activity size={16}/>Request analyzer<span className="ml-auto size-1.5 rounded-full bg-[#d7ed86]"/></a>
        <a href="#catalog" onClick={onClose} className="nav-link"><Boxes size={16}/>Product catalog</a>
        <a href="#catalog" onClick={onClose} className="nav-link"><FileText size={16}/>Knowledge library</a>
      </div>

      <div className="mt-10">
        <p className="mb-3 px-3 font-mono text-[9px] uppercase tracking-[.16em] text-[#75847a]">System</p>
        <div className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[12px] text-[#9ba89e]"><ShieldCheck size={15}/>Decision safeguards</div>
        <div className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[12px] text-[#9ba89e]"><Database size={15}/>Data connections</div>
      </div>

      <div className="mt-auto">
        <div className="rounded-[13px] border border-white/10 bg-white/[.045] p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[.13em] text-[#9ba89e]">Operating principle</span>
            <ShieldCheck size={14} className="text-[#d7ed86]"/>
          </div>
          <p className="text-[12px] font-medium leading-[1.65] text-[#edf0e8]">Models interpret. Rules verify. People decide.</p>
          <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3 text-[10px] text-[#9ba89e]"><span className="status-dot"/> Evidence-first workflow</div>
        </div>
        <div className="mt-5 flex items-center justify-between px-2 text-[9px] text-[#718077]"><span>VEYRA WORKSPACE</span><span className="mono">v0.1</span></div>
      </div>
    </aside>
  );
}

function Field({ name, value }: { name: string; value: string | number | null }) {
  return (
    <div className="min-w-0 border border-[#e1e2d9] bg-white px-3.5 py-3">
      <p className="data-label">{name}</p>
      <p className="data-value truncate">{value ?? "Not specified"}</p>
    </div>
  );
}

export function AnalyzerWorkspace() {
  const [message, setMessage] = useState(sample);
  const [result, setResult] = useState<Result | null>(null);
  const [conversationId, setConversationId] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mobileNav, setMobileNav] = useState(false);

  async function run() {
    setLoading(true); setError(""); setResult(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, conversationId }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error ?? "Analysis failed");
      setConversationId(payload.conversationId);
      setResult(payload.result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  const confidence = result ? Math.max(0, Math.min(100, Math.round(result.extracted.confidence * 100))) : 0;

  return (
    <div className="app-shell">
      <Sidebar />
      {mobileNav && <Sidebar mobile onClose={() => setMobileNav(false)} />}

      <main className="workspace-main">
        <header className="sticky top-0 z-20 flex h-[66px] items-center justify-between border-b border-[#dedfd6] bg-[#f3f2ec]/95 px-5 backdrop-blur-md md:px-9">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileNav(true)} aria-label="Open navigation" className="grid size-9 place-items-center rounded-lg border border-[#dedfd6] bg-[#fbfaf6] text-[#59645c] lg:hidden"><Menu size={17}/></button>
            <div>
              <p className="eyebrow">Workspace <span className="px-1.5 text-[#b5b9af]">/</span> <span className="text-[#28362e]">Request analyzer</span></p>
              <p className="mt-1 text-[12px] font-semibold tracking-[-.01em]">Commercial operations desk</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-full border border-[#d9dfd0] bg-[#f8faef] px-3 py-1.5">
            <span className="status-dot"/>
            <span className="text-[10px] font-semibold text-[#4f6949]">Engine connected</span>
          </div>
        </header>

        <div className="workspace-content" id="analyzer">
          <div className="mb-8 flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
            <div>
              <p className="eyebrow mb-4">01 <span className="px-2 text-[#b0b5aa]">/</span> Incoming intelligence</p>
              <h1 className="display-title">Clarity in.<br/><span className="text-[#6b796d]">Confidence out.</span></h1>
              <p className="mt-4 max-w-[570px] text-[13px] leading-[1.8] text-[#737c74]">Translate customer language into structured commercial requirements. Match against your catalog, verify stock and keep every decision tied to evidence.</p>
            </div>
            <div className="flex w-full max-w-[330px] items-center gap-4 border-y border-[#d7d9cf] py-4 xl:mb-1">
              <div className="grid size-11 shrink-0 place-items-center rounded-full border border-[#d7d9cf] bg-[#fbfaf6] text-[#52675a]"><Activity size={19}/></div>
              <div className="min-w-0 flex-1">
                <p className="eyebrow">Analysis pipeline</p>
                <p className="mt-1 text-[13px] font-semibold">Extract <span className="px-1 text-[#a6aca2]">·</span> Retrieve <span className="px-1 text-[#a6aca2]">·</span> Verify</p>
              </div>
              <span className="mono text-[10px] text-[#879187]">03/03</span>
            </div>
          </div>

          <div className="grid items-start gap-5 2xl:grid-cols-[minmax(390px,.91fr)_minmax(500px,1.09fr)]">
            <section className="panel overflow-hidden">
              <div className="panel-heading flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-[9px] bg-[#e9eddf] text-[#526b50]"><ClipboardList size={16}/></span>
                  <div><h2 className="text-[13px] font-semibold">Customer request</h2><p className="mt-1 text-[10px] text-[#899188]">Raw message · Email, RFQ or inquiry</p></div>
                </div>
                <span className="mono text-[9px] text-[#9aa198]">INPUT / 001</span>
              </div>
              <div className="p-5 md:p-6">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label htmlFor="request" className="field-label mb-0">Message content</label>
                  <button onClick={() => setMessage(sample)} className="text-[10px] font-semibold text-[#607b56] underline decoration-[#b8c4a9] underline-offset-4 hover:text-[#18241f]">Insert sample</button>
                </div>
                <textarea
                  id="request"
                  value={message}
                  onChange={event => setMessage(event.target.value)}
                  rows={11}
                  maxLength={12000}
                  aria-describedby="request-hint"
                  placeholder="Paste the customer’s original message here…"
                  className="field-control min-h-[230px] resize-y bg-[#fdfdfb] leading-[1.8]"
                />
                <div id="request-hint" className="mt-2 flex justify-between gap-3 text-[9px] text-[#9aa198]"><span>Maximum 12,000 characters</span><span className="mono">{message.length.toLocaleString()} / 12,000</span></div>

                {error && <div role="alert" className="mt-4 flex items-start gap-2 rounded-[10px] border border-[#ead1c9] bg-[#fff7f3] p-3 text-[11px] leading-5 text-[#a94f48]"><AlertCircle size={15} className="mt-0.5 shrink-0"/>{error}</div>}

                <div className="mt-5 flex flex-col gap-3 border-t border-[#e6e6df] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-[10px] text-[#858e85]"><ShieldCheck size={14} className="text-[#638363]"/> Server-side processing</div>
                  <Button onClick={run} disabled={loading || message.trim().length < 12} className="w-full sm:w-auto">
                    {loading ? <LoaderCircle size={15} className="animate-spin"/> : <WandSparkles size={15}/>}
                    {loading ? "Analyzing request" : "Analyze request"}
                    {!loading && <ArrowUpRight size={14}/>}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-3 border-t border-[#dedfd6] bg-[#f4f4ee]">
                {["01  Extract","02  Retrieve","03  Decide"].map((item, index) => <div key={item} className={`px-3 py-3 text-center text-[9px] font-semibold ${index ? "border-l border-[#dedfd6]" : ""} text-[#6d786f]`}><span className="mono mr-1 text-[#a0a89d]">{item.slice(0,2)}</span>{item.slice(4)}</div>)}
              </div>
            </section>

            <section className="panel min-h-[550px] overflow-hidden">
              <div className="panel-heading flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-[9px] bg-[#e7eceb] text-[#496c7b]"><Activity size={16}/></span>
                  <div><h2 className="text-[13px] font-semibold">Analysis record</h2><p className="mt-1 text-[10px] text-[#899188]">Structured output · Evidence-backed decision</p></div>
                </div>
                <span className="mono text-[9px] text-[#9aa198]">OUTPUT / 002</span>
              </div>

              {!result && !loading && (
                <div className="flex min-h-[480px] flex-col items-center justify-center px-8 text-center">
                  <div className="relative mb-5 grid size-[66px] place-items-center rounded-full border border-[#d9ded1] bg-[#f5f6ef] text-[#6c8067]">
                    <PackageSearch size={25}/>
                    <span className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-[#fbfaf6] bg-[#d7ed86]"/>
                  </div>
                  <p className="text-[14px] font-semibold tracking-[-.02em]">No analysis on record</p>
                  <p className="mt-2 max-w-[260px] text-[11px] leading-[1.8] text-[#8a9389]">Submit a customer message. Extracted fields, catalog evidence and stock checks will appear here.</p>
                  <div className="mt-7 flex items-center gap-2 border-t border-[#e3e4dc] pt-4 text-[9px] text-[#9aa198]"><CircleHelp size={12}/> Nothing is inferred until a request is submitted</div>
                </div>
              )}

              {loading && (
                <div className="flex min-h-[480px] flex-col items-center justify-center">
                  <div className="grid size-14 place-items-center rounded-full border border-[#dce2d3] bg-[#f4f6ed]"><LoaderCircle size={24} className="animate-spin text-[#637b58]"/></div>
                  <p className="mt-5 text-[13px] font-semibold">Reading the request</p>
                  <p className="mt-2 text-[10px] text-[#8a9389]">Extracting fields · Searching evidence · Checking rules</p>
                  <div className="mt-6 h-[2px] w-40 overflow-hidden bg-[#e6e8df]"><div className="h-full w-1/2 animate-pulse bg-[#91a96e]"/></div>
                </div>
              )}

              {result && (
                <div className="space-y-5 p-5 md:p-6">
                  <div className="border border-[#dfe3d6] bg-[#f4f6ed] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="eyebrow text-[#65775e]">Decision status</span>
                      <span className="inline-flex items-center gap-2 border border-[#d4ddc9] bg-white px-2.5 py-1.5 text-[10px] font-semibold text-[#536e4d]"><span className="size-1.5 rounded-full bg-[#82a66d]"/>{labels[result.decision] ?? result.decision}</span>
                    </div>
                    <p className="mt-3 text-[13px] font-semibold leading-[1.7] tracking-[-.01em]">{result.extracted.summary}</p>
                    <div className="mt-5 flex items-center justify-between"><span className="data-label">Extraction confidence</span><span className="mono text-[11px] font-semibold">{confidence}%</span></div>
                    <div className="mt-2 h-[4px] overflow-hidden bg-[#e0e6d6]"><div className="h-full bg-[#708b60] transition-all" style={{ width: confidence + "%" }}/></div>
                  </div>

                  <div>
                    <div className="mb-3 flex items-center justify-between"><h3 className="text-[11px] font-semibold">Extracted requirements</h3><span className="eyebrow">01 / Fields</span></div>
                    <div className="grid grid-cols-2 gap-2">
                      <Field name="Product" value={result.extracted.product}/>
                      <Field name="Quantity" value={result.extracted.quantity ? result.extracted.quantity + " " + (result.extracted.unit ?? "") : null}/>
                      <Field name="Destination" value={result.extracted.destination}/>
                      <Field name="Delivery date" value={result.extracted.requested_delivery_date}/>
                    </div>
                  </div>

                  <div className="result-section">
                    <div className="mb-3 flex items-center justify-between"><h3 className="text-[11px] font-semibold">Technical requirements</h3><span className="eyebrow">02 / Specs</span></div>
                    {result.extracted.technical_requirements.length ? <div className="flex flex-wrap gap-2">{result.extracted.technical_requirements.map((item,index) => <span key={index} className="border border-[#dfe1d8] bg-white px-2.5 py-2 text-[10px] text-[#5e6b61]">{item.name} <b className="text-[#25352b]">{item.operator === "minimum" ? "≥ " : ""}{item.value}</b></span>)}</div> : <p className="text-[10px] text-[#939b92]">No technical specifications detected.</p>}
                  </div>

                  <div className="result-section">
                    <div className="mb-3 flex items-center justify-between"><h3 className="text-[11px] font-semibold">Catalog evidence</h3><span className="mono text-[9px] text-[#8b958b]">{result.catalogMatches.length} MATCHES</span></div>
                    {result.catalogMatches.length ? result.catalogMatches.map(item => <div key={item.id} className="mb-2 flex flex-wrap items-center justify-between gap-3 border border-[#e1e2d9] bg-white px-3.5 py-3"><div><p className="text-[11px] font-semibold">{item.name}</p><p className="mono mt-1 text-[9px] text-[#929b91]">{item.sku}</p></div><p className="mono text-[10px] text-[#53665a]">{item.price_amount ? item.price_amount + " " + (item.price_currency ?? "") : "Price not listed"}</p></div>) : <p className="border border-[#eadfca] bg-[#fbf7ed] p-3 text-[10px] text-[#987044]">No matching item in the current catalog.</p>}
                  </div>

                  <div className="result-section">
                    <div className="mb-3 flex items-center justify-between"><h3 className="text-[11px] font-semibold">Inventory verification</h3><span className="eyebrow">03 / Stock</span></div>
                    {result.stockChecks.length ? result.stockChecks.map((item,index) => <div key={index} className="mb-2 flex flex-wrap justify-between gap-2 border border-[#e1e2d9] bg-white px-3.5 py-3 text-[10px]"><span className="font-semibold">{item.product.name}</span><span className={item.status === "sufficient" ? "text-[#4f7858]" : "text-[#a46a32]"}>{item.available} available / {item.requestedQuantity} requested · {item.status}</span></div>) : <p className="text-[10px] text-[#939b92]">Stock not checked: product or quantity is missing.</p>}
                  </div>

                  <div className="result-section">
                    <div className="mb-3 flex items-center justify-between"><h3 className="text-[11px] font-semibold">Knowledge base evidence</h3><span className="eyebrow">04 / Sources</span></div>
                    {result.documentContext.length ? result.documentContext.map((item,index) => <div key={index} className="mb-2 border border-[#e1e2d9] bg-white p-3.5"><div className="flex flex-wrap justify-between gap-2"><span className="text-[10px] font-semibold">{item.source_title}</span><span className="mono text-[9px] text-[#8c968c]">{Math.round(item.similarity * 100)}% MATCH</span></div><p className="mt-2 line-clamp-3 text-[10px] leading-[1.7] text-[#727d73]">{item.content}</p></div>) : <p className="text-[10px] text-[#939b92]">No relevant document chunks found.</p>}
                  </div>

                  <div className="result-section">
                    <div className="mb-3 flex items-center justify-between"><h3 className="text-[11px] font-semibold">Missing information</h3><span className="eyebrow">05 / Follow-up</span></div>
                    {result.extracted.missing_information.length ? <div className="flex flex-wrap gap-2">{result.extracted.missing_information.map(item => <span key={item} className="border border-[#eadfc9] bg-[#fbf7ed] px-2.5 py-1.5 text-[10px] font-medium text-[#987044]">{item}</span>)}</div> : <span className="flex items-center gap-2 text-[10px] text-[#4f7858]"><CheckCircle2 size={14}/> No missing fields detected</span>}
                  </div>

                  <div className="result-section">
                    <p className="mb-3 eyebrow">Decision rationale</p>
                    {result.decisionRationale.map((item,index) => <p key={index} className="mb-2 flex gap-2 text-[10px] leading-[1.7] text-[#6f7a70]"><Check size={12} className="mt-0.5 shrink-0 text-[#78916a]"/>{item}</p>)}
                  </div>
                </div>
              )}
            </section>
          </div>

          <div className="mt-6 grid gap-0 border-y border-[#d7d9cf] md:grid-cols-3">
            {[
              { icon: Sparkles, no: "01", title: "Structured extraction", detail: "Natural language, validated fields." },
              { icon: PackageSearch, no: "02", title: "Document intelligence", detail: "Semantic retrieval from your own files." },
              { icon: ShieldCheck, no: "03", title: "Deterministic controls", detail: "Inventory and rules stay in application code." },
            ].map((item,index) => <div key={item.no} className={`flex gap-3 py-4 ${index ? "border-t border-[#d7d9cf] md:border-l md:border-t-0 md:pl-5" : ""} ${index < 2 ? "md:pr-5" : ""}`}>
              <span className="mono pt-1 text-[9px] text-[#9aa198]">{item.no}</span>
              <span className="grid size-8 shrink-0 place-items-center rounded-full border border-[#d7d9cf] text-[#647c61]"><item.icon size={15}/></span>
              <div><p className="text-[11px] font-semibold">{item.title}</p><p className="mt-1 text-[10px] text-[#838d83]">{item.detail}</p></div>
            </div>)}
          </div>

          <footer className="mt-8 flex flex-col justify-between gap-2 text-[9px] text-[#9aa198] sm:flex-row">
            <span>VEYRA / COMMERCIAL INTELLIGENCE</span>
            <span>AI-assisted extraction · Application-verified decisions</span>
          </footer>
        </div>
      </main>
    </div>
  );
}