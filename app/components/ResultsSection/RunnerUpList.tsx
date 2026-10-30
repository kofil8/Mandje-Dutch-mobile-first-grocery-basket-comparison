import type { ComparisonStore } from "../../map-data";
import SupermarketCard from "./SupermarketCard";

type Props = {
  stores: ComparisonStore[];
  winnerTotal: number;
  activeStoreId: string | null;
  onOpen: (storeId: string) => void;
  onHighlight: (storeId: string) => void;
};

export default function RunnerUpList({
  stores,
  winnerTotal,
  activeStoreId,
  onOpen,
  onHighlight,
}: Props) {
  if (!stores.length) return null;

  return (
    <section className="runner-up-section">
      <div className="runner-up-heading">
        <h3>Andere supermarkten</h3>
        <span>Gesorteerd op prijs</span>
      </div>
      <div className="store-list">
        {stores.map((store) => (
          <SupermarketCard
            key={store.id}
            store={store}
            active={store.id === activeStoreId}
            winnerTotal={winnerTotal}
            onOpen={onOpen}
            onHighlight={onHighlight}
          />
        ))}
      </div>
    </section>
  );
}
