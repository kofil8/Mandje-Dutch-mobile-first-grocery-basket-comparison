import Link from "next/link";
import { ArrowLeft, ShoppingBasket } from "lucide-react";

export default function NotFound() {
  return (
    <main className="app-shell error-page">
      <span className="error-icon">
        <ShoppingBasket size={24} aria-hidden="true" />
      </span>
      <p className="error-code">404 · PAGINA NIET GEVONDEN</p>
      <h1>Deze pagina is niet in je mandje beland.</h1>
      <p>Controleer het adres of ga terug naar de prijsvergelijker.</p>
      <Link className="error-home-link" href="/">
        <ArrowLeft size={16} aria-hidden="true" />
        Naar Mandje
      </Link>
    </main>
  );
}
