import { AlertTriangle, ArrowUpRight } from "lucide-react";
import type { CSSProperties } from "react";
import type { ComparisonStore } from "../../map-data";
import { formatDistance, formatPrice } from "../../map-data";

type Props = {
  store: ComparisonStore;
  active: boolean;
  winnerTotal: number;
  onOpen: (storeId: string) => void;
  onHighlight: (storeId: string) => void;
};

export default function SupermarketCard({
  store,
  active,
  winnerTotal,
  onOpen,
  onHighlight,
}: Props) {
  const delta = Math.round((store.basketTotal - winnerTotal) * 100) / 100;

  return (
    <button
      className={`store-card${active ? " is-active" : ""}`}
      type="button"
      onClick={() => onOpen(store.id)}
      onPointerEnter={() => onHighlight(store.id)}
      onFocus={() => onHighlight(store.id)}
      aria-label={`Bekijk het voorbeeldmandje van ${store.brand}`}
      aria-haspopup="dialog"
    >
      <span className="store-brand-wrap">
        <span
          className="store-brand"
          style={{ "--store-color": store.color } as CSSProperties}
          aria-hidden="true"
        >
          {store.short}
        </span>
        <span className="store-copy">
          <strong>{store.brand}</strong>
          <span>
            {store.branchName} · {formatDistance(store.distanceKm)}
          </span>
        </span>
      </span>
      <span className="store-price-wrap">
        <strong className="store-price">
          {formatPrice(store.basketTotal)}
        </strong>
        {delta > 0.004 && (
          <span className="store-delta">+{formatPrice(delta)}</span>
        )}
        {store.missingItems.length > 0 && (
          <span className="missing-items">
            <AlertTriangle size={13} aria-hidden="true" />
            {store.missingItems.length} niet meegeteld
          </span>
        )}
      </span>
      <ArrowUpRight className="store-open-icon" size={16} aria-hidden="true" />
    </button>
  );
}
