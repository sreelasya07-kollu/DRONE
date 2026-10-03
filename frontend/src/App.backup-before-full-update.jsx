import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle
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
  { id: "health", label: "System Health", icon: "✓" }
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

/* =========================================================
   MAP
========================================================= */

function CommandMap({ large = false }) {
  const [mapVictims, setMapVictims] = useState([]);
  const [mapHazards, setMapHazards] = useState([]);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadMapData() {
      try {
        const [victimResponse, hazardResponse] = await Promise.all([
          fetch(`${API_BASE}/api/victims`),
          fetch(`${API_BASE}/api/hazards`)
        ]);

        if (!victimResponse.ok || !hazardResponse.ok) {
          throw new Error("Operational data unavailable");
        }

        const victimData = await victimResponse.json();
        const hazardData = await hazardResponse.json();

        if (!cancelled) {
          setMapVictims(Array.isArray(victimData) ? victimData : []);
          setMapHazards(Array.isArray(hazardData) ? hazardData : []);
          setMapError(false);
        }
      } catch {
        if (!cancelled) setMapError(true);
      }
    }

    loadMapData();
    const timer = setInterval(loadMapData, 10000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const center = [17.3850, 78.4867];

  const commandIcon = useMemo(
    () =>
      new L.DivIcon({
        className: "resq-command-marker",
        html: `<div style="
          width:18px;
          height:18px;
          border-radius:50%;
          background:#27a8ff;
          border:3px solid #fff;
          box-shadow:0 0 18px rgba(39,168,255,.9);
        "></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      }),
    []
  );

  const victimIcon = useMemo(
    () =>
      new L.DivIcon({
        className: "resq-victim-marker",
        html: `<div style="
          width:16px;
          height:16px;
          border-radius:50%;
          background:#ff5364;
          border:3px solid #fff;
          box-shadow:0 0 15px rgba(255,83,100,.8);
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      }),
    []
  );

  const hazardIcon = useMemo(
    () =>
      new L.DivIcon({
        className: "resq-hazard-marker",
        html: `<div style="
          width:16px;
          height:16px;
          border-radius:4px;
          background:#ff9d3d;
          border:2px solid #fff;
          transform:rotate(45deg);
          box-shadow:0 0 14px rgba(255,157,61,.8);
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      }),
    []
  );

  return (
    <div
      className={`commandMap ${large ? "large" : ""}`}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "10px"
      }}
    >
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        style={{
          width: "100%",
          height: large ? "520px" : "420px",
          minHeight: large ? "520px" : "420px"
        }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={center} icon={commandIcon}>
          <Popup>
            <strong>RESQ-OPS COMMAND CENTER</strong>
            <br />
            Hyderabad Operations
          </Popup>
        </Marker>

        {mapVictims.map((victim) => (
          <Marker
            key={`victim-${victim.id}`}
            position={[Number(victim.latitude), Number(victim.longitude)]}
            icon={victimIcon}
          >
            <Popup>
              <strong>{victim.name || `Victim ${victim.id}`}</strong>
              <br />
              Severity: {victim.severity}
              <br />
              People: {victim.people_count ?? "—"}
              <br />
              Priority: {victim.priority || "—"}
            </Popup>
          </Marker>
        ))}

        {mapHazards.map((hazard) => {
          const severity = String(hazard.severity || "").toUpperCase();
          const radius = Number(hazard.radius_m) || 80;
          const stroke =
            severity === "CRITICAL"
              ? "#ff5364"
              : severity === "HIGH"
              ? "#ff9d3d"
              : "#e5c65c";

          return (
            <React.Fragment key={`hazard-${hazard.id}`}>
              <Marker
                position={[Number(hazard.latitude), Number(hazard.longitude)]}
                icon={hazardIcon}
              >
                <Popup>
                  <strong>{hazard.type}</strong>
                  <br />
                  Severity: {hazard.severity}
                  <br />
                  Status: {hazard.status}
                </Popup>
              </Marker>

              <Circle
                center={[Number(hazard.latitude), Number(hazard.longitude)]}
                radius={radius}
                pathOptions={{
                  color: stroke,
                  fillColor: stroke,
                  fillOpacity: 0.12,
                  weight: 2
                }}
              />
            </React.Fragment>
          );
        })}
      </MapContainer>

      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 1000,
          background: "rgba(7,18,30,.92)",
          border: "1px solid #24415b",
          borderRadius: 7,
          padding: "8px 12px",
          color: "#d8e8f7",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: ".08em",
          pointerEvents: "none"
        }}
      >
        LIVE OPERATIONAL MAP
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 12,
          zIndex: 1000,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          background: "rgba(7,18,30,.92)",
          border: "1px solid #24415b",
          borderRadius: 7,
          padding: "8px 12px",
          fontSize: 9,
          color: "#9eb3c8",
          pointerEvents: "none"
        }}
      >
        <span>🔵 COMMAND</span>
        <span>🔴 VICTIM</span>
        <span>🟠 HAZARD</span>
        {mapError && <span style={{ color: "#ff8b8b" }}>API DATA ERROR</span>}
      </div>
    </div>
  );
}

/* =========================================================
   ALERTS
========================================================= */

function AlertsPanel() {

  return (
    <section className="panel">

      <PanelTitle
        title="CRITICAL ALERTS"
        sub="REAL-TIME INCIDENT FEED"
      />

      <div className="alerts">

        <div className="alert criticalAlert">

          <div className="alertIcon">!</div>

          <div className="alertContent">
            <strong>ROAD OBSTRUCTION</strong>
            <span>Sector B · AI Confidence 94%</span>
            <small>2 minutes ago</small>
          </div>

          <Severity value="CRITICAL" />

        </div>

        <div className="alert highAlert">

          <div className="alertIcon">!</div>

          <div className="alertContent">
            <strong>FIRE / SMOKE</strong>
            <span>Sector C · AI Confidence 91%</span>
            <small>5 minutes ago</small>
          </div>

          <Severity value="HIGH" />

        </div>

        <div className="alert mediumAlert">

          <div className="alertIcon">!</div>

          <div className="alertContent">
            <strong>STRUCTURAL DAMAGE</strong>
            <span>Sector A · AI Confidence 87%</span>
            <small>8 minutes ago</small>
          </div>

          <Severity value="HIGH" />

        </div>

        <div className="alert infoAlert">

          <div className="alertIcon">i</div>

          <div className="alertContent">
            <strong>ROUTE UPDATED</strong>
            <span>Emergency path recalculated</span>
            <small>11 minutes ago</small>
          </div>

          <span className="infoText">INFO</span>

        </div>

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

function Detection() {
  const [running, setRunning] = useState(true);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleFile(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;

    if (preview) URL.revokeObjectURL(preview);

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
    setError("");
  }

  async function runDetection() {
    if (!file) {
      setError("Select an image before running YOLO detection.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE}/api/detection`, {
        method: "POST",
        body: formData
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : data?.detail || `Detection failed (${response.status})`
        );
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Detection request failed.");
    } finally {
      setLoading(false);
    }
  }

  const detections = Array.isArray(result)
    ? result
    : Array.isArray(result?.detections)
    ? result.detections
    : Array.isArray(result?.results)
    ? result.results
    : [];

  const getLabel = (item) =>
    item?.label ||
    item?.class_name ||
    item?.class ||
    item?.name ||
    "Object";

  const getConfidence = (item) => {
    const raw =
      item?.confidence ??
      item?.conf ??
      item?.score ??
      item?.probability ??
      0;

    const number = Number(raw);
    if (Number.isNaN(number)) return "0%";

    return `${Math.round(number <= 1 ? number * 100 : number)}%`;
  };

  return (
    <div className="page">
      <div className="pageIntro">
        <div>
          <h2>AI VISION DETECTION</h2>
          <p>
            YOLO-powered object and incident detection pipeline connected to
            the RESQ-OPS backend.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <label className="primaryButton" style={{ cursor: "pointer" }}>
            SELECT IMAGE
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              style={{ display: "none" }}
            />
          </label>

          <button
            className={`primaryButton ${running ? "dangerButton" : ""}`}
            onClick={() => setRunning(!running)}
          >
            {running ? "STOP DETECTION" : "START DETECTION"}
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginBottom: 16,
            padding: "12px 14px",
            borderRadius: 8,
            border: "1px solid rgba(255,83,100,.4)",
            background: "rgba(255,83,100,.08)",
            color: "#ff9aa5",
            fontSize: 12
          }}
        >
          {error}
        </div>
      )}

      <div className="cameraGrid">
        <section className="panel cameraPanel">
          <PanelTitle
            title="LIVE / IMAGE INPUT"
            sub="YOLO INFERENCE SOURCE"
            action={
              <StatusDot status={running ? "ONLINE" : "OFFLINE"} />
            }
          />

          <div className="camera" style={{ position: "relative", overflow: "hidden" }}>
            {preview ? (
              <img
                src={preview}
                alt="Detection input"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block"
                }}
              />
            ) : (
              <>
                <div className="cameraScan" />

                <div className="cameraTarget">
                  <span>WAITING FOR IMAGE</span>
                  <b>—</b>
                </div>

                <div className="cameraCenter">
                  {running ? "LIVE DETECTION READY" : "DETECTION PAUSED"}
                </div>
              </>
            )}

            <div className="cameraMeta">
              <span>YOLO</span>
              <span>BACKEND</span>
              <span>640 × 640</span>
              <span>CONF 0.50</span>
            </div>
          </div>

          <div style={{ padding: "14px 18px", display: "flex", gap: 10 }}>
            <button
              className="primaryButton"
              onClick={runDetection}
              disabled={!file || loading || !running}
            >
              {loading ? "RUNNING YOLO..." : "RUN YOLO DETECTION →"}
            </button>

            {file && (
              <span
                style={{
                  alignSelf: "center",
                  color: "#71879d",
                  fontSize: 11,
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {file.name}
              </span>
            )}
          </div>
        </section>

        <section className="panel">
          <PanelTitle
            title="DETECTION RESULTS"
            sub="BACKEND YOLO RESPONSE"
          />

          <div className="detectionResults">
            {detections.length > 0 ? (
              detections.map((item, index) => {
                const confidence = getConfidence(item);

                return (
                  <div className="detectionResult" key={index}>
                    <div className="detectionName">
                      <span className="detectDot red" />
                      {getLabel(item)}
                    </div>

                    <strong>{confidence}</strong>

                    <Progress value={confidence} />
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  padding: 20,
                  color: "#71879d",
                  fontSize: 12,
                  lineHeight: 1.6
                }}
              >
                {result
                  ? "YOLO returned no detected objects above the configured threshold."
                  : "Select an image and run YOLO detection to see real backend results."}
              </div>
            )}
          </div>

          <div className="detectionSummary">
            <div>
              <span>OBJECTS</span>
              <strong>{detections.length}</strong>
            </div>

            <div>
              <span>ALERTS</span>
              <strong>
                {result?.alerts?.length ??
                  result?.alert_count ??
                  (detections.length ? detections.length : 0)}
              </strong>
            </div>

            <div>
              <span>ENGINE</span>
              <strong>YOLO</strong>
            </div>
          </div>

          {result && typeof result === "object" && !Array.isArray(result) && (
            <div
              style={{
                margin: "0 18px 18px",
                padding: 12,
                borderRadius: 7,
                background: "#0b1621",
                border: "1px solid #1b3044",
                color: "#7f96ab",
                fontSize: 10,
                lineHeight: 1.5
              }}
            >
              Detection response received from RESQ-OPS FastAPI.
              {result.annotated_image && (
                <div style={{ marginTop: 6, color: "#4dafff" }}>
                  Annotated output available.
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   VICTIMS
========================================================= */

function Victims() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`${API_BASE}/api/victims`);
        if (!response.ok) throw new Error();
        const json = await response.json();

        if (!cancelled) {
          setData(Array.isArray(json) ? json : []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const timer = setInterval(load, 10000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const critical = data.filter(
    (v) => String(v.severity).toLowerCase() === "critical"
  ).length;

  const high = data.filter(
    (v) => String(v.severity).toLowerCase() === "high"
  ).length;

  const medium = data.filter(
    (v) => String(v.severity).toLowerCase() === "medium"
  ).length;

  return (
    <div className="page">
      <div className="metrics">
        <Metric label="TOTAL DETECTED" value={String(data.length).padStart(2, "0")} sub="Current mission" />
        <Metric label="CRITICAL" value={String(critical).padStart(2, "0")} sub="Immediate response" accent="red" />
        <Metric label="HIGH PRIORITY" value={String(high).padStart(2, "0")} sub="Priority response" accent="orange" />
        <Metric label="MEDIUM" value={String(medium).padStart(2, "0")} sub="Monitoring" accent="yellow" />
      </div>

      <section className="panel">
        <PanelTitle
          title="VICTIM DETECTION"
          sub="LIVE DATA FROM RESQ-OPS FASTAPI"
        />

        {loading ? (
          <div style={{ padding: 24, color: "#71879d" }}>
            Loading victim data...
          </div>
        ) : (
          <div className="victimGrid">
            {data.map((v) => {
              const confidence =
                v.confidence != null
                  ? Number(v.confidence) <= 1
                    ? `${Math.round(Number(v.confidence) * 100)}%`
                    : `${Math.round(Number(v.confidence))}%`
                  : "—";

              return (
                <div className="victimCard" key={v.id}>
                  <div className="victimTop">
                    <div className="victimAvatar">+</div>

                    <div>
                      <strong>{v.name || `V-${String(v.id).padStart(3, "0")}`}</strong>
                      <span>
                        {Number(v.latitude).toFixed(4)},{" "}
                        {Number(v.longitude).toFixed(4)}
                      </span>
                    </div>

                    <Severity value={String(v.severity || "unknown").toUpperCase()} />
                  </div>

                  <div className="victimData">
                    <div>
                      <span>PEOPLE</span>
                      <strong>{v.people_count ?? "—"}</strong>
                    </div>

                    <div>
                      <span>PRIORITY</span>
                      <strong>{v.priority || "—"}</strong>
                    </div>

                    <div>
                      <span>STATUS</span>
                      <strong>{v.status || "—"}</strong>
                    </div>
                  </div>

                  <Progress value={confidence === "—" ? "0%" : confidence} />

                  <button className="cardAction">
                    OPEN INCIDENT →
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

/* =========================================================
   HAZARDS
========================================================= */

function Hazards() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`${API_BASE}/api/hazards`);
        if (!response.ok) throw new Error();
        const json = await response.json();

        if (!cancelled) {
          setData(Array.isArray(json) ? json : []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const timer = setInterval(load, 10000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const critical = data.filter(
    (h) => String(h.severity).toLowerCase() === "critical"
  ).length;

  const high = data.filter(
    (h) => String(h.severity).toLowerCase() === "high"
  ).length;

  const medium = data.filter(
    (h) => String(h.severity).toLowerCase() === "medium"
  ).length;

  return (
    <div className="page">
      <div className="metrics">
        <Metric label="ACTIVE HAZARDS" value={String(data.length).padStart(2, "0")} sub="Backend data" />
        <Metric label="CRITICAL" value={String(critical).padStart(2, "0")} sub="Immediate action" accent="red" />
        <Metric label="HIGH" value={String(high).padStart(2, "0")} sub="Response required" accent="orange" />
        <Metric label="MEDIUM" value={String(medium).padStart(2, "0")} sub="Monitoring" accent="yellow" />
      </div>

      <section className="panel">
        <PanelTitle
          title="HAZARD MONITORING"
          sub="LIVE DATA FROM RESQ-OPS FASTAPI"
        />

        {loading ? (
          <div style={{ padding: 24, color: "#71879d" }}>
            Loading hazard data...
          </div>
        ) : (
          <div className="incidentGrid">
            {data.map((h) => {
              const confidence =
                h.confidence != null
                  ? Number(h.confidence) <= 1
                    ? `${Math.round(Number(h.confidence) * 100)}%`
                    : `${Math.round(Number(h.confidence))}%`
                  : "—";

              const severity = String(h.severity || "unknown").toUpperCase();

              return (
                <div className="incidentCard" key={h.id}>
                  <div className="incidentTop">
                    <Severity value={severity} />
                    <span className="incidentId">
                      HZ-{String(h.id).padStart(3, "0")}
                    </span>
                  </div>

                  <div className="incidentType">
                    {h.type || "Unknown Hazard"}
                  </div>

                  <div className="incidentLocation">
                    {Number(h.latitude).toFixed(4)},{" "}
                    {Number(h.longitude).toFixed(4)}
                  </div>

                  <div className="incidentInfo">
                    <div className="incidentInfoItem">
                      <span className="incidentInfoLabel">SEVERITY</span>
                      <span className={`incidentInfoValue ${severity.toLowerCase()}`}>
                        {severity}
                      </span>
                    </div>

                    <div className="incidentInfoItem">
                      <span className="incidentInfoLabel">STATUS</span>
                      <span className="incidentInfoValue">
                        {String(h.status || "ACTIVE").toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="confidenceBar">
                    <div
                      className="confidenceFill"
                      style={{
                        width: confidence === "—" ? "0%" : confidence
                      }}
                    />
                  </div>

                  <div className="incidentBottom">
                    <span>
                      RADIUS {h.radius_m != null ? `${h.radius_m}m` : "—"}
                    </span>
                    <span>{confidence} CONFIDENCE</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

/* =========================================================
   DRONES
========================================================= */

function Drones() {

  return (
    <div className="page">

      <div className="metrics">

        <Metric label="TOTAL DRONES" value="04" sub="Registered assets" />
        <Metric label="ACTIVE" value="02" sub="Currently deployed" accent="green" />
        <Metric label="STANDBY" value="01" sub="Ready for deployment" accent="cyan" />
        <Metric label="CHARGING" value="01" sub="Base station" accent="yellow" />

      </div>

      <section className="panel">

        <PanelTitle
          title="DRONE FLEET"
          sub="AUTONOMOUS AERIAL RESPONSE UNITS"
        />

        <div className="droneGrid">

          {drones.map((drone) => (

            <div className="droneCard" key={drone[0]}>

              <div className="droneVisual">
                <div className="droneBody">◆</div>
                <div className="droneWing left" />
                <div className="droneWing right" />
              </div>

              <div className="droneHeader">

                <div>
                  <strong>{drone[0]}</strong>
                  <span>{drone[1]}</span>
                </div>

                <StatusDot status={drone[2]} />

              </div>

              <div className="droneInfo">

                <div>
                  <span>LOCATION</span>
                  <strong>{drone[3]}</strong>
                </div>

                <div>
                  <span>BATTERY</span>
                  <strong>{drone[4]}</strong>
                </div>

                <div>
                  <span>DISTANCE</span>
                  <strong>{drone[5]}</strong>
                </div>

              </div>

              <Progress value={drone[4]} />

            </div>

          ))}

        </div>

      </section>

    </div>
  );
}

/* =========================================================
   ROUTES
========================================================= */

function Routes() {

  const [selected, setSelected] = useState(routes[0]);

  return (
    <div className="page">

      <div className="routeLayout">

        <section className="panel">

          <PanelTitle
            title="ROUTE OPTIMIZATION"
            sub="A* / DIJKSTRA EMERGENCY PATH ANALYSIS"
          />

          <CommandMap large />

        </section>

        <section className="panel">

          <PanelTitle
            title="RECOMMENDED ROUTES"
            sub="CALCULATED RESPONSE PATHS"
          />

          <div className="routeList">

            {routes.map((route) => (

              <button
                key={route.id}
                className={`routeOption ${
                  selected.id === route.id ? "selected" : ""
                }`}
                onClick={() => setSelected(route)}
              >

                <div className="routeTop">

                  <strong>{route.name}</strong>

                  <span className="routeStatus">
                    {route.status}
                  </span>

                </div>

                <div className="routePath">
                  {route.from}
                  <span>→</span>
                  {route.to}
                </div>

                <div className="routeDetails">

                  <div>
                    <span>DISTANCE</span>
                    <strong>{route.distance}</strong>
                  </div>

                  <div>
                    <span>ETA</span>
                    <strong>{route.eta}</strong>
                  </div>

                </div>

              </button>

            ))}

          </div>

          <div className="selectedRoute">

            <span>SELECTED ROUTE</span>
            <strong>{selected.id}</strong>

            <p>
              {selected.name} is currently selected for
              emergency response deployment.
            </p>

            <button className="primaryButton">
              DEPLOY ROUTE
            </button>

          </div>

        </section>

      </div>

    </div>
  );
}

/* =========================================================
   COVERAGE
========================================================= */

function Coverage() {

  const coverage = [
    ["Sector A", 92],
    ["Sector B", 87],
    ["Sector C", 76],
    ["Sector D", 64],
    ["Sector E", 48]
  ];

  return (
    <div className="page">

      <div className="metrics">

        <Metric label="TOTAL COVERAGE" value="78%" sub="Operational area" />
        <Metric label="SECTOR A" value="92%" sub="Full surveillance" accent="green" />
        <Metric label="SECTOR B" value="87%" sub="Active mission" accent="cyan" />
        <Metric label="SECTOR D" value="64%" sub="Needs coverage" accent="yellow" />

      </div>

      <div className="pageGrid">

        <section className="panel">

          <PanelTitle
            title="AREA COVERAGE"
            sub="SURVEILLANCE AND RESPONSE COVERAGE"
          />

          <CommandMap large />

        </section>

        <section className="panel">

          <PanelTitle
            title="SECTOR COVERAGE"
            sub="CURRENT SENSOR AVAILABILITY"
          />

          <div className="coverageList">

            {coverage.map(([name, value]) => (

              <div className="coverageItem" key={name}>

                <div className="coverageTop">
                  <strong>{name}</strong>
                  <span>{value}%</span>
                </div>

                <Progress value={`${value}%`} />

              </div>

            ))}

          </div>

        </section>

      </div>

    </div>
  );
}

/* =========================================================
   RESQ AI
========================================================= */

function ResqAI() {

  const [question, setQuestion] = useState("");

  const [messages, setMessages] = useState([
    {
      role: "ai",
      text:
        "RESQ AI online. I can analyze incidents, victims, hazards, routes and emergency protocols."
    }
  ]);

  function sendMessage() {

    if (!question.trim()) return;

    const userMessage = {
      role: "user",
      text: question
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");

    fetch(`${API_BASE}/api/ai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question: question.trim() })
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.detail || "RESQ AI request failed");
        }

        const answer =
          data?.answer ||
          data?.response ||
          data?.message ||
          data?.text ||
          "RESQ AI returned no textual response.";

        setMessages((prev) => [
          ...prev,
          { role: "ai", text: answer }
        ]);
      })
      .catch((error) => {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: `RESQ AI connection error: ${error.message}`
          }
        ]);
      });
  }

  return (
    <div className="page">

      <div className="aiLayout">

        <section className="panel aiChat">

          <PanelTitle
            title="RESQ AI"
            sub="TACTICAL INTELLIGENCE ASSISTANT"
          />

          <div className="messages">

            {messages.map((message, index) => (

              <div
                key={index}
                className={`messageRow ${message.role}`}
              >

                <div className="messageAvatar">
                  {message.role === "ai" ? "AI" : "OP"}
                </div>

                <div className="message">
                  {message.text}
                </div>

              </div>

            ))}

          </div>

          <div className="chatInput">

            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="Ask RESQ AI about the current operation..."
            />

            <button onClick={sendMessage}>
              SEND →
            </button>

          </div>

        </section>

        <section className="panel">

          <PanelTitle
            title="AI CONTEXT"
            sub="CURRENT OPERATIONAL DATA"
          />

          <div className="contextList">

            <div>
              <span>MISSION</span>
              <strong>Emergency Response</strong>
            </div>

            <div>
              <span>PRIORITY</span>
              <strong>Sector B</strong>
            </div>

            <div>
              <span>HAZARDS</span>
              <strong>04 active</strong>
            </div>

            <div>
              <span>VICTIMS</span>
              <strong>04 detected</strong>
            </div>

            <div>
              <span>ROUTE</span>
              <strong>RT-001</strong>
            </div>

          </div>

        </section>

      </div>

    </div>
  );
}

/* =========================================================
   SIMULATION
========================================================= */

function Simulation() {

  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(42);

  function runSimulation() {

    setRunning(true);
    setProgress(0);

    let value = 0;

    const timer = setInterval(() => {

      value += 10;
      setProgress(value);

      if (value >= 100) {
        clearInterval(timer);
        setRunning(false);
      }

    }, 300);
  }

  return (
    <div className="page">

      <div className="simulationGrid">

        <section className="panel">

          <PanelTitle
            title="MISSION SIMULATION"
            sub="TEST RESPONSE STRATEGIES"
          />

          <div className="simulationControls">

            <label>
              SCENARIO
              <select>
                <option>Multi-Hazard Emergency</option>
                <option>Urban Fire Response</option>
                <option>Flood Evacuation</option>
                <option>Mass Casualty Event</option>
              </select>
            </label>

            <label>
              RESPONSE UNITS
              <select>
                <option>Full Fleet</option>
                <option>Ground Units Only</option>
                <option>Drones Only</option>
              </select>
            </label>

            <button
              className="primaryButton"
              onClick={runSimulation}
              disabled={running}
            >
              {running ? "SIMULATION RUNNING..." : "RUN SIMULATION"}
            </button>

          </div>

        </section>

        <section className="panel">

          <PanelTitle
            title="SIMULATION STATUS"
            sub="LIVE MODEL EXECUTION"
          />

          <div className="simulationVisual">

            <div className="simulationCircle">
              <strong>{progress}%</strong>
              <span>COMPLETE</span>
            </div>

            <div className="simulationSteps">

              <div className={progress >= 20 ? "done" : ""}>
                <span>01</span>
                Incident Detection
              </div>

              <div className={progress >= 40 ? "done" : ""}>
                <span>02</span>
                Threat Assessment
              </div>

              <div className={progress >= 60 ? "done" : ""}>
                <span>03</span>
                Route Optimization
              </div>

              <div className={progress >= 80 ? "done" : ""}>
                <span>04</span>
                Unit Deployment
              </div>

              <div className={progress >= 100 ? "done" : ""}>
                <span>05</span>
                Mission Complete
              </div>

            </div>

          </div>

        </section>

      </div>

    </div>
  );
}

/* =========================================================
   REPORTS
========================================================= */

function Reports() {

  const reports = [
    ["MISSION-001", "Emergency Response", "03 Oct 2026", "ACTIVE"],
    ["INCIDENT-027", "Hazard Detection", "03 Oct 2026", "COMPLETE"],
    ["ROUTE-014", "Route Analysis", "03 Oct 2026", "COMPLETE"],
    ["DRONE-009", "Aerial Survey", "02 Oct 2026", "COMPLETE"]
  ];

  return (
    <div className="page">

      <section className="panel">

        <PanelTitle
          title="OPERATIONAL REPORTS"
          sub="MISSION AND INCIDENT RECORDS"
          action={
            <button className="smallButton">
              EXPORT REPORT
            </button>
          }
        />

        <div className="reportGrid">

          {reports.map((report) => (

            <div className="reportCard" key={report[0]}>

              <div className="reportIcon">
                ▤
              </div>

              <div className="reportMain">
                <strong>{report[0]}</strong>
                <span>{report[1]}</span>
                <small>{report[2]}</small>
              </div>

              <span
                className={`reportStatus ${report[3].toLowerCase()}`}
              >
                {report[3]}
              </span>

              <button className="reportAction">
                VIEW →
              </button>

            </div>

          ))}

        </div>

      </section>

    </div>
  );
}

/* =========================================================
   SYSTEM HEALTH
========================================================= */

function Health() {

  const systems = [
    ["FastAPI Backend", "ONLINE", "24 ms"],
    ["Database", "ONLINE", "8 ms"],
    ["YOLO Detection", "ONLINE", "32 FPS"],
    ["RESQ AI", "ONLINE", "Ready"],
    ["WebSocket", "ONLINE", "Connected"],
    ["Route Engine", "ONLINE", "Operational"],
    ["Drone Gateway", "ONLINE", "4 devices"],
    ["Storage", "ONLINE", "68% available"]
  ];

  return (
    <div className="page">

      <div className="metrics">

        <Metric
          label="SYSTEM STATUS"
          value="ONLINE"
          sub="All services operational"
          accent="green"
        />

        <Metric
          label="UPTIME"
          value="99.9%"
          sub="Last 30 days"
          accent="cyan"
        />

        <Metric
          label="API LATENCY"
          value="24ms"
          sub="Average"
        />

        <Metric
          label="CPU"
          value="38%"
          sub="Current utilization"
          accent="yellow"
        />

      </div>

      <section className="panel">

        <PanelTitle
          title="SYSTEM HEALTH"
          sub="SERVICE STATUS MONITOR"
        />

        <div className="healthGrid">

          {systems.map((system) => (

            <div className="healthCard" key={system[0]}>

              <div className="healthIcon">
                ✓
              </div>

              <div className="healthMain">

                <strong>{system[0]}</strong>

                <span>
                  {system[2]}
                </span>

              </div>

              <StatusDot status={system[1]} />

            </div>

          ))}

        </div>

      </section>

    </div>
  );
}

/* =========================================================
   APP
========================================================= */

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

      case "health":
        return <Health />;

      default:
        return <Overview setPage={setPage} />;

    }

  }, [page]);

  return (

    <div className="app">

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