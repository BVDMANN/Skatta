"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Map as LeafletMap } from 'leaflet';

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

type LeafletModule = typeof import('leaflet');

export const JobMap = ({
  lat,
  lng,
  title,
  neighborhood,
  priceLabel,
}: {
  lat: number;
  lng: number;
  title: string;
  neighborhood: string;
  priceLabel: string;
}) => {
  const [leaflet, setLeaflet] = useState<LeafletModule | null>(null);

  useEffect(() => {
    import('leaflet').then(setLeaflet);
  }, []);

  if (!leaflet) {
    return (
      <div className="flex h-96 items-center justify-center bg-slate-100 text-slate-500">
        Chargement de la carte…
      </div>
    );
  }

  const pinIcon = leaflet.divIcon({
    className: 'skatta-map-pin-wrap',
    html: '<div class="skatta-map-pin"></div>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={13}
      scrollWheelZoom={false}
      className="w-full h-96"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={pinIcon}>
        <Popup>
          <div className="p-2 min-w-[180px]">
            <h4 className="font-black text-slate-900">{title}</h4>
            <p className="text-sm text-slate-600">{neighborhood}</p>
            <p className="text-sm text-slate-600 font-bold">{priceLabel}</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
};
