"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCw } from "lucide-react";

type Props = {
  error: unknown;
  retry: () => void;
};

export default function ErrorPage({ error, retry }: Props) {
  useEffect(() => {
    console.error("Mandje route error:", error);
  }, [error]);

  return (
    <main className="app-shell error-page" role="alert">
      <span className="error-icon error-icon-warning">!</span>
      <p className="error-code">TIJDELIJKE FOUT</p>
      <h1>Oeps! Onze rekenmachine is even de weg kwijt.</h1>
      <p>Probeer het over een paar minuten opnieuw.</p>
      <div className="error-actions">
        <button className="error-home-link" type="button" onClick={retry}>
          <RotateCw size={15} aria-hidden="true" />
          Opnieuw proberen
        </button>
        <Link className="error-secondary-link" href="/">
          <ArrowLeft size={15} aria-hidden="true" />
          Naar Mandje
        </Link>
      </div>
    </main>
  );
}
