"use client";

import dynamic from "next/dynamic";
import type { ComparisonLocation, ComparisonStore } from "../../map-data";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="map-loading" role="status">
      <span className="map-loading-spinner" aria-hidden="true" />
      Kaart laden…
    </div>
  ),
});

type Props = {
  location: ComparisonLocation;
  stores: ComparisonStore[];
  activeStoreId: string | null;
  onStoreSelect: (storeId: string) => void;
};

export default function MapWrapper(props: Props) {
  return <LeafletMap {...props} />;
}
