import type { Metadata } from "next";
import LegalPageLayout from "../components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacyverklaring | Mandje",
  description:
    "Lees hoe de Mandje-demo omgaat met je boodschappenlijst en locatie.",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacyverklaring"
      intro="We vragen zo min mogelijk gegevens. Deze verklaring beschrijft het huidige demo-gedrag; vul voor een publieke productieversie de verantwoordelijke organisatie en contactgegevens aan."
    >
      <section>
        <h2>Welke gegevens gebruikt de demo?</h2>
        <p>
          Wanneer je vergelijkt, stuurt je browser je boodschappenlijst, gekozen
          zoekradius en locatie naar de Mandje-server om een voorbeeldantwoord
          te maken. De demo slaat deze aanvraag niet op in een
          applicatiedatabase en gebruikt geen accountprofielen.
        </p>
      </section>
      <section>
        <h2>Locatie</h2>
        <p>
          Je browserlocatie wordt alleen opgevraagd nadat je zelf op “Locatie
          gebruiken” klikt. De gekozen coördinaten worden meegestuurd met een
          vergelijking, maar door de demo-app niet permanent bewaard. Je kunt
          ook zelf een plaats of postcode invullen.
        </p>
      </section>
      <section>
        <h2>Boodschappenlijst en AI</h2>
        <p>
          De huidige demo verstuurt je lijst alleen naar de eigen
          vergelijkingsroute. Er wordt geen externe AI-API aangeroepen en je
          lijst wordt niet naar een AI-aanbieder doorgestuurd. Bij een
          toekomstige AI-integratie moet deze verklaring worden bijgewerkt
          voordat die verwerking start.
        </p>
      </section>
      <section>
        <h2>Technische logs en bewaartermijnen</h2>
        <p>
          De hostingprovider kan technische toegangs- of foutlogs verwerken
          volgens diens eigen voorwaarden. De beheerder van een productieversie
          moet hier de gebruikte hostingdiensten, bewaartermijnen, rechtsgrond
          en contactgegevens invullen.
        </p>
      </section>
      <section>
        <h2>Vragen of verzoeken</h2>
        <p>
          Deze demo bevat nog geen contactgegevens van een
          verwerkingsverantwoordelijke. Voeg die toe voordat de dienst publiek
          wordt aangeboden.
        </p>
      </section>
    </LegalPageLayout>
  );
}
