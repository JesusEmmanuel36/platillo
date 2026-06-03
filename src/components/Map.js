"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

export default function Map({ location, pfp }) {
  console.log("pfp:", pfp);

  const customIcon = L.divIcon({
    html: `
      <div style="
        width:45px;
        height:45px;
        border-radius:50%;
        overflow:hidden;
        border:3px solid white;
        box-shadow:0 4px 10px rgba(0,0,0,0.3);
        transform: translateY(-10px);
      ">
        <img src="${pfp}" style="
          width:100%;
          height:100%;
          object-fit:cover;
        " />
      </div>
    `,
    className: "",
  });

  return (
    <MapContainer
      center={[location.lat, location.lng]}
      zoom={17}
      className="w-full h-[200px] rounded-[10px]"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <Marker position={[location.lat, location.lng]} icon={customIcon}>
        <Popup>Ubicación del restaurante</Popup>
      </Marker>
    </MapContainer>
  );
}
