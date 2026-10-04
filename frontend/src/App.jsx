import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./index.css";


const API_BASE = "http://localhost:8000";

/* =========================================================
   RESQ-OPS
   Emergency Response & Operations Command Platform
========================================================= */

const NAV = [
  { id: "overview", label: "Overview", icon: "⌂" },
  { id: "detection", label: "Live Detection", icon: "◉" },
  { id: "victims", label: "Victims", icon: "♙" },
  { id: "hazards", label: "Hazards", icon: "△" },
  { id: "drones", label: "Drones", icon: "✦" },
  { id: "routes", label: "Routes", icon: "↗" },
  { id: "coverage", label: "Coverage", icon: "◎" },
  { id: "ai", label: "RESQ AI", icon: "✧" },
  { id: "simulation", label: "Simulation", icon: "▷" },
  { id: "reports", label: "Reports", icon: "▤" },
];

const hazards = [
  ["HZ-001", "Road Obstruction", "Sector B", "CRITICAL", "94%"],
  ["HZ-002", "Fire / Smoke", "Sector C", "HIGH", "91%"],
  ["HZ-003", "Structural Damage", "Sector A", "HIGH", "87%"],
  ["HZ-004", "Flooded Road", "Sector D", "MEDIUM", "83%"]
];

const victims = [
  ["V-001", "Critical", "Sector B", "02:41 ago", "94%"],
  ["V-002", "High", "Sector C", "04:12 ago", "91%"],
  ["V-003", "Medium", "Sector A", "06:37 ago", "87%"],
  ["V-004", "Critical", "Sector D", "08:03 ago", "89%"]
];

const drones = [
  ["DR-01", "ALPHA", "ACTIVE", "Sector B", "72%", "1.8 km"],
  ["DR-02", "BRAVO", "ACTIVE", "Sector C", "64%", "2.4 km"],
  ["DR-03", "CHARLIE", "STANDBY", "Sector A", "91%", "0.7 km"],
  ["DR-04", "DELTA", "CHARGING", "Base", "38%", "0 km"]
];

const routes = [
  {
    id: "RT-001",
    name: "Primary Emergency Route",
    from: "Command Center",
    to: "Sector B",
    distance: "4.8 km",
    eta: "06 min",
    status: "OPTIMAL"
  },
  {
    id: "RT-002",
    name: "Secondary Response Route",
    from: "Command Center",
    to: "Sector C",
    distance: "6.2 km",
    eta: "09 min",
    status: "CLEAR"
  },
  {
    id: "RT-003",
    name: "Evacuation Route",
    from: "Sector D",
    to: "Safe Zone",
    distance: "7.6 km",
    eta: "12 min",
    status: "MONITOR"
  }
];

const events = [
  {
    time: "02:41",
    type: "HAZARD",
    text: "Road obstruction detected in Sector B",
    severity: "CRITICAL"
  },
  {
    time: "02:38",
    type: "AI",
    text: "Emergency route recalculated using A*",
    severity: "INFO"
  },
  {
    time: "02:34",
    type: "DRONE",
    text: "DR-01 entered Sector B surveillance zone",
    severity: "INFO"
  },
  {
    time: "02:29",
    type: "VICTIM",
    text: "Potential victim detected near Sector C",
    severity: "HIGH"
  },
  {
    time: "02:22",
    type: "SYSTEM",
    text: "All response services operational",
    severity: "SUCCESS"
  }
];

/* =========================================================
   SHARED COMPONENTS
========================================================= */

function PanelTitle({ title, sub, action }) {
  return (
    <div className="panelHeader">
      <div>
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>

      {action && <div>{action}</div>}
    </div>
  );
}

function StatusDot({ status = "ONLINE" }) {
  const value = String(status).toLowerCase();

  return (
    <span className={`statusDot ${value}`}>
      <i />
      {status}
    </span>
  );
}

function Severity({ value }) {
  return (
    <span className={`severity ${String(value).toLowerCase()}`}>
      {value}
    </span>
  );
}

function Metric({ label, value, sub, accent = "blue" }) {
  return (
    <div className={`metric metric-${accent}`}>
      <div className="metricLabel">{label}</div>
      <div className="metricValue">{value}</div>
      {sub && <div className="metricSub">{sub}</div>}
    </div>
  );
}

