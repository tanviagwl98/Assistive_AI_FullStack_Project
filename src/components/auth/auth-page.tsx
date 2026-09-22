import Link from "next/link";
import { AuthForm } from "./auth-form";

export function AuthPage({ mode, returnTo, invitedEmail }: { mode: "login" | "signup"; returnTo?: string; invitedEmail?: string | null }) {
  const isSignup = mode === "signup";
  return <main className="min-h-screen bg-surface-muted px-5 py-10"><section className="mx-auto max-w-md rounded-card border bg-surface p-7 shadow-soft"><Link href="/" className="eyebrow"> My Marriage</Link><h1 className="mt-4 text-4xl">{isSignup ? "Start your wedding workspace" : "Welcome back"}</h1><p className="mt-3 text-muted-foreground">{isSignup ? "Create an account to plan together." : "Sign in to continue planning."}</p><AuthForm mode={mode} returnTo={returnTo} invitedEmail={invitedEmail}/><p className="mt-6 text-sm text-muted-foreground">{isSignup ? "Already have an account?" : "New to  My Marriage?"} <Link className="font-semibold text-primary underline" href={`${isSignup ? "/login" : "/signup"}${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}>{isSignup ? "Sign in" : "Create an account"}</Link></p></section></main>;
}
