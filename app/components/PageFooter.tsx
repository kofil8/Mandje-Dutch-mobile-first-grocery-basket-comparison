import Link from "next/link";

export default function PageFooter() {
  return (
    <footer className="site-footer">
      <span>Mandje · Voorbeeldvergelijkingen</span>
      <nav aria-label="Juridische informatie">
        <Link href="/privacy">Privacyverklaring</Link>
        <Link href="/voorwaarden">Gebruiksvoorwaarden</Link>
      </nav>
    </footer>
  );
}
