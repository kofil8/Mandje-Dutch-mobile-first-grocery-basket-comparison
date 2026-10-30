import { AlertTriangle, Check, ShoppingBasket } from "lucide-react";
import type { ComparisonStore } from "../../map-data";
import { formatDistance, formatPrice } from "../../map-data";

type Props = {
  store: ComparisonStore;
  active: boolean;
  onOpen: (storeId: string) => void;
  onHighlight: (storeId: string) => void;
};

function listNames(names: string[]) {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} en ${names[names.length - 1]}`;
}

export default function WinnerCard({
  store,
  active,
  onOpen,
  onHighlight,
}: Props) {
  const comparedCount = store.receipt.filter(
    (item) => item.status === "comparable",
  ).length;

  return (
    <button
      className={`winner-card${active ? " is-active" : ""}`}
      type="button"
      onClick={() => onOpen(store.id)}
      onPointerEnter={() => onHighlight(store.id)}
      onFocus={() => onHighlight(store.id)}
      aria-label={`Bekijk het voorbeeldmandje van ${store.brand}`}
      aria-haspopup="dialog"
    >
      <div className="winner-card-heading">
        <span className="winner-check">
          <Check size={16} aria-hidden="true" />
        </span>
        <span>
          <small>VOORDELIGSTE KEUZE</small>
          <strong>{store.brand}</strong>
          <span className="winner-branch">{store.branchName}</span>
        </span>
        <span className="winner-total">{formatPrice(store.basketTotal)}</span>
      </div>
      {store.missingItems.length > 0 && (
        <span className="missing-warning" role="note">
          <AlertTriangle size={15} aria-hidden="true" />
          <span>
            <strong>Let op:</strong> {store.brand} heeft geen{" "}
            {listNames(store.missingItems)}.{" "}
            {store.missingItems.length === 1 ? "Dit is" : "Deze zijn"} uit alle
            totalen weggelaten.
          </span>
        </span>
      )}
      <div className="basket-preview">
        <span>
          <ShoppingBasket size={14} aria-hidden="true" />
          {comparedCount} {comparedCount === 1 ? "product" : "producten"} ·{" "}
          {formatDistance(store.distanceKm)}
        </span>
        <span className="basket-open-hint">Bekijk kassabon</span>
      </div>
    </button>
  );
}
