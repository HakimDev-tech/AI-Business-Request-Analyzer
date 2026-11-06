"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Archive, ArrowUpRight, BookOpen, ChevronRight, FilePlus2,
  LayoutDashboard, LogOut, Menu, ShieldCheck, X
} from "lucide-react";

const navigation = [
  { href: "/", label: "Operations overview", icon: LayoutDashboard, index: "01" },
  { href: "/requests", label: "Request archive", icon: Archive, index: "02" },
  { href: "/analyzer", label: "New request", icon: FilePlus2, index: "03" },
  { href: "/catalog", label: "Products & knowledge", icon: BookOpen, index: "04" },
];

function Brand() {
  return (
    <Link href="/" className="veyra-brand" aria-label="Veyra operations overview">
      <span className="veyra-brand-mark">
        <svg viewBox="0 0 28 28" width="23" height="23" fill="none" aria-hidden="true">
          <path d="M4 7h6.1c3.9 0 4.1 7 7.9 7H24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M4 21h6.1c3.9 0 4.1-7 7.9-7H24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="4" cy="7" r="2" fill="#bc5034"/>
          <circle cx="24" cy="21" r="2" fill="#bc5034"/>
        </svg>
      </span>
      <span className="min-w-0">
        <span className="veyra-brand-name">VEYRA<span style={{ color: "#e2ad69" }}>·</span></span>
        <span className="block veyra-brand-sub">Trade operations</span>
      </span>
    </Link>
  );
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main navigation" className="veyra-nav">
      <p className="veyra-nav-label">Commercial workspace</p>
      <div className="space-y-1">
        {navigation.map(({ href, label, icon: Icon, index }) => {
          const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className="veyra-nav-link"
            >
              <Icon size={16} strokeWidth={1.8} className="veyra-nav-icon"/>
              <span>{label}</span>
              <span className="veyra-nav-index">{index}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function Sidebar({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
  return (
    <aside className={mobile ? "veyra-sidebar veyra-mobile-overlay" : "veyra-sidebar hidden lg:flex"}>
      <div className="flex items-center justify-between">
        <Brand/>
        {mobile && (
          <button onClick={onClose} className="grid size-9 place-items-center rounded-[9px_2px_9px_2px] border border-white/15 text-[#d7e2de]" aria-label="Close menu">
            <X size={17}/>
          </button>
        )}
      </div>
      <NavItems onNavigate={onClose}/>
      <div className="veyra-sidebar-bottom">
        <div className="veyra-principle">
          <div className="veyra-principle-kicker"><ShieldCheck size={13} className="text-[#e2ad69]"/> Decision discipline</div>
          <p className="veyra-principle-copy">Interpret the request. Verify the facts. Keep the record.</p>
          <p className="veyra-principle-steps">AI / STRUCTURE<br/>DATA / VALIDATE<br/>OPERATOR / APPROVE</p>
        </div>
        <div className="veyra-sidebar-foot"><span>VEYRA / PRIVATE DESK</span><span>0.3</span></div>
      </div>
    </aside>
  );
}

function pageTitle(pathname: string) {
  if (pathname.startsWith("/analyzer")) return "New request";
  if (pathname.startsWith("/requests")) return "Request archive";
  if (pathname.startsWith("/catalog")) return "Products & knowledge";
  return "Operations overview";
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
    if (pathname === "/login" || pathname === "/product") return;
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
      <main className="veyra-access">
        <div className="veyra-access-card">
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.14em] text-[#bc5034]">
            <ShieldCheck size={14}/> Private workspace
          </div>
          <h1 className="veyra-access-title">
            {authStatus === "unconfigured" ? "Access protection is not configured." : authStatus === "unavailable" ? "Authentication service unavailable." : "Checking workspace access…"}
          </h1>
          <p className="veyra-access-copy">
            {authStatus === "unconfigured" ? "Set WORKSPACE_ACCESS_PASSWORD and WORKSPACE_SESSION_SECRET (at least 32 characters) in the server environment before opening this workspace." : authStatus === "unavailable" ? "The session endpoint could not be reached. Check the deployment and try again." : "A valid private workspace session is required to access business records."}
          </p>
          {authStatus === "unconfigured" && <Link href="/login" className="veyra-new-request mt-5">Open access setup <ArrowUpRight size={12}/></Link>}
        </div>
      </main>
    );
  }

  return (
    <div className="veyra-shell">
      <Sidebar/>
      {mobileOpen && <Sidebar mobile onClose={() => setMobileOpen(false)}/>}
      <div className="veyra-main">
        <header className="veyra-header">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="veyra-header-mobile-menu lg:hidden" aria-label="Open navigation">
              <Menu size={17}/>
            </button>
            <div className="min-w-0">
              <div className="veyra-header-crumb">VEYRA <span className="px-1.5 text-[#c3d1ca]">/</span> {title}</div>
              <p className="veyra-header-title">Commercial operations desk</p>
            </div>
          </div>
          <div className="veyra-header-actions">
            <div className="veyra-db-state">
              <span className="veyra-db-lamp" data-state={database}/>
              <span>{database === "connected" ? "Records connected" : database === "unavailable" ? "Records unavailable" : "Checking records"}</span>
            </div>
            <Link href="/analyzer" className="veyra-new-request">
              <FilePlus2 size={14}/> <span className="hidden sm:inline">New request</span><span className="sm:hidden">New</span><ArrowUpRight size={12}/>
            </Link>
            <button onClick={() => void logout()} aria-label="Sign out" title="Sign out" className="veyra-signout"><LogOut size={14}/></button>
          </div>
        </header>
        <div className="workspace-canvas">{children}</div>
        <footer className="veyra-main-footer">
          <span>VEYRA / COMMERCIAL WORKFLOW</span>
          <span>Human approval remains part of the process</span>
        </footer>
      </div>
    </div>
  );
}