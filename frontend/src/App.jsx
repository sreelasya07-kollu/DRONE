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

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
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
      const response = await fetch(`${API_BASE}/api/detection`, { method: "POST", body: formData });
      const type = response.headers.get("content-type") || "";
      const data = type.includes("application/json") ? await response.json() : await response.text();
      if (!response.ok) throw new Error(typeof data === "string" ? data : data?.detail || `Detection failed (${response.status})`);
      setResult(data);
    } catch (err) {
      setError(err.message || "Detection request failed.");
    } finally {
      setLoading(false);
    }
  }

  const detections = Array.isArray(result) ? result :
    Array.isArray(result?.detections) ? result.detections :
    Array.isArray(result?.results) ? result.results : [];

  const label = item => item?.label || item?.class_name || item?.class || item?.name || "Object";
  const confidence = item => {
    const n = Number(item?.confidence ?? item?.conf ?? item?.score ?? item?.probability ?? 0);
    return Number.isNaN(n) ? "0%" : `${Math.round(n <= 1 ? n * 100 : n)}%`;
  };

  return (
    <div className="page opsEnhanced">
      <div className="opsPageHero">
        <div>
          <span className="opsEyebrow">COMPUTER VISION / YOLO INFERENCE</span>
          <h2>Live AI Detection</h2>
          <p>Convert field imagery into machine-detected operational objects and alerts.</p>
        </div>
        <StatusDot status={running ? "ONLINE" : "OFFLINE"} />
      </div>

      <div className="metrics opsMetrics">
        <Metric label="ENGINE" value="YOLO" sub="Computer vision" accent="cyan" />
        <Metric label="INPUT" value={file ? "READY" : "WAIT"} sub="Image / field frame" />
        <Metric label="DETECTIONS" value={String(detections.length).padStart(2,"0")} sub="Current inference" accent="orange" />
        <Metric label="STATE" value={loading ? "RUN" : running ? "READY" : "PAUSED"} sub="Inference status" accent={loading ? "red" : "green"} />
      </div>

      {error && <div className="opsError">{error}</div>}

      <div className="opsCommandGrid detectionOpsGrid">
        <section className="panel opsCameraPanel">
          <PanelTitle title="VISION WORKSPACE" sub="FIELD IMAGE / CAMERA FRAME" />
          <div className="opsCamera">
            {preview ? (
              <img src={preview} alt="Detection input" />
            ) : (
              <div className="opsCameraEmpty">
                <div className="cameraGlyph">◉</div>
                <strong>{running ? "WAITING FOR FIELD IMAGE" : "DETECTION PAUSED"}</strong>
                <span>Select an image to start AI analysis.</span>
              </div>
            )}
            {loading && <div className="opsScanLine" />}
            <div className="opsCameraTag">YOLO // {loading ? "PROCESSING" : running ? "STANDBY" : "OFFLINE"}</div>
          </div>

          <div className="opsActionBar">
            <label className="primaryButton opsFileButton">
              SELECT IMAGE
              <input type="file" accept="image/*" onChange={handleFile} />
            </label>
            <button className="primaryButton" onClick={runDetection} disabled={!file || loading || !running}>
              {loading ? "RUNNING YOLO…" : "RUN YOLO DETECTION →"}
            </button>
            <button className="smallButton" onClick={() => setRunning(v => !v)}>
              {running ? "PAUSE" : "START"}
            </button>
          </div>
        </section>

        <div className="opsSideStack">
          <section className="panel">
            <PanelTitle title="DETECTION RESULTS" sub="BACKEND YOLO RESPONSE" />
            <div className="opsDetectionList">
              {detections.length ? detections.map((item,index) => (
                <div className="opsDetectionRow" key={index}>
                  <div className="opsEntityIcon detection">◉</div>
                  <div className="opsEntityText">
                    <strong>{label(item)}</strong>
                    <span>AI confidence {confidence(item)}</span>
                  </div>
                  <span className="opsConfidence">{confidence(item)}</span>
                </div>
              )) : (
                <div className="opsEmpty">{result ? "No objects detected above the configured threshold." : "Run YOLO to populate live detections."}</div>
              )}
            </div>
          </section>

          <section className="panel">
            <PanelTitle title="AI INTERPRETATION" sub="OPERATIONAL CONVERSION LAYER" />
            <div className="opsAssessment">
              <div className="aiBadge">AI</div>
              <div>
                <strong>Evidence-first detection pipeline</strong>
                <p>Visual detections can be correlated with victim, hazard and route data before dispatch.</p>
              </div>
            </div>
          </section>
        </div>
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
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("ALL");

  async function load() {
    try {
      const response = await fetch(`${API_BASE}/api/victims`);
      if (!response.ok) throw new Error("Victim API unavailable");
      const json = await response.json();
      setData(Array.isArray(json) ? json : []);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, []);

  const filtered = data.filter(v =>
    filter === "ALL" ||
    String(v.severity || "").toUpperCase() === filter
  );

  const active = selected || filtered[0];
  const critical = data.filter(v => String(v.severity).toLowerCase() === "critical").length;
  const high = data.filter(v => String(v.severity).toLowerCase() === "high").length;
  const people = data.reduce((sum, v) => sum + Number(v.people_count || 0), 0);

  return (
    <div className="page opsEnhanced">
      <div className="opsPageHero">
        <div>
          <span className="opsEyebrow">FIELD INTELLIGENCE / LIVE INCIDENTS</span>
          <h2>Victim Operations</h2>
          <p>Live victim locations, priority classification and dispatch context.</p>
        </div>
        <div className="opsHeroStatus">
          <StatusDot status="ONLINE" />
          <button className="smallButton" onClick={load}>↻ REFRESH</button>
        </div>
      </div>

      <div className="metrics opsMetrics">
        <Metric label="TOTAL VICTIMS" value={String(data.length).padStart(2,"0")} sub="Live incident records" />
        <Metric label="CRITICAL" value={String(critical).padStart(2,"0")} sub="Immediate response" accent="red" />
        <Metric label="HIGH PRIORITY" value={String(high).padStart(2,"0")} sub="Dispatch queue" accent="orange" />
        <Metric label="PEOPLE AFFECTED" value={String(people).padStart(2,"0")} sub="Estimated count" accent="cyan" />
      </div>

      <div className="opsCommandGrid">
        <section className="panel opsMapPanel">
          <PanelTitle title="VICTIM LOCATION INTELLIGENCE" sub="LIVE OPERATIONAL MAP · SELECT A MARKER TO INSPECT" />
          <CommandMap large />
        </section>

        <div className="opsSideStack">
          <section className="panel">
            <PanelTitle title="PRIORITY QUEUE" sub="SORTED BY INCIDENT SEVERITY" />
            <div className="opsFilters">
              {["ALL","CRITICAL","HIGH","MEDIUM"].map(x => (
                <button key={x} className={filter === x ? "opsFilter active" : "opsFilter"} onClick={() => setFilter(x)}>
                  {x}
                </button>
              ))}
            </div>

            <div className="opsLiveList">
              {loading ? <div className="opsEmpty">Loading live victim feed…</div> :
               filtered.length === 0 ? <div className="opsEmpty">No victims match this filter.</div> :
               filtered.map(v => (
                <button key={v.id} className={`opsLiveRow ${active?.id === v.id ? "selected" : ""}`} onClick={() => setSelected(v)}>
                  <div className={`opsEntityIcon ${String(v.severity).toLowerCase()}`}>+</div>
                  <div className="opsEntityText">
                    <strong>{v.name || `V-${String(v.id).padStart(3,"0")}`}</strong>
                    <span>{v.people_count || 0} people · {v.status || "DETECTED"}</span>
                  </div>
                  <Severity value={String(v.severity || "UNKNOWN").toUpperCase()} />
                </button>
              ))}
            </div>
          </section>

          <section className="panel">
            <PanelTitle title="SELECTED INCIDENT" sub={active ? `V-${String(active.id).padStart(3,"0")} · INCIDENT DETAIL` : "SELECT A VICTIM"} />
            {active ? (
              <div className="opsDetailGrid">
                <div><span>SEVERITY</span><strong>{String(active.severity || "—").toUpperCase()}</strong></div>
                <div><span>PRIORITY</span><strong>{active.priority || "—"}</strong></div>
                <div><span>PEOPLE</span><strong>{active.people_count ?? "—"}</strong></div>
                <div><span>STATUS</span><strong>{String(active.status || "—").toUpperCase()}</strong></div>
                <div className="wide"><span>LOCATION</span><strong>{active.latitude}, {active.longitude}</strong></div>
                <div className="wide"><span>SOURCE</span><strong>{active.source || "FIELD / AI"}</strong></div>
              </div>
            ) : <div className="opsEmpty">Select an incident from the priority queue.</div>}
          </section>
        </div>
      </div>

      <section className="panel">
        <PanelTitle title="RESPONSE CONTEXT" sub="CURRENT VICTIM RECORDS" />
        <div className="opsContextStrip">
          {data.map(v => (
            <div className="opsContextCard" key={v.id}>
              <strong>{v.name || `Victim ${v.id}`}</strong>
              <span>{String(v.severity || "").toUpperCase()} · {v.people_count || 0} people</span>
              <small>{v.latitude}, {v.longitude}</small>
            </div>
          ))}
        </div>
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
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("ALL");

  async function load() {
    try {
      const response = await fetch(`${API_BASE}/api/hazards`);
      if (!response.ok) throw new Error("Hazard API unavailable");
      const json = await response.json();
      setData(Array.isArray(json) ? json : []);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, []);

  const filtered = data.filter(h =>
    filter === "ALL" ||
    String(h.severity || "").toUpperCase() === filter
  );
  const active = selected || filtered[0];
  const critical = data.filter(h => String(h.severity).toLowerCase() === "critical").length;
  const high = data.filter(h => String(h.severity).toLowerCase() === "high").length;
  const radius = Math.round(data.reduce((sum,h) => sum + Number(h.radius_m || 0), 0));

  return (
    <div className="page opsEnhanced">
      <div className="opsPageHero">
        <div>
          <span className="opsEyebrow">THREAT ENVIRONMENT / RISK ZONES</span>
          <h2>Hazard Operations</h2>
          <p>Live hazard zones, severity classification and route-impact intelligence.</p>
        </div>
        <div className="opsHeroStatus">
          <StatusDot status="ONLINE" />
          <button className="smallButton" onClick={load}>↻ REFRESH</button>
        </div>
      </div>

      <div className="metrics opsMetrics">
        <Metric label="ACTIVE HAZARDS" value={String(data.length).padStart(2,"0")} sub="Live risk objects" />
        <Metric label="CRITICAL ZONES" value={String(critical).padStart(2,"0")} sub="Immediate restriction" accent="red" />
        <Metric label="HIGH RISK" value={String(high).padStart(2,"0")} sub="Response required" accent="orange" />
        <Metric label="ZONE FOOTPRINT" value={`${radius}m`} sub="Combined radius" accent="yellow" />
      </div>

      <div className="opsCommandGrid">
        <section className="panel opsMapPanel">
          <PanelTitle title="THREAT ENVIRONMENT MAP" sub="LIVE HAZARD MARKERS + AFFECTED ZONES" />
          <CommandMap large />
        </section>

        <div className="opsSideStack">
          <section className="panel">
            <PanelTitle title="ACTIVE THREATS" sub="CURRENT HAZARD QUEUE" />
            <div className="opsFilters">
              {["ALL","CRITICAL","HIGH","MEDIUM"].map(x => (
                <button key={x} className={filter === x ? "opsFilter active" : "opsFilter"} onClick={() => setFilter(x)}>{x}</button>
              ))}
            </div>
            <div className="opsLiveList">
              {loading ? <div className="opsEmpty">Loading hazard feed…</div> :
               filtered.length === 0 ? <div className="opsEmpty">No threats match this filter.</div> :
               filtered.map(h => (
                <button key={h.id} className={`opsLiveRow ${active?.id === h.id ? "selected" : ""}`} onClick={() => setSelected(h)}>
                  <div className="opsEntityIcon hazard">!</div>
                  <div className="opsEntityText">
                    <strong>{h.type || "Unknown Hazard"}</strong>
                    <span>{h.status || "ACTIVE"} · radius {h.radius_m || 0}m</span>
                  </div>
                  <Severity value={String(h.severity || "UNKNOWN").toUpperCase()} />
                </button>
              ))}
            </div>
          </section>

          <section className="panel">
            <PanelTitle title="THREAT ASSESSMENT" sub={active ? `HZ-${String(active.id).padStart(3,"0")} · SELECTED` : "SELECT A THREAT"} />
            {active ? (
              <div className="opsDetailGrid">
                <div><span>TYPE</span><strong>{active.type}</strong></div>
                <div><span>SEVERITY</span><strong>{String(active.severity || "—").toUpperCase()}</strong></div>
                <div><span>STATUS</span><strong>{String(active.status || "—").toUpperCase()}</strong></div>
                <div><span>RADIUS</span><strong>{active.radius_m || 0} m</strong></div>
                <div className="wide"><span>LOCATION</span><strong>{active.latitude}, {active.longitude}</strong></div>
                <div className="wide"><span>DESCRIPTION</span><strong>{active.description || "No additional description."}</strong></div>
              </div>
            ) : <div className="opsEmpty">Select a threat from the queue or map.</div>}
          </section>
        </div>
      </div>

      <section className="panel">
        <PanelTitle title="THREAT REGISTER" sub="OPERATIONAL RISK OBJECTS" />
        <div className="opsContextStrip">
          {data.map(h => (
            <div className="opsContextCard threat" key={h.id}>
              <Severity value={String(h.severity || "").toUpperCase()} />
              <strong>{h.type}</strong>
              <span>{h.radius_m || 0}m affected radius</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


/* =========================================================
   DRONES
========================================================= */

function Drones() {
  const [selected, setSelected] = useState("DR-01");
  const active = drones.filter(d => d[2] === "ACTIVE").length;
  const avg = Math.round(drones.reduce((s,d) => s + parseInt(d[4],10), 0) / drones.length);
  const selectedDrone = drones.find(d => d[0] === selected) || drones[0];

  return (
    <div className="page opsEnhanced">
      <div className="opsPageHero">
        <div>
          <span className="opsEyebrow">AERIAL SURVEILLANCE / FLEET COMMAND</span>
          <h2>Drone Operations</h2>
          <p>Fleet readiness, aerial coverage and mission telemetry.</p>
        </div>
        <StatusDot status="ONLINE" />
      </div>

      <div className="metrics opsMetrics">
        <Metric label="FLEET" value="04" sub="Registered aircraft" />
        <Metric label="ACTIVE" value={`0${active}`} sub="Currently deployed" accent="green" />
        <Metric label="AVG BATTERY" value={`${avg}%`} sub="Fleet average" accent="cyan" />
        <Metric label="MISSION READY" value="87%" sub="Operational readiness" accent="yellow" />
      </div>

      <div className="opsCommandGrid">
        <section className="panel opsMapPanel">
          <PanelTitle title="AERIAL OPERATIONS MAP" sub="FLEET POSITIONS / RESPONSE FOOTPRINT" />
          <CommandMap large />
        </section>

        <section className="panel">
          <PanelTitle title="FLEET TELEMETRY" sub="SELECT AN AIRCRAFT" />
          <div className="opsLiveList">
            {drones.map(d => (
              <button key={d[0]} className={`opsLiveRow ${selected === d[0] ? "selected" : ""}`} onClick={() => setSelected(d[0])}>
                <div className="opsEntityIcon drone">✦</div>
                <div className="opsEntityText">
                  <strong>{d[0]} · {d[1]}</strong>
                  <span>{d[3]} · {d[4]} battery · {d[5]}</span>
                </div>
                <StatusDot status={d[2]} />
              </button>
            ))}
          </div>

          <div className="opsDroneDetail">
            <span>SELECTED AIRCRAFT</span>
            <strong>{selectedDrone[0]} · {selectedDrone[1]}</strong>
            <div className="opsDetailGrid">
              <div><span>STATUS</span><strong>{selectedDrone[2]}</strong></div>
              <div><span>SECTOR</span><strong>{selectedDrone[3]}</strong></div>
              <div><span>BATTERY</span><strong>{selectedDrone[4]}</strong></div>
              <div><span>RANGE</span><strong>{selectedDrone[5]}</strong></div>
            </div>
          </div>
        </section>
      </div>

      <section className="panel">
        <PanelTitle title="MISSION ASSIGNMENT" sub="CURRENT AERIAL TASKING" />
        <div className="opsTable">
          <div className="opsTableHead"><span>UNIT</span><span>SECTOR</span><span>MISSION</span><span>STATE</span></div>
          {drones.map(d => (
            <div className="opsTableRow" key={d[0]}>
              <span><strong>{d[0]}</strong> {d[1]}</span>
              <span>{d[3]}</span>
              <span>{d[2] === "ACTIVE" ? "SURVEILLANCE" : "STANDBY / SUPPORT"}</span>
              <span><StatusDot status={d[2]} /></span>
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
    <div className="page opsEnhanced">
      <div className="opsPageHero">
        <div>
          <span className="opsEyebrow">PATHFINDING / A* / DIJKSTRA</span>
          <h2>Response Routes</h2>
          <p>Emergency corridors, route status and hazard-aware dispatch paths.</p>
        </div>
        <StatusDot status="ONLINE" />
      </div>

      <div className="metrics opsMetrics">
        <Metric label="ACTIVE ROUTES" value="03" sub="Calculated paths" />
        <Metric label="FASTEST ETA" value="06m" sub="Primary response" accent="green" />
        <Metric label="ROUTE BLOCKERS" value="04" sub="Hazards considered" accent="red" />
        <Metric label="ALGORITHM" value="A*" sub="Graph search" accent="cyan" />
      </div>

      <div className="opsCommandGrid">
        <section className="panel opsMapPanel">
          <PanelTitle title="ROUTE COMMAND MAP" sub="EMERGENCY CORRIDORS / INCIDENT TARGETS" />
          <CommandMap large />
        </section>

        <section className="panel">
          <PanelTitle title="CALCULATED ROUTES" sub="SELECT A PATH FOR DISPATCH DETAILS" />
          <div className="opsRouteList">
            {routes.map(route => (
              <button key={route.id} className={`opsRouteRow ${selected.id === route.id ? "selected" : ""}`} onClick={() => setSelected(route)}>
                <div className="routeNumber">{route.id.replace("RT-","")}</div>
                <div className="opsEntityText">
                  <strong>{route.name}</strong>
                  <span>{route.from} → {route.to} · {route.distance}</span>
                </div>
                <div className="routeEta">{route.eta}</div>
              </button>
            ))}
          </div>

          <div className="opsRouteAssessment">
            <span>SELECTED ROUTE</span>
            <strong>{selected.id} · {selected.status}</strong>
            <p>{selected.from} → {selected.to}</p>
            <div className="opsDetailGrid">
              <div><span>DISTANCE</span><strong>{selected.distance}</strong></div>
              <div><span>ETA</span><strong>{selected.eta}</strong></div>
            </div>
            <button className="primaryButton">DEPLOY ROUTE →</button>
          </div>
        </section>
      </div>

      <section className="panel">
        <PanelTitle title="ROUTE SAFETY CHECK" sub="DISPATCH VALIDATION" />
        <div className="opsContextStrip">
          <div className="opsContextCard"><strong>✓ HAZARDS</strong><span>Included in route assessment</span></div>
          <div className="opsContextCard"><strong>✓ PRIORITY</strong><span>Victim severity considered</span></div>
          <div className="opsContextCard"><strong>✓ ALTERNATIVE</strong><span>Secondary corridor available</span></div>
        </div>
      </section>
    </div>
  );
}


/* =========================================================
   COVERAGE
========================================================= */

function Coverage() {
  const coverage = [
    ["Sector A", 92, "SECURE", "4 units"],
    ["Sector B", 87, "PRIORITY", "7 units"],
    ["Sector C", 76, "WATCH", "3 units"],
    ["Sector D", 64, "GAP", "2 units"],
    ["Sector E", 48, "GAP", "0 units"]
  ];
  const avg = Math.round(coverage.reduce((s,x) => s + x[1], 0) / coverage.length);

  return (
    <div className="page opsEnhanced">
      <div className="opsPageHero">
        <div>
          <span className="opsEyebrow">SENSOR GRID / RESPONSE FOOTPRINT</span>
          <h2>Coverage Operations</h2>
          <p>Surveillance reach, response presence and operational gaps.</p>
        </div>
        <StatusDot status="ONLINE" />
      </div>

      <div className="metrics opsMetrics">
        <Metric label="OVERALL COVERAGE" value={`${avg}%`} sub="Across active sectors" accent="cyan" />
        <Metric label="SECURE SECTOR" value="01" sub="Full operational reach" accent="green" />
        <Metric label="COVERAGE GAPS" value="02" sub="Needs additional assets" accent="red" />
        <Metric label="UNITS DEPLOYED" value="16" sub="Ground + aerial" accent="yellow" />
      </div>

      <div className="opsCommandGrid">
        <section className="panel opsMapPanel">
          <PanelTitle title="COVERAGE MAP" sub="SURVEILLANCE AND RESPONSE FOOTPRINT" />
          <CommandMap large />
        </section>

        <section className="panel">
          <PanelTitle title="SECTOR COVERAGE" sub="CURRENT SENSOR AVAILABILITY" />
          <div className="coverageOpsList">
            {coverage.map(([name,value,state,units]) => (
              <div className="coverageOpsRow" key={name}>
                <div className="coverageOpsTop">
                  <strong>{name}</strong>
                  <span>{value}%</span>
                </div>
                <Progress value={`${value}%`} />
                <div className="coverageOpsMeta"><span>{units}</span><span>{state}</span></div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="panel">
        <PanelTitle title="COVERAGE PRIORITIES" sub="AREAS WHERE ADDITIONAL ASSETS WOULD IMPROVE VISIBILITY" />
        <div className="opsPriorityStrip">
          <div><strong>01</strong><b>Sector E</b><span>48% coverage · aerial surveillance required</span></div>
          <div><strong>02</strong><b>Sector D</b><span>64% coverage · maintain drone watch</span></div>
          <div><strong>03</strong><b>Sector C</b><span>76% coverage · monitor incident load</span></div>
        </div>
      </section>
    </div>
  );
}


/* =========================================================
   RESQ AI
========================================================= */

function ResqAI() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "RESQ AI online. I can analyze incidents, victims, hazards, routes and emergency protocols." }
  ]);
  const [loading, setLoading] = useState(false);

  async function sendMessage(textOverride) {
    const text = (textOverride ?? question).trim();
    if (!text) return;
    setMessages(prev => [...prev, { role: "user", text }]);
    setQuestion("");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.detail || "RESQ AI request failed");
      const answer = data?.answer || data?.response || data?.message || data?.text || "RESQ AI returned no textual response.";
      setMessages(prev => [...prev, { role: "ai", text: answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "ai", text: `RESQ AI connection error: ${error.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page opsEnhanced">
      <div className="opsPageHero">
        <div>
          <span className="opsEyebrow">DECISION SUPPORT / RAG INTELLIGENCE</span>
          <h2>RESQ AI</h2>
          <p>Context-aware operational intelligence across incidents, hazards and routes.</p>
        </div>
        <StatusDot status={loading ? "BUSY" : "ONLINE"} />
      </div>

      <div className="metrics opsMetrics">
        <Metric label="MODE" value="RAG" sub="Grounded intelligence" accent="cyan" />
        <Metric label="CONTEXT" value="LIVE" sub="Operational records" accent="green" />
        <Metric label="ROUTING" value="A*" sub="Dispatch layer" accent="yellow" />
        <Metric label="STATE" value={loading ? "THINK" : "READY"} sub="Assistant status" accent="blue" />
      </div>

      <div className="aiLayout opsAIGrid">
        <section className="panel aiChat">
          <PanelTitle title="OPERATIONAL ASSESSMENT" sub="AI RESPONSE / CURRENT MISSION CONTEXT" />
          <div className="messages opsMessages">
            {messages.map((message,index) => (
              <div key={index} className={`messageRow ${message.role}`}>
                <div className="messageAvatar">{message.role === "ai" ? "AI" : "OP"}</div>
                <div className="message">{message.text}</div>
              </div>
            ))}
          </div>
          <div className="chatInput">
            <input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => { if(e.key === "Enter") sendMessage(); }} placeholder="Ask RESQ AI about the current operation…" />
            <button onClick={() => sendMessage()} disabled={loading}>{loading ? "ANALYSING…" : "SEND →"}</button>
          </div>
        </section>

        <section className="panel">
          <PanelTitle title="AI CONTEXT" sub="CURRENT OPERATIONAL DATA" />
          <div className="contextList">
            <div><span>MISSION</span><strong>Emergency Response</strong></div>
            <div><span>PRIORITY</span><strong>Sector B</strong></div>
            <div><span>HAZARDS</span><strong>04 active</strong></div>
            <div><span>VICTIMS</span><strong>04 detected</strong></div>
            <div><span>ROUTE</span><strong>RT-001 · A*</strong></div>
          </div>
          <div className="aiQuickPrompts">
            {["Summarise the current threat picture","Which victims are highest priority?","Explain the primary response route"].map(q => (
              <button key={q} onClick={() => sendMessage(q)}>{q}</button>
            ))}
          </div>
        </section>
      </div>

      <section className="panel">
        <PanelTitle title="GROUNDING SOURCES" sub="DATA AVAILABLE TO RESQ AI" />
        <div className="opsContextStrip">
          <div className="opsContextCard"><strong>VICTIMS</strong><span>Live FastAPI records</span></div>
          <div className="opsContextCard"><strong>HAZARDS</strong><span>Live threat zones</span></div>
          <div className="opsContextCard"><strong>ROUTES</strong><span>A* / Dijkstra layer</span></div>
          <div className="opsContextCard"><strong>MAP</strong><span>OpenStreetMap context</span></div>
        </div>
      </section>
    </div>
  );
}


/* =========================================================
   SIMULATION
========================================================= */

function Simulation() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          setRunning(false);
          return 100;
        }
        return p + 5;
      });
    }, 250);
    return () => clearInterval(timer);
  }, [running]);

  return (
    <div className="page opsEnhanced">
      <div className="opsPageHero">
        <div>
          <span className="opsEyebrow">DIGITAL TWIN / RESPONSE EXERCISE</span>
          <h2>Mission Simulation</h2>
          <p>Test detection, routing, hazards and response sequencing before deployment.</p>
        </div>
        <StatusDot status={running ? "RUNNING" : "READY"} />
      </div>

      <div className="metrics opsMetrics">
        <Metric label="SCENARIO" value="01" sub="Multi-hazard emergency" />
        <Metric label="SIMULATION" value={`${progress}%`} sub="Scenario completion" accent="cyan" />
        <Metric label="UNITS" value="16" sub="Available assets" accent="green" />
        <Metric label="EVENTS" value={String(Math.floor(progress/10)+4)} sub="Generated events" accent="orange" />
      </div>

      <div className="opsCommandGrid">
        <section className="panel opsMapPanel">
          <PanelTitle title="SIMULATION THEATRE" sub="SCENARIO MAP / OPERATIONAL STATE" />
          <CommandMap large />
        </section>

        <section className="panel">
          <PanelTitle title="EXERCISE CONTROL" sub="SCENARIO EXECUTION" />
          <div className="simulationOpsControls">
            <div className="simScenarioBox">
              <span>SCENARIO</span>
              <strong>Multi-Hazard Emergency</strong>
              <small>Urban response / live map model</small>
            </div>
            <button className="primaryButton" onClick={() => { if(progress >= 100) setProgress(0); setRunning(true); }} disabled={running}>
              {running ? "SIMULATION RUNNING…" : "▶ START SIMULATION"}
            </button>
            <button className="smallButton" onClick={() => { setRunning(false); setProgress(0); }}>↺ RESET</button>
            <Progress value={`${progress}%`} />
            <div className="simClock"><span>SCENARIO PROGRESS</span><strong>{progress}%</strong></div>
          </div>
        </section>
      </div>

      <section className="panel">
        <PanelTitle title="EVENT TIMELINE" sub="GENERATED OPERATIONAL EVENTS" />
        <div className="opsTimeline">
          {[
            "Command centre initialised",
            "Flood hazard expanded in Sector B",
            "Victim priority queue updated",
            "A* response route recalculated",
            "Drone surveillance dispatched",
            "Evacuation corridor opened"
          ].slice(0, Math.max(2, Math.min(6, Math.floor(progress/15)+2))).map((event,i) => (
            <div key={event}><span>{String(i+1).padStart(2,"0")}</span><i /><strong>{event}</strong></div>
          ))}
        </div>
      </section>
    </div>
  );
}


/* =========================================================
   REPORTS
========================================================= */

function Reports() {
  const [victimData, setVictimData] = useState([]);
  const [hazardData, setHazardData] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/victims`).then(r => r.ok ? r.json() : []),
      fetch(`${API_BASE}/api/hazards`).then(r => r.ok ? r.json() : [])
    ]).then(([v,h]) => {
      setVictimData(Array.isArray(v) ? v : []);
      setHazardData(Array.isArray(h) ? h : []);
    }).catch(() => {});
  }, []);

  function exportReport() {
    const payload = {
      generated_at: new Date().toISOString(),
      platform: "RESQ-OPS",
      victims: victimData,
      hazards: hazardData
    };
    const blob = new Blob([JSON.stringify(payload,null,2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resq-ops-operational-report.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page opsEnhanced">
      <div className="opsPageHero">
        <div>
          <span className="opsEyebrow">MISSION RECORDS / ANALYTICS</span>
          <h2>Mission Reports</h2>
          <p>Operational performance, incident summaries and exportable mission evidence.</p>
        </div>
        <button className="primaryButton" onClick={exportReport}>↓ EXPORT REPORT</button>
      </div>

      <div className="metrics opsMetrics">
        <Metric label="MISSION READINESS" value="92%" sub="Current operation" accent="green" />
        <Metric label="RESPONSE ETA" value="06m" sub="Primary corridor" accent="cyan" />
        <Metric label="VICTIMS" value={String(victimData.length).padStart(2,"0")} sub="Live records" accent="red" />
        <Metric label="HAZARDS" value={String(hazardData.length).padStart(2,"0")} sub="Active records" accent="orange" />
      </div>

      <div className="opsCommandGrid reportsOpsGrid">
        <section className="panel">
          <PanelTitle title="MISSION PERFORMANCE" sub="CURRENT OPERATIONAL INDICATORS" />
          <div className="reportBarsOps">
            {[
              ["Detection coverage",88],
              ["Response coordination",92],
              ["Route availability",96],
              ["Aerial surveillance",84],
              ["Incident closure",79]
            ].map(([label,value]) => (
              <div key={label}><div><span>{label}</span><strong>{value}%</strong></div><Progress value={`${value}%`} /></div>
            ))}
          </div>
        </section>
        <section className="panel">
          <PanelTitle title="EXECUTIVE SUMMARY" sub="CURRENT OPERATIONAL PICTURE" />
          <div className="opsSummary">
            <strong>RESQ-OPS MISSION STATUS</strong>
            <p>The command platform is receiving live victim and hazard data. Priority incidents remain visible while routing and AI decision support are available for response coordination.</p>
            <div><b>{victimData.length}</b><span>victims</span><b>{hazardData.length}</b><span>hazards</span><b>04</b><span>drones</span></div>
          </div>
        </section>
      </div>

      <section className="panel">
        <PanelTitle title="INCIDENT REGISTER" sub="CURRENT RECORDS INCLUDED IN THE REPORT" />
        <div className="opsTable">
          <div className="opsTableHead"><span>ID</span><span>TYPE</span><span>SEVERITY</span><span>STATUS</span></div>
          {[
            ...victimData.map(v => ({id:`V-${v.id}`,type:"VICTIM",severity:v.severity,status:v.status || "DETECTED"})),
            ...hazardData.map(h => ({id:`HZ-${h.id}`,type:h.type,severity:h.severity,status:h.status || "ACTIVE"}))
          ].map(r => (
            <div className="opsTableRow" key={r.id}>
              <span><strong>{r.id}</strong></span><span>{r.type}</span>
              <span><Severity value={String(r.severity || "").toUpperCase()} /></span>
              <span>{String(r.status).toUpperCase()}</span>
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
  const [health, setHealth] = useState(null);
  const [checked, setChecked] = useState("—");

  async function load() {
    try {
      const response = await fetch(`${API_BASE}/api/health`);
      const data = await response.json();
      setHealth(response.ok ? data : null);
    } catch {
      setHealth(null);
    }
    setChecked(new Date().toLocaleTimeString());
  }

  useEffect(() => {
    load();
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, []);

  const systems = [
    ["FastAPI Backend", !!health, "API /api/health"],
    ["YOLO Detection", !!health?.yolo_available, "Computer vision engine"],
    ["Database", !!health, "SQLite operational store"],
    ["Map Layer", true, "OpenStreetMap / Leaflet"],
    ["Frontend", true, "React command interface"],
    ["Route Engine", true, "A* / Dijkstra layer"]
  ];

  return (
    <div className="page opsEnhanced">
      <div className="opsPageHero">
        <div>
          <span className="opsEyebrow">PLATFORM STATUS / TELEMETRY</span>
          <h2>System Health</h2>
          <p>Live service availability and platform readiness.</p>
        </div>
        <button className="smallButton" onClick={load}>↻ RUN HEALTH CHECK</button>
      </div>

      <div className="metrics opsMetrics">
        <Metric label="PLATFORM" value={health ? "ONLINE" : "OFFLINE"} sub={health ? "Core API reachable" : "Backend unavailable"} accent={health ? "green" : "red"} />
        <Metric label="YOLO" value={health?.yolo_available ? "READY" : "CHECK"} sub="Detection engine" accent="cyan" />
        <Metric label="API VERSION" value={health?.version || "—"} sub="Backend release" />
        <Metric label="LAST CHECK" value={checked} sub="Auto refresh 10s" accent="yellow" />
      </div>

      <section className="panel">
        <PanelTitle title="SERVICE STATUS" sub="LIVE PLATFORM MONITOR" />
        <div className="healthOpsGrid">
          {systems.map(([name,ok,sub]) => (
            <div className={`healthOpsCard ${ok ? "ok" : "bad"}`} key={name}>
              <div className="healthOpsIcon">{ok ? "✓" : "!"}</div>
              <div><strong>{name}</strong><span>{sub}</span></div>
              <StatusDot status={ok ? "ONLINE" : "OFFLINE"} />
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <PanelTitle title="BACKEND RESPONSE" sub="LATEST /api/health PAYLOAD" />
        <pre className="healthCodeOps">{JSON.stringify(health || {status:"offline"}, null, 2)}</pre>
      </section>
    </div>
  );
}



const EXTRA_CSS = `
.opsEnhanced { max-width: 100%; }
.opsPageHero {
  display:flex; align-items:flex-end; justify-content:space-between; gap:20px;
  margin-bottom:18px; padding:2px 2px 4px;
}
.opsPageHero h2 { margin:6px 0 5px; font-size:25px; letter-spacing:.02em; }
.opsPageHero p { margin:0; color:#7890a5; font-size:12px; line-height:1.5; }
.opsEyebrow { color:#3fb8ff; font-size:9px; font-weight:800; letter-spacing:.15em; }
.opsHeroStatus { display:flex; align-items:center; gap:12px; }
.opsMetrics { grid-template-columns:repeat(4,minmax(0,1fr)); }
.opsCommandGrid {
  display:grid; grid-template-columns:minmax(0,1.65fr) minmax(330px,.85fr);
  gap:16px; align-items:stretch; margin-bottom:16px;
}
.opsMapPanel { min-width:0; }
.opsSideStack { display:flex; flex-direction:column; gap:16px; min-width:0; }
.opsFilters { display:flex; gap:6px; padding:0 16px 12px; flex-wrap:wrap; }
.opsFilter {
  border:1px solid #1d3449; background:#0a1724; color:#718ba0; border-radius:5px;
  padding:7px 10px; font-size:9px; font-weight:800; letter-spacing:.06em; cursor:pointer;
}
.opsFilter.active { color:#4ebcff; border-color:#287fae; background:#0d2536; }
.opsLiveList { display:flex; flex-direction:column; gap:6px; padding:0 12px 14px; }
.opsLiveRow {
  width:100%; display:flex; align-items:center; gap:10px; text-align:left;
  padding:11px; border:1px solid transparent; border-radius:7px;
  background:#081522; color:#d7e5f0; cursor:pointer;
}
.opsLiveRow:hover,.opsLiveRow.selected { border-color:#245b7d; background:#0b1d2c; }
.opsEntityIcon {
  width:30px; height:30px; flex:0 0 30px; display:grid; place-items:center;
  border-radius:7px; background:#132b3e; color:#48baff; font-weight:900;
}
.opsEntityIcon.critical { background:#3a1820; color:#ff6474; }
.opsEntityIcon.high { background:#392515; color:#ffad52; }
.opsEntityIcon.medium { background:#393217; color:#e7c85b; }
.opsEntityIcon.hazard { color:#ffad52; background:#352617; }
.opsEntityIcon.drone { color:#68d1ff; background:#102b3d; }
.opsEntityIcon.detection { color:#ff6171; background:#321822; }
.opsEntityText { min-width:0; flex:1; display:flex; flex-direction:column; gap:3px; }
.opsEntityText strong { font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.opsEntityText span { font-size:9px; color:#71879b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.opsDetailGrid {
  display:grid; grid-template-columns:1fr 1fr; gap:1px; margin:0 16px 16px;
  border:1px solid #182d40; border-radius:7px; overflow:hidden;
}
.opsDetailGrid > div { padding:12px; background:#081521; min-height:52px; }
.opsDetailGrid .wide { grid-column:1/-1; }
.opsDetailGrid span { display:block; color:#60788e; font-size:8px; font-weight:800; letter-spacing:.1em; margin-bottom:5px; }
.opsDetailGrid strong { display:block; color:#dcebf5; font-size:11px; line-height:1.4; }
.opsEmpty { padding:22px 16px; color:#647c91; font-size:11px; line-height:1.5; }
.opsContextStrip {
  display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:8px; padding:0 16px 16px;
}
.opsContextCard {
  display:flex; flex-direction:column; gap:5px; padding:13px; min-height:76px;
  border:1px solid #182f42; background:#081521; border-radius:7px;
}
.opsContextCard strong { color:#dceaf4; font-size:10px; }
.opsContextCard span,.opsContextCard small { color:#6e8599; font-size:9px; }
.opsContextCard.threat { border-left:2px solid #ff9d3d; }
.opsError {
  margin-bottom:15px; padding:11px 13px; border:1px solid #67303a; border-radius:7px;
  background:#28151a; color:#ff9ba6; font-size:11px;
}
.opsCameraPanel { min-width:0; }
.opsCamera {
  height:490px; margin:0 16px; position:relative; overflow:hidden; border:1px solid #203a50;
  border-radius:8px; background:#040d15; display:flex; align-items:center; justify-content:center;
}
.opsCamera img { width:100%; height:100%; object-fit:contain; display:block; }
.opsCameraEmpty { display:flex; flex-direction:column; align-items:center; gap:8px; color:#6c8498; }
.opsCameraEmpty strong { color:#9fb6c9; font-size:11px; letter-spacing:.08em; }
.opsCameraEmpty span { font-size:10px; }
.cameraGlyph { width:52px; height:52px; display:grid; place-items:center; border:1px solid #24536e; border-radius:50%; color:#42b9ff; font-size:25px; box-shadow:0 0 28px rgba(49,174,241,.15); }
.opsCameraTag {
  position:absolute; top:10px; left:10px; padding:6px 9px; border:1px solid #25445a;
  background:rgba(5,16,26,.88); color:#4ebcff; border-radius:4px; font-size:8px; font-weight:800; letter-spacing:.1em;
}
.opsScanLine {
  position:absolute; left:0; right:0; top:0; height:2px; background:#38b9ff;
  box-shadow:0 0 15px #38b9ff; animation:resqScan 1.7s linear infinite;
}
@keyframes resqScan { 0%{top:8%} 100%{top:92%} }
.opsActionBar { display:flex; align-items:center; gap:8px; padding:14px 16px; flex-wrap:wrap; }
.opsFileButton { position:relative; overflow:hidden; display:inline-flex; align-items:center; }
.opsFileButton input { position:absolute; inset:0; opacity:0; cursor:pointer; }
.opsDetectionList { display:flex; flex-direction:column; gap:6px; padding:0 12px 14px; }
.opsDetectionRow {
  display:flex; align-items:center; gap:10px; padding:11px; border:1px solid #182d40;
  border-radius:7px; background:#081521;
}
.opsConfidence { color:#48bdff; font-size:11px; font-weight:800; }
.opsAssessment { display:flex; gap:12px; padding:0 16px 16px; }
.opsAssessment > div:last-child { flex:1; }
.opsAssessment strong { display:block; color:#dceaf4; font-size:12px; margin-bottom:5px; }
.opsAssessment p { color:#70889b; font-size:10px; line-height:1.6; margin:0; }
.opsDroneDetail { margin:8px 16px 16px; padding:13px; background:#081521; border:1px solid #1a3245; border-radius:7px; }
.opsDroneDetail > span { color:#60788e; font-size:8px; letter-spacing:.1em; font-weight:800; }
.opsDroneDetail > strong { display:block; margin:6px 0 12px; color:#dceaf4; font-size:12px; }
.opsRouteList { display:flex; flex-direction:column; gap:6px; padding:0 12px 12px; }
.opsRouteRow {
  display:flex; align-items:center; gap:10px; width:100%; padding:12px; text-align:left;
  border:1px solid #182d40; background:#081521; color:#dceaf4; border-radius:7px; cursor:pointer;
}
.opsRouteRow.selected { border-color:#2c78a3; background:#0b1f2f; }
.routeNumber { width:30px; height:30px; display:grid; place-items:center; border-radius:6px; background:#102d41; color:#43b9ff; font-size:9px; font-weight:900; }
.routeEta { margin-left:auto; color:#55c7ff; font-size:12px; font-weight:900; }
.opsRouteAssessment { margin:4px 16px 16px; padding:14px; border:1px solid #1d374c; border-radius:7px; background:#091824; }
.opsRouteAssessment > span { display:block; color:#60788e; font-size:8px; font-weight:800; letter-spacing:.1em; }
.opsRouteAssessment > strong { display:block; color:#dceaf4; margin:6px 0; font-size:12px; }
.opsRouteAssessment p { color:#7890a4; font-size:10px; margin:0 0 12px; }
.coverageOpsList { padding:0 16px 16px; }
.coverageOpsRow { padding:12px 0; border-bottom:1px solid #14283a; }
.coverageOpsTop,.coverageOpsMeta { display:flex; justify-content:space-between; align-items:center; }
.coverageOpsTop strong { color:#dceaf4; font-size:11px; }
.coverageOpsTop span { color:#46baff; font-weight:900; font-size:11px; }
.coverageOpsMeta { margin-top:6px; color:#657d91; font-size:8px; letter-spacing:.05em; }
.opsPriorityStrip { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; padding:0 16px 16px; }
.opsPriorityStrip > div { display:grid; grid-template-columns:auto 1fr; column-gap:9px; padding:13px; background:#081521; border:1px solid #182f42; border-radius:7px; }
.opsPriorityStrip strong { grid-row:1/3; color:#2f9dd4; font-size:20px; }
.opsPriorityStrip b { color:#dceaf4; font-size:11px; }
.opsPriorityStrip span { color:#70879a; font-size:9px; margin-top:4px; }
.opsAIGrid { gap:16px; }
.opsMessages { min-height:410px; max-height:520px; overflow:auto; }
.aiQuickPrompts { display:flex; flex-direction:column; gap:6px; padding:0 16px 16px; }
.aiQuickPrompts button { text-align:left; padding:9px 10px; border:1px solid #1a3448; background:#091824; color:#7892a7; border-radius:5px; font-size:9px; cursor:pointer; }
.aiQuickPrompts button:hover { color:#48baff; border-color:#2c6c91; }
.simulationOpsControls { display:flex; flex-direction:column; gap:12px; padding:0 16px 16px; }
.simScenarioBox { padding:14px; border:1px solid #1b3347; background:#081521; border-radius:7px; }
.simScenarioBox span,.simClock span { display:block; color:#60788e; font-size:8px; letter-spacing:.1em; font-weight:800; }
.simScenarioBox strong { display:block; color:#dceaf4; margin:6px 0 4px; font-size:12px; }
.simScenarioBox small { color:#6f879a; font-size:9px; }
.simClock { display:flex; justify-content:space-between; align-items:end; }
.simClock strong { color:#4dbbff; font-size:22px; }
.opsTimeline { padding:0 16px 16px; display:flex; flex-direction:column; }
.opsTimeline > div { display:grid; grid-template-columns:35px 18px 1fr; align-items:center; min-height:42px; }
.opsTimeline > div > span { color:#4bbaff; font-size:9px; font-weight:800; }
.opsTimeline i { width:7px; height:7px; border-radius:50%; background:#2d9bd0; box-shadow:0 0 8px rgba(45,155,208,.5); position:relative; }
.opsTimeline i:after { content:""; position:absolute; left:3px; top:7px; width:1px; height:35px; background:#1d3547; }
.opsTimeline > div:last-child i:after { display:none; }
.opsTimeline strong { color:#9fb5c6; font-size:10px; }
.reportBarsOps { padding:0 16px 16px; display:flex; flex-direction:column; gap:16px; }
.reportBarsOps > div > div:first-child { display:flex; justify-content:space-between; margin-bottom:6px; }
.reportBarsOps span { color:#7d94a7; font-size:10px; }
.reportBarsOps strong { color:#dceaf4; font-size:10px; }
.opsSummary { padding:0 16px 16px; }
.opsSummary > strong { color:#dceaf4; font-size:12px; }
.opsSummary p { color:#71889b; font-size:10px; line-height:1.65; margin:9px 0 15px; }
.opsSummary > div { display:flex; gap:7px; align-items:baseline; flex-wrap:wrap; }
.opsSummary b { color:#4bbaff; font-size:18px; }
.opsSummary span { color:#647c90; font-size:9px; margin-right:10px; }
.opsTable { margin:0 16px 16px; border:1px solid #192f42; border-radius:7px; overflow:hidden; }
.opsTableHead,.opsTableRow { display:grid; grid-template-columns:1fr 1.5fr 1fr 1fr; gap:10px; align-items:center; }
.opsTableHead { padding:9px 12px; background:#0b1a28; color:#5f778b; font-size:8px; font-weight:800; letter-spacing:.08em; }
.opsTableRow { padding:11px 12px; border-top:1px solid #13283a; color:#8097a9; font-size:9px; }
.opsTableRow strong { color:#dceaf4; }
.healthOpsGrid { display:grid; grid-template-columns:1fr 1fr; gap:8px; padding:0 16px 16px; }
.healthOpsCard { display:flex; align-items:center; gap:10px; padding:13px; border:1px solid #183144; background:#081521; border-radius:7px; }
.healthOpsCard.bad { border-color:#5d2a33; }
.healthOpsIcon { width:30px; height:30px; display:grid; place-items:center; border-radius:50%; background:#103527; color:#4fe39a; font-weight:900; }
.healthOpsCard.bad .healthOpsIcon { background:#351820; color:#ff6576; }
.healthOpsCard > div:nth-child(2) { flex:1; display:flex; flex-direction:column; gap:4px; }
.healthOpsCard strong { color:#dceaf4; font-size:10px; }
.healthOpsCard span { color:#6d8498; font-size:8px; }
.healthCodeOps { margin:0 16px 16px; padding:14px; overflow:auto; background:#050d15; border:1px solid #182d40; border-radius:7px; color:#62c3ff; font-size:10px; line-height:1.55; }
@media (max-width:1100px) {
  .opsCommandGrid { grid-template-columns:1fr; }
  .opsMetrics { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .opsContextStrip,.opsPriorityStrip { grid-template-columns:1fr 1fr; }
}
@media (max-width:700px) {
  .opsPageHero { align-items:flex-start; flex-direction:column; }
  .opsMetrics,.opsContextStrip,.opsPriorityStrip,.healthOpsGrid { grid-template-columns:1fr; }
  .opsTableHead,.opsTableRow { grid-template-columns:1fr 1fr; }
  .opsTableHead span:nth-child(n+3),.opsTableRow span:nth-child(n+3) { display:none; }
  .opsCamera { height:360px; }
}
`;

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

      <style>{EXTRA_CSS}</style>

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