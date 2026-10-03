import {
  AlertTriangle,
  Plane,
  Radio,
  ShieldAlert,
  Users,
  Zap
} from "lucide-react";

import { useEffect, useState } from "react";

import MetricCard from "../components/MetricCard";
import MapView from "../components/MapView";
import VictimCard from "../components/VictimCard";
import HazardCard from "../components/HazardCard";
import DroneCard from "../components/DroneCard";

import {
  getDrones,
  getHazards,
  getMissions,
  getVictims
} from "../services/api";

export default function Overview() {

  const [victims, setVictims] = useState([]);
  const [hazards, setHazards] = useState([]);
  const [drones, setDrones] = useState([]);
  const [missions, setMissions] = useState([]);

  useEffect(() => {

    const loadData = async () => {

      try {

        const [
          victimsResponse,
          hazardsResponse,
          dronesResponse,
          missionsResponse
        ] = await Promise.all([
          getVictims(),
          getHazards(),
          getDrones(),
          getMissions()
        ]);

        setVictims(victimsResponse.data);
        setHazards(hazardsResponse.data);
        setDrones(dronesResponse.data);
        setMissions(missionsResponse.data);

      } catch (error) {

        console.error(
          "Failed to load RESQ-OPS data:",
          error
        );

      }

    };

    loadData();

  }, []);

  const criticalVictims = victims.filter(
    (v) =>
      String(v.severity).toLowerCase() === "critical"
  ).length;

  const activeDrones = drones.filter(
    (d) =>
      String(d.status).toLowerCase() === "active"
  ).length;

  const activeMissions = missions.filter(
    (m) =>
      String(m.status).toLowerCase() !== "completed"
  ).length;

  return (
    <div>

      <div className="page-header">

        <div>
          <div className="eyebrow">
            OPERATIONS / OVERVIEW
          </div>

          <h1>
            Mission Overview
          </h1>

          <p>
            Real-time situational awareness across
            the emergency response network.
          </p>
        </div>

        <div className="emergency-state">
          <span></span>
          ALL SYSTEMS NOMINAL
        </div>

      </div>

      <div className="metrics-grid">

        <MetricCard
          title="Active Missions"
          value={activeMissions}
          subtitle="Currently deployed"
          icon={ShieldAlert}
        />

        <MetricCard
          title="Critical Victims"
          value={criticalVictims}
          subtitle="Priority response required"
          icon={Users}
          status={
            criticalVictims > 0
              ? "CRITICAL"
              : "CLEAR"
          }
        />

        <MetricCard
          title="Active Drones"
          value={activeDrones}
          subtitle={`${drones.length} total registered`}
          icon={Plane}
        />

        <MetricCard
          title="Hazard Zones"
          value={hazards.length}
          subtitle="Detected risk areas"
          icon={AlertTriangle}
        />

      </div>

      <div className="section-heading">

        <div>
          <h2>Operational Map</h2>
          <span>
            LIVE FIELD INTELLIGENCE
          </span>
        </div>

        <div className="map-controls">
          <span>
            <i className="legend-victim"></i>
            Victims
          </span>

          <span>
            <i className="legend-hazard"></i>
            Hazards
          </span>

          <span>
            <i className="legend-drone"></i>
            Drones
          </span>
        </div>

      </div>

      <MapView
        victims={victims}
        hazards={hazards}
        drones={drones}
      />

      <div className="three-column">

        <section>

          <div className="section-heading compact">
            <div>
              <h2>Priority Victims</h2>
              <span>
                {victims.length} REGISTERED
              </span>
            </div>
          </div>

          <div className="card-stack">

            {victims.length === 0 ? (
              <div className="empty-state">
                No victims registered.
              </div>
            ) : (
              victims.slice(0, 4).map((victim) => (
                <VictimCard
                  key={victim.id}
                  victim={victim}
                />
              ))
            )}

          </div>

        </section>

        <section>

          <div className="section-heading compact">
            <div>
              <h2>Hazard Zones</h2>
              <span>
                ACTIVE THREATS
              </span>
            </div>
          </div>

          <div className="card-stack">

            {hazards.length === 0 ? (
              <div className="empty-state">
                No hazards detected.
              </div>
            ) : (
              hazards.slice(0, 4).map((hazard) => (
                <HazardCard
                  key={hazard.id}
                  hazard={hazard}
                />
              ))
            )}

          </div>

        </section>

        <section>

          <div className="section-heading compact">
            <div>
              <h2>Drone Fleet</h2>
              <span>
                {drones.length} UNITS
              </span>
            </div>
          </div>

          <div className="card-stack">

            {drones.length === 0 ? (
              <div className="empty-state">
                No drones registered.
              </div>
            ) : (
              drones.slice(0, 4).map((drone) => (
                <DroneCard
                  key={drone.id}
                  drone={drone}
                />
              ))
            )}

          </div>

        </section>

      </div>

      <div className="quick-actions">

        <button>
          <Radio size={17} />
          LIVE DETECTION
        </button>

        <button>
          <Zap size={17} />
          EMERGENCY MODE
        </button>

        <button>
          <ShieldAlert size={17} />
          INCIDENT RESPONSE
        </button>

      </div>

    </div>
  );
}