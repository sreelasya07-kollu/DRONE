import {
  Battery,
  MapPin,
  Plane
} from "lucide-react";

import StatusBadge from "./StatusBadge";

export default function DroneCard({ drone }) {

  return (
    <div className="data-card">

      <div className="data-card-header">

        <div className="hazard-title">

          <div className="drone-icon">
            <Plane size={17} />
          </div>

          <div>
            <h3>{drone.name}</h3>

            <div className="location-text">
              <MapPin size={13} />
              {Number(drone.latitude).toFixed(4)},
              {" "}
              {Number(drone.longitude).toFixed(4)}
            </div>
          </div>

        </div>

        <StatusBadge status={drone.status} />

      </div>

      <div className="drone-stats">

        <div>
          <Battery size={15} />
          <strong>{drone.battery}%</strong>
        </div>

        <div>
          ALT {drone.altitude}m
        </div>

      </div>

      <div className="battery-bar">
        <div
          style={{
            width: `${Math.max(
              0,
              Math.min(100, drone.battery)
            )}%`
          }}
        />
      </div>

    </div>
  );
}