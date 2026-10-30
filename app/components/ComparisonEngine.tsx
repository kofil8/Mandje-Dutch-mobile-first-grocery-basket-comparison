"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  AlertTriangle,
  Check,
  LocateFixed,
  MapPin,
  ShoppingBasket,
  Sparkles,
} from "lucide-react";
import type {
  ComparisonLocation,
  ComparisonRequest,
  ComparisonResponse,
  ComparisonStore,
  MapLocation,
} from "../map-data";
import {
  DEFAULT_CENTER,
  findLocation,
  formatPrice,
  parseShoppingList,
  suggestRadius,
} from "../map-data";
import InputSection from "./InputSection";
import SubmitButton from "./InputSection/SubmitButton";
import MapWrapper from "./MapSection/MapWrapper";
import SearchIntroPanel from "./SearchIntroPanel";
import ReceiptDialog from "./ReceiptDialog";
import ResultsSection from "./ResultsSection";

type Status = "idle" | "loading" | "error" | "success";

const loadingMessages = [
  "Lijst ontcijferen…",
  "Voorraden controleren bij AH en Jumbo…",
  "Beste deal berekenen…",
];

function getRetryDelay(response: Response) {
  const retryAfter = response.headers.get("Retry-After");
  if (!retryAfter) return 60;

  const seconds = Number(retryAfter);
  if (Number.isFinite(seconds)) {
    return Math.max(1, Math.min(3600, Math.ceil(seconds)));
  }

  const retryAt = Date.parse(retryAfter);
  return Number.isNaN(retryAt)
    ? 60
    : Math.max(1, Math.min(3600, Math.ceil((retryAt - Date.now()) / 1000)));
}

async function guessNetworkLocation(): Promise<MapLocation | null> {
  try {
    const response = await fetch("/api/locate", { cache: "no-store" });
    if (!response.ok) return null;
    const data = (await response.json()) as { location?: MapLocation };
    return data.location ?? null;
  } catch {
    return null;
  }
}

function LoadingResults({ step, message }: { step: number; message: string }) {
  return (
    <section className="loading-results" role="status" aria-live="polite">
      <div className="loading-title">
        <span className="loading-icon-wrap">
          <Sparkles size={16} aria-hidden="true" />
        </span>
        <span>
          <strong>{message}</strong>
          <small>Een momentje, we zetten alles op een rij.</small>
        </span>
      </div>
      <ol className="loading-steps">
        {loadingMessages.map((label, index) => (
          <li
            key={label}
            className={
              index < step ? "is-done" : index === step ? "is-active" : ""
            }
          >
            <span className="loading-step-marker" aria-hidden="true">
              {index < step ? <Check size={11} /> : null}
            </span>
            {label}
          </li>
        ))}
      </ol>
      <div
        className={`skeleton skeleton-winner${step === 2 ? " is-stage" : ""}`}
        aria-hidden="true"
      />
      <div
        className={`skeleton skeleton-store${step === 1 ? " is-stage" : ""}`}
        aria-hidden="true"
      />
      <div
        className={`skeleton skeleton-store${step === 1 ? " is-stage" : ""}`}
        aria-hidden="true"
      />
    </section>
  );
}

