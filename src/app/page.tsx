import Link from "next/link";

export default function HomePage() {
  return <main><p className="eyebrow">Make My Marriage</p><h1>One shared workspace for your wedding.</h1><p>Plan events, guests, tasks, vendors, expenses and memories together.</p><div className="actions"><Link className="button" href="/signup">Create an account</Link><Link className="button button--secondary" href="/login">Log in</Link></div></main>;
}
