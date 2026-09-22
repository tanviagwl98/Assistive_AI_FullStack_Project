import Link from "next/link";

const links = [["Dashboard", "/dashboard"], ["Events", "/events"], ["Tasks", "/tasks"], ["Guests", "/guests"], ["Photos", "/gallery"]] as const;
export function WeddingShell({ children, user, weddingId, role, editing }: { children: React.ReactNode; user?: { name?: string }; weddingId: string | null; role?: string; editing?: boolean }) {
  return <div className="min-h-screen bg-background"><header className="border-b bg-surface"><div className="container flex min-h-16 flex-wrap items-center justify-between gap-3 py-3"><Link href="/dashboard" className="font-serif text-xl text-primary"> My Marriage</Link>{weddingId && <nav aria-label="Wedding workspace" className="flex flex-wrap gap-3 text-sm text-muted-foreground">{links.map(([label, href]) => <Link key={href} href={href} className="hover:text-primary">{label}</Link>)}{role === "ADMIN" && <Link href="/settings/members" className="hover:text-primary">Members</Link>}</nav>}<span className="text-sm text-muted-foreground">{editing ? "Editing" : user?.name ?? ""}</span></div></header>{children}</div>;
}
