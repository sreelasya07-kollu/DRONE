import {
  Play,
  RotateCcw,
  Activity,
  Zap
} from "lucide-react";

import { useState } from "react";

import { runSimulation } from "../services/api";

export default function Simulation() {

  const [events, setEvents] = useState([]);
  const [running, setRunning] = useState(false);

  const start = async () => {

    try {

      setRunning(true);

      const response = await runSimulation();

      setEvents(response.data.events || []);

    } catch (error) {

      console.error(error);

    } finally {

      setRunning(false);

    }
  };

  return (
    <div>

      <div className="page-header">

        <div>
          <div className="eyebrow">
            MISSION CONTROL / SIMULATION
          </div>

          <h1>Emergency Simulation</h1>

          <p>
            Test response logic using simulated
            operational events.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={start}
          disabled={running}
        >
          <Play size={18} />
          {running
            ? "SIMULATION RUNNING..."
            : "START SIMULATION"}
        </button>

      </div>

      <div className="simulation-grid">

        <div className="simulation-hero">

          <Activity size={45} />

          <h2>
            Scenario Engine
          </h2>

          <p>
            Generate emergency events and
            evaluate the RESQ-OPS response
            pipeline.
          </p>

          <div className="simulation-line">
            <span></span>
            EVENT GENERATOR READY
          </div>

        </div>

        <div className="panel">

          <div className="panel-header">
            <div>
              <h2>Simulation Events</h2>
              <span>LIVE EVENT STREAM</span>
            </div>

            <Zap size={20} />
          </div>

          {events.length === 0 ? (
            <div className="empty-state large">
              <Activity size={35} />

              <strong>
                No simulation events
              </strong>

              <span>
                Start a simulation to generate
                emergency scenarios.
              </span>
            </div>
          ) : (
            <div className="event-list">

              {events.map((event, index) => (
                <div
                  className="event-row"
                  key={index}
                >
                  <span className="event-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div>
                    <strong>
                      {event.type ||
                        event.event ||
                        "EVENT"}
                    </strong>

                    <small>
                      {event.message ||
                        JSON.stringify(event)}
                    </small>
                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>

      <button
        className="secondary-button"
        onClick={() => setEvents([])}
      >
        <RotateCcw size={15} />
        CLEAR EVENTS
      </button>

    </div>
  );
}