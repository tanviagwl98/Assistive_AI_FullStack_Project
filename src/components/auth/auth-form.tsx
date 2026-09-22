"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/components/workspace/api";

export function AuthForm({ mode, returnTo, invitedEmail }: { mode: "login" | "signup"; returnTo?: string; invitedEmail?: string | null }) {
  const router = useRouter(); const signup = mode === "signup";
  const [error, setError] = useState(""); const [pending, setPending] = useState(false);
  async function submit(formData: FormData) { setPending(true); setError(""); try { const payload = Object.fromEntries(formData); const result = await apiRequest<{ hasWedding?: boolean }>(`/api/auth/${signup ? "signup" : "login"}`, "POST", payload); router.replace(returnTo ?? (result.hasWedding ? "/dashboard" : "/onboarding")); router.refresh(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to continue."); } finally { setPending(false); } }
  return <form action={submit} className="mt-7 grid gap-4"><label className="grid gap-1 text-sm font-semibold">{signup && <>Your name<input required name="name" autoComplete="name" className="rounded-md border bg-white px-3 py-2 font-normal" /></>}</label><label className="grid gap-1 text-sm font-semibold">Email<input required name="email" type="email" defaultValue={invitedEmail ?? ""} autoComplete="email" className="rounded-md border bg-white px-3 py-2 font-normal" /></label><label className="grid gap-1 text-sm font-semibold">Password<input required name="password" type="password" minLength={8} autoComplete={signup ? "new-password" : "current-password"} className="rounded-md border bg-white px-3 py-2 font-normal" /></label>{error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-danger">{error}</p>}<button disabled={pending} className="button button-primary mt-2 disabled:opacity-60">{pending ? "Please wait…" : signup ? "Create account" : "Sign in"}</button></form>;
}
