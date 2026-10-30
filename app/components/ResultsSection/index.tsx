import { AlertTriangle, Sparkles } from "lucide-react";
import type { ComparisonStore } from "../../map-data";
import ResultsHeader from "./ResultsHeader";
import RunnerUpList from "./RunnerUpList";
import WinnerCard from "./WinnerCard";

type Props = {
  stores: ComparisonStore[];
  itemCount: number;
  comparableCount: number;
  excluded: string[];
  unmatched: string[];
  activeStoreId: string | null;
  onStoreOpen: (storeId: string) => void;
  onStoreHighlight: (storeId: string) => void;
};

function listNames(names: string[]) {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} en ${names[names.length - 1]}`;
}

export default function ResultsSection({
  stores,
  itemCount,
  comparableCount,
  excluded,
  unmatched,
  activeStoreId,
  onStoreOpen,
  onStoreHighlight,
}: Props) {
  const sortedStores = [...stores].sort(
    (first, second) => first.basketTotal - second.basketTotal,
  );
  const winner = sortedStores[0];

  if (!winner) {
    return (
      <section className="results-error" role="alert">
        <AlertTriangle size={17} aria-hidden="true" />
        Er zijn geen winkels gevonden. Probeer een grotere zoekradius.
      </section>
    );
  }

  return (
    <section className="results-section" aria-label="Prijsvergelijking">
      <div className="demo-notice">
        <Sparkles size={15} aria-hidden="true" />
        <span>
          <strong>Demo-catalogus</strong>
          <small>
            Prijzen, voorraad en huismerkkeuzes komen uit een vaste
            voorbeeldcatalogus — geen actuele winkeldata.
          </small>
        </span>
      </div>
      <ResultsHeader
        itemCount={itemCount}
        comparableCount={comparableCount}
        storeCount={stores.length}
      />
      {unmatched.length > 0 && (
        <div className="results-notice" role="note">
          <AlertTriangle size={15} aria-hidden="true" />
          <span>
            <strong>Niet herkend:</strong> {listNames(unmatched)}.{" "}
            {unmatched.length === 1 ? "Deze regel staat" : "Deze regels staan"}{" "}
            niet in de demo-catalogus en{" "}
            {unmatched.length === 1 ? "is" : "zijn"} niet meegerekend.
          </span>
        </div>
      )}
      {excluded.length > 0 && (
        <div className="results-notice" role="note">
          <AlertTriangle size={15} aria-hidden="true" />
          <span>
            <strong>Eerlijk vergelijken:</strong> {listNames(excluded)}{" "}
            {excluded.length === 1 ? "is" : "zijn"} niet bij elke winkel te koop
            en daarom uit alle totalen weggelaten.
          </span>
        </div>
      )}
      <WinnerCard
        store={winner}
        active={winner.id === activeStoreId}
        onOpen={onStoreOpen}
        onHighlight={onStoreHighlight}
      />
      <RunnerUpList
        stores={sortedStores.slice(1)}
        winnerTotal={winner.basketTotal}
        activeStoreId={activeStoreId}
        onOpen={onStoreOpen}
        onHighlight={onStoreHighlight}
      />
    </section>
  );
}
