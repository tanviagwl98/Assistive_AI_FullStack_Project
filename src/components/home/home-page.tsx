"use client";

import Link from "next/link";
import { useHomeSession } from "./home-session";

export function HomePage() {
  const session = useHomeSession();
  const dashboardHref = session === "wedding" ? "/dashboard" : session === "onboarding" ? "/onboarding" : "/signup";
  return <main><section className="container hero"><div className="hero-copy"><p className="eyebrow">Make My Marriage</p><h1>Every wedding detail, beautifully together.</h1><p className="section-intro">A calm shared workspace for your family to plan events, guests, tasks and the memories that follow.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link className="button button-primary" href={dashboardHref}>{session === "signed-out" ? "Start planning" : "Open your wedding"}</Link>{session === "signed-out" && <Link className="button button-secondary" href="/login">Sign in</Link>}</div></div></section><section className="section section-tinted"><div className="container"><div className="section-heading"><p className="eyebrow">One organised celebration</p><h2>Made for the way Indian weddings come together.</h2><p className="section-intro">Coordinate every ceremony, keep guests informed, and give everyone one reliable place to return to.</p></div><div className="grid gap-5 md:grid-cols-3">{[["Plan", "Events, tasks, vendors and expenses in one wedding workspace."], ["Invite", "Personal invitation links and simple RSVP collection—no guest accounts."], ["Remember", "A private gallery for every shared moment."]].map(([title, copy]) => <article className="rounded-card border bg-surface p-6 shadow-soft" key={title}><h3 className="text-xl">{title}</h3><p className="mt-3 text-muted-foreground">{copy}</p></article>)}</div></div></section></main>;
}
