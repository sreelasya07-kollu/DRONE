import {
  HeartPulse,
  MapPin,
  Users
} from "lucide-react";

import StatusBadge from "./StatusBadge";

export default function VictimCard({ victim }) {

  return (
    <div className="data-card">

      <div className="data-card-header">

        <div>
          <h3>{victim.name}</h3>

          <div className="location-text">
            <MapPin size={13} />
            {Number(victim.latitude).toFixed(4)},
            {" "}
            {Number(victim.longitude).toFixed(4)}
          </div>
        </div>

        <StatusBadge status={victim.status} />

      </div>

      <div className="victim-info">

        <div>
          <HeartPulse size={15} />
          <span>
            Severity:
            <strong>{victim.severity}</strong>
          </span>
        </div>

        <div>
          <Users size={15} />
          <span>
            People:
            <strong>{victim.people_count}</strong>
          </span>
        </div>

      </div>

    </div>
  );
}