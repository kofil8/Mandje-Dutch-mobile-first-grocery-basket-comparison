import { Check, MapPin, ShieldCheck, Sparkles } from "lucide-react";

const benefits = [
  "Jouw lijstje blijft privé",
  "Winkels in jouw buurt",
  "Vergelijk in één overzicht",
];

export default function SearchIntroPanel() {
  return (
    <aside className="search-intro" aria-label="Zo werkt Mandje">
      <span className="search-intro-icon" aria-hidden="true">
        <ShoppingBasketIllustration />
      </span>
      <span className="search-intro-kicker">
        <Sparkles size={13} aria-hidden="true" />
        EEN HANDIGER BOODSCHAPPENRONDJE
      </span>
      <h2>Jouw lijstje. De beste keuze in de buurt.</h2>
      <p>
        Vul je boodschappen en woonplaats in. We zetten de mogelijkheden
        overzichtelijk voor je op een rij.
      </p>
      <ul>
        {benefits.map((benefit, index) => (
          <li key={benefit}>
            <span className="search-intro-benefit-icon" aria-hidden="true">
              {index === 0 ? (
                <ShieldCheck size={16} />
              ) : index === 1 ? (
                <MapPin size={16} />
              ) : (
                <Check size={16} />
              )}
            </span>
            {benefit}
          </li>
        ))}
      </ul>
      <small className="search-intro-demo-note">
        Deze versie gebruikt voorbeeldprijzen en voorbeeldlocaties.
      </small>
    </aside>
  );
}

function ShoppingBasketIllustration() {
  return (
    <svg
      viewBox="0 0 160 132"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M37 54h86l-9 58H47l-10-58Z"
        fill="#F6FAF1"
        stroke="#4B8A5E"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="m55 53 20-30m30 30L85 23"
        stroke="#4B8A5E"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path d="M58 67v29m22-29v29m22-29v29" stroke="#C2D8BD" strokeWidth="4" />
      <circle cx="128" cy="27" r="17" fill="#E5F0DE" />
      <path
        d="m121 27 5 5 10-11"
        stroke="#397950"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M29 119h105"
        stroke="#DDE8D9"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M65 48c-1-12 5-18 15-18 3 8-2 16-15 18Z" fill="#8CB58A" />
      <path d="M84 48c1-12-5-18-15-18-3 8 2 16 15 18Z" fill="#A4C59A" />
    </svg>
  );
}
