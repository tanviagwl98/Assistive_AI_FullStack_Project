import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Make My Marriage", template: "%s | Make My Marriage" },
  description: "One shared workspace for planning an Indian wedding.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
