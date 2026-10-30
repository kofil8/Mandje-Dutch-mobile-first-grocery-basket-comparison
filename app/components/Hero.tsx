import { Info, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow">
          <Sparkles size={13} aria-hidden="true" />
          MEER OVERHOUDEN VOOR LEUKE DINGEN
        </span>
        <h1>Bespaar op je wekelijkse boodschappen</h1>
        <p>
          Jouw lijstje, jouw buurt. Ontdek waar je boodschappenmandje het
          voordeligst is.
        </p>
      </div>
      <div className="hero-note">
        <span className="hero-note-icon">
          <Info size={17} aria-hidden="true" />
        </span>
        <span>
          <strong>Voorbeeldprijzen, geen live data</strong>
          <small>Ook winkel-locaties zijn illustratief</small>
        </span>
      </div>
    </section>
  );
}
