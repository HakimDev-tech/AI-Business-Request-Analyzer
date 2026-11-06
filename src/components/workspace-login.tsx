"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Fingerprint, LoaderCircle, LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <main className="grid min-h-screen bg-[#f0f1f4] lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative flex min-h-[320px] flex-col justify-between overflow-hidden bg-[#171923] px-7 py-8 text-white sm:px-12 sm:py-11 lg:min-h-screen lg:px-16 lg:py-14">
        <div className="relative z-10 flex items-center gap-3">
          <span className="grid size-10 place-items-center bg-[#365dff]">
            <svg viewBox="0 0 28 28" width="23" height="23" fill="none" aria-hidden="true"><path d="M4 5h7l7 18h6L17 5h7" stroke="white" strokeWidth="2.3" strokeLinecap="square"/><path d="M4 23h5" stroke="#ff795c" strokeWidth="2.3"/></svg>
          </span>
          <span><span className="block text-[17px] font-bold tracking-[-.06em]">VEYRA<span className="text-[#ff795c]">/</span></span><span className="mt-1 block text-[8px] uppercase tracking-[.18em] text-[#858b9b]">Commercial operations</span></span>
        </div>
        <div className="relative z-10 max-w-[540px] py-12">
          <p className="mono text-[9px] uppercase tracking-[.18em] text-[#8da4ff]">Private workspace / Access control</p>
          <h1 className="mt-5 font-[var(--font-space)] text-[clamp(38px,5vw,64px)] font-semibold leading-[.98] tracking-[-.07em]">Decisions need<br/><span className="text-[#8da4ff]">evidence.</span></h1>
          <p className="mt-6 max-w-[390px] text-[12px] leading-[1.9] text-[#a7adbb]">A controlled operating environment for customer requests, product intelligence, inventory verification and commercial knowledge.</p>
        </div>
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4 font-mono text-[8px] uppercase tracking-[.13em] text-[#7e8493]"><span>VEYRA / WORKSPACE</span><span>PRIVATE INSTANCE</span></div>
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -right-16 size-[420px] rounded-full border border-white/[.06]"><div className="absolute inset-10 rounded-full border border-white/[.06]"/><div className="absolute inset-20 rounded-full border border-white/[.06]"/><div className="absolute inset-32 rounded-full border border-[#365dff]/30"/></div>
      </section>

      <section className="flex min-h-[460px] items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-[390px]">
          <div className="mb-8 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.14em] text-[#858b98]"><LockKeyhole size={13} className="text-[#365dff]"/> Secure access</div>
          <h2 className="font-[var(--font-space)] text-[31px] font-semibold leading-none tracking-[-.055em]">Sign in to Veyra.</h2>
          <p className="mt-3 text-[11px] leading-[1.7] text-[#7a808e]">Enter the private workspace password configured for this deployment.</p>

          <form onSubmit={submit} className="mt-8">
            <label htmlFor="workspace-password" className="field-label">Workspace password</label>
            <div className="relative">
              <Fingerprint size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a90a0]"/>
              <input id="workspace-password" type="password" autoComplete="current-password" required value={password} onChange={event=>setPassword(event.target.value)} placeholder="Enter access password" className="field-control h-11 pl-9"/>
            </div>
            {error && <div role="alert" className="mt-4 border border-[#f0d1ce] bg-[#fff7f6] p-3 text-[10px] leading-[1.7] text-[#a84b49]">{error}</div>}
            {configured === false && <div role="status" className="mt-4 border border-[#f0dfbd] bg-[#fffbf3] p-3 text-[10px] leading-[1.7] text-[#956a2f]">Access is not configured. Add WORKSPACE_ACCESS_PASSWORD and a WORKSPACE_SESSION_SECRET of at least 32 characters to the server environment.</div>}
            <Button type="submit" disabled={loading || configured === false || configured === null || !password} className="mt-5 w-full">
              {loading ? <LoaderCircle size={14} className="animate-spin"/> : <ShieldCheck size={14}/>}
              {loading ? "Verifying access…" : "Enter workspace"}
              {!loading && <ArrowRight size={13}/>}
            </Button>
          </form>

          <div className="mt-8 border-t border-[#dfe1e7] pt-4 text-[9px] leading-[1.7] text-[#8c92a0]">This instance uses a shared workspace password. Personal accounts, roles and multi-tenant access are not enabled in this pilot build. <a href="/product" className="ml-1 font-bold text-[#365dff] underline">About Veyra</a></div>
        </div>
      </section>
    </main>
  );
}
