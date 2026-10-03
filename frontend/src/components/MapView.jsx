import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline
} from "react-leaflet";

import L from "leaflet";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

export default function MapView({
  victims = [],
  hazards = [],
  drones = [],
  route = []
}) {

  const center = [17.3850, 78.4867];

  return (
    <div className="map-wrapper">

      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={true}
        className="map"
      >

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {victims.map((victim) => (
          <Marker
            key={`victim-${victim.id}`}
            position={[
              victim.latitude,
              victim.longitude
            ]}
          >
            <Popup>
              <strong>VICTIM</strong>
              <br />
              {victim.name}
              <br />
              Severity: {victim.severity}
            </Popup>
          </Marker>
        ))}

        {drones.map((drone) => (
          <Marker
            key={`drone-${drone.id}`}
            position={[
              drone.latitude,
              drone.longitude
            ]}
          >
            <Popup>
              <strong>DRONE</strong>
              <br />
              {drone.name}
              <br />
              Battery: {drone.battery}%
            </Popup>
          </Marker>
        ))}

        {hazards.map((hazard) => (
          <Circle
            key={`hazard-${hazard.id}`}
            center={[
              hazard.latitude,
              hazard.longitude
            ]}
            radius={hazard.radius_m || 100}
          />
        ))}

        {route.length > 0 && (
          <Polyline
            positions={route.map((point) => [
              point.latitude,
              point.longitude
            ])}
          />
        )}

      </MapContainer>

      <div className="map-overlay">
        <div>
          <span className="map-live-dot"></span>
          LIVE OPERATIONAL MAP
        </div>

        <small>
          HYDERABAD SECTOR
        </small>
      </div>

    </div>
  );
}