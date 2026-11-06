"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Fingerprint, LoaderCircle, LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

function LoginBrand() {
  return (
    <div className="login-brand">
      <span className="veyra-brand-mark">
        <svg viewBox="0 0 28 28" width="23" height="23" fill="none" aria-hidden="true">
          <path d="M4 7h6.1c3.9 0 4.1 7 7.9 7H24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M4 21h6.1c3.9 0 4.1-7 7.9-7H24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="4" cy="7" r="2" fill="#bc5034"/>
          <circle cx="24" cy="21" r="2" fill="#bc5034"/>
        </svg>
      </span>
      <span>
        <span className="block text-[17px] font-extrabold tracking-[-.065em] text-white">VEYRA<span style={{ color: "#e2ad69" }}>·</span></span>
        <span className="mt-1 block text-[8px] font-bold uppercase tracking-[.16em] text-[#9bb2aa]">Trade operations</span>
      </span>
    </div>
  );
}

export function WorkspaceLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then(response => response.json())
      .then(payload => {
        if (!active) return;
        setConfigured(Boolean(payload.configured));
        if (payload.authenticated) router.replace("/");
      })
      .catch(() => {
        if (active) setError("Authentication service is unavailable. Check the deployment configuration.");
      });
    return () => { active = false; };
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password || loading) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error ?? "Access denied");
      router.replace("/");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-layout">
      <section className="login-story">
        <LoginBrand/>
        <div>
          <p className="mono text-[9px] uppercase tracking-[.17em] text-[#e2ad69]">A clear line from inquiry to action</p>
          <h1 className="login-story-title">Trade starts<br/>with a <em className="not-italic text-[#e2ad69]">question.</em></h1>
          <p className="login-story-copy">Keep the original customer message, structured requirements, catalog evidence and stock position together in one accountable commercial record.</p>
          <div className="relative z-10 mt-9 grid max-w-[490px] grid-cols-3 border-y border-white/15">
            <div className="py-3 pr-3"><p className="mono text-[8px] text-[#e2ad69]">01</p><p className="mt-1.5 text-[10px] font-semibold text-[#edf4ee]">Interpret</p></div>
            <div className="border-l border-white/15 px-3 py-3"><p className="mono text-[8px] text-[#e2ad69]">02</p><p className="mt-1.5 text-[10px] font-semibold text-[#edf4ee]">Verify</p></div>
            <div className="border-l border-white/15 pl-3 py-3"><p className="mono text-[8px] text-[#e2ad69]">03</p><p className="mt-1.5 text-[10px] font-semibold text-[#edf4ee]">Decide</p></div>
          </div>
        </div>
        <div className="login-story-foot"><span>VEYRA / PRIVATE DESK</span><span>ACCESS CONTROL</span></div>
      </section>

      <section className="login-content">
        <div className="login-form-wrap">
          <div className="mb-7 inline-flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[.14em] text-[#8a7567]">
            <LockKeyhole size={13} className="text-[#bc5034]"/> Secure workspace access
          </div>
          <h2 className="font-[var(--font-editorial)] text-[34px] font-medium leading-[1.02] tracking-[-.045em] text-[#203a39]">Welcome back.</h2>
          <p className="mt-3 max-w-[330px] text-[11px] leading-[1.8] text-[#6b7d77]">Enter the private workspace password configured for this instance.</p>

          <form onSubmit={submit} className="mt-8">
            <label htmlFor="workspace-password" className="field-label">Workspace password</label>
            <div className="relative">
              <Fingerprint size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#879a94]"/>
              <input
                id="workspace-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={event => setPassword(event.target.value)}
                placeholder="Enter access password"
                className="field-control h-12 pl-9"
              />
            </div>
            {error && <div role="alert" className="mt-4 border border-[#f0d9d0] bg-[#fff8f3] p-3 text-[10px] leading-[1.7] text-[#a94f3e]">{error}</div>}
            {configured === false && <div role="status" className="mt-4 border border-[#eddfc9] bg-[#fff8ef] p-3 text-[10px] leading-[1.7] text-[#95683b]">Access is not configured. Add WORKSPACE_ACCESS_PASSWORD and a WORKSPACE_SESSION_SECRET of at least 32 characters to the server environment.</div>}
            <Button type="submit" disabled={loading || configured === false || configured === null || !password} className="mt-5 w-full">
              {loading ? <LoaderCircle size={14} className="animate-spin"/> : <ShieldCheck size={14}/>}
              {loading ? "Verifying access…" : "Enter workspace"}
              {!loading && <ArrowRight size={13}/>}
            </Button>
          </form>

          <div className="mt-8 border-t border-[#d6e1dc] pt-4 text-[9px] leading-[1.8] text-[#84958e]">
            This instance uses a shared workspace password. Individual accounts, roles and multi-tenant access are not enabled in this release.
            <a href="/product" className="ml-1 font-bold text-[#bc5034] underline underline-offset-2">About Veyra</a>
          </div>
        </div>
      </section>
    </main>
  );
}