import { useEffect, useMemo, useState } from "react";
import {
  Map as MapIcon,
  Radio,
  Shield,
  Activity,
  Navigation,
  Crosshair,
  AlertTriangle,
  Users,
  Plane,
  Route as RouteIcon
} from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMap
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import api from "../services/api";

const commandCenter = [17.385, 78.4867];

const createIcon = (type) => {
  const config = {
    command: {
      color: "#38bdf8",
      symbol: "⌖"
    },
    critical: {
      color: "#ef4444",
      symbol: "!"
    },
    high: {
      color: "#f97316",
      symbol: "!"
    },
    medium: {
      color: "#facc15",
      symbol: "•"
    },
    low: {
      color: "#22c55e",
      symbol: "•"
    },
    drone: {
      color: "#38bdf8",
      symbol: "✦"
    },
    hazard: {
      color: "#fb7185",
      symbol: "!"
    }
  };

  const item = config[type] || config.medium;

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:30px;
        height:30px;
        border-radius:50%;
        background:${item.color}22;
        border:2px solid ${item.color};
        display:flex;
        align-items:center;
        justify-content:center;
        color:${item.color};
        font-weight:800;
        font-size:14px;
        box-shadow:0 0 16px ${item.color}55;
      ">
        ${item.symbol}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

function MapFocus({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, 14);
    }
  }, [center, map]);

  return null;
}

