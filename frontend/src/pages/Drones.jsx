import {
  Battery,
  Plane,
  RefreshCw
} from "lucide-react";

import { useEffect, useState } from "react";

import DroneCard from "../components/DroneCard";
import { getDrones } from "../services/api";

export default function Drones() {

  const [drones, setDrones] = useState([]);

  const load = async () => {
    try {
      const response = await getDrones();
      setDrones(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const active = drones.filter(
    (d) => d.status === "active"
  ).length;

  const averageBattery =
    drones.length > 0
      ? Math.round(
          drones.reduce(
            (sum, drone) =>
              sum + Number(drone.battery || 0),
            0
          ) / drones.length
        )
      : 0;

  return (
    <div>

      <div className="page-header">

        <div>
          <div className="eyebrow">
            FLEET / UAV OPERATIONS
          </div>

          <h1>Drone Fleet</h1>

          <p>
            Monitor aerial assets and mission
            deployment status.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={load}
        >
          <RefreshCw size={16} />
          REFRESH FLEET
        </button>

      </div>

      <div className="metrics-grid">

        <div className="metric-card">
          <Plane size={20} />

          <div className="metric-value">
            {drones.length}
          </div>

          <div className="metric-title">
            TOTAL UAVs
          </div>
        </div>

        <div className="metric-card">
          <Plane size={20} />

          <div className="metric-value">
            {active}
          </div>

          <div className="metric-title">
            ACTIVE UAVs
          </div>
        </div>

        <div className="metric-card">
          <Battery size={20} />

          <div className="metric-value">
            {averageBattery}%
          </div>

          <div className="metric-title">
            AVERAGE BATTERY
          </div>
        </div>

      </div>

      <div className="section-heading">

        <div>
          <h2>UAV Status</h2>
          <span>REAL-TIME FLEET</span>
        </div>

      </div>

      <div className="data-grid">

        {drones.length === 0 ? (
          <div className="empty-state large">
            No drone data available.
          </div>
        ) : (
          drones.map((drone) => (
            <DroneCard
              key={drone.id}
              drone={drone}
            />
          ))
        )}

      </div>

    </div>
  );
}