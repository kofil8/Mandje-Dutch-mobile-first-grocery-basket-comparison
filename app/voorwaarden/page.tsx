import type { Metadata } from "next";
import LegalPageLayout from "../components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Gebruiksvoorwaarden | Mandje",
  description:
    "Voorwaarden voor het gebruik van de Mandje-demo voor prijsvergelijking.",
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Gebruiksvoorwaarden"
      intro="Mandje is op dit moment een demonstratie. Deze conceptvoorwaarden zijn geen juridisch advies en moeten vóór een publieke lancering worden gecontroleerd en aangevuld."
    >
      <section>
        <h2>Indicatieve informatie</h2>
        <p>
          Winkels, locaties, beschikbaarheid, productmatches en prijzen in deze
          demo zijn uitsluitend illustratief. Ze zijn geen actueel aanbod,
          aankoopadvies of garantie van beschikbaarheid. Controleer prijzen en
          voorraad altijd bij de betreffende winkel.
        </p>
      </section>
      <section>
        <h2>Geen band met supermarktketens</h2>
        <p>
          Mandje is niet verbonden aan of goedgekeurd door Albert Heijn, Ahold
          Delhaize, Jumbo, Lidl of andere genoemde winkelketens. Merknamen
          worden alleen gebruikt om de demonstratieweergave herkenbaar te maken.
        </p>
      </section>
      <section>
        <h2>Gebruik van de dienst</h2>
        <p>
          Gebruik de demo alleen voor het testen van de interface. Omdat de
          gegevens niet actueel zijn, mag je de resultaten niet gebruiken als
          basis voor aankoop-, reis- of financiële beslissingen.
        </p>
      </section>
      <section>
        <h2>Beschikbaarheid en wijzigingen</h2>
        <p>
          De demo wordt geleverd zonder garantie op beschikbaarheid of foutloze
          werking. Functies, gegevens en deze voorwaarden kunnen worden
          aangepast wanneer de dienst verder wordt ontwikkeld.
        </p>
      </section>
      <section>
        <h2>Voor publicatie</h2>
        <p>
          Een productieversie vereist onder meer de juridische naam en
          contactgegevens van de aanbieder, een toepasselijk recht en een
          juridische controle van deze voorwaarden.
        </p>
      </section>
    </LegalPageLayout>
  );
}
