import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Database, FileSearch, PackageCheck, ShieldCheck } from "lucide-react";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Veyra",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: "A B2B commercial operations workspace that turns customer requests into validated requirements, catalog matches, inventory checks and traceable decision records.",
  featureList: [
    "Structured extraction of B2B customer requests",
    "Product catalog matching",
    "Database-backed inventory verification",
    "Semantic retrieval from commercial documents",
    "Persistent request history and decision records"
  ],
};

const capabilities = [
  {
    number: "01",
    title: "Interpret the request",
    body: "Convert unstructured customer messages into typed fields such as request type, product, quantity, technical requirements, destination, delivery date and missing information.",
    icon: FileSearch,
  },
  {
    number: "02",
    title: "Match commercial data",
    body: "Compare extracted product requirements against the workspace catalog. Product identifiers, descriptions and listed prices remain grounded in stored records.",
    icon: PackageCheck,
  },
  {
    number: "03",
    title: "Verify availability",
    body: "Check requested quantities against the current inventory table. The model does not invent available stock or approve a quotation by itself.",
    icon: Database,
  },
  {
    number: "04",
    title: "Keep the decision trace",
    body: "Persist the original message, extracted fields, business outcome, catalog matches, stock checks and retrieved document evidence for later review.",
    icon: ShieldCheck,
  },
];

const faqs = [
  {
    question: "What kind of B2B requests can Veyra process?",
    answer: "The extraction schema covers quotation requests, purchase orders, product information inquiries, availability checks, service requests and other commercial messages. The exact decision depends on the information present and the configured catalog and inventory.",
  },
  {
    question: "Does the AI make the final commercial decision?",
    answer: "No. Gemini extracts and interprets the message. Zod validates the structure, while server-side application rules and database queries determine catalog and inventory outcomes. A human operator remains responsible for final commercial approval.",
  },
  {
    question: "Which business documents can be indexed?",
    answer: "The current document ingestion workflow accepts PDF, DOCX, CSV, JSON, Markdown and plain text files up to 10 MB. Extracted text is segmented and embedded for semantic retrieval during request analysis.",
  },
  {
    question: "Can separate companies use the current deployment?",
    answer: "The current pilot is a single-workspace instance protected by a shared workspace password. Individual user accounts, role-based access control and multi-tenant data isolation are not yet available.",
  },
];

export const metadata = {
  title: "B2B request and procurement operations software",
  description: "Veyra structures B2B customer inquiries, matches product catalogs, verifies inventory and stores traceable commercial decision records.",
  alternates: { canonical: "/product" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website" as const,
    title: "Veyra — B2B commercial operations intelligence",
    description: "From customer messages to structured requirements, catalog evidence and verified inventory checks.",
  },
};

