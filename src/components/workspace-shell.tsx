"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Archive, ArrowUpRight, BookOpen, ChevronRight, FilePlus2,
  LayoutDashboard, LogOut, Menu, ShieldCheck, X
} from "lucide-react";

const navigation = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/requests", label: "Request history", icon: Archive },
  { href: "/analyzer", label: "New analysis", icon: FilePlus2 },
  { href: "/catalog", label: "Catalog & inventory", icon: BookOpen },
];

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3 px-1" aria-label="Veyra overview">
      <span className="signal-mark grid size-9 shrink-0 place-items-center bg-[#365dff] text-white">
        <svg viewBox="0 0 28 28" width="22" height="22" fill="none" aria-hidden="true">
          <path d="M4 5h7l7 18h6L17 5h7" stroke="currentColor" strokeWidth="2.3" strokeLinecap="square"/>
          <path d="M4 23h5" stroke="#ff795c" strokeWidth="2.3"/>
        </svg>
      </span>
      <span className="min-w-0">
        <span className="block text-[16px] font-bold leading-none tracking-[-.055em] text-white">VEYRA<span className="text-[#ff795c]">/</span></span>
        <span className="mt-1 block text-[8px] font-semibold uppercase tracking-[.19em] text-[#9296a3]">Commercial operations</span>
      </span>
    </Link>
  );
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main navigation" className="mt-10">
      <p className="mb-3 px-3 font-mono text-[9px] font-medium uppercase tracking-[.16em] text-[#777d8d]">Operate</p>
      <div className="space-y-1">
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`group relative flex h-11 items-center gap-3 border-l-[3px] px-3 text-[12px] font-medium transition-colors ${active ? "border-[#ff795c] bg-white/[.085] text-white" : "border-transparent text-[#a6aab5] hover:bg-white/[.05] hover:text-white"}`}
            >
              <Icon size={16} strokeWidth={1.8} className={active ? "text-[#8da4ff]" : "text-[#858b9b] group-hover:text-white"}/>
              <span>{label}</span>
              {active && <ChevronRight size={13} className="ml-auto text-[#ff795c]"/>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function Sidebar({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
  return (
    <aside className={mobile
      ? "fixed inset-0 z-50 flex w-full flex-col bg-[#171923] px-5 py-5 text-white lg:hidden"
      : "fixed inset-y-0 left-0 z-30 hidden w-[232px] flex-col border-r border-white/[.06] bg-[#171923] px-4 py-6 text-white lg:flex"}>
      <div className="flex items-center justify-between">
        <Brand/>
        {mobile && <button onClick={onClose} className="grid size-9 place-items-center border border-white/15 text-[#c6cad3]" aria-label="Close menu"><X size={17}/></button>}
      </div>
      <NavItems onNavigate={onClose}/>
      <div className="mt-auto">
        <div className="border border-white/10 bg-white/[.035] p-3.5">
          <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[.14em] text-[#abb0bd]"><ShieldCheck size={13} className="text-[#8da4ff]"/> Decision controls</div>
          <p className="mt-2 text-[10px] leading-[1.7] text-[#8d93a1]">AI extraction is reviewed against catalog records and inventory data before a commercial decision is returned.</p>
        </div>
        <div className="mt-5 flex items-center justify-between px-1 font-mono text-[8px] uppercase tracking-[.12em] text-[#727888]">
          <span>VEYRA WORKSPACE</span><span>0.2.0</span>
        </div>
      </div>
    </aside>
  );
}

function pageTitle(pathname: string) {
  if (pathname.startsWith("/analyzer")) return "New analysis";
  if (pathname.startsWith("/requests")) return "Request history";
  if (pathname.startsWith("/catalog")) return "Catalog & inventory";
  return "Overview";
}

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [database, setDatabase] = useState<"checking" | "connected" | "unavailable">("checking");
  const [authStatus, setAuthStatus] = useState<"checking" | "authenticated" | "unauthenticated" | "unconfigured" | "unavailable">("checking");
  const title = useMemo(() => pageTitle(pathname), [pathname]);

  useEffect(() => {
    let active = true;
    if (pathname === "/login") return;
    fetch("/api/auth/session", { cache: "no-store" })
      .then(async response => {
        const payload = await response.json();
        if (!active) return;
        if (!payload.configured) {
          setAuthStatus("unconfigured");
          return;
        }
        if (!payload.authenticated) {
          setAuthStatus("unauthenticated");
          router.replace("/login");
          return;
        }
        setAuthStatus("authenticated");
        fetch("/api/health", { cache: "no-store" })
          .then(async healthResponse => {
            const health = await healthResponse.json();
            if (active) setDatabase(healthResponse.ok && health.database === "connected" ? "connected" : "unavailable");
          })
          .catch(() => { if (active) setDatabase("unavailable"); });
      })
      .catch(() => { if (active) setAuthStatus("unavailable"); });

    return () => { active = false; };
  }, [pathname, router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    setAuthStatus("unauthenticated");
    router.replace("/login");
  }

  if (pathname === "/login" || pathname === "/product") return <>{children}</>;

  if (authStatus !== "authenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f0f1f4] px-6">
        <div className="w-full max-w-[430px] border border-[#dfe1e7] bg-[#fbfbfc] p-6">
          <div className="mb-4 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.14em] text-[#365dff]"><ShieldCheck size={14}/> Private workspace</div>
          <h1 className="font-[var(--font-space)] text-[22px] font-semibold tracking-[-.04em]">{authStatus === "unconfigured" ? "Access protection is not configured." : authStatus === "unavailable" ? "Authentication service unavailable." : "Checking workspace access…"}</h1>
          <p className="mt-3 text-[10px] leading-[1.8] text-[#777d8b]">{authStatus === "unconfigured" ? "Set WORKSPACE_ACCESS_PASSWORD and WORKSPACE_SESSION_SECRET (at least 32 characters) in the server environment before opening this workspace." : authStatus === "unavailable" ? "The session endpoint could not be reached. Check the deployment and try again." : "A valid private workspace session is required to access business records."}</p>
          {authStatus === "unconfigured" && <Link href="/login" className="mt-5 inline-flex h-9 items-center gap-2 bg-[#365dff] px-3 text-[10px] font-bold text-white">Open access setup <ArrowUpRight size={12}/></Link>}
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f1f4] text-[#171923]">
      <Sidebar/>
      {mobileOpen && <Sidebar mobile onClose={() => setMobileOpen(false)}/>}
      <div className="min-h-screen lg:pl-[232px]">
        <header className="sticky top-0 z-20 flex h-[65px] items-center justify-between border-b border-[#dfe1e7] bg-[#fbfbfc]/95 px-4 backdrop-blur-lg sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="grid size-9 shrink-0 place-items-center border border-[#dfe1e7] bg-white text-[#353947] lg:hidden" aria-label="Open menu"><Menu size={17}/></button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[.15em] text-[#8b8f9c]"><span>Workspace</span><span className="text-[#c2c5cd]">/</span><span className="truncate text-[#343846]">{title}</span></div>
              <p className="mt-1 truncate text-[12px] font-semibold tracking-[-.01em] text-[#252834]">Commercial intelligence desk</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 border-r border-[#e0e2e8] pr-4 sm:flex">
              <span className={`size-1.5 ${database === "connected" ? "bg-[#27875a]" : database === "unavailable" ? "bg-[#d35c4b]" : "animate-pulse bg-[#bb8b39]"}`}/>
              <span className="text-[9px] font-medium text-[#656a78]">{database === "connected" ? "Database online" : database === "unavailable" ? "Database unavailable" : "Connecting"}</span>
            </div>
            <Link href="/analyzer" className="inline-flex h-9 items-center gap-2 bg-[#365dff] px-3.5 text-[10px] font-semibold text-white transition-colors hover:bg-[#274ce5]">
              <FilePlus2 size={14}/> <span className="hidden sm:inline">New request</span><span className="sm:hidden">New</span><ArrowUpRight size={12}/>
            </Link>
            <button onClick={() => void logout()} aria-label="Sign out" title="Sign out" className="grid size-9 place-items-center border border-[#dfe1e7] bg-white text-[#606675] hover:border-[#c4514e] hover:text-[#c4514e]"><LogOut size={14}/></button>
          </div>
        </header>
        <div className="workspace-canvas">{children}</div>
        <footer className="flex flex-col justify-between gap-2 border-t border-[#dfe1e7] px-5 py-4 text-[8px] font-medium uppercase tracking-[.13em] text-[#969aa5] sm:flex-row sm:px-8">
          <span>VEYRA / COMMERCIAL INTELLIGENCE</span>
          <span>AI-assisted extraction · Database-verified operations</span>
        </footer>
      </div>
    </div>
  );
}
