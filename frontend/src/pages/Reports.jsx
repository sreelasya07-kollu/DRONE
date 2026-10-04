import { useEffect, useMemo, useState } from "react";

import {
  FileText,
  Download,
  ShieldCheck,
  Activity,
  Clock,
  Users,
  Radio,
  AlertTriangle,
  Plane,
  Route,
  Target,
  MapPin,
  CheckCircle,
  BrainCircuit
} from "lucide-react";

import api from "../services/api";

export default function Reports() {
  const [victims, setVictims] = useState([]);
  const [hazards, setHazards] = useState([]);
  const [drones, setDrones] = useState([]);
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [
        victimData,
        hazardData,
        droneData,
        operations
      ] = await Promise.all([
        api.victims(),
        api.hazards(),
        api.drones(),
        api.operationsMap()
      ]);

      setVictims(
        Array.isArray(victimData)
          ? victimData
          : victimData?.data || []
      );

      setHazards(
        Array.isArray(hazardData)
          ? hazardData
          : hazardData?.data || []
      );

      setDrones(
        Array.isArray(droneData)
          ? droneData
          : droneData?.data || []
      );

      setMapData(operations);
    } catch (error) {
      console.error("Report data error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    const timer = setInterval(load, 10000);

    return () => clearInterval(timer);
  }, []);

  const rescued = useMemo(
    () =>
      victims.filter((v) =>
        ["rescued", "resolved", "safe"].includes(
          String(v.status || "").toLowerCase()
        )
      ).length,
    [victims]
  );

  const criticalVictims = useMemo(
    () =>
      victims.filter(
        (v) =>
          String(v.priority || "")
            .toLowerCase() === "critical"
      ),
    [victims]
  );

  const highVictims = useMemo(
    () =>
      victims.filter(
        (v) =>
          String(v.priority || "")
            .toLowerCase() === "high"
      ),
    [victims]
  );

  const totalPeople = victims.reduce(
    (sum, v) =>
      sum + Number(v.people_count || 0),
    0
  );

  const onlineDrones = drones.filter((d) =>
    ["active", "available"].includes(
      String(d.status || "").toLowerCase()
    )
  ).length;

  const standbyDrones = drones.filter(
    (d) =>
      String(d.status || "").toLowerCase() ===
      "standby"
  ).length;

  const resolutionRate = victims.length
    ? Math.round(
        (rescued / victims.length) * 100
      )
    : 0;

  const route = mapData?.route;
  const destination = mapData?.route_destination;

  const generateReport = (type) => {
    const report = {
      system: "RESQ-OPS",
      report_type: type,
      mission_status: "ACTIVE",

      operational_summary: {
        threat_level:
          mapData?.system?.threat_level ||
          "CRITICAL",
        victims_tracked: victims.length,
        people_at_risk: totalPeople,
        critical_cases: criticalVictims.length,
        high_priority_cases: highVictims.length,
        rescued_or_resolved: rescued,
        active_hazards: hazards.length,
        uav_assets: drones.length,
        uav_operational: onlineDrones
      },

      current_response_target:
        destination || null,

      route_intelligence:
        route || null,

      victims,

      hazards,

      drones,

      generated_at:
        new Date().toISOString()
    };

    const blob = new Blob(
      [JSON.stringify(report, null, 2)],
      {
        type: "application/json"
      }
    );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;

    a.download =
      `RESQ-OPS-${type
        .toLowerCase()
        .replaceAll(" ", "-")}.json`;

    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div>

      {/* HEADER */}

      <div className="page-header">

        <div>

          <div className="eyebrow">
            OPERATIONS / MISSION REPORTING
          </div>

          <h1>Mission Reports</h1>

          <p>
            Comprehensive operational reporting generated
            from current RESQ-OPS field intelligence.
          </p>

        </div>

        <div className="ai-status">
          <ShieldCheck size={16} />
          REPORTING SYSTEM ONLINE
        </div>

      </div>

      {/* EXECUTIVE METRICS */}

      <div className="opsPriorityGrid">

        <ReportMetric
          label="MISSION STATUS"
          value="ACTIVE"
          sub="Emergency operation"
        />

        <ReportMetric
          label="VICTIMS / PEOPLE"
          value={
            loading
              ? "--"
              : `${victims.length} / ${totalPeople}`
          }
          sub="Cases / persons tracked"
        />

        <ReportMetric
          label="CRITICAL CASES"
          value={
            loading
              ? "--"
              : criticalVictims.length
          }
          sub="Immediate attention"
        />

        <ReportMetric
          label="THREAT LEVEL"
          value={
            mapData?.system?.threat_level ||
            "CRITICAL"
          }
          sub={`${hazards.length} active hazards`}
        />

      </div>

      {/* EXECUTIVE SUMMARY */}

      <div
        className="panel"
        style={{ marginTop: 18 }}
      >

        <div className="panel-header">

          <div>
            <h2>
              Operational Situation Report
            </h2>

            <span>
              EXECUTIVE MISSION SUMMARY
            </span>
          </div>

          <FileText size={19} />

        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4,1fr)",
            gap: 14
          }}
        >

          <SituationCard
            icon={<Users size={18} />}
            label="Victim Cases"
            value={victims.length}
            text={`${criticalVictims.length} critical priority`}
          />

          <SituationCard
            icon={<AlertTriangle size={18} />}
            label="Threat Zones"
            value={hazards.length}
            text="Active hazards monitored"
          />

          <SituationCard
            icon={<Plane size={18} />}
            label="UAV Network"
            value={`${onlineDrones}/${drones.length}`}
            text={`${standbyDrones} standby`}
          />

          <SituationCard
            icon={<Activity size={18} />}
            label="Resolution"
            value={`${resolutionRate}%`}
            text={`${rescued} cases resolved`}
          />

        </div>

      </div>

      {/* TWO COLUMN REPORT */}

      <div
        className="two-column-layout"
        style={{ marginTop: 18 }}
      >

        {/* THREAT ASSESSMENT */}

        <div className="panel">

          <div className="panel-header">

            <div>
              <h2>Threat Assessment</h2>
              <span>
                CURRENT OPERATIONAL RISKS
              </span>
            </div>

            <AlertTriangle size={19} />

          </div>

          <div className="report-section-row">
            <span>Overall threat level</span>

            <strong>
              {mapData?.system?.threat_level ||
                "CRITICAL"}
            </strong>
          </div>

          <div className="report-section-row">
            <span>Critical victims</span>
            <strong>
              {criticalVictims.length}
            </strong>
          </div>

          <div className="report-section-row">
            <span>High-priority victims</span>
            <strong>
              {highVictims.length}
            </strong>
          </div>

          <div className="report-section-row">
            <span>Active hazards</span>
            <strong>
              {hazards.length}
            </strong>
          </div>

          <div className="report-section-row">
            <span>People requiring assistance</span>
            <strong>
              {totalPeople}
            </strong>
          </div>

        </div>

        {/* RESPONSE PERFORMANCE */}

        <div className="panel">

          <div className="panel-header">

            <div>
              <h2>Response Performance</h2>

              <span>
                MISSION TELEMETRY
              </span>
            </div>

            <Activity size={19} />

          </div>

          <ReportProgress
            label="Victim resolution"
            value={resolutionRate}
          />

          <ReportProgress
            label="UAV operational availability"
            value={
              drones.length
                ? Math.round(
                    (onlineDrones /
                      drones.length) *
                      100
                  )
                : 0
            }
          />

          <ReportProgress
            label="Critical case response"
            value={
              victims.length
                ? Math.round(
                    (criticalVictims.length /
                      victims.length) *
                      100
                  )
                : 0
            }
          />

        </div>

      </div>

      {/* VICTIM REPORT */}

      <div
        className="panel"
        style={{ marginTop: 18 }}
      >

        <div className="panel-header">

          <div>
            <h2>Victim Intelligence</h2>

            <span>
              PRIORITY DISTRIBUTION
            </span>
          </div>

          <Target size={19} />

        </div>

        <div className="reportTable">

          <div className="reportTableHeader">
            <span>CASE</span>
            <span>PRIORITY</span>
            <span>PERSONS</span>
            <span>STATUS</span>
            <span>ASSESSMENT</span>
          </div>

          {victims
            .slice()
            .sort(
              (a, b) =>
                Number(b.priority_score || 0) -
                Number(a.priority_score || 0)
            )
            .map((victim) => (
              <div
                className="reportTableRow"
                key={victim.id}
              >
                <strong>
                  {victim.name}
                </strong>

                <span>
                  {victim.priority}
                </span>

                <span>
                  {victim.people_count}
                </span>

                <span>
                  {String(
                    victim.status || ""
                  ).toUpperCase()}
                </span>

                <span>
                  {victim.notes || "No additional notes"}
                </span>
              </div>
            ))}

        </div>

      </div>

      {/* HAZARDS + UAV */}

      <div
        className="two-column-layout"
        style={{ marginTop: 18 }}
      >

        <div className="panel">

          <div className="panel-header">

            <div>
              <h2>Hazard Intelligence</h2>
              <span>
                ACTIVE FIELD THREATS
              </span>
            </div>

            <AlertTriangle size={19} />

          </div>

          {hazards.map((hazard) => (
            <div
              key={hazard.id}
              className="report-card"
              style={{ marginBottom: 10 }}
            >

              <strong>
                {hazard.type}
              </strong>

              <p>
                {hazard.description}
              </p>

              <div className="coverageMeta">
                <span>
                  Severity:{" "}
                  {hazard.severity}
                </span>

                <span>
                  Radius:{" "}
                  {hazard.radius_m}m
                </span>

                <span>
                  {String(
                    hazard.status
                  ).toUpperCase()}
                </span>
              </div>

            </div>
          ))}

        </div>

        <div className="panel">

          <div className="panel-header">

            <div>
              <h2>UAV Deployment</h2>

              <span>
                FIELD ASSET STATUS
              </span>
            </div>

            <Radio size={19} />

          </div>

          {drones.map((drone) => (
            <div
              key={drone.id}
              className="report-section-row"
            >

              <span>
                <Plane
                  size={14}
                  style={{
                    marginRight: 7
                  }}
                />

                {drone.name}
              </span>

              <strong>
                {String(
                  drone.status
                ).toUpperCase()}{" "}
                • {drone.battery}%
              </strong>

            </div>
          ))}

        </div>

      </div>

      {/* ROUTE INTELLIGENCE */}

      <div
        className="panel"
        style={{ marginTop: 18 }}
      >

        <div className="panel-header">

          <div>
            <h2>Response Route Intelligence</h2>

            <span>
              ACTIVE ROUTE ANALYSIS
            </span>
          </div>

          <Route size={19} />

        </div>

        {destination ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4,1fr)",
              gap: 14
            }}
          >

            <SituationCard
              icon={<Target size={18} />}
              label="Destination"
              value={destination.name}
              text="Current response target"
            />

            <SituationCard
              icon={<MapPin size={18} />}
              label="Distance"
              value={`${route?.distance_km || "--"} km`}
              text="Calculated road distance"
            />

            <SituationCard
              icon={<Clock size={18} />}
              label="ETA"
              value={`${route?.duration_minutes || "--"} min`}
              text="Estimated travel time"
            />

            <SituationCard
              icon={<Route size={18} />}
              label="Provider"
              value={
                route?.provider || "OSRM"
              }
              text="Routing engine"
            />

          </div>
        ) : (
          <div className="empty-state">
            No active response route.
          </div>
        )}

      </div>

      {/* AI SUMMARY */}

      <div
        className="panel"
        style={{ marginTop: 18 }}
      >

        <div className="panel-header">

          <div>
            <h2>AI Mission Assessment</h2>

            <span>
              DECISION SUPPORT SUMMARY
            </span>
          </div>

          <BrainCircuit size={19} />

        </div>

        <div
          style={{
            padding: 18,
            borderRadius: 10,
            background:
              "rgba(56,189,248,.045)",
            border:
              "1px solid rgba(56,189,248,.14)"
          }}
        >

          <strong>
            Current operational assessment
          </strong>

          <p
            style={{
              marginBottom: 0,
              opacity: .72,
              lineHeight: 1.7
            }}
          >
            RESQ-OPS is tracking{" "}
            <strong>
              {victims.length} victim cases
            </strong>{" "}
            involving{" "}
            <strong>
              {totalPeople} people
            </strong>
            . There are{" "}
            <strong>
              {criticalVictims.length} critical-priority
              cases
            </strong>{" "}
            and{" "}
            <strong>
              {hazards.length} active hazard zones
            </strong>
            . The UAV network currently has{" "}
            <strong>
              {onlineDrones} operational assets
            </strong>
            . The active response route is directed
            toward{" "}
            <strong>
              {destination?.name || "the highest-priority case"}
            </strong>
            .
          </p>

        </div>

      </div>

      {/* EXPORT */}

      <div
        className="panel"
        style={{ marginTop: 18 }}
      >

        <div className="panel-header">

          <div>
            <h2>Mission Documentation</h2>

            <span>
              EXPORT OPERATIONAL RECORDS
            </span>
          </div>

          <Download size={19} />

        </div>

        <div className="report-grid">

          <ReportAction
            icon={<FileText size={20} />}
            title="Complete Mission Report"
            text="Export the complete operational picture including victims, hazards, UAVs, route intelligence and mission status."
            onClick={() =>
              generateReport(
                "Complete Mission Report"
              )
            }
          />

          <ReportAction
            icon={<AlertTriangle size={20} />}
            title="Incident Report"
            text="Export an incident-focused report containing critical cases, hazards and immediate response information."
            onClick={() =>
              generateReport(
                "Incident Report"
              )
            }
          />

          <ReportAction
            icon={<BrainCircuit size={20} />}
            title="AI Intelligence Report"
            text="Export the current AI-support context and response intelligence for operational review."
            onClick={() =>
              generateReport(
                "AI Intelligence Report"
              )
            }
          />

        </div>

      </div>

    </div>
  );
}

