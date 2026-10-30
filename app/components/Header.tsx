import Link from "next/link";
import { ShoppingBasket } from "lucide-react";

export default function Header() {
  return (
    <header className="topbar">
      <Link className="brand" href="/" aria-label="Mandje home">
        <span className="brand-icon">
          <ShoppingBasket size={19} strokeWidth={2.2} aria-hidden="true" />
        </span>
        <span>mandje</span>
      </Link>
      <span className="header-note">
        <span className="header-note-dot" aria-hidden="true" />
        Slimmer boodschappen doen
      </span>
    </header>
  );
}
