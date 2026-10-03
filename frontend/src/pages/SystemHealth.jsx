import {
  CheckCircle2,
  Database,
  Server,
  Wifi,
  BrainCircuit
} from "lucide-react";

import { useEffect, useState } from "react";

import { getHealth } from "../services/api";

export default function SystemHealth() {

  const [health, setHealth] = useState(null);

  const check = async () => {
    try {
      const response = await getHealth();
      setHealth(response.data);
    } catch (error) {
      setHealth(null);
    }
  };

  useEffect(() => {
    check();

    const interval = setInterval(
      check,
      10000
    );

    return () =>
      clearInterval(interval);
  }, []);

  const online = Boolean(health);

  return (
    <div>

      <div className="page-header">

        <div>
          <div className="eyebrow">
            SYSTEM / MONITORING
          </div>

          <h1>System Health</h1>

          <p>
            RESQ-OPS infrastructure and service
            monitoring.
          </p>
        </div>

        <div
          className={
            online
              ? "emergency-state"
              : "emergency-state danger"
          }
        >
          <span></span>
          {online
            ? "SYSTEM ONLINE"
            : "SYSTEM OFFLINE"}
        </div>

      </div>

      <div className="health-grid">

        <HealthCard
          icon={Server}
          title="API SERVER"
          online={online}
        />

        <HealthCard
          icon={Database}
          title="DATABASE"
          online={online}
        />

        <HealthCard
          icon={Wifi}
          title="WEBSOCKET"
          online={online}
        />

        <HealthCard
          icon={BrainCircuit}
          title="AI ENGINE"
          online={online}
        />

      </div>

      <div className="panel system-info">

        <div className="panel-header">
          <div>
            <h2>Backend Information</h2>
            <span>HEALTH ENDPOINT</span>
          </div>
        </div>

        <pre>
          {health
            ? JSON.stringify(
                health,
                null,
                2
              )
            : "Backend unavailable."}
        </pre>

      </div>

    </div>
  );
}

function HealthCard({
  icon: Icon,
  title,
  online
}) {

  return (
    <div className="health-card">

      <div className="health-icon">
        <Icon size={22} />
      </div>

      <div>
        <span>{title}</span>

        <strong>
          {online ? "OPERATIONAL" : "OFFLINE"}
        </strong>
      </div>

      <CheckCircle2
        size={19}
        className={
          online
            ? "health-check"
            : "health-off"
        }
      />

    </div>
  );
}