function Progress({ value }) {
  return (
    <div className="progress">
      <div style={{ width: value }} />
    </div>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar({ page, setPage }) {
  return (
    <aside className="sidebar">

      <div className="brand">
        <div className="brandMark">R</div>

        <div>
          <div className="brandName">RESQ-OPS</div>
          <div className="brandSub">COMMAND PLATFORM</div>
        </div>
      </div>

      <div className="systemStatus">
        <span className="liveIndicator" />
        <span>SYSTEM OPERATIONAL</span>
      </div>

      <div className="navLabel">OPERATIONS</div>

      <nav className="nav">

        {NAV.map((item) => (

          <button
            key={item.id}
            className={`navItem ${page === item.id ? "active" : ""}`}
            onClick={() => setPage(item.id)}
          >
            <span className="navIcon">{item.icon}</span>
            <span>{item.label}</span>
          </button>

        ))}

      </nav>

      <div className="sidebarBottom">

        <div className="connection">
          <div className="connectionTop">
            <span>NETWORK</span>
            <span className="green">CONNECTED</span>
          </div>

          <Progress value="96%" />

          <div className="connectionMeta">
            <span>LATENCY</span>
            <span>24 ms</span>
          </div>
        </div>

        <div className="version">
          RESQ-OPS v1.0.0
        </div>

      </div>

    </aside>
  );
}

/* =========================================================
   HEADER
========================================================= */

function Header({ page }) {

  const title =
    NAV.find((item) => item.id === page)?.label || "Overview";

  return (
    <header className="header">

      <div>
        <div className="breadcrumb">
          COMMAND / {title.toUpperCase()}
        </div>

        <h1>{title}</h1>
      </div>

      <div className="headerRight">

        <div className="headerTime">
          <span>LOCAL TIME</span>
          <strong>{new Date().toLocaleTimeString()}</strong>
        </div>

        <div className="operator">
          <div className="operatorAvatar">OP</div>

          <div>
            <strong>OPERATOR</strong>
            <span>COMMAND UNIT</span>
          </div>
        </div>

      </div>

    </header>
  );
}


function Simulation() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    victims: 15,
    critical: 0,
    high: 0,
    drones: 4,
    hazards: 0,
    rescued: 0
  });
  const [error, setError] = useState("");

  const loadStats = async () => {
    try {
      const [victimResponse, hazardResponse, droneResponse] =
        await Promise.all([
          fetch(`${API_BASE}/api/victims`),
          fetch(`${API_BASE}/api/hazards`),
          fetch(`${API_BASE}/api/drones`)
        ]);

      const victims = await victimResponse.json();
      const hazards = await hazardResponse.json();
      const drones = await droneResponse.json();

      setStats({
        victims: victims.length,

        critical: victims.filter(
          (v) =>
            String(v.severity).toLowerCase() ===
            "critical"
        ).length,

        high: victims.filter(
          (v) =>
            String(v.severity).toLowerCase() ===
            "high"
        ).length,

        drones: drones.length,

        hazards: hazards.filter(
          (h) => h.status === "active"
        ).length,

        rescued: victims.filter(
          (v) => v.status === "rescued"
        ).length
      });

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const startSimulation = async () => {

    if (running) return;

    setRunning(true);
    setProgress(0);
    setEvents([]);
    setError("");

    const localEvents = [
      "Urban flood response simulation initiated",
      "Flood zone expanded — additional victims identified",
      "Drone surveillance units dispatched",
      "Critical victim priority queue recalculated",
      "Fastest rescue route recalculated around hazards",
      "Rescue unit reached priority victim",
      "Drone surveillance detected additional people",
      "Emergency response coordination continuing"
    ];

    try {

      const response = await fetch(
        `${API_BASE}/api/simulation/run`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ticks: 8,
            interval_seconds: 0.8
          })
        }
      );

      if (!response.ok) {
        throw new Error(
          `Simulation failed: ${response.status}`
        );
      }

      const result = await response.json();

      const returnedEvents =
        result.events || [];

      for (let i = 0; i < returnedEvents.length; i++) {

        const event = returnedEvents[i];

        setEvents((previous) => [
          ...previous,
          event
        ]);

        setProgress(
          Math.min(
            100,
            Math.round(
              ((i + 1) /
                Math.max(returnedEvents.length, 1)) *
              100
            )
          )
        );

        await new Promise((resolve) =>
          setTimeout(resolve, 350)
        );
      }

      // Refresh operational statistics
      await loadStats();

      // Force map data refresh through page remount
      window.dispatchEvent(
        new CustomEvent("resq-operation-updated")
      );

      setProgress(100);

    } catch (err) {

      setError(err.message);

      // Fallback visual timeline
      for (let i = 0; i < localEvents.length; i++) {

        setEvents((previous) => [
          ...previous,
          {
            tick: i + 1,
            type: "SIMULATION",
            message: localEvents[i],
            severity:
              i === 1 || i === 3
                ? "CRITICAL"
                : "INFO"
          }
        ]);

        setProgress(
          Math.round(
            ((i + 1) /
              localEvents.length) *
            100
          )
        );

        await new Promise((resolve) =>
          setTimeout(resolve, 400)
        );
      }

    } finally {
      setRunning(false);
      await loadStats();
    }
  };

  const resetSimulation = async () => {
    setRunning(false);
    setProgress(0);
    setEvents([]);
    setError("");
    await loadStats();
  };

  return (
    <div className="opsPage">

      {/* HEADER */}

      <div className="opsHero">
        <div>
          <div className="opsEyebrow">
            DIGITAL TWIN / EMERGENCY EXERCISE
          </div>

          <h1>Flood Response Simulation</h1>

          <p>
            Test how RESQ-OPS detects victims, deploys
            drones, prioritizes emergencies and calculates
            rescue routes during an evolving flood incident.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10
          }}
        >
          <OpsButton
            onClick={startSimulation}
            disabled={running}
          >
            {running
              ? "SIMULATION RUNNING..."
              : "▶ START SIMULATION"}
          </OpsButton>

          <OpsButton
            secondary
            onClick={resetSimulation}
            disabled={running}
          >
            ↻ RESET
          </OpsButton>
        </div>
      </div>


      {/* STATUS */}

      <div
        style={{
          padding: 16,
          borderRadius: 12,
          border:
            "1px solid rgba(56,189,248,.18)",
          background:
            "linear-gradient(135deg, rgba(14,165,233,.08), rgba(15,23,42,.65))"
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >

          <div>
            <strong>
              SCENARIO: URBAN FLOOD RESPONSE
            </strong>

            <div
              style={{
                color: "#64748b",
                fontSize: 12,
                marginTop: 5
              }}
            >
              Command center → detection → prioritization
              → drone deployment → routing → rescue
            </div>
          </div>

          <OpsBadge
            tone={running ? "orange" : "green"}
          >
            {running
              ? "LIVE EXERCISE"
              : "READY"}
          </OpsBadge>

        </div>

        <div
          style={{
            marginTop: 14,
            height: 6,
            borderRadius: 10,
            background: "rgba(148,163,184,.12)",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background:
                "linear-gradient(90deg,#0284c7,#38bdf8)",
              transition: "width .35s ease"
            }}
          />
        </div>

        <div
          style={{
            marginTop: 6,
            textAlign: "right",
            fontSize: 11,
            color: "#64748b"
          }}
        >
          {progress}% complete
        </div>

      </div>


      {/* METRICS */}

      <div className="opsStatGrid">

        <OpsStat
          label="VICTIMS"
          value={stats.victims}
          detail="Active response targets"
          tone="blue"
        />

        <OpsStat
          label="CRITICAL"
          value={stats.critical}
          detail="Immediate response"
          tone="red"
        />

        <OpsStat
          label="HIGH"
          value={stats.high}
          detail="Priority response"
          tone="orange"
        />

        <OpsStat
          label="DRONES"
          value={stats.drones}
          detail="Surveillance fleet"
          tone="purple"
        />

        <OpsStat
          label="HAZARDS"
          value={stats.hazards}
          detail="Active flood zones"
          tone="orange"
        />

        <OpsStat
          label="RESCUED"
          value={stats.rescued}
          detail="Completed rescues"
          tone="green"
        />

      </div>


      {/* MAP */}

      <OpsPanel
        title="Operational Simulation Map"
        subtitle="Live command center, victims, hazards, drones and response routes"
      >

        <div
          style={{
            height: 500,
            borderRadius: 14,
            overflow: "hidden"
          }}
        >
          <CommandMap
            key={`${running}-${progress}`}
            large
          />
        </div>

      </OpsPanel>


      {/* EVENTS */}

      <OpsPanel
        title="Simulation Timeline"
        subtitle="Live operational events generated during the exercise"
      >

        {events.length === 0 ? (

          <div
            style={{
              padding: 30,
              textAlign: "center",
              color: "#64748b"
            }}
          >
            Press <strong>START SIMULATION</strong> to
            begin the flood-response exercise.
          </div>

        ) : (

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8
            }}
          >

            {events.map((event, index) => (

              <div
                key={`${event.tick}-${index}`}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  padding: 12,
                  borderRadius: 9,
                  background:
                    "rgba(15,23,42,.65)",
                  border:
                    "1px solid rgba(148,163,184,.1)"
                }}
              >

                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    background:
                      event.severity === "CRITICAL"
                        ? "rgba(239,68,68,.15)"
                        : event.severity === "SUCCESS"
                          ? "rgba(34,197,94,.15)"
                          : "rgba(56,189,248,.12)",
                    color:
                      event.severity === "CRITICAL"
                        ? "#f87171"
                        : event.severity === "SUCCESS"
                          ? "#4ade80"
                          : "#38bdf8",
                    fontSize: 12,
                    fontWeight: 800
                  }}
                >
                  {event.tick}
                </div>

                <div style={{ flex: 1 }}>

                  <strong
                    style={{
                      fontSize: 13
                    }}
                  >
                    {event.message}
                  </strong>

                  <div
                    style={{
                      marginTop: 3,
                      color: "#64748b",
                      fontSize: 10
                    }}
                  >
                    TICK {event.tick}
                    {" • "}
                    {event.type}
                  </div>

                </div>

                <OpsBadge
                  tone={
                    event.severity === "CRITICAL"
                      ? "red"
                      : event.severity === "SUCCESS"
                        ? "green"
                        : "blue"
                  }
                >
                  {event.severity}
                </OpsBadge>

              </div>

            ))}

          </div>

        )}

      </OpsPanel>


      {error && (
        <div
          style={{
            padding: 14,
            borderRadius: 10,
            background: "rgba(127,29,29,.25)",
            border:
              "1px solid rgba(248,113,113,.3)",
            color: "#fecaca"
          }}
        >
          {error}
        </div>
      )}

    </div>
  );
}
/* =========================================================
   MAP
========================================================= */

