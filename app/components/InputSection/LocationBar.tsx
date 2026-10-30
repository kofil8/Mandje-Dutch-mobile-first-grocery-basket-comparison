"use client";

import { ChevronDown, LocateFixed, MapPin, X } from "lucide-react";
import type { MapLocation } from "../../map-data";
import { RADIUS_OPTIONS, SUPPORTED_CITIES } from "../../map-data";

type Props = {
  value: string;
  radius: number;
  location: MapLocation | null;
  error: string;
  notice: string;
  isLocating: boolean;
  onLocationChange: (value: string) => void;
  onRadiusChange: (radius: number) => void;
  onUseLocation: () => void;
};

export default function LocationBar({
  value,
  radius,
  location,
  error,
  notice,
  isLocating,
  onLocationChange,
  onRadiusChange,
  onUseLocation,
}: Props) {
  return (
    <section className="input-card location-card">
      <div className="section-title-row">
        <span className="section-number">02</span>
        <div>
          <h2>Waar wil je boodschappen doen?</h2>
          <p>We zoeken winkels bij jou in de buurt.</p>
        </div>
      </div>
      <div className="location-radius-row">
        <div className="location-field-wrap">
          <label htmlFor="location">Postcode of woonplaats</label>
          <div className="location-input">
            <MapPin size={17} aria-hidden="true" />
            <input
              id="location"
              name="location"
              type="text"
              list="supported-locations"
              value={value}
              onChange={(event) => onLocationChange(event.target.value)}
              placeholder="Bijv. Amsterdam of 1012"
              autoComplete="postal-code"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "location-error" : "location-hint"}
            />
            {value && (
              <button
                className="clear-location"
                type="button"
                aria-label="Locatie wissen"
                onClick={() => onLocationChange("")}
              >
                <X size={15} aria-hidden="true" />
              </button>
            )}
            <datalist id="supported-locations">
              {SUPPORTED_CITIES.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>
          </div>
          {error ? (
            <span className="field-error" id="location-error" role="alert">
              {error}
            </span>
          ) : (
            <span className="field-hint" id="location-hint">
              {notice ||
                (location
                  ? `Kaart ingesteld op ${location.label}`
                  : "Kies een ondersteunde plaats of postcode")}
            </span>
          )}
        </div>
        <label className="radius-field" htmlFor="radius">
          <span>
            <strong>Zoekradius</strong>
            <small>Hoe ver wil je reizen?</small>
          </span>
          <span className="select-wrap">
            <select
              id="radius"
              value={radius}
              onChange={(event) => onRadiusChange(Number(event.target.value))}
            >
              {RADIUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} km
                </option>
              ))}
            </select>
            <ChevronDown size={15} aria-hidden="true" />
          </span>
        </label>
      </div>
      <div className="location-actions">
        <button
          className="gps-button"
          type="button"
          onClick={onUseLocation}
          disabled={isLocating}
          aria-busy={isLocating}
        >
          <LocateFixed size={16} aria-hidden="true" />
          <span>{isLocating ? "Even zoeken…" : "Locatie gebruiken"}</span>
        </button>
      </div>
    </section>
  );
}