function ReportMetric({
  label,
  value,
  sub
}) {
  return (
    <div className="metric-card">

      <div className="metric-label">
        {label}
      </div>

      <div className="metric-value">
        {value}
      </div>

      <div className="metric-sub">
        {sub}
      </div>

    </div>
  );
}

function SituationCard({
  icon,
  label,
  value,
  text
}) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 10,
        background:
          "rgba(255,255,255,.025)",
        border:
          "1px solid rgba(120,160,200,.12)"
      }}
    >

      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          opacity: .65,
          fontSize: 12
        }}
      >
        {icon}
        {label}
      </div>

      <div
        style={{
          marginTop: 10,
          fontSize: 20,
          fontWeight: 700
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: 5,
          fontSize: 11,
          opacity: .5
        }}
      >
        {text}
      </div>

    </div>
  );
}

function ReportProgress({
  label,
  value
}) {
  return (
    <div style={{ marginBottom: 18 }}>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 7
        }}
      >
        <span>{label}</span>

        <strong>
          {value}%
        </strong>
      </div>

      <div className="coverage-bar">
        <div
          style={{
            width: `${value}%`
          }}
        />
      </div>

    </div>
  );
}

function ReportAction({
  icon,
  title,
  text,
  onClick
}) {
  return (
    <div className="report-card">

      {icon}

      <h2>{title}</h2>

      <p>{text}</p>

      <button
        className="secondary-button"
        onClick={onClick}
      >
        <Download size={15} />
        EXPORT JSON
      </button>

    </div>
  );
}