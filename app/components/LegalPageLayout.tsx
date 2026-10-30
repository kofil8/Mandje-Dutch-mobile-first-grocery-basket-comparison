import type { ReactNode } from "react";
import Link from "next/link";
import Header from "./Header";
import PageFooter from "./PageFooter";

type Props = {
  title: string;
  intro: string;
  children: ReactNode;
};

export default function LegalPageLayout({ title, intro, children }: Props) {
  return (
    <main className="app-shell legal-shell">
      <Header />
      <article className="legal-page">
        <Link className="legal-back-link" href="/">
          Terug naar Mandje
        </Link>
        <h1>{title}</h1>
        <p className="legal-intro">{intro}</p>
        <div className="legal-content">{children}</div>
      </article>
      <PageFooter />
    </main>
  );
}
