"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export interface EvaluatedZone {
  id: string;
  nombre: string;
  distrito: string;
  lat: number;
  lng: number;
  pendienteDEM: number;
  saturacionSAR: number;
  poblacionExpuesta: number;
  historialGAMC: string;
  protocolo: string;
  indiceRiesgo: number;
  nivel: "CRÍTICO" | "PRECAUCIÓN" | "ESTABLE";
}

interface TunariMapProps {
  zonas: EvaluatedZone[];
  zonaSeleccionada: EvaluatedZone;
  onSelectZona: (zona: EvaluatedZone) => void;
}

function MapFlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 13, { duration: 0.8 });
  }, [lat, lng, map]);
  return null;
}

export default function TunariMap({ zonas, zonaSeleccionada, onSelectZona }: TunariMapProps) {
  const getColor = (nivel: EvaluatedZone["nivel"]) => {
    if (nivel === "CRÍTICO") return "#ef4444";
    if (nivel === "PRECAUCIÓN") return "#f59e0b";
    return "#10b981";
  };

  return (
    <MapContainer
      center={[-17.365, -66.165]}
      zoom={13}
      className="w-full h-full rounded-xl z-0"
      style={{ minHeight: "420px", background: "#020617" }}
    >
      <TileLayer
        attribution='Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, NASA'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />
      <MapFlyTo lat={zonaSeleccionada.lat} lng={zonaSeleccionada.lng} />

      {zonas.map((zona) => {
        const color = getColor(zona.nivel);
        const isSelected = zona.id === zonaSeleccionada.id;
        return (
          <CircleMarker
            key={zona.id}
            center={[zona.lat, zona.lng]}
            radius={isSelected ? 18 : zona.nivel === "CRÍTICO" ? 15 : 11}
            pathOptions={{
              color: isSelected ? "#38bdf8" : "#ffffff",
              fillColor: color,
              fillOpacity: 0.8,
              weight: isSelected ? 3 : 1.5,
            }}
            eventHandlers={{
              click: () => onSelectZona(zona),
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
              <div className="text-xs font-sans">
                <p className="font-bold text-slate-900">{zona.nombre}</p>
                <p className="text-slate-700">
                  Riesgo Hidrológico: <strong>{zona.indiceRiesgo}% ({zona.nivel})</strong>
                </p>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
