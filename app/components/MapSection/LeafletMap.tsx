"use client";

import { useEffect, useMemo } from "react";
import L, { type LatLngExpression } from "leaflet";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { formatPrice, type ComparisonLocation, type ComparisonStore } from "../../map-data";

type Props = {
  location: ComparisonLocation;
  stores: ComparisonStore[];
  activeStoreId: string | null;
  onStoreSelect: (storeId: string) => void;
};

function MapSynchronizer({
  location,
  stores,
}: Pick<Props, "location" | "stores">) {
  const map = useMap();
  const [latitude, longitude] = location.center;
  const { radius } = location;

  useEffect(() => {
    const observer = new ResizeObserver(() =>
      map.invalidateSize({ pan: false }),
    );
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    map.setView(
      [latitude, longitude],
      radius <= 5 ? 13 : radius <= 10 ? 12 : 11,
      { animate: !reduceMotion },
    );
  }, [latitude, longitude, radius, map]);

  useEffect(() => {
    if (!stores.length) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const bounds = L.latLngBounds([
      [latitude, longitude],
      ...stores.map((store) => store.position),
    ]);
    map.fitBounds(bounds, {
      padding: [46, 46],
      maxZoom: 14,
      animate: !reduceMotion,
    });
  }, [map, stores, latitude, longitude]);

  return null;
}

function createStoreIcon(store: ComparisonStore, active: boolean) {
  return L.divIcon({
    className: `store-marker-icon${active ? " is-active" : ""}`,
    html: `<span class="store-marker-badge" style="--store-color:${store.color}"><i>${store.short}</i></span>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -18],
  });
}

export default function LeafletMap({
  location,
  stores,
  activeStoreId,
  onStoreSelect,
}: Props) {
  // Marks the searched location itself, so the radius circle has a visible centre.
  const centreIcon = useMemo(
    () =>
      L.divIcon({
        className: "locate-marker",
        html: '<span class="locate-marker-dot"></span>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      }),
    [],
  );

  const markerIcons = useMemo(
    () =>
      Object.fromEntries(
        stores.map((store) => [
          store.id,
          createStoreIcon(store, store.id === activeStoreId),
        ]),
      ),
    [activeStoreId, stores],
  );
  const center: LatLngExpression = location.center;

  return (
    <div className="map-root" role="region" aria-label="Kaart met supermarkten">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        className="leaflet-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={location.center}
          icon={centreIcon}
          interactive={false}
          keyboard={false}
          zIndexOffset={-100}
        />
        <Circle
          center={center}
          radius={location.radius * 1000}
          pathOptions={{
            color: "#3d8061",
            fillColor: "#63a980",
            fillOpacity: 0.12,
            weight: 2,
          }}
        />
        {stores.map((store) => (
          <Marker
            key={store.id}
            position={store.position}
            icon={markerIcons[store.id]}
            eventHandlers={{ click: () => onStoreSelect(store.id) }}
          >
            <Popup className="grocery-popup">
              <div className="popup-store">
                <strong>{store.brand}</strong>
                <span>{store.branchName}</span>
                <small>{store.address}</small>
                <span className="popup-price-label">
                  Demo-mandje · {store.matchedCount} producten
                </span>
                <strong className="popup-price">
                  {formatPrice(store.basketTotal)}
                </strong>
                {store.missingItems.length > 0 && (
                  <small className="popup-missing">
                    {store.missingItems.length} niet meegeteld
                  </small>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        <MapSynchronizer location={location} stores={stores} />
      </MapContainer>
    </div>
  );
}
