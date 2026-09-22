import { requireWeddingMember } from "@/server/auth/require-session";

export default async function DashboardPage() {
  const context = await requireWeddingMember();
  return <main><p className="eyebrow">Wedding dashboard</p><h1>Welcome, {context.user.name}</h1><p>Your dashboard summaries will appear here as planning modules are implemented.</p></main>;
}
