"use client";

import { CircleHelp } from "lucide-react";
import type { MapLocation } from "../../map-data";
import LocationBar from "./LocationBar";
import PreferencesToggle from "./PreferencesToggle";
import ShoppingListInput from "./ShoppingListInput";
import SubmitButton from "./SubmitButton";

type Props = {
  rawInput: string;
  locationText: string;
  location: MapLocation | null;
  radius: number;
  isOrganicOnly: boolean;
  status: "idle" | "loading" | "error" | "success";
  loadingMessage: string;
  listError: string;
  locationError: string;
  locationNotice: string;
  isLocating: boolean;
  rateLimitSeconds: number;
  onRawInputChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onRadiusChange: (radius: number) => void;
  onOrganicChange: (checked: boolean) => void;
  onUseLocation: () => void;
};

export default function InputSection({
  rawInput,
  locationText,
  location,
  radius,
  isOrganicOnly,
  status,
  loadingMessage,
  listError,
  locationError,
  locationNotice,
  isLocating,
  rateLimitSeconds,
  onRawInputChange,
  onLocationChange,
  onRadiusChange,
  onOrganicChange,
  onUseLocation,
}: Props) {
  const isLoading = status === "loading";

  return (
    <>
      <div className="form-grid">
        <ShoppingListInput
          value={rawInput}
          error={listError}
          onChange={onRawInputChange}
        />
        <PreferencesToggle checked={isOrganicOnly} onChange={onOrganicChange} />
        <LocationBar
          value={locationText}
          radius={radius}
          location={location}
          error={locationError}
          notice={locationNotice}
          isLocating={isLocating}
          onLocationChange={onLocationChange}
          onRadiusChange={onRadiusChange}
          onUseLocation={onUseLocation}
        />
      </div>
      <div className="desktop-submit">
        <span>
          <CircleHelp size={15} aria-hidden="true" />
          Je lijstje wordt alleen gebruikt voor deze vergelijking.
        </span>
        <SubmitButton
          disabled={!rawInput.trim() || isLoading || rateLimitSeconds > 0}
          loading={isLoading}
          loadingMessage={loadingMessage}
          rateLimitSeconds={rateLimitSeconds}
        />
      </div>
    </>
  );
}
