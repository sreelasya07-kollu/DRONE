import {
  AlertTriangle,
  MapPin
} from "lucide-react";

import StatusBadge from "./StatusBadge";

export default function HazardCard({ hazard }) {

  return (
    <div className="data-card">

      <div className="data-card-header">

        <div className="hazard-title">
          <div className="hazard-icon">
            <AlertTriangle size={17} />
          </div>

          <div>
            <h3>{hazard.type}</h3>

            <div className="location-text">
              <MapPin size={13} />
              {Number(hazard.latitude).toFixed(4)},
              {" "}
              {Number(hazard.longitude).toFixed(4)}
            </div>
          </div>
        </div>

        <StatusBadge status={hazard.status} />

      </div>

      <div className="hazard-severity">
        <span>SEVERITY</span>

        <strong>
          {hazard.severity}
        </strong>
      </div>

      <p>
        {hazard.description || "No additional information."}
      </p>

    </div>
  );
}