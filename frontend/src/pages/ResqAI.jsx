import { useEffect, useMemo, useState } from "react";

import {
  Bot,
  Send,
  BrainCircuit,
  Shield,
  Target,
  Route,
  Radio,
  AlertTriangle,
  Plane,
  Users,
  Lightbulb,
  Activity
} from "lucide-react";

import api, { askAI } from "../services/api";

export default function ResqAI() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [mapData, setMapData] = useState(null);

  const [messages, setMessages] = useState([
    {
      role: "ai",
      text:
        "RESQ AI is ready. I can assess victims, hazards, UAV deployment, route priorities and emergency response actions using the current operational picture."
    }
  ]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.operationsMap();
        setMapData(data);
      } catch (error) {
        console.error("RESQ AI context error:", error);
      }
    };

    load();

    const timer = setInterval(load, 10000);

    return () => clearInterval(timer);
  }, []);

  const victims = mapData?.victims || [];
  const hazards = mapData?.hazards || [];
  const drones = mapData?.drones || [];
  const route = mapData?.route;
  const destination = mapData?.route_destination;

  const criticalVictims = useMemo(
    () =>
      victims.filter(
        (v) =>
          String(v.priority || "")
            .toLowerCase() === "critical"
      ),
    [victims]
  );

  const activeDrones = drones.filter((d) =>
    ["active", "available"].includes(
      String(d.status || "").toLowerCase()
    )
  );

  const askPreset = async (text) => {
    setQuestion(text);

    await sendQuestion(text);
  };

  const sendQuestion = async (textOverride = null) => {
    const current =
      textOverride !== null
        ? textOverride
        : question;

    if (!current.trim() || loading) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: current
      }
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await askAI(current);

      const answer =
        response?.data?.answer ||
        response?.answer ||
        response?.data?.message ||
        response?.message ||
        "No operational guidance was returned.";

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: answer
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            "RESQ AI could not reach the decision-support service. Verify that the backend AI service is running."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      <div className="page-header">
        <div>
          <div className="eyebrow">
            ARTIFICIAL INTELLIGENCE / DECISION SUPPORT
          </div>

          <h1>RESQ AI</h1>

          <p>
            AI-assisted operational guidance for victim
            prioritization, hazard assessment, route
            planning and UAV coordination.
          </p>
        </div>

        <div className="ai-status">
          <BrainCircuit size={17} />
          AI ENGINE ONLINE
        </div>
      </div>

      {/* LIVE SITUATION */}

      <div className="opsPriorityGrid">

        <div className="metric-card">
          <div className="metric-label">
            VICTIMS
          </div>

          <div className="metric-value">
            {victims.length}
          </div>

          <div className="metric-sub">
            {criticalVictims.length} critical
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">
            HAZARDS
          </div>

          <div className="metric-value">
            {hazards.length}
          </div>

          <div className="metric-sub">
            Active threat zones
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">
            UAV ASSETS
          </div>

          <div className="metric-value">
            {activeDrones.length}
          </div>

          <div className="metric-sub">
            Operational assets
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">
            THREAT LEVEL
          </div>

          <div
            className="metric-value"
            style={{ fontSize: 24 }}
          >
            {mapData?.system?.threat_level ||
              "ASSESSING"}
          </div>

          <div className="metric-sub">
            Current operational assessment
          </div>
        </div>

      </div>

      <div
        className="two-column-layout"
        style={{ marginTop: 18 }}
      >

        {/* GUIDANCE */}

        <div>

          <div className="panel">

            <div className="panel-header">
              <div>
                <h2>Operational Guidance</h2>
                <span>
                  AI RESPONSE RECOMMENDATIONS
                </span>
              </div>

              <Lightbulb size={19} />
            </div>

            <GuidanceCard
              icon={<Target size={18} />}
              title="Victim Prioritization"
              text={
                criticalVictims.length
                  ? `${criticalVictims.length} critical-priority cases require immediate assessment.`
                  : "No critical cases currently detected."
              }
              action="Analyze priority"
              onClick={() =>
                askPreset(
                  "Analyze all current victims and explain which victim should be rescued first and why."
                )
              }
            />

            <GuidanceCard
              icon={<AlertTriangle size={18} />}
              title="Hazard Assessment"
              text={
                hazards.length
                  ? `${hazards.length} active hazard zones are affecting the operational area.`
                  : "No active hazards currently registered."
              }
              action="Assess hazards"
              onClick={() =>
                askPreset(
                  "Assess the current hazards and explain the safest operational response."
                )
              }
            />

            <GuidanceCard
              icon={<Route size={18} />}
              title="Route Intelligence"
              text={
                destination
                  ? `Current route targets ${destination.name}, ${route?.distance_km || "--"} km away.`
                  : "No active response route selected."
              }
              action="Evaluate route"
              onClick={() =>
                askPreset(
                  "Evaluate the current response route and explain whether it is appropriate."
                )
              }
            />

            <GuidanceCard
              icon={<Plane size={18} />}
              title="UAV Coordination"
              text={`${activeDrones.length} UAV assets are currently operational.`}
              action="Plan UAV deployment"
              onClick={() =>
                askPreset(
                  "Recommend how the available UAVs should be deployed across the current emergency zone."
                )
              }
            />

          </div>

          {/* CURRENT PRIORITY */}

          <div
            className="panel"
            style={{ marginTop: 16 }}
          >

            <div className="panel-header">
              <div>
                <h2>Current AI Priority</h2>
                <span>
                  RESPONSE TARGET
                </span>
              </div>

              <Activity size={19} />
            </div>

            {destination ? (
              <div
                style={{
                  padding: 16,
                  borderRadius: 10,
                  background:
                    "rgba(239,68,68,.07)",
                  border:
                    "1px solid rgba(239,68,68,.18)"
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700
                  }}
                >
                  {destination.name}
                </div>

                <p style={{ opacity: .72 }}>
                  {destination.notes}
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(3,1fr)",
                    gap: 12,
                    marginTop: 14
                  }}
                >
                  <MiniFact
                    label="PRIORITY"
                    value={destination.priority}
                  />

                  <MiniFact
                    label="PERSONS"
                    value={destination.people_count}
                  />

                  <MiniFact
                    label="ETA"
                    value={`${route?.duration_minutes || "--"} min`}
                  />
                </div>
              </div>
            ) : (
              <div className="empty-state">
                Waiting for operational priority data.
              </div>
            )}

          </div>

        </div>

        {/* CHAT */}

        <div className="panel ai-chat">

          <div className="chat-header">

            <div>
              <strong>
                RESQ AI ASSISTANT
              </strong>

              <span>
                OPERATIONAL DECISION SUPPORT
              </span>
            </div>

            <span className="online-dot">
              ONLINE
            </span>

          </div>

          <div className="chat-messages">

            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message ${message.role}`}
              >

                <div className="chat-avatar">
                  {message.role === "ai" ? (
                    <Bot size={15} />
                  ) : (
                    "OP"
                  )}
                </div>

                <div className="chat-bubble">
                  {message.text}
                </div>

              </div>
            ))}

            {loading && (
              <div className="chat-message ai">

                <div className="chat-avatar">
                  <Bot size={15} />
                </div>

                <div className="chat-bubble">
                  ANALYZING OPERATIONAL DATA...
                </div>

              </div>
            )}

          </div>

          <div className="chat-input">

            <input
              placeholder="Ask for operational guidance..."
              value={question}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendQuestion();
                }
              }}
            />

            <button
              onClick={() => sendQuestion()}
              disabled={loading}
            >
              <Send size={18} />
            </button>

          </div>

          {/* QUICK QUESTIONS */}

          <div
            style={{
              padding: "0 16px 16px",
              display: "flex",
              flexWrap: "wrap",
              gap: 8
            }}
          >
            <QuickQuestion
              text="Who needs rescue first?"
              onClick={() =>
                askPreset(
                  "Who needs rescue first? Analyze the current victim list."
                )
              }
            />

            <QuickQuestion
              text="Assess current threats"
              onClick={() =>
                askPreset(
                  "Assess all current operational threats."
                )
              }
            />

            <QuickQuestion
              text="Plan UAV deployment"
              onClick={() =>
                askPreset(
                  "How should the current UAV fleet be deployed?"
                )
              }
            />

            <QuickQuestion
              text="Evaluate route"
              onClick={() =>
                askPreset(
                  "Evaluate the current emergency response route."
                )
              }
            />
          </div>

        </div>

      </div>
    </div>
  );
}

function GuidanceCard({
  icon,
  title,
  text,
  action,
  onClick
}) {
  return (
    <div
      style={{
        padding: 15,
        marginBottom: 10,
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
          gap: 12,
          alignItems: "flex-start"
        }}
      >
        <div style={{ marginTop: 2 }}>
          {icon}
        </div>

        <div style={{ flex: 1 }}>
          <strong>{title}</strong>

          <p
            style={{
              margin: "5px 0 10px",
              opacity: .65,
              fontSize: 13
            }}
          >
            {text}
          </p>

          <button
            className="secondary-button"
            onClick={onClick}
          >
            {action}
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniFact({ label, value }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          opacity: .5,
          letterSpacing: 1
        }}
      >
        {label}
      </div>

      <strong>{value}</strong>
    </div>
  );
}

function QuickQuestion({ text, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        border:
          "1px solid rgba(100,160,220,.18)",
        background:
          "rgba(40,100,160,.08)",
        color: "inherit",
        borderRadius: 20,
        padding: "7px 11px",
        cursor: "pointer",
        fontSize: 11
      }}
    >
      {text}
    </button>
  );
}