"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  MapPinned,
  PackageCheck,
  Sparkles,
  X,
} from "lucide-react";
import type { ComparisonStore } from "../map-data";
import { formatDistance, formatPrice } from "../map-data";

type Props = {
  store: ComparisonStore;
  onClose: () => void;
  onEditList: () => void;
};

export default function ReceiptDialog({ store, onClose, onEditList }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Esc, a backdrop click and the close button can all fire close events;
  // guard so the parent's onClose only runs once.
  const requestedClose = useRef(false);
  const requestClose = () => {
    if (requestedClose.current) return;
    requestedClose.current = true;
    onClose();
  };
  const comparedItems = useMemo(
    () => store.receipt.filter((item) => item.status === "comparable"),
    [store.receipt],
  );
  const excludedItems = useMemo(
    () => store.receipt.filter((item) => item.status !== "comparable"),
    [store.receipt],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();

    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      className="receipt-dialog"
      ref={dialogRef}
      aria-labelledby="receipt-title"
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClose={requestClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <div className="receipt-dialog-content">
        <header className="receipt-dialog-header">
          <div className="receipt-store-logo" aria-hidden="true">
            {store.short}
          </div>
          <div className="receipt-store-heading">
            <span className="receipt-kicker">VOORBEELDMANDJE</span>
            <h2 id="receipt-title">{store.brand}</h2>
            <p>
              {store.branchName} · {formatDistance(store.distanceKm)}
            </p>
          </div>
          <button
            className="receipt-close"
            type="button"
            onClick={requestClose}
            aria-label="Sluit mandje"
            autoFocus
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="receipt-total-banner">
          <span>
            <small>
              Totaal · {comparedItems.length}{" "}
              {comparedItems.length === 1 ? "product" : "producten"}
            </small>
            <strong>{formatPrice(store.basketTotal)}</strong>
          </span>
          <span className="receipt-demo-badge">Demo-prijs</span>
        </div>

        <div className="receipt-list-heading">
          <h3>Kassabon</h3>
          <span>
            {comparedItems.length} meegerekend · {excludedItems.length} niet
          </span>
        </div>

        <div className="receipt-products">
          {store.receipt.map((item, index) => (
            <div
              className={`receipt-product${item.status === "comparable" ? "" : " is-excluded"}`}
              key={`${store.id}-${index}-${item.name}`}
            >
              <span className="receipt-product-thumb" aria-hidden="true">
                {item.status === "comparable" ? (
                  <PackageCheck size={18} />
                ) : (
                  <AlertTriangle size={18} />
                )}
              </span>
              <span className="receipt-product-copy">
                <small>
                  {item.status === "comparable"
                    ? "MEEGEREKEND"
                    : "NIET MEEGEREKEND"}
                </small>
                <strong>{item.productName ?? item.name}</strong>
                {item.substitution && (
                  <span className="receipt-substitution">
                    <span className="ai-choice">
                      <Sparkles size={10} aria-hidden="true" />
                      AI Keuze
                    </span>
                    {item.substitution}
                  </span>
                )}
                {item.productName && (
                  <span>
                    {item.name} · {item.quantityLabel}
                    {item.unitPriceLabel ? ` · ${item.unitPriceLabel}` : ""}
                  </span>
                )}
                {item.reason && (
                  <span className="receipt-reason">{item.reason}</span>
                )}
              </span>
              <span className="receipt-product-price">
                <strong>
                  {item.price === null ? "—" : formatPrice(item.price)}
                </strong>
                <small>
                  {item.status === "comparable"
                    ? "regelprijs"
                    : "telt niet mee"}
                </small>
              </span>
            </div>
          ))}
        </div>

        <section
          className="receipt-missing"
          aria-labelledby="missing-items-title"
        >
          <h3 id="missing-items-title">
            <AlertTriangle size={15} aria-hidden="true" />
            Niet meegeteld
          </h3>
          {excludedItems.length > 0 ? (
            <ul>
              {excludedItems.map((item, index) => (
                <li key={`${store.id}-missing-${index}-${item.name}`}>
                  {item.name}
                  {item.reason ? ` — ${item.reason}` : ""}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              <Check size={14} aria-hidden="true" />
              Alle producten zijn bij deze winkel meegerekend.
            </p>
          )}
        </section>

        <p className="receipt-disclaimer">
          Winkel, voorraad en prijzen zijn illustratief en komen uit een vaste
          demo-catalogus. Regelprijzen zijn de prijs van de benodigde
          verpakkingen; huismerkkeuzes verklaren een deel van het prijsverschil.
        </p>

        <footer className="receipt-actions">
          <button
            className="receipt-edit-button"
            type="button"
            onClick={onEditList}
          >
            Pas lijst aan
          </button>
          <button
            className="receipt-directions-button"
            type="button"
            disabled
            title="Live winkeladressen zijn niet beschikbaar in deze demo"
          >
            Bekijk route
            <ArrowUpRight size={15} aria-hidden="true" />
          </button>
        </footer>
        <p className="receipt-route-note">
          <MapPinned size={13} aria-hidden="true" />
          Een route is beschikbaar zodra echte winkeladressen zijn gekoppeld.
        </p>
      </div>
    </dialog>
  );
}