export default function ProductPage() {
  return (
    <main className="min-h-screen bg-[#f0f1f4] text-[#171923]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}/>
      <header className="flex h-[72px] items-center justify-between border-b border-[#dfe1e7] bg-[#fbfbfc] px-5 sm:px-10">
        <Link href="/product" className="flex items-center gap-3" aria-label="Veyra home">
          <span className="grid size-9 place-items-center bg-[#171923] text-white">
            <svg viewBox="0 0 28 28" width="22" height="22" fill="none" aria-hidden="true">
              <path d="M4 5h7l7 18h6L17 5h7" stroke="currentColor" strokeWidth="2.3" strokeLinecap="square"/>
              <path d="M4 23h5" stroke="#ff795c" strokeWidth="2.3"/>
            </svg>
          </span>
          <span className="text-[15px] font-bold tracking-[-.055em]">VEYRA<span className="text-[#ff795c]">/</span></span>
        </Link>
        <div className="flex items-center gap-5">
          <span className="hidden font-mono text-[8px] uppercase tracking-[.15em] text-[#898e9a] md:block">Commercial operations intelligence</span>
          <Link href="/login" className="inline-flex h-9 items-center gap-2 bg-[#365dff] px-4 text-[10px] font-bold text-white hover:bg-[#274ce5]">Workspace access <ArrowUpRight size={13}/></Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#171923] px-6 py-20 text-white sm:px-12 sm:py-28 lg:px-20">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-8 hidden size-[520px] border border-white/[.07] lg:block">
          <div className="absolute inset-10 border border-white/[.07]"/>
          <div className="absolute inset-20 border border-white/[.07]"/>
          <div className="absolute inset-32 border border-[#365dff]/40"/>
          <div className="absolute inset-[42%] bg-[#ff795c]"/>
        </div>
        <div className="relative z-10 max-w-[850px]">
          <p className="font-mono text-[9px] uppercase tracking-[.2em] text-[#8da4ff]">B2B request intelligence / Veyra</p>
          <h1 className="mt-7 max-w-[820px] font-[var(--font-space)] text-[clamp(42px,7.5vw,88px)] font-semibold leading-[.94] tracking-[-.075em]">Customer requests.<br/><span className="text-[#8da4ff]">Operational clarity.</span></h1>
          <p className="mt-8 max-w-[600px] text-[13px] leading-[1.95] text-[#b1b6c3]">Veyra is a commercial operations workspace for teams that receive product inquiries and quotation requests in unstructured messages. It turns those messages into validated requirements, catalog matches, inventory checks and traceable records.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className="inline-flex h-11 items-center justify-center gap-2 bg-[#365dff] px-5 text-[11px] font-bold text-white transition hover:bg-[#274ce5]">Open private workspace <ArrowRight size={14}/></Link>
            <a href="#workflow" className="inline-flex h-11 items-center justify-center gap-2 border border-white/20 px-5 text-[11px] font-semibold text-[#d6d9e0] hover:bg-white/[.06]">Explore the workflow <ArrowDownGlyph/></a>
          </div>
        </div>
        <div className="relative z-10 mt-20 grid max-w-[860px] gap-px border border-white/10 bg-white/10 sm:grid-cols-3">
          <div className="bg-[#1d202c] p-4"><p className="font-mono text-[8px] uppercase tracking-[.14em] text-[#858b9b]">01 / Input</p><p className="mt-2 text-[12px] font-semibold">Original customer message</p></div>
          <div className="bg-[#1d202c] p-4"><p className="font-mono text-[8px] uppercase tracking-[.14em] text-[#858b9b]">02 / Evidence</p><p className="mt-2 text-[12px] font-semibold">Catalog, inventory, documents</p></div>
          <div className="bg-[#1d202c] p-4"><p className="font-mono text-[8px] uppercase tracking-[.14em] text-[#858b9b]">03 / Record</p><p className="mt-2 text-[12px] font-semibold">Decision and review history</p></div>
        </div>
      </section>

      <section id="workflow" className="px-6 py-16 sm:px-12 lg:px-20">
        <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
          <div>
            <p className="page-kicker mb-4">System / 01</p>
            <h2 className="font-[var(--font-space)] text-[36px] font-semibold leading-[1.02] tracking-[-.06em]">A workflow built around evidence.</h2>
            <p className="mt-4 text-[11px] leading-[1.85] text-[#737988]">The model is one part of the process. Business data, deterministic checks and human review provide the operational boundaries.</p>
          </div>
          <div className="divide-y divide-[#dfe1e7] border-y border-[#dfe1e7]">
            {capabilities.map(item => {
              const Icon = item.icon;
              return (
                <article key={item.number} className="grid gap-4 py-6 sm:grid-cols-[44px_1fr]">
                  <div className="flex items-start gap-3 sm:block">
                    <span className="font-mono text-[9px] text-[#9a9eaa]">{item.number}</span>
                    <span className="mt-3 hidden size-8 place-items-center border border-[#dfe1e7] bg-[#fbfbfc] text-[#365dff] sm:grid"><Icon size={15}/></span>
                  </div>
                  <div><h3 className="text-[14px] font-bold tracking-[-.02em]">{item.title}</h3><p className="mt-2 max-w-[650px] text-[11px] leading-[1.85] text-[#737988]">{item.body}</p></div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-[#dfe1e7] bg-[#fbfbfc] px-6 py-16 sm:px-12 lg:px-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="page-kicker mb-4">Controls / 02</p>
            <h2 className="font-[var(--font-space)] text-[34px] font-semibold leading-[1.05] tracking-[-.06em]">AI assistance without invisible decisions.</h2>
            <p className="mt-4 max-w-[540px] text-[11px] leading-[1.9] text-[#737988]">Commercial decisions need provenance. Veyra keeps the input, extracted data and database-backed evidence visible so an operator can inspect what the system used.</p>
          </div>
          <div className="space-y-4">
            {[
              "The original customer message is retained with the saved analysis.",
              "Structured output is validated against a defined schema.",
              "Inventory availability comes from database queries.",
              "Missing fields and unmatched catalog items remain explicit.",
              "Retrieved document passages are shown as supporting context, not as verified product facts.",
            ].map((item,index)=><div key={index} className="flex gap-3 border-b border-[#e5e7ec] pb-4"><span className="grid size-6 shrink-0 place-items-center bg-[#e9edff] text-[#365dff]"><Check size={12}/></span><p className="text-[10px] leading-[1.8] text-[#565d6b]">{item}</p></div>)}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-12 lg:px-20">
        <div className="mx-auto max-w-[900px]">
          <p className="page-kicker mb-4">Answers / 03</p>
          <h2 className="font-[var(--font-space)] text-[35px] font-semibold tracking-[-.06em]">Frequently asked questions.</h2>
          <div className="mt-8 divide-y divide-[#dfe1e7] border-y border-[#dfe1e7]">
            {faqs.map(item=><article key={item.question} className="py-5"><h3 className="text-[12px] font-bold">{item.question}</h3><p className="mt-2 max-w-[780px] text-[10px] leading-[1.9] text-[#737988]">{item.answer}</p></article>)}
          </div>
        </div>
      </section>

      <section className="bg-[#365dff] px-6 py-14 text-white sm:px-12 lg:px-20">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div><p className="font-mono text-[8px] uppercase tracking-[.17em] text-white/70">Private workspace</p><h2 className="mt-3 font-[var(--font-space)] text-[32px] font-semibold tracking-[-.06em]">Bring your actual catalog and requests.</h2><p className="mt-2 text-[10px] text-white/75">The current instance is configured as a single-workspace pilot.</p></div>
          <Link href="/login" className="inline-flex h-11 items-center justify-center gap-2 bg-[#171923] px-5 text-[10px] font-bold text-white hover:bg-[#242735]">Workspace sign in <ArrowUpRight size={13}/></Link>
        </div>
      </section>

      <footer className="flex flex-col justify-between gap-3 bg-[#171923] px-6 py-6 text-[#9297a6] sm:flex-row sm:px-12 lg:px-20">
        <span className="text-[12px] font-bold tracking-[-.04em] text-white">VEYRA<span className="text-[#ff795c]">/</span></span>
        <span className="text-[9px]">B2B request analysis · Catalog matching · Inventory verification</span>
        <span className="font-mono text-[8px] uppercase tracking-[.1em]">Commercial operations intelligence</span>
      </footer>
    </main>
  );
}

function ArrowDownGlyph() {
  return <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true"><path d="M8 2v11M3.5 8.5 8 13l4.5-4.5" stroke="currentColor" strokeWidth="1.5"/></svg>;
}