export default function Coverage() {
  const [mapData, setMapData] = useState(null);
  const [drones, setDrones] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [operations, droneData] = await Promise.all([
        api.operationsMap(),
        api.drones()
      ]);

      setMapData(operations);

      setDrones(
        Array.isArray(droneData)
          ? droneData
          : droneData?.data || []
      );
    } catch (error) {
      console.error("Coverage loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    const timer = setInterval(load, 10000);

    return () => clearInterval(timer);
  }, []);

  const victims = mapData?.victims || [];
  const hazards = mapData?.hazards || [];
  const operationDrones = mapData?.drones || drones;
  const route = mapData?.route;
  const destination = mapData?.route_destination;

  const criticalVictims = victims.filter(
    (v) =>
      String(v.priority || "").toLowerCase() === "critical"
  );

  const highVictims = victims.filter(
    (v) =>
      String(v.priority || "").toLowerCase() === "high"
  );

  const activeDrones = operationDrones.filter((d) =>
    ["active", "available"].includes(
      String(d.status || "").toLowerCase()
    )
  );

  const standbyDrones = operationDrones.filter(
    (d) =>
      String(d.status || "").toLowerCase() === "standby"
  );

  const coverage = Math.min(
    100,
    Math.round(
      (activeDrones.length /
        Math.max(operationDrones.length, 1)) *
        100
    )
  );

  const routeCoordinates = useMemo(() => {
    if (!route?.geometry?.coordinates) return [];

    return route.geometry.coordinates.map(
      ([longitude, latitude]) => [
        latitude,
        longitude
      ]
    );
  }, [route]);

  const mapCenter = destination
    ? [destination.latitude, destination.longitude]
    : commandCenter;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">
            FIELD SURVEILLANCE / OPERATIONAL COVERAGE
          </div>

          <h1>Operational Coverage</h1>

          <p>
            Live geographic view of victims, hazards, UAV
            surveillance and active response routes.
          </p>
        </div>

        <div className="ai-status">
          <Radio size={16} />
          LIVE FIELD NETWORK
        </div>
      </div>

      {/* TOP METRICS */}

      <div className="opsPriorityGrid">

        <div className="metric-card">
          <div className="metric-label">
            AREA COVERAGE
          </div>

          <div className="metric-value">
            {coverage}%
          </div>

          <div className="metric-sub">
            Active UAV surveillance
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">
            VICTIMS TRACKED
          </div>

          <div className="metric-value">
            {victims.length}
          </div>

          <div className="metric-sub">
            {criticalVictims.length} critical /{" "}
            {highVictims.length} high
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">
            ACTIVE HAZARDS
          </div>

          <div className="metric-value">
            {hazards.length}
          </div>

          <div className="metric-sub">
            Threat zones monitored
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">
            UAV NETWORK
          </div>

          <div className="metric-value">
            {activeDrones.length}
            <span style={{
              fontSize: 16,
              opacity: .55
            }}>
              /{operationDrones.length}
            </span>
          </div>

          <div className="metric-sub">
            {standbyDrones.length} standby
          </div>
        </div>

      </div>

      {/* MAIN MAP */}

      <div
        className="panel"
        style={{ marginTop: 18 }}
      >
        <div className="panel-header">
          <div>
            <h2>Live Operational Map</h2>

            <span>
              VICTIMS • HAZARDS • UAVS • RESPONSE ROUTE
            </span>
          </div>

          <MapIcon size={19} />
        </div>

        <div
          style={{
            height: 610,
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid rgba(100,160,220,.16)"
          }}
        >
          <MapContainer
            center={mapCenter}
            zoom={14}
            style={{
              height: "100%",
              width: "100%",
              background: "#071321"
            }}
          >
            <TileLayer
              attribution="© OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapFocus center={mapCenter} />

            {/* COMMAND CENTER */}

            <Marker
              position={commandCenter}
              icon={createIcon("command")}
            >
              <Popup>
                <strong>
                  RESQ OPERATIONS CENTER
                </strong>

                <br />

                Command Center
                <br />

                Status: Operational
              </Popup>
            </Marker>

            {/* HAZARDS */}

            {hazards.map((hazard) => (
              <div key={`hazard-${hazard.id}`}>
                <Circle
                  center={[
                    hazard.latitude,
                    hazard.longitude
                  ]}
                  radius={hazard.radius_m || 100}
                  pathOptions={{
                    color:
                      hazard.severity === "high"
                        ? "#ef4444"
                        : "#f59e0b",
                    fillColor:
                      hazard.severity === "high"
                        ? "#ef4444"
                        : "#f59e0b",
                    fillOpacity: 0.13,
                    weight: 2
                  }}
                />

                <Marker
                  position={[
                    hazard.latitude,
                    hazard.longitude
                  ]}
                  icon={createIcon("hazard")}
                >
                  <Popup>
                    <strong>
                      {hazard.type}
                    </strong>

                    <br />

                    Severity:{" "}
                    {String(
                      hazard.severity || ""
                    ).toUpperCase()}

                    <br />

                    Radius: {hazard.radius_m} m

                    <br />

                    Status:{" "}
                    {hazard.status}
                  </Popup>
                </Marker>
              </div>
            ))}

            {/* VICTIMS */}

            {victims.map((victim) => {
              const priority =
                String(
                  victim.priority || victim.severity || "low"
                ).toLowerCase();

              const type =
                priority === "critical"
                  ? "critical"
                  : priority === "high"
                  ? "high"
                  : priority === "medium"
                  ? "medium"
                  : "low";

              return (
                <Marker
                  key={`victim-${victim.id}`}
                  position={[
                    victim.latitude,
                    victim.longitude
                  ]}
                  icon={createIcon(type)}
                >
                  <Popup>
                    <strong>
                      {victim.name}
                    </strong>

                    <br />

                    Priority:{" "}
                    {String(
                      victim.priority || ""
                    ).toUpperCase()}

                    <br />

                    People: {victim.people_count}

                    <br />

                    Status: {victim.status}

                    <br />

                    Score: {victim.priority_score}

                    <br />

                    {victim.notes}
                  </Popup>
                </Marker>
              );
            })}

            {/* DRONE COVERAGE */}

            {operationDrones.map((drone) => (
              <div key={`drone-${drone.id || drone.database_id}`}>
                <Circle
                  center={[
                    drone.latitude,
                    drone.longitude
                  ]}
                  radius={drone.coverage_radius_m || 900}
                  pathOptions={{
                    color: "#38bdf8",
                    fillColor: "#38bdf8",
                    fillOpacity: 0.045,
                    weight: 1,
                    dashArray: "6 8"
                  }}
                />

                <Marker
                  position={[
                    drone.latitude,
                    drone.longitude
                  ]}
                  icon={createIcon("drone")}
                >
                  <Popup>
                    <strong>
                      {drone.name}
                    </strong>

                    <br />

                    Status:{" "}
                    {String(
                      drone.status || ""
                    ).toUpperCase()}

                    <br />

                    Battery: {drone.battery}%

                    <br />

                    Altitude: {drone.altitude} m

                    <br />

                    Coverage radius:{" "}
                    {drone.coverage_radius_m || 900} m
                  </Popup>
                </Marker>
              </div>
            ))}

            {/* RESPONSE ROUTE */}

            {routeCoordinates.length > 0 && (
              <Polyline
                positions={routeCoordinates}
                pathOptions={{
                  color: "#38bdf8",
                  weight: 5,
                  opacity: 0.9
                }}
              />
            )}

          </MapContainer>
        </div>

        {/* MAP LEGEND */}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 18,
            padding: "14px 4px 2px",
            fontSize: 12,
            opacity: .8
          }}
        >
          <span>
            🔵 Command Center
          </span>

          <span>
            🔴 Critical Victim
          </span>

          <span>
            🟠 High Priority
          </span>

          <span>
            🟡 Medium Priority
          </span>

          <span>
            🟢 Low Priority
          </span>

          <span>
            ✦ UAV
          </span>

          <span>
            ⚠ Hazard Zone
          </span>

          <span>
            ━ Response Route
          </span>
        </div>
      </div>

      {/* OPERATIONAL DETAILS */}

      <div
        className="two-column-layout"
        style={{ marginTop: 18 }}
      >

        <div className="panel">

          <div className="panel-header">
            <div>
              <h2>Threat & Response Picture</h2>
              <span>
                CURRENT FIELD SITUATION
              </span>
            </div>

            <Activity size={19} />
          </div>

          <div className="network-row">
            <span>
              <Users size={14} /> VICTIMS
            </span>

            <strong>
              {victims.length} TRACKED
            </strong>
          </div>

          <div className="network-row">
            <span>
              <AlertTriangle size={14} /> CRITICAL
            </span>

            <strong>
              {criticalVictims.length}
            </strong>
          </div>

          <div className="network-row">
            <span>
              <Shield size={14} /> HAZARDS
            </span>

            <strong>
              {hazards.length} ACTIVE
            </strong>
          </div>

          <div className="network-row">
            <span>
              <Plane size={14} /> UAVS
            </span>

            <strong>
              {activeDrones.length} ACTIVE
            </strong>
          </div>

          <div className="network-row">
            <span>
              <RouteIcon size={14} /> RESPONSE ROUTE
            </span>

            <strong>
              {route?.distance_km
                ? `${route.distance_km} KM`
                : "CALCULATING"}
            </strong>
          </div>

        </div>

        <div className="panel">

          <div className="panel-header">
            <div>
              <h2>Current Response Target</h2>
              <span>
                AI / ROUTE PRIORITY
              </span>
            </div>

            <Crosshair size={19} />
          </div>

          {destination ? (
            <>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  marginBottom: 8
                }}
              >
                {destination.name}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3,1fr)",
                  gap: 10
                }}
              >
                <div className="summaryFacts">
                  <span>PRIORITY</span>
                  <strong>
                    {destination.priority}
                  </strong>
                </div>

                <div className="summaryFacts">
                  <span>PERSONS</span>
                  <strong>
                    {destination.people_count}
                  </strong>
                </div>

                <div className="summaryFacts">
                  <span>ETA</span>
                  <strong>
                    {route?.duration_minutes || "--"} min
                  </strong>
                </div>
              </div>

              <p
                style={{
                  marginTop: 16,
                  opacity: .72
                }}
              >
                {destination.notes}
              </p>
            </>
          ) : (
            <div className="empty-state">
              No active response target.
            </div>
          )}

        </div>

      </div>
    </div>
  );
}