function CommandMap({ large = false, selectedVictimId = null }) {
  const [mapData, setMapData] = useState(null);
   const [clickedVictimId, setClickedVictimId] = useState(null);
  const [mapError, setMapError] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadOperationsMap = async (victimId = null) => {
    try {
      setLoading(true);

      const url = victimId
        ? `${API_BASE}/api/operations/map?victim_id=${victimId}`
        : `${API_BASE}/api/operations/map`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Operations API returned ${response.status}`);
      }

      const data = await response.json();

      setMapData(data);
      setMapError(false);
    } catch (error) {
      console.error("RESQ operations map error:", error);
      setMapError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (cancelled) return;
      await loadOperationsMap(selectedVictimId ?? clickedVictimId);
    };

    load();

    const timer = setInterval(load, 10000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
 }, [selectedVictimId, clickedVictimId]);

  const center = [
    Number(mapData?.command_center?.latitude) || 17.3850,
    Number(mapData?.command_center?.longitude) || 78.4867
  ];

  const routeCoordinates =
    mapData?.route?.geometry?.coordinates?.map(
      ([longitude, latitude]) => [Number(latitude), Number(longitude)]
    ) || [];

  const commandIcon = useMemo(
    () =>
      new L.DivIcon({
        className: "resq-command-marker",
        html: `
          <div style="
            width:18px;
            height:18px;
            border-radius:50%;
            background:#27a8ff;
            border:3px solid #ffffff;
            box-shadow:0 0 18px rgba(39,168,255,.95);
          "></div>
        `,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      }),
    []
  );

  const victimIcon = useMemo(
    () =>
      new L.DivIcon({
        className: "resq-victim-marker",
        html: `
          <div style="
            width:17px;
            height:17px;
            border-radius:50%;
            background:#ff5364;
            border:3px solid #ffffff;
            box-shadow:0 0 16px rgba(255,83,100,.9);
          "></div>
        `,
        iconSize: [17, 17],
        iconAnchor: [8.5, 8.5]
      }),
    []
  );

  const hazardIcon = useMemo(
    () =>
      new L.DivIcon({
        className: "resq-hazard-marker",
        html: `
          <div style="
            width:20px;
            height:20px;
            border-radius:5px;
            background:#f0a83a;
            border:2px solid #ffffff;
            box-shadow:0 0 15px rgba(240,168,58,.8);
            display:flex;
            align-items:center;
            justify-content:center;
            color:#071223;
            font-size:12px;
            font-weight:900;
          ">!</div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      }),
    []
  );

  const droneIcon = useMemo(
    () =>
      new L.DivIcon({
        className: "resq-drone-marker",
        html: `
          <div style="
            width:28px;
            height:28px;
            border-radius:50%;
            background:rgba(39,168,255,.15);
            border:1px solid rgba(39,168,255,.65);
            box-shadow:0 0 14px rgba(39,168,255,.5);
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:15px;
          ">✦</div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      }),
    []
  );

  return (
    <div
      style={{
        position: "relative",
        minHeight: large ? 650 : 520,
        background: "#071223",
        borderRadius: 12,
        overflow: "hidden"
      }}
    >
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={true}
        style={{
          width: "100%",
          height: large ? 650 : 520,
          minHeight: large ? 650 : 520,
          background: "#071223"
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* COMMAND CENTER */}
        <Marker position={center} icon={commandIcon}>
          <Popup>
            <strong>RESQ Operations Center</strong>
            <br />
            Command & Dispatch Center
          </Popup>
        </Marker>

        {/* VICTIMS */}
        {mapData?.victims?.map((victim) => {
          const position = [
            Number(victim.latitude),
            Number(victim.longitude)
          ];

          return (
            <Marker
              key={`victim-${victim.id}`}
              position={position}
              icon={victimIcon}
              eventHandlers={{
                click: () => {
                 setClickedVictimId(victim.id);
                }
              }}
            >
              <Popup>
                <strong>Victim {victim.name}</strong>
                <br />
                Severity: {victim.severity}
                <br />
                People: {victim.people_count}
                <br />
                Priority: {victim.priority}
                <br />
                <button
                  style={{ marginTop: 8 }}
                  onClick={() => setClickedVictimId(victim.id)}
                >
                  Route Here
                </button>
              </Popup>
            </Marker>
          );
        })}

        {/* HAZARDS */}
        {mapData?.hazards?.map((hazard) => {
          const position = [
            Number(hazard.latitude),
            Number(hazard.longitude)
          ];

          return (
            <React.Fragment key={`hazard-${hazard.id}`}>
              <Circle
                center={position}
                radius={Number(hazard.radius_m) || 80}
                pathOptions={{
                  color:
                    hazard.severity === "high" ||
                    hazard.severity === "critical"
                      ? "#ff5364"
                      : "#f0a83a",
                  fillOpacity: 0.16,
                  weight: 2
                }}
              />

              <Marker position={position} icon={hazardIcon}>
                <Popup>
                  <strong>{hazard.type}</strong>
                  <br />
                  Severity: {hazard.severity}
                  <br />
                  Radius: {hazard.radius_m} m
                  <br />
                  Status: {hazard.status}
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* DRONES */}
        {mapData?.drones?.map((drone) => (
          <Marker
            key={drone.id}
            position={[
              Number(drone.latitude),
              Number(drone.longitude)
            ]}
            icon={droneIcon}
          >
            <Popup>
              <strong>{drone.name}</strong>
              <br />
              Unit: {drone.id}
              <br />
              Status: {drone.status}
              <br />
              Battery: {drone.battery}%
            </Popup>
          </Marker>
        ))}

        {/* FASTEST ROAD ROUTE */}
        {routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{
              color: "#168cff",
              weight: 6,
              opacity: 0.9
            }}
          />
        )}
      </MapContainer>

      {/* MAP STATUS */}
      <div
        style={{
          position: "absolute",
          zIndex: 1000,
          top: 14,
          left: 14,
          right: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          pointerEvents: "none"
        }}
      >
        <div
          style={{
            background: "rgba(7,18,35,.94)",
            border: "1px solid rgba(39,168,255,.3)",
            borderRadius: 10,
            padding: "11px 14px",
            boxShadow: "0 8px 30px rgba(0,0,0,.25)"
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: 1.5,
              color: "#73bfff",
              fontWeight: 800
            }}
          >
            LIVE OPERATIONS MAP
          </div>

          <div
            style={{
              color: "#fff",
              fontWeight: 800,
              marginTop: 3
            }}
          >
            {mapData?.system?.status || "CONNECTING"}
          </div>
        </div>

        <div
          style={{
            background: "rgba(7,18,35,.94)",
            border: "1px solid rgba(39,168,255,.3)",
            borderRadius: 10,
            padding: "11px 14px",
            minWidth: 180,
            boxShadow: "0 8px 30px rgba(0,0,0,.25)"
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: 1.4,
              color: "#73bfff",
              fontWeight: 800
            }}
          >
            FASTEST RESPONSE ROUTE
          </div>

          <div
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: 900,
              marginTop: 3
            }}
          >
            {mapData?.route?.distance_km ?? "--"} km
          </div>

          <div style={{ color: "#9eb2ca", fontSize: 12 }}>
            ETA {mapData?.route?.duration_minutes ?? "--"} min
          </div>
        </div>
      </div>

      {/* MAP LEGEND */}
      <div
        style={{
          position: "absolute",
          zIndex: 1000,
          left: 14,
          bottom: 14,
          background: "rgba(7,18,35,.94)",
          border: "1px solid rgba(39,168,255,.22)",
          borderRadius: 10,
          padding: 11,
          color: "#fff",
          fontSize: 11,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          maxWidth: "calc(100% - 28px)"
        }}
      >
        <span>🔵 Command</span>
        <span>🔴 Victim</span>
        <span>⚠ Hazard</span>
        <span>✦ Drone</span>
        <span>━ Fastest Route</span>
      </div>

      {/* MAP ERROR */}
      {mapError && (
        <div
          style={{
            position: "absolute",
            zIndex: 1100,
            top: 78,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(90,20,30,.96)",
            border: "1px solid rgba(255,83,100,.5)",
            color: "#fff",
            borderRadius: 8,
            padding: "8px 14px",
            fontSize: 12
          }}
        >
          Operations API unavailable
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div
          style={{
            position: "absolute",
            zIndex: 1100,
            top: 78,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(7,18,35,.96)",
            border: "1px solid rgba(39,168,255,.35)",
            color: "#fff",
            borderRadius: 8,
            padding: "8px 14px",
            fontSize: 12
          }}
        >
          Syncing operations…
        </div>
      )}
    </div>
  );
}

function AlertsPanel() {
  const { victimData, hazardData } = useOpsData();
  const criticalVictims = victimData.filter(v => String(v.severity).toLowerCase() === "critical");
  const highHazards = hazardData.filter(h => ["critical","high"].includes(String(h.severity).toLowerCase()));
  return (
    <section className="panel">
      <PanelTitle title="CRITICAL ALERTS" sub="REAL-TIME INCIDENT FEED" />
      <div className="alerts">
        {criticalVictims.slice(0,3).map(v => (
          <div className="alert criticalAlert" key={`v-${v.id}`}>
            <div className="alertIcon">!</div><div className="alertContent"><strong>CRITICAL VICTIM</strong><span>{v.name || `Victim ${v.id}`} · {v.people_count || 0} people</span><small>Priority {v.priority || "CRITICAL"}</small></div><Severity value="CRITICAL" />
          </div>
        ))}
        {highHazards.slice(0,2).map(h => (
          <div className="alert mediumAlert" key={`h-${h.id}`}>
            <div className="alertIcon">!</div><div className="alertContent"><strong>{String(h.type).toUpperCase()}</strong><span>Risk zone · {h.radius_m || 0} m radius</span><small>{String(h.status || "ACTIVE").toUpperCase()}</small></div><Severity value={String(h.severity || "HIGH").toUpperCase()} />
          </div>
        ))}
        {!criticalVictims.length && !highHazards.length && <OpsEmpty>No critical alerts.</OpsEmpty>}
      </div>
    </section>
  );
}

/* =========================================================
   OVERVIEW
========================================================= */

function Overview({ setPage }) {

  return (
    <div className="page">

      <div className="metrics">

        <Metric
          label="ACTIVE MISSION"
          value="01"
          sub="Emergency Response"
          accent="blue"
        />

        <Metric
          label="THREAT LEVEL"
          value="HIGH"
          sub="3 active hazards"
          accent="red"
        />

        <Metric
          label="VICTIMS DETECTED"
          value="04"
          sub="2 requiring priority"
          accent="orange"
        />

        <Metric
          label="ACTIVE HAZARDS"
          value="04"
          sub="AI verified"
          accent="yellow"
        />

        <Metric
          label="DRONES ONLINE"
          value="03"
          sub="1 standby"
          accent="cyan"
        />

        <Metric
          label="RESPONSE ETA"
          value="06m"
          sub="Sector B"
          accent="green"
        />

      </div>

      <div className="dashboardGrid">

        <section className="panel mapPanel">

          <PanelTitle
            title="LIVE OPERATIONAL MAP"
            sub="ACTIVE MISSION · SECTOR B"
            action={
              <button
                className="smallButton"
                onClick={() => setPage("routes")}
              >
                ROUTE ANALYSIS →
              </button>
            }
          />

          <CommandMap large />

        </section>

        <AlertsPanel />

      </div>

      <div className="dashboardLower">

        <section className="panel">

          <PanelTitle
            title="AI SITUATION ASSESSMENT"
            sub="RESQ AI · LIVE ANALYSIS"
          />

          <div className="aiAssessment">

            <div className="aiBadge">AI</div>

            <div>
              <h3>Emergency response priority established</h3>

              <p>
                AI analysis identifies Sector B as the current priority
                due to a critical road obstruction and nearby victim
                detection. Primary response route has been calculated
                using A* path optimization.
              </p>

              <div className="assessmentTags">
                <span>PRIORITY: SECTOR B</span>
                <span>ROUTE: OPTIMAL</span>
                <span>CONFIDENCE: 94%</span>
              </div>
            </div>

          </div>

        </section>

        <section className="panel">

          <PanelTitle
            title="RESPONSE UNITS"
            sub="FIELD ASSETS"
          />

          <div className="unitList">

            <div className="unit">
              <div className="unitIcon">DR</div>

              <div>
                <strong>DR-01 · ALPHA</strong>
                <span>Sector B surveillance</span>
              </div>

              <StatusDot status="ACTIVE" />
            </div>

            <div className="unit">
              <div className="unitIcon">DR</div>

              <div>
                <strong>DR-02 · BRAVO</strong>
                <span>Sector C surveillance</span>
              </div>

              <StatusDot status="ACTIVE" />
            </div>

            <div className="unit">
              <div className="unitIcon vehicleIcon">EV</div>

              <div>
                <strong>UNIT-07 · RESCUE</strong>
                <span>En route to Sector B</span>
              </div>

              <StatusDot status="ONLINE" />
            </div>

          </div>

        </section>

      </div>

      <section className="panel">

        <PanelTitle
          title="LIVE EVENT STREAM"
          sub="SYSTEM EVENTS · REAL TIME"
        />

        <EventStream />

      </section>

    </div>
  );
}

/* =========================================================
   EVENT STREAM
========================================================= */

function EventStream() {

  return (
    <div className="eventStream">

      {events.map((event, index) => (

        <div className="event" key={index}>

          <span className="eventTime">
            {event.time}
          </span>

          <span className={`eventType ${event.severity.toLowerCase()}`}>
            {event.type}
          </span>

          <span className="eventText">
            {event.text}
          </span>

        </div>

      ))}

    </div>
  );
}

/* =========================================================
   LIVE DETECTION
========================================================= */

/* =========================================================
   OPERATIONS PAGES — unified command-center experience
========================================================= */

async function apiJson(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  if (!response.ok) throw new Error(`API ${response.status}`);
  return response.json();
}

function useOpsData() {
  const [victimData, setVictimData] = useState([]);
  const [hazardData, setHazardData] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [v, h] = await Promise.all([
        apiJson("/api/victims"),
        apiJson("/api/hazards")
      ]);
      setVictimData(Array.isArray(v) ? v : []);
      setHazardData(Array.isArray(h) ? h : []);
    } catch {
      // Keep the operational UI usable even when the API is temporarily offline.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, []);

  return { victimData, hazardData, loading, reload: load };
}

function OpsStat({ label, value, detail, tone = "blue" }) {
  return (
    <div className={`opsStat ${tone}`}>
      <div className="opsStatLabel">{label}</div>
      <div className="opsStatValue">{value}</div>
      {detail && <div className="opsStatDetail">{detail}</div>}
    </div>
  );
}

function OpsPanel({ title, subtitle, children, action }) {
  return (
    <section className="opsPanel">
      <div className="opsPanelHead">
        <div>
          <div className="opsPanelTitle">{title}</div>
          {subtitle && <div className="opsPanelSub">{subtitle}</div>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function OpsToolbar({ children }) {
  return <div className="opsToolbar">{children}</div>;
}

function OpsButton({ children, onClick, secondary = false, disabled = false }) {
  return (
    <button
      className={`opsButton ${secondary ? "secondary" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

function OpsBadge({ children, tone = "blue" }) {
  return <span className={`opsBadge ${tone}`}>{children}</span>;
}

function OpsEmpty({ children = "No operational data available." }) {
  return <div className="opsEmpty">{children}</div>;
}

function OperationsMap({ mode = "all", selectedId, onSelect, drones: droneData = [], victimSeverity = "ALL", hazardSeverity = "ALL" }) {
  const { victimData, hazardData } = useOpsData();
  const center = [17.3850, 78.4867];

  const commandIcon = useMemo(() => new L.DivIcon({
    className: "opsLeafletIcon",
    html: '<span class="opsMapCommand">C</span>',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  }), []);

  const victimIcon = useMemo(() => new L.DivIcon({
    className: "opsLeafletIcon",
    html: '<span class="opsMapVictim">+</span>',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  }), []);

  const hazardIcon = useMemo(() => new L.DivIcon({
    className: "opsLeafletIcon",
    html: '<span class="opsMapHazard">!</span>',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  }), []);

  const droneIcon = useMemo(() => new L.DivIcon({
    className: "opsLeafletIcon",
    html: '<span class="opsMapDrone">✦</span>',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  }), []);

  const visibleVictims = mode === "hazards" ? [] : (victimSeverity === "ALL" ? victimData : victimData.filter(v => String(v.severity || "").toUpperCase() === victimSeverity));
  const visibleHazards = mode === "victims" ? [] : (hazardSeverity === "ALL" ? hazardData : hazardData.filter(h => String(h.severity || "").toUpperCase() === hazardSeverity));
  const victimIconFor = (severity) => {
    const sev = String(severity || "medium").toLowerCase();
    const color = sev === "critical" ? "#ff3f58" : sev === "high" ? "#ff9638" : sev === "medium" ? "#f1c84b" : "#45d89a";
    return new L.DivIcon({ className: "opsLeafletIcon", html: `<span style="display:flex;width:22px;height:22px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 0 14px ${color};align-items:center;justify-content:center;color:#06111f;font-weight:900;font-size:11px">+</span>`, iconSize:[22,22], iconAnchor:[11,11] });
  };

  return (
    <div className="opsMapWrap">
      <MapContainer center={center} zoom={13} scrollWheelZoom style={{ width: "100%", height: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} icon={commandIcon}>
          <Popup><strong>RESQ-OPS COMMAND CENTER</strong><br />Hyderabad Operations</Popup>
        </Marker>

        {visibleVictims.map((v) => {
          const id = `v-${v.id}`;
          return (
            <Marker
              key={id}
              position={[Number(v.latitude), Number(v.longitude)]}
              icon={victimIconFor(v.severity)}
              eventHandlers={{ click: () => onSelect?.(id, v) }}
            >
              <Popup>
                <strong>{v.name || `Victim ${v.id}`}</strong><br />
                {String(v.severity || "UNKNOWN").toUpperCase()} · {v.people_count ?? 0} people
              </Popup>
            </Marker>
          );
        })}

        {visibleHazards.map((h) => {
          const id = `h-${h.id}`;
          const sev = String(h.severity || "medium").toLowerCase();
          const stroke = sev === "critical" ? "#ff4f69" : sev === "high" ? "#ff9d3d" : "#f1c75b";
          return (
            <React.Fragment key={id}>
              <Marker
                position={[Number(h.latitude), Number(h.longitude)]}
                icon={hazardIcon}
                eventHandlers={{ click: () => onSelect?.(id, h) }}
              >
                <Popup><strong>{h.type}</strong><br />{String(h.severity || "").toUpperCase()}</Popup>
              </Marker>
              <Circle
                center={[Number(h.latitude), Number(h.longitude)]}
                radius={Number(h.radius_m) || 80}
                pathOptions={{ color: stroke, fillColor: stroke, fillOpacity: 0.14, weight: 2 }}
              />
            </React.Fragment>
          );
        })}

        {droneData.map((d, i) => {
          const p = d.position || [17.385 + (i - 1) * 0.012, 78.4867 + (i - 1) * 0.014];
          return (
            <React.Fragment key={d.id || i}>
              <Circle center={p} radius={Number(d.coverage_radius_m) || 900} pathOptions={{ color: "#42c8ff", fillColor: "#42c8ff", fillOpacity: 0.05, weight: 1, dashArray: "5 5" }} />
              <Marker position={p} icon={droneIcon}>
                <Popup><strong>{d.id || `DR-${i + 1}`}</strong><br />{d.status || "ACTIVE"}<br />Battery {d.battery || "—"}<br />Coverage {d.coverage_radius_m || 900} m<br />People detected {d.people_detected || 0}</Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
      <div className="opsMapLabel"><span className="pulse" /> LIVE OPERATIONAL MAP</div>
      <div className="opsMapLegend">
        <span><i className="legendCommand" /> Command</span>
        {mode !== "hazards" && <span><i className="legendVictim" /> Victims</span>}
        {mode !== "victims" && <span><i className="legendHazard" /> Hazards</span>}
        {droneData.length > 0 && <span><i className="legendDrone" /> Drones</span>}
      </div>
    </div>
  );
}

function Victims() {
  const { victimData, hazardData, loading, reload } = useOpsData();
  const [selectedId,setSelectedId]=useState(null); const [filter,setFilter]=useState("ALL");
  const filtered=filter==="ALL"?victimData:victimData.filter(v=>String(v.severity||"").toUpperCase()===filter);
  const selected=victimData.find(v=>`v-${v.id}`===selectedId)||filtered[0];
  const people=victimData.reduce((a,v)=>a+Number(v.people_count||0),0);
  return <div className="opsPage">
    <div className="opsHero"><div><div className="opsEyebrow">FIELD PERSONNEL / INCIDENTS</div><h1>Victim Operations</h1><p>Prioritise people, inspect their location and send the fastest rescue route.</p></div><div className="opsHeroActions"><OpsBadge tone="green">● LIVE SYNC</OpsBadge><OpsButton secondary onClick={reload}>↻ Refresh</OpsButton></div></div>
    <div className="opsStatGrid"><OpsStat label="TOTAL VICTIMS" value={victimData.length} detail="Detected incidents"/><OpsStat label="CRITICAL" value={victimData.filter(v=>String(v.severity).toLowerCase()==="critical").length} detail="Immediate response" tone="red"/><OpsStat label="HIGH" value={victimData.filter(v=>String(v.severity).toLowerCase()==="high").length} detail="Priority queue" tone="orange"/><OpsStat label="PEOPLE AFFECTED" value={people} detail="Across incidents" tone="purple"/></div>
    <OpsToolbar>{["ALL","CRITICAL","HIGH","MEDIUM","LOW"].map(x=><button key={x} className={`opsFilter ${filter===x?"active":""}`} onClick={()=>setFilter(x)}>{x}</button>)}</OpsToolbar>
    <div className="opsMainGrid">
      <OpsPanel title="Victim Map" subtitle={`${filtered.length} victim records shown`}><div className="opsMapLarge"><OperationsMap mode="victims" selectedId={selectedId} onSelect={setSelectedId} victimSeverity={filter}/></div></OpsPanel>
      <div className="opsStack"><OpsPanel title="Victim Queue" subtitle="Select a victim to inspect"><div className="opsList">{loading&&!victimData.length?<OpsEmpty>Loading victim feed…</OpsEmpty>:filtered.map(v=><button key={v.id} className={`opsRowButton ${selected?.id===v.id?"selected":""}`} onClick={()=>setSelectedId(`v-${v.id}`)}><div className={`opsAvatar ${String(v.severity).toLowerCase()}`}>+</div><div className="opsRowMain"><strong>{v.name||`Victim ${v.id}`}</strong><span>{v.people_count||0} people · {v.status||"DETECTED"}</span></div><Severity value={String(v.severity||"").toUpperCase()}/></button>)}</div></OpsPanel>
      <OpsPanel title="Selected Victim" subtitle={selected?`V-${selected.id}`:"Choose an incident"}>{selected?<div className="opsDetailGrid"><div><span>SEVERITY</span><strong>{String(selected.severity).toUpperCase()}</strong></div><div><span>PEOPLE</span><strong>{selected.people_count||0}</strong></div><div><span>PRIORITY</span><strong>{selected.priority||"—"}</strong></div><div><span>STATUS</span><strong>{String(selected.status||"DETECTED").toUpperCase()}</strong></div><div className="wide"><span>LOCATION</span><strong>{selected.latitude}, {selected.longitude}</strong></div><div className="wide"><OpsButton onClick={()=>{localStorage.setItem("resq-route-victim",String(selected.id));window.dispatchEvent(new CustomEvent("resq-route-victim",{detail:selected.id}));}}>VIEW RESCUE ROUTE →</OpsButton></div></div>:<OpsEmpty>Select a victim marker or queue item.</OpsEmpty>}</OpsPanel></div>
    </div>
  </div>;
}

function Hazards() {
  const { hazardData, loading, reload } = useOpsData(); const [filter,setFilter]=useState("ALL"); const [selectedId,setSelectedId]=useState(null);
  const filtered=filter==="ALL"?hazardData:hazardData.filter(h=>String(h.severity||"").toUpperCase()===filter); const selected=hazardData.find(h=>`h-${h.id}`===selectedId)||filtered[0];
  return <div className="opsPage">
    <div className="opsHero"><div><div className="opsEyebrow">THREAT ENVIRONMENT / RISK ZONES</div><h1>Hazard Operations</h1><p>Map every active flood, obstruction and risk zone that can affect rescue.</p></div><div className="opsHeroActions"><OpsBadge tone="orange">⚠ LIVE THREAT FEED</OpsBadge><OpsButton secondary onClick={reload}>↻ Refresh</OpsButton></div></div>
    <div className="opsStatGrid"><OpsStat label="ACTIVE HAZARDS" value={hazardData.length} detail="Live risk objects"/><OpsStat label="CRITICAL" value={hazardData.filter(h=>String(h.severity).toLowerCase()==="critical").length} detail="Restricted zones" tone="red"/><OpsStat label="HIGH" value={hazardData.filter(h=>String(h.severity).toLowerCase()==="high").length} detail="Monitor" tone="orange"/><OpsStat label="AFFECTED RADIUS" value={`${Math.round(hazardData.reduce((a,h)=>a+Number(h.radius_m||0),0))} m`} detail="Combined footprint" tone="purple"/></div>
    <OpsToolbar>{["ALL","CRITICAL","HIGH","MEDIUM","LOW"].map(x=><button key={x} className={`opsFilter ${filter===x?"active":""}`} onClick={()=>setFilter(x)}>{x}</button>)}</OpsToolbar>
    <div className="opsMainGrid"><OpsPanel title="Hazard Map" subtitle="Every active hazard has a visible risk radius"><div className="opsMapLarge"><OperationsMap mode="hazards" selectedId={selectedId} onSelect={setSelectedId} hazardSeverity={filter}/></div></OpsPanel><OpsPanel title="Hazard Queue" subtitle="Select a threat for details"><div className="opsList">{loading&&!hazardData.length?<OpsEmpty>Loading hazard feed…</OpsEmpty>:filtered.map(h=><button key={h.id} className={`opsRowButton ${selected?.id===h.id?"selected":""}`} onClick={()=>setSelectedId(`h-${h.id}`)}><div className="opsHazardIcon">!</div><div className="opsRowMain"><strong>{h.type}</strong><span>{h.radius_m||0} m radius · {String(h.status||"ACTIVE").toUpperCase()}</span></div><Severity value={String(h.severity||"").toUpperCase()}/></button>)}</div>{selected&&<div className="opsDetailGrid"><div><span>TYPE</span><strong>{selected.type}</strong></div><div><span>SEVERITY</span><strong>{String(selected.severity).toUpperCase()}</strong></div><div><span>RADIUS</span><strong>{selected.radius_m||0} m</strong></div><div><span>STATUS</span><strong>{String(selected.status||"ACTIVE").toUpperCase()}</strong></div><div className="wide"><span>DESCRIPTION</span><strong>{selected.description||"No additional description."}</strong></div></div>}</OpsPanel></div>
  </div>;
}

function Detection() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runDetection = async () => {
    if (!file) return;
    setLoading(true); setError("");
    try {
      const form = new FormData(); form.append("file", file);
      const data = await apiJson("/api/detection/image?confidence=0.35", { method: "POST", body: form });
      setResult(data);
    } catch (e) { setError(e.message || "Detection service unavailable"); }
    finally { setLoading(false); }
  };
  const detections = Array.isArray(result) ? result : (result?.detections || result?.results || []);
  const people = detections.filter(d => /person|people|victim|human/i.test(d.class || d.label || d.name || "")).length;
  return (
    <div className="opsPage">
      <div className="opsHero"><div><div className="opsEyebrow">FIELD VISION / INCIDENT DETECTION</div><h1>Live Detection</h1><p>Upload field imagery and turn visual evidence into actionable rescue intelligence.</p></div><OpsBadge tone="green">● VISION READY</OpsBadge></div>
      <div className="opsStatGrid"><OpsStat label="INPUT" value={file ? "READY" : "WAIT"} detail="Field image" tone="purple" /><OpsStat label="OBJECTS FOUND" value={detections.length} detail="Current frame" tone="orange" /><OpsStat label="PEOPLE / VICTIMS" value={people} detail="Detected in frame" tone="red" /><OpsStat label="ENGINE" value={loading ? "RUNNING" : "READY"} detail="YOLO inference" tone="green" /></div>
      <div className="opsMainGrid detectionLayout">
        <OpsPanel title="Field Evidence" subtitle="Choose an image, then run detection">
          <div className="opsCamera">{preview ? <img src={preview} alt="Detection input" /> : <div className="opsCameraEmpty"><div className="cameraGlyph">◉</div><strong>NO FIELD IMAGE</strong><span>Upload a flood or rescue image to analyse it.</span></div>}<div className="cameraCorners" />{loading && <div className="scanLine" />}<div className="opsCameraTag">LIVE VISION // {loading ? "ANALYSING" : "STANDBY"}</div></div>
          <OpsToolbar><label className="opsFile"><input type="file" accept="image/*" onChange={e => {const f=e.target.files?.[0];if(f){setFile(f);setPreview(URL.createObjectURL(f));setResult(null);}}} /> CHOOSE FIELD IMAGE</label><OpsButton onClick={runDetection} disabled={!file || loading}>{loading ? "ANALYSING…" : "ANALYSE IMAGE"}</OpsButton></OpsToolbar>
          {error && <div className="opsError">{error}</div>}
        </OpsPanel>
        <div className="opsStack">
          <OpsPanel title="Detected Objects" subtitle="What the model found in this frame">{detections.length ? <div className="opsList">{detections.map((d,i)=><div className="opsDetection" key={i}><div className="opsDetectionDot" /><div><strong>{d.class || d.label || d.name || `OBJECT ${i+1}`}</strong><span>{d.confidence != null ? `${Math.round(Number(d.confidence) <= 1 ? Number(d.confidence)*100 : Number(d.confidence))}% confidence` : "Confidence unavailable"}</span></div><OpsBadge tone="green">FOUND</OpsBadge></div>)}</div> : <OpsEmpty>{result ? "No objects detected above the threshold." : "Detection results will appear here."}</OpsEmpty>}</OpsPanel>
          <OpsPanel title="Operational Meaning" subtitle="How detection supports rescue"> <div className="opsAssessment"><div className="assessmentIcon">✧</div><div><strong>Evidence → Response</strong><p>Detected people can be added to the victim picture, while vehicles, smoke and obstacles can support hazard assessment and route decisions.</p></div></div></OpsPanel>
        </div>
      </div>
    </div>
  );
}

function Drones() {
  const [droneList,setDroneList]=useState([]); const [loading,setLoading]=useState(true);
  useEffect(()=>{const load=async()=>{try{const d=await apiJson("/api/drones");setDroneList(Array.isArray(d)?d:[]);}catch{setDroneList([]);}finally{setLoading(false);}};load();const t=setInterval(load,10000);return()=>clearInterval(t)},[]);
  const normalized=droneList.map((d,i)=>({...d,id:d.id||`DR-${String(i+1).padStart(2,"0")}`,name:d.name||`DRONE-${i+1}`,latitude:Number(d.latitude??d.lat??17.385),longitude:Number(d.longitude??d.lon??78.4867),battery:Number(d.battery??0),altitude:Number(d.altitude??0),status:String(d.status||"AVAILABLE").toUpperCase(),coverage_radius_m:Number(d.coverage_radius_m??900),people_detected:Number(d.people_detected??d.people_count??0),victims_detected:Number(d.victims_detected??0)}));
  const active=normalized.filter(d=>["ACTIVE","ONLINE","AVAILABLE"].includes(d.status)).length;
  return <div className="opsPage"><div className="opsHero"><div><div className="opsEyebrow">AERIAL SURVEILLANCE / FLEET</div><h1>Drone Operations</h1><p>Track where every drone is, what it is covering and what it has detected.</p></div><OpsBadge tone="green">● {active} UNITS AVAILABLE</OpsBadge></div>
    <div className="opsStatGrid"><OpsStat label="FLEET" value={normalized.length} detail="Registered drones"/><OpsStat label="ONLINE" value={active} detail="Available / active" tone="green"/><OpsStat label="AVG BATTERY" value={`${normalized.length?Math.round(normalized.reduce((a,d)=>a+d.battery,0)/normalized.length):0}%`} detail="Fleet state" tone="purple"/><OpsStat label="PEOPLE DETECTED" value={normalized.reduce((a,d)=>a+d.people_detected,0)} detail="Reported by drones" tone="orange"/></div>
    <div className="opsMainGrid"><OpsPanel title="Drone Position & Coverage" subtitle="Markers show current aircraft; circles show surveillance reach"><div className="opsMapLarge"><OperationsMap mode="all" drones={normalized.map(d=>({id:d.id,name:d.name,status:d.status,battery:d.battery,position:[d.latitude,d.longitude],coverage_radius_m:d.coverage_radius_m,people_detected:d.people_detected}))}/></div></OpsPanel><OpsPanel title="Fleet Telemetry" subtitle="Select a unit to inspect its current mission data"><div className="opsList">{loading&&!normalized.length?<OpsEmpty>Loading drone fleet…</OpsEmpty>:normalized.map(d=><div className="opsFleetRow" key={d.id}><div className="droneGlyph">✦</div><div className="opsRowMain"><strong>{d.id} · {d.name}</strong><span>{d.status} · {d.altitude} m altitude</span><div className="opsProgress"><div style={{width:`${d.battery}%`}}/></div><span>{d.battery}% battery · {d.coverage_radius_m} m coverage</span></div><div className="fleetRight"><strong>{d.people_detected}</strong><span style={{fontSize:8,color:'#6d8498'}}>people</span><OpsBadge tone={d.status==='ACTIVE'||d.status==='ONLINE'||d.status==='AVAILABLE'?'green':'blue'}>{d.status}</OpsBadge></div></div>)}</div></OpsPanel></div>
    <OpsPanel title="Drone Detection & Mission Details" subtitle="Operational telemetry"><div className="opsTable"><div className="opsTableHead"><span>UNIT</span><span>POSITION</span><span>DETECTION</span><span>COVERAGE</span></div>{normalized.map(d=><div className="opsTableRow" key={d.id}><span><strong>{d.id}</strong> {d.name}</span><span>{d.latitude.toFixed(4)}, {d.longitude.toFixed(4)}</span><span>{d.people_detected} people · {d.victims_detected} victims</span><span>{d.coverage_radius_m} m radius</span></div>)}</div></OpsPanel>
  </div>;
}

function Routes() {
  const [victims, setVictims] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routeLoading, setRouteLoading] = useState(false);
  const [error, setError] = useState("");

  const loadVictims = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/api/victims`);
      if (!response.ok) {
        throw new Error("Unable to load victims");
      }

      const data = await response.json();

      const activeVictims = data.filter(
        (v) => v.status !== "rescued"
      );

      setVictims(activeVictims);

      if (activeVictims.length > 0 && !selectedId) {
        setSelectedId(activeVictims[0].id);
      }

      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadRoute = async (victimId) => {
    if (!victimId) return;

    try {
      setRouteLoading(true);

      const response = await fetch(
        `${API_BASE}/api/operations/map?victim_id=${victimId}`
      );

      if (!response.ok) {
        throw new Error("Unable to calculate rescue route");
      }

      const data = await response.json();

      setRouteData(data);
      setError("");
    } catch (err) {
      setError(err.message);
      setRouteData(null);
    } finally {
      setRouteLoading(false);
    }
  };

  useEffect(() => {
    loadVictims();
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadRoute(selectedId);
    }
  }, [selectedId]);

  const selectedVictim =
    victims.find((v) => v.id === selectedId) || null;

  const severityClass = (severity) => {
    const value = String(severity || "").toLowerCase();

    if (value === "critical") return "critical";
    if (value === "high") return "high";
    if (value === "medium") return "medium";
    return "low";
  };

  return (
    <div className="opsPage">

      <div className="opsHero">
        <div>
          <div className="opsEyebrow">
            RESPONSE ROUTING / LIVE OPERATIONS
          </div>

          <h1>Rescue Routes</h1>

          <p>
            Select a victim to calculate the fastest response route
            from the RESQ Operations Center.
          </p>
        </div>

        <OpsButton secondary onClick={loadVictims}>
          ↻ Refresh Victims
        </OpsButton>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "300px minmax(0, 1fr)",
          gap: 18,
          minHeight: 620
        }}
      >

        {/* VICTIM LIST */}

        <OpsPanel
          title="Active Victims"
          subtitle={`${victims.length} active response targets`}
        >
          {loading ? (
            <div className="opsEmpty">
              Loading victims...
            </div>
          ) : victims.length === 0 ? (
            <div className="opsEmpty">
              No active victims.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                maxHeight: 540,
                overflowY: "auto"
              }}
            >
              {victims.map((victim) => {

                const active =
                  victim.id === selectedId;

                return (
                  <button
                    key={victim.id}
                    onClick={() => setSelectedId(victim.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      cursor: "pointer",
                      padding: 13,
                      borderRadius: 10,
                      border: active
                        ? "1px solid #38bdf8"
                        : "1px solid rgba(148,163,184,.16)",
                      background: active
                        ? "rgba(14,165,233,.12)"
                        : "rgba(15,23,42,.65)",
                      color: "#dbeafe"
                    }}
                  >

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 8,
                        alignItems: "center"
                      }}
                    >
                      <strong>
                        {victim.name}
                      </strong>

                      <span
                        className={`severityDot ${severityClass(
                          victim.severity
                        )}`}
                      />
                    </div>

                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 12,
                        color: "#94a3b8"
                      }}
                    >
                      {String(victim.severity).toUpperCase()}
                      {" • "}
                      {victim.people_count || 0} people
                    </div>

                    <div
                      style={{
                        marginTop: 5,
                        fontSize: 11,
                        color: "#64748b"
                      }}
                    >
                      {Number(victim.latitude).toFixed(4)},
                      {" "}
                      {Number(victim.longitude).toFixed(4)}
                    </div>

                  </button>
                );
              })}
            </div>
          )}
        </OpsPanel>


        {/* MAP + ROUTE */}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14
          }}
        >

          <OpsPanel
            title={
              selectedVictim
                ? `Route to ${selectedVictim.name}`
                : "Select a Victim"
            }
            subtitle="RESQ Operations Center → Victim"
          >

            {selectedVictim && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(4, minmax(0, 1fr))",
                  gap: 10,
                  marginBottom: 14
                }}
              >

                <OpsStat
                  label="TARGET"
                  value={selectedVictim.name}
                  detail="Selected victim"
                  tone="red"
                />

                <OpsStat
                  label="SEVERITY"
                  value={String(
                    selectedVictim.severity
                  ).toUpperCase()}
                  detail={`${selectedVictim.people_count || 0} people`}
                  tone="orange"
                />

                <OpsStat
                  label="DISTANCE"
                  value={
                    routeLoading
                      ? "..."
                      : routeData?.route?.distance_km != null
                        ? `${routeData.route.distance_km} km`
                        : "—"
                  }
                  detail="Command center → victim"
                  tone="blue"
                />

                <OpsStat
                  label="ETA"
                  value={
                    routeLoading
                      ? "..."
                      : routeData?.route?.duration_minutes != null
                        ? `${routeData.route.duration_minutes} min`
                        : "—"
                  }
                  detail="Estimated response"
                  tone="green"
                />

              </div>
            )}

            <div
              style={{
                height: 480,
                borderRadius: 14,
                overflow: "hidden",
                position: "relative"
              }}
            >
              <CommandMap
                key={selectedId || "route-default"}
                large
                selectedVictimId={selectedId}
              />

              {routeLoading && (
                <div
                  style={{
                    position: "absolute",
                    top: 14,
                    left: 14,
                    zIndex: 1000,
                    padding: "9px 13px",
                    borderRadius: 8,
                    background: "rgba(2,6,23,.9)",
                    color: "#bae6fd",
                    fontSize: 12
                  }}
                >
                  Calculating rescue route...
                </div>
              )}
            </div>

          </OpsPanel>


          {/* ROUTE INFORMATION */}

          {routeData?.route && (
            <OpsPanel
              title="Route Intelligence"
              subtitle="Operational routing result"
            >

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3, minmax(0, 1fr))",
                  gap: 12
                }}
              >

                <div className="opsInfoCard">
                  <span>ORIGIN</span>
                  <strong>
                    RESQ Operations Center
                  </strong>
                  <small>
                    {routeData.command_center?.latitude},
                    {" "}
                    {routeData.command_center?.longitude}
                  </small>
                </div>

                <div className="opsInfoCard">
                  <span>DESTINATION</span>
                  <strong>
                    {routeData.route_destination?.name}
                  </strong>
                  <small>
                    {routeData.route_destination?.latitude},
                    {" "}
                    {routeData.route_destination?.longitude}
                  </small>
                </div>

                <div className="opsInfoCard">
                  <span>ROUTING ENGINE</span>
                  <strong>
                    {routeData.route.provider || "ROUTING"}
                  </strong>
                  <small>
                    {routeData.route.status}
                  </small>
                </div>

              </div>

            </OpsPanel>
          )}

          {error && (
            <div
              style={{
                padding: 14,
                borderRadius: 10,
                background: "rgba(127,29,29,.25)",
                border: "1px solid rgba(248,113,113,.3)",
                color: "#fecaca"
              }}
            >
              {error}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

const OPS_PAGE_STYLES = `
.opsPage{display:flex;flex-direction:column;gap:18px;padding:4px 0 32px;min-width:0;color:#dbe9f6}
.opsHero{display:flex;justify-content:space-between;align-items:flex-end;gap:18px;padding:6px 2px 2px}
.opsHero h1{margin:5px 0 4px;font-size:28px;letter-spacing:-.03em;color:#f2f8ff}
.opsHero p{margin:0;color:#8097ad;font-size:12px}
.opsEyebrow{font-size:9px;font-weight:800;letter-spacing:.18em;color:#43c7ff}
.opsHeroActions{display:flex;align-items:center;gap:9px}
.opsBadge{display:inline-flex;align-items:center;justify-content:center;white-space:nowrap;border:1px solid #28455f;background:#0b1b2c;color:#9bb3c9;border-radius:6px;padding:6px 9px;font-size:9px;font-weight:800;letter-spacing:.08em}
.opsBadge.green{color:#63e6b0;border-color:#1e5b4b;background:#09241f}.opsBadge.red{color:#ff7485;border-color:#67303b;background:#2a1118}.opsBadge.orange{color:#ffb45d;border-color:#694722;background:#281b0e}.opsBadge.purple{color:#bd9cff;border-color:#503b72;background:#1a1429}.opsBadge.blue{color:#57caff;border-color:#24506d;background:#0a1e2d}
.opsButton{border:1px solid #1f9fda;background:#0d80b8;color:#fff;border-radius:7px;padding:9px 13px;font-size:10px;font-weight:800;letter-spacing:.04em;cursor:pointer;transition:.18s}.opsButton:hover{filter:brightness(1.12);transform:translateY(-1px)}.opsButton:disabled{opacity:.45;cursor:not-allowed;transform:none}.opsButton.secondary{background:#0b1828;border-color:#29445d;color:#a9c0d3}
.opsStatGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.opsStat{position:relative;overflow:hidden;background:linear-gradient(145deg,#0d1b2b,#091423);border:1px solid #1c344a;border-radius:10px;padding:15px 16px;min-height:92px}.opsStat:after{content:"";position:absolute;right:-25px;bottom:-35px;width:95px;height:95px;border-radius:50%;background:rgba(55,190,255,.05)}.opsStatLabel{font-size:9px;color:#71889d;font-weight:800;letter-spacing:.12em}.opsStatValue{margin-top:7px;font-size:25px;font-weight:800;color:#eef7ff;line-height:1}.opsStatDetail{margin-top:8px;font-size:9px;color:#6d859b}.opsStat.red{border-color:#4a2835}.opsStat.red .opsStatValue{color:#ff6478}.opsStat.orange{border-color:#493521}.opsStat.orange .opsStatValue{color:#ffb15d}.opsStat.green{border-color:#1c4a3e}.opsStat.green .opsStatValue{color:#63e6b0}.opsStat.purple{border-color:#3b3154}.opsStat.purple .opsStatValue{color:#bd9cff}
.opsMainGrid{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(330px,.8fr);gap:14px;align-items:stretch}.opsStack{display:flex;flex-direction:column;gap:14px}.opsPanel{background:linear-gradient(145deg,#0c1929,#081321);border:1px solid #1d354b;border-radius:10px;overflow:hidden;box-shadow:0 10px 28px rgba(0,0,0,.13)}.opsPanelHead{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid #182d40}.opsPanelTitle{font-size:12px;font-weight:800;color:#e4f0fa;letter-spacing:.04em}.opsPanelSub{margin-top:3px;color:#687f94;font-size:9px}.opsMapLarge{height:520px}.opsMapWrap{height:100%;min-height:360px;position:relative;background:#07111c}.opsMapWrap .leaflet-container{height:100%;width:100%;background:#091521;font-family:inherit}.opsMapLabel{position:absolute;left:12px;top:12px;z-index:900;background:rgba(6,17,28,.93);border:1px solid #28445c;border-radius:6px;padding:7px 10px;color:#dcecf8;font-size:9px;font-weight:800;letter-spacing:.08em;pointer-events:none}.pulse{display:inline-block;width:6px;height:6px;background:#48e0b1;border-radius:50%;margin-right:6px;box-shadow:0 0 9px #48e0b1}.opsMapLegend{position:absolute;left:12px;bottom:12px;z-index:900;display:flex;gap:12px;flex-wrap:wrap;background:rgba(6,17,28,.94);border:1px solid #28445c;border-radius:6px;padding:7px 10px;color:#8da4b8;font-size:8px;pointer-events:none}.opsMapLegend i{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:4px}.legendCommand{background:#2bb8ff}.legendVictim{background:#ff536a}.legendHazard{background:#ff9d3d}.legendDrone{background:#b899ff}.opsLeafletIcon{background:transparent;border:0}.opsMapCommand,.opsMapVictim,.opsMapHazard,.opsMapDrone{display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;font-size:11px;font-weight:900;color:#fff;box-shadow:0 0 16px rgba(0,0,0,.55)}.opsMapCommand{background:#168fc8;border:2px solid #bcecff}.opsMapVictim{background:#d93655;border:2px solid #ffd4db}.opsMapHazard{background:#c76c1e;border:2px solid #ffe0bd;border-radius:6px}.opsMapDrone{background:#7450b7;border:2px solid #e1d2ff}
.opsToolbar{display:flex;align-items:center;gap:7px;flex-wrap:wrap;padding:11px 14px;border-bottom:1px solid #172b3e}.opsFilter{border:1px solid #223b52;background:#0a1625;color:#71899f;border-radius:5px;padding:6px 8px;font-size:8px;font-weight:800;letter-spacing:.06em;cursor:pointer}.opsFilter.active{background:#103d55;color:#58ceff;border-color:#20789f}.opsList{display:flex;flex-direction:column}.opsRowButton{display:flex;align-items:center;gap:10px;width:100%;text-align:left;background:transparent;border:0;border-bottom:1px solid #14283a;padding:11px 13px;color:#d9e8f3;cursor:pointer}.opsRowButton:hover,.opsRowButton.selected{background:#0d2638}.opsAvatar{width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:7px;background:#172e42;color:#5fcfff;font-weight:900}.opsAvatar.critical{background:#34131d;color:#ff6579}.opsAvatar.high{background:#34200f;color:#ffad59}.opsRowMain{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1}.opsRowMain strong{font-size:10px;color:#dcebf6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.opsRowMain span{font-size:8px;color:#6d8498;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.opsHazardIcon{width:28px;height:28px;border-radius:7px;background:#33200f;color:#ffab52;display:flex;align-items:center;justify-content:center;font-weight:900}.opsDetailGrid{display:grid;grid-template-columns:1fr 1fr;gap:0}.opsDetailGrid>div{padding:12px 14px;border-bottom:1px solid #162a3c}.opsDetailGrid .wide{grid-column:1/-1}.opsDetailGrid span{display:block;color:#61798e;font-size:8px;font-weight:800;letter-spacing:.1em;margin-bottom:5px}.opsDetailGrid strong{font-size:10px;color:#dbeaf5;word-break:break-word}.opsMiniGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;padding:13px}.opsContextCard{display:flex;flex-direction:column;gap:7px;background:#0a1624;border:1px solid #193147;border-radius:8px;padding:11px}.opsContextCard strong{font-size:10px}.opsContextCard span{font-size:8px;color:#6f879b}.opsEmpty{padding:30px 16px;text-align:center;color:#637b90;font-size:10px}.opsError{margin:0 14px 14px;padding:10px;border:1px solid #5b2934;background:#241119;color:#ff8190;border-radius:6px;font-size:9px}
.opsCamera{position:relative;height:490px;background:#050c14;display:flex;align-items:center;justify-content:center;overflow:hidden}.opsCamera img{width:100%;height:100%;object-fit:contain}.opsCameraEmpty{display:flex;flex-direction:column;align-items:center;gap:7px;color:#668096}.opsCameraEmpty strong{font-size:11px;color:#b8cad9;letter-spacing:.1em}.opsCameraEmpty span{font-size:9px}.cameraGlyph{width:62px;height:62px;border:1px solid #246482;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px;color:#35bff6;box-shadow:0 0 25px rgba(35,180,240,.16)}.cameraCorners{position:absolute;inset:18px;border:1px solid rgba(50,190,245,.25);pointer-events:none}.opsCameraTag{position:absolute;left:12px;top:12px;padding:6px 8px;background:rgba(4,13,22,.88);border:1px solid #23475e;border-radius:5px;color:#62cfff;font-size:8px;font-weight:800;letter-spacing:.1em}.scanLine{position:absolute;left:0;right:0;top:35%;height:1px;background:#45d8ff;box-shadow:0 0 14px #45d8ff;animation:scan 1.5s linear infinite}@keyframes scan{0%{top:15%}50%{top:80%}100%{top:15%}}.opsFile{display:inline-flex;align-items:center;cursor:pointer;border:1px solid #29455d;background:#0b1827;border-radius:7px;padding:9px 12px;font-size:9px;font-weight:800;color:#9db5c9}.opsFile input{display:none}.opsDetection{display:flex;align-items:center;gap:10px;padding:12px 13px;border-bottom:1px solid #152a3c}.opsDetection>div:nth-child(2){display:flex;flex-direction:column;gap:3px;flex:1}.opsDetection strong{font-size:10px}.opsDetection span{font-size:8px;color:#6d8498}.opsDetectionDot{width:8px;height:8px;border-radius:50%;background:#58dfb2;box-shadow:0 0 10px rgba(88,223,178,.7)}.opsAssessment{display:flex;gap:12px;padding:14px}.assessmentIcon,.aiOrb{width:38px;height:38px;min-width:38px;border:1px solid #5e45a2;border-radius:10px;background:#1a1530;color:#c8b4ff;display:flex;align-items:center;justify-content:center;font-size:18px}.opsAssessment strong{font-size:10px}.opsAssessment p{font-size:9px;line-height:1.6;color:#71889d;margin:6px 0 0}
.opsFleetRow{display:flex;align-items:center;gap:10px;padding:13px;border-bottom:1px solid #152a3c}.droneGlyph{width:31px;height:31px;border-radius:8px;background:#21193a;color:#bf9fff;display:flex;align-items:center;justify-content:center}.fleetRight{display:flex;flex-direction:column;align-items:flex-end;gap:5px}.fleetRight strong{font-size:10px}.opsProgress{height:4px;background:#122436;border-radius:10px;overflow:hidden;margin-top:5px}.opsProgress>div{height:100%;background:#2fb8ec;border-radius:10px}.opsProgress.big{height:6px}.opsTable{width:100%}.opsTableHead,.opsTableRow{display:grid;grid-template-columns:1.1fr 1.2fr 1.5fr 1fr;gap:12px;align-items:center;padding:11px 14px;border-bottom:1px solid #152a3b}.opsTableHead{color:#5f768b;font-size:8px;font-weight:800;letter-spacing:.12em;background:#091523}.opsTableRow{font-size:9px;color:#a4b9ca}.opsTableRow strong{color:#dceaf5}.opsRoute{display:flex;align-items:center;gap:10px;width:100%;text-align:left;background:transparent;border:0;border-bottom:1px solid #152a3c;padding:12px 13px;color:#d9e8f3;cursor:pointer}.opsRoute:hover,.opsRoute.selected{background:#0d2638}.routeIndex{width:28px;height:28px;border-radius:6px;background:#0e3044;color:#54caff;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:900}.routeEta{font-size:13px;font-weight:800;color:#63e6b0}.routeAssessment{display:flex;align-items:center;gap:12px;padding:14px;border-bottom:1px solid #172b3d}.routeBig{font-size:32px;font-weight:900;color:#55d5ff}.routeAssessment>div:nth-child(2){display:flex;flex-direction:column;gap:4px}.routeAssessment span{font-size:8px;color:#71889d}.opsRouteNotes{display:flex;flex-direction:column;gap:8px;padding:13px;color:#77a38f;font-size:9px}.coverageList{padding:8px 14px 14px}.coverageRow{padding:12px 0;border-bottom:1px solid #152a3c}.coverageTop{display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center}.coverageTop strong{font-size:10px}.coverageTop>span{font-size:10px;color:#a8bdcc;font-weight:800}.coverageMeta{margin-top:6px;color:#657d91;font-size:8px}.opsPriorityGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:14px}.opsPriorityGrid>div{display:grid;grid-template-columns:30px 1fr;column-gap:10px;padding:13px;background:#0a1624;border:1px solid #1a3145;border-radius:8px}.opsPriorityGrid strong{grid-row:1/3;color:#38c1fa;font-size:16px}.opsPriorityGrid span{font-size:10px;font-weight:800}.opsPriorityGrid small{font-size:8px;color:#687f94;line-height:1.5}.aiLayout{display:grid;grid-template-columns:1.25fr .9fr;gap:14px}.aiAnswer{display:flex;gap:13px;padding:18px}.aiAnswerLabel{font-size:8px;font-weight:800;color:#a78aff;letter-spacing:.12em}.aiAnswer p{font-size:11px;line-height:1.75;color:#c4d5e2;margin:8px 0 0;white-space:pre-wrap}.aiInput{padding:14px}.aiInput textarea{width:100%;min-height:125px;resize:vertical;background:#071321;border:1px solid #20394f;border-radius:7px;color:#dceaf5;padding:11px;font:inherit;font-size:10px;outline:none;box-sizing:border-box}.aiInput textarea:focus{border-color:#268dbb}.aiInput .opsButton{margin-top:9px}.aiPrompts{display:flex;flex-direction:column;gap:6px;padding:0 14px 14px}.aiPrompts button{text-align:left;border:1px solid #1d3549;background:#091624;color:#8199ad;border-radius:6px;padding:8px;font-size:8px;cursor:pointer}.aiPrompts button:hover{color:#53c9f7;border-color:#28627f}.opsContextGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;padding:14px}.opsContextGrid>div{padding:14px;background:#091624;border:1px solid #1a3146;border-radius:8px;text-align:center}.opsContextGrid strong{display:block;font-size:19px;color:#58cfff}.opsContextGrid span{display:block;margin-top:5px;font-size:8px;color:#70889d}.simControls{padding:16px;display:flex;flex-direction:column;gap:10px}.simProgress{height:8px;background:#102335;border-radius:10px;overflow:hidden}.simProgress>div{height:100%;background:#40c8f6;transition:width .3s}.simReadout{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #172b3d}.simReadout span{font-size:8px;color:#617a90}.simReadout strong{font-size:10px}.opsTimeline{padding:12px 18px}.opsTimeline>div{display:grid;grid-template-columns:42px 10px 1fr;align-items:center;gap:10px;min-height:42px}.opsTimeline span{font-size:8px;color:#587086}.opsTimeline i{width:7px;height:7px;border-radius:50%;background:#38bdf2;box-shadow:0 0 9px rgba(56,189,242,.6)}.opsTimeline strong{font-size:9px;color:#b6c9d8;font-weight:600}.reportGrid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:9px}.reportGrid .opsStat{min-height:84px}.reportBars{padding:14px;display:flex;flex-direction:column;gap:16px}.reportBars>div>div:first-child{display:flex;justify-content:space-between;margin-bottom:6px;font-size:9px;color:#9eb3c4}.reportBars strong{color:#58d0ff}.summaryBox{padding:16px}.summaryBox>strong{font-size:10px;color:#5bcdf8;letter-spacing:.08em}.summaryBox p{font-size:10px;color:#8399ac;line-height:1.7}.summaryFacts{display:flex;gap:8px}.summaryFacts span{padding:8px 10px;background:#091624;border:1px solid #1b3247;border-radius:6px;font-size:8px;color:#71889c}.summaryFacts b{color:#dceaf5}.healthGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.healthCard{display:flex;align-items:center;gap:11px;background:linear-gradient(145deg,#0c1928,#091421);border:1px solid #1c3449;border-radius:9px;padding:13px}.healthIcon{width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:900}.healthIcon.ok{background:#09271f;color:#63e6b0;border:1px solid #1e5c4b}.healthIcon.bad{background:#2a1118;color:#ff687b;border:1px solid #5c2b37}.healthCard>div:nth-child(2){display:flex;flex-direction:column;gap:3px;flex:1}.healthCard strong{font-size:10px}.healthCard span{font-size:8px;color:#6e869a}.healthCode{margin:0;padding:16px;background:#050c14;color:#77d7ff;font-size:9px;line-height:1.65;overflow:auto}.detectionLayout{grid-template-columns:minmax(0,1.4fr) minmax(320px,.8fr)}
@media(max-width:1100px){.opsStatGrid{grid-template-columns:repeat(2,1fr)}.opsMainGrid,.aiLayout{grid-template-columns:1fr}.reportGrid{grid-template-columns:repeat(3,1fr)}.opsMiniGrid,.opsContextGrid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:700px){.opsHero{align-items:flex-start;flex-direction:column}.opsStatGrid,.reportGrid,.healthGrid{grid-template-columns:1fr}.opsTable{overflow:auto}.opsTableHead,.opsTableRow{min-width:620px}.opsMiniGrid,.opsContextGrid,.opsPriorityGrid{grid-template-columns:1fr}.opsMapLarge{height:420px}.opsCamera{height:350px}}
`;

export default function App() {

  const [page, setPage] = useState("overview");

  const [backendOnline, setBackendOnline] = useState(false);

  const [clock, setClock] = useState(
    new Date().toLocaleTimeString()
  );

  useEffect(() => {

    const timer = setInterval(() => {
      setClock(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);

  }, []);

  useEffect(() => {
    const handler = () => setPage("routes");
    window.addEventListener("resq-route-victim", handler);
    return () => window.removeEventListener("resq-route-victim", handler);
  }, []);

  useEffect(() => {

    fetch(`${API_BASE}/api/health`)
      .then((response) => {
        if (response.ok) {
          setBackendOnline(true);
        }
      })
      .catch(() => {
        setBackendOnline(false);
      });

  }, []);

  const content = useMemo(() => {

    switch (page) {

      case "overview":
        return <Overview setPage={setPage} />;

      case "detection":
        return <Detection />;

      case "victims":
        return <Victims />;

      case "hazards":
        return <Hazards />;

      case "drones":
        return <Drones />;

      case "routes":
        return <Routes />;

      case "coverage":
        return <Coverage />;

      case "ai":
        return <ResqAI />;

      case "simulation":
        return <Simulation />;

      case "reports":
        return <Reports />;

      default:
        return <Overview setPage={setPage} />;

    }

  }, [page]);

  return (

    <div className="app">

      <style>{OPS_PAGE_STYLES}</style>

      <Sidebar
        page={page}
        setPage={setPage}
      />

      <main className="main">

        <Header page={page} />

        <div className="backendStatus">

          <span className={backendOnline ? "online" : "offline"} />

          BACKEND {backendOnline ? "CONNECTED" : "DEMO MODE"}

          <span className="statusClock">
            {clock}
          </span>

        </div>

        {content}

      </main>

    </div>

  );
}
