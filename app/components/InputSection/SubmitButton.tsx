"use client";

import { ShoppingBasket } from "lucide-react";

type Props = {
  disabled: boolean;
  loading: boolean;
  loadingMessage: string;
  rateLimitSeconds: number;
};

export default function SubmitButton({
  disabled,
  loading,
  loadingMessage,
  rateLimitSeconds,
}: Props) {
  return (
    <button className="compare-button" type="submit" disabled={disabled}>
      {loading ? (
        <span className="loading-icon" aria-hidden="true" />
      ) : (
        <ShoppingBasket size={17} aria-hidden="true" />
      )}
      {loading
        ? loadingMessage
        : rateLimitSeconds > 0
          ? `Wacht ${rateLimitSeconds}s`
          : "Vergelijk prijzen"}
    </button>
  );
}