export default function ComparisonEngine() {
  const [rawInput, setRawInput] = useState("");
  const [locationText, setLocationText] = useState("");
  const [location, setLocation] = useState<MapLocation | null>(null);
  const [radius, setRadius] = useState(5);
  const [isOrganicOnly, setIsOrganicOnly] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [loadingStep, setLoadingStep] = useState(0);
  const [response, setResponse] = useState<ComparisonResponse | null>(null);
  const [highlightedStoreId, setHighlightedStoreId] = useState<string | null>(
    null,
  );
  const [openStoreId, setOpenStoreId] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [listError, setListError] = useState("");
  const [locationError, setLocationError] = useState("");
  const [locationNotice, setLocationNotice] = useState("");
  const [requestError, setRequestError] = useState("");
  const [rateLimitUntil, setRateLimitUntil] = useState<number | null>(null);
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0);
  const resultsRef = useRef<HTMLElement>(null);

  const parsedItems = useMemo(() => parseShoppingList(rawInput), [rawInput]);
  const selectedStore: ComparisonStore | null =
    response?.stores.find((store) => store.id === openStoreId) ?? null;
  const resolvedLocation = location ?? findLocation(locationText);
  const activeLocation: ComparisonLocation | null = resolvedLocation
    ? {
        label: resolvedLocation.label,
        center: resolvedLocation.center,
        radius,
      }
    : null;
  const mapLocation = activeLocation ?? {
    label: locationText.trim() ? "Locatie niet herkend" : "Nog geen locatie",
    center: DEFAULT_CENTER,
    radius,
  };
  const loadingMessage = loadingMessages[loadingStep] ?? loadingMessages[0];
  const isLoading = status === "loading";
  // The intro panel and the empty results card say the same thing; only show
  // the introduction until a location has been recognised.
  const showIntroPanel = !resolvedLocation && !response;

  const cheapestStore = useMemo(() => {
    if (!response?.stores.length) return null;
    return [...response.stores].sort(
      (first, second) => first.basketTotal - second.basketTotal,
    )[0];
  }, [response]);

  const announcement = isLoading
    ? loadingMessage
    : requestError
      ? requestError
      : cheapestStore
        ? `Vergelijking klaar. ${cheapestStore.brand} is het voordeligst met ${formatPrice(cheapestStore.basketTotal)}.`
        : "";

  useEffect(() => {
    if (rateLimitUntil === null) return;

    const updateRemaining = () => {
      const remaining = Math.max(
        0,
        Math.ceil((rateLimitUntil - Date.now()) / 1000),
      );
      setRateLimitSeconds(remaining);
      if (remaining === 0) setRateLimitUntil(null);
    };

    updateRemaining();
    const timer = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(timer);
  }, [rateLimitUntil]);

  function invalidateResults() {
    setResponse(null);
    setOpenStoreId(null);
    setRequestError("");
    setHighlightedStoreId(null);
    setStatus((current) => (current === "loading" ? current : "idle"));
  }

  function handleInputChange(value: string) {
    setRawInput(value);
    setListError("");
    invalidateResults();
  }

  function handleLocationChange(value: string) {
    setLocationText(value);
    setLocation(null);
    setLocationError("");
    setLocationNotice("");
    invalidateResults();
    const place = findLocation(value);
    setMapOpen(Boolean(place));
    if (place) setRadius(suggestRadius(place.label));
  }

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setLocationError(
        "Locatiebepaling wordt niet ondersteund door je browser.",
      );
      return;
    }

    setIsLocating(true);
    setLocationError("");
    setLocationNotice("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const point: MapLocation = {
          label: "Jouw locatie",
          center: [coords.latitude, coords.longitude],
        };
        setLocation(point);
        setLocationText(point.label);
        setMapOpen(true);
        setIsLocating(false);
        invalidateResults();
      },
      async () => {
        // Permission denied or unavailable: fall back to a city-level estimate
        // so the map and the comparison keep working.
        const fallback = await guessNetworkLocation();
        setIsLocating(false);

        if (fallback) {
          setLocation(fallback);
          setLocationText(fallback.label);
          setRadius(suggestRadius(fallback.label));
          setLocationNotice(
            `Locatie bij benadering: ${fallback.label}. Pas je postcode aan voor meer precisie.`,
          );
          setMapOpen(true);
          invalidateResults();
          return;
        }

        setLocationError(
          "Je locatie kon niet worden opgehaald. Vul je postcode of woonplaats in.",
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }

  async function handleCompare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading || rateLimitSeconds > 0) return;

    const items = parseShoppingList(rawInput);
    const place = location ?? findLocation(locationText);
    setListError(
      items.length
        ? items.length > 50
          ? "Gebruik maximaal 50 lijstregels."
          : ""
        : "Vul eerst je boodschappenlijstje in.",
    );
    setLocationError(
      place
        ? ""
        : "Kies een Nederlandse plaats of postcode uit de suggesties, of gebruik je locatie.",
    );
    setRequestError("");

    if (!items.length || items.length > 50 || !place) return;

    const payload: ComparisonRequest = {
      rawInput,
      location: {
        lat: place.center[0],
        lng: place.center[1],
        postcode: place.label,
        radius,
      },
      isOrganicOnly,
    };

    setStatus("loading");
    setLoadingStep(0);
    setMapOpen(true);
    setResponse(null);

    const stageTimer = window.setInterval(() => {
      setLoadingStep((current) =>
        Math.min(current + 1, loadingMessages.length - 1),
      );
    }, 600);

    try {
      const request = fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const [result] = await Promise.all([
        request,
        new Promise((resolve) => window.setTimeout(resolve, 1850)),
      ]);

      if (result.status === 429) {
        const delay = getRetryDelay(result);
        setRateLimitSeconds(delay);
        setRateLimitUntil(Date.now() + delay * 1000);
        throw new Error("Je hebt veel lijstjes kort na elkaar vergeleken.");
      }

      if (result.status >= 500) {
        throw new Error(
          "Oeps! Onze rekenmachine is even de weg kwijt. Probeer het over een paar minuten opnieuw.",
        );
      }

      if (!result.ok) {
        const failure = (await result.json()) as { error?: string };
        throw new Error(failure.error ?? "Vergelijken is niet gelukt.");
      }

      const data = (await result.json()) as ComparisonResponse;
      if (!Array.isArray(data.items) || !Array.isArray(data.stores)) {
        throw new Error(
          "We ontvingen een ongeldig antwoord. Probeer het opnieuw.",
        );
      }

      setResponse(data);
      setStatus("success");
      window.setTimeout(
        () =>
          resultsRef.current?.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
              .matches
              ? "auto"
              : "smooth",
            block: "start",
          }),
        50,
      );
    } catch (error) {
      setRequestError(
        error instanceof Error
          ? error.message
          : "Er ging iets mis. Probeer het opnieuw.",
      );
      setStatus("error");
    } finally {
      window.clearInterval(stageTimer);
    }
  }

  function handleRadiusChange(value: number) {
    setRadius(value);
    invalidateResults();
  }

  function handleOrganicChange(value: boolean) {
    setIsOrganicOnly(value);
    invalidateResults();
  }

  function handleStoreHighlight(storeId: string) {
    setHighlightedStoreId(storeId);
  }

  function handleStoreOpen(storeId: string) {
    setHighlightedStoreId(storeId);
    setOpenStoreId(storeId);
    setMapOpen(true);
  }

  function handleEditList() {
    setOpenStoreId(null);
    window.requestAnimationFrame(() =>
      document.getElementById("shopping-list")?.focus(),
    );
  }

  return (
    <>
      <p className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </p>

      <form
        className="comparison-form"
        onSubmit={handleCompare}
        noValidate
        aria-busy={isLoading}
      >
        <div className="comparison-layout">
          <div className="workflow-column">
            <fieldset
              className={`input-fieldset${isLoading && loadingStep === 0 ? " is-parsing" : ""}`}
              disabled={isLoading}
              aria-label="Vergelijkingsinvoer"
            >
              <InputSection
                rawInput={rawInput}
                locationText={locationText}
                location={resolvedLocation}
                radius={radius}
                isOrganicOnly={isOrganicOnly}
                status={status}
                loadingMessage={loadingMessage}
                listError={listError}
                locationError={locationError}
                locationNotice={locationNotice}
                isLocating={isLocating}
                rateLimitSeconds={rateLimitSeconds}
                onRawInputChange={handleInputChange}
                onLocationChange={handleLocationChange}
                onRadiusChange={handleRadiusChange}
                onOrganicChange={handleOrganicChange}
                onUseLocation={handleUseLocation}
              />
            </fieldset>

            <section
              className="results-column"
              ref={resultsRef}
              aria-label="Prijsvergelijking"
            >
              {isLoading ? (
                <LoadingResults step={loadingStep} message={loadingMessage} />
              ) : status === "error" ? (
                <div className="request-error" role="alert">
                  <AlertTriangle size={17} aria-hidden="true" />
                  <span>
                    {requestError}
                    {rateLimitSeconds > 0 && (
                      <small>
                        Probeer het opnieuw over {rateLimitSeconds} seconden.
                      </small>
                    )}
                  </span>
                </div>
              ) : response ? (
                <ResultsSection
                  stores={response.stores}
                  itemCount={response.items.length}
                  comparableCount={response.comparableCount}
                  excluded={response.excluded}
                  unmatched={response.unmatched}
                  activeStoreId={highlightedStoreId}
                  onStoreOpen={handleStoreOpen}
                  onStoreHighlight={handleStoreHighlight}
                />
              ) : showIntroPanel ? null : (
                <section className="empty-results">
                  <span className="empty-icon">
                    <ShoppingBasket size={22} aria-hidden="true" />
                  </span>
                  <h3>Nog één stap</h3>
                  <p>
                    Je locatie is ingesteld. Vergelijk je lijstje om te zien
                    welke winkel het voordeligst uitkomt.
                  </p>
                  <div className="empty-benefits">
                    <span>
                      <Check size={14} aria-hidden="true" />
                      Bekijk winkels op de kaart
                    </span>
                    <span>
                      <Check size={14} aria-hidden="true" />
                      Vergelijk je mandje in één oogopslag
                    </span>
                  </div>
                </section>
              )}
            </section>
          </div>

          {showIntroPanel ? (
            <SearchIntroPanel />
          ) : (
            <>
              <button
                className="map-toggle"
                type="button"
                aria-expanded={mapOpen}
                aria-controls="map-panel"
                onClick={() => setMapOpen((open) => !open)}
              >
                <MapPin size={16} aria-hidden="true" />
                {mapOpen ? "Verberg kaart" : "Bekijk op kaart"}
              </button>

              <aside
                id="map-panel"
                className={`map-column${mapOpen ? " map-column-open" : ""}${response ? "" : " map-column-idle"}`}
                aria-label="Winkels op de kaart"
              >
                <div className="map-card">
                  <div className="map-card-heading">
                    <span>
                      <strong>{mapLocation.label}</strong>
                      <small>Zoekradius {radius} km</small>
                    </span>
                    {response && (
                      <span className="map-pin-count">
                        <MapPin size={13} aria-hidden="true" />
                        {response.stores.length} winkels
                      </span>
                    )}
                  </div>
                  <div className="map-frame">
                    {response && activeLocation ? (
                      <MapWrapper
                        location={activeLocation}
                        stores={response.stores}
                        activeStoreId={highlightedStoreId}
                        onStoreSelect={handleStoreHighlight}
                      />
                    ) : (
                      <div className="map-empty-location">
                        <LocateFixed size={22} aria-hidden="true" />
                        <strong>
                          {resolvedLocation
                            ? "Vergelijk om winkels te zien"
                            : "Waar doe jij boodschappen?"}
                        </strong>
                        <span>
                          {resolvedLocation
                            ? "Na vergelijken tonen we hier illustratieve winkels."
                            : "Vul een plaats of postcode in om de kaart klaar te zetten."}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="map-disclaimer">
                    Kaart © OpenStreetMap · winkels en prijzen zijn voorbeelden
                  </p>
                </div>
                {response && (
                  <div className="map-legend">
                    {response.stores.map((store) => (
                      <span key={store.id}>
                        <span
                          className="legend-dot"
                          style={{ background: store.color }}
                        />
                        {store.brand}
                      </span>
                    ))}
                  </div>
                )}
              </aside>
            </>
          )}
        </div>

        <div className={`mobile-submit${rawInput.trim() ? "" : " is-idle"}`}>
          <span className="mobile-item-count">
            {parsedItems.length > 0 &&
              `${parsedItems.length} ${parsedItems.length === 1 ? "product" : "producten"}`}
          </span>
          <SubmitButton
            disabled={!rawInput.trim() || isLoading || rateLimitSeconds > 0}
            loading={isLoading}
            loadingMessage={loadingMessage}
            rateLimitSeconds={rateLimitSeconds}
          />
        </div>
      </form>

      {selectedStore && (
        <ReceiptDialog
          key={selectedStore.id}
          store={selectedStore}
          onClose={() => setOpenStoreId(null)}
          onEditList={handleEditList}
        />
      )}
    </>
  );
}
