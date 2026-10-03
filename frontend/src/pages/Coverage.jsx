import {
  Map,
  Target,
  Radio
} from "lucide-react";

export default function Coverage() {

  return (
    <div>

      <div className="page-header">

        <div>
          <div className="eyebrow">
            MISSION CONTROL / COVERAGE
          </div>

          <h1>Operational Coverage</h1>

          <p>
            Monitor field surveillance and
            response coverage areas.
          </p>
        </div>

      </div>

      <div className="coverage-grid">

        <div className="coverage-visual">

          <div className="radar">

            <div className="radar-ring ring-1"></div>
            <div className="radar-ring ring-2"></div>
            <div className="radar-ring ring-3"></div>

            <div className="radar-cross horizontal"></div>
            <div className="radar-cross vertical"></div>

            <div className="radar-sweep"></div>

            <div className="radar-center">
              <Target size={20} />
            </div>

          </div>

          <div className="radar-label">
            LIVE COVERAGE FIELD
          </div>

        </div>

        <div className="coverage-stats">

          <div className="panel">

            <div className="panel-header">
              <div>
                <h2>Coverage Metrics</h2>
                <span>FIELD INTELLIGENCE</span>
              </div>

              <Map size={20} />
            </div>

            <div className="coverage-stat">
              <span>AREA COVERED</span>
              <strong>78%</strong>
            </div>

            <div className="coverage-bar">
              <div style={{ width: "78%" }} />
            </div>

            <div className="coverage-stat">
              <span>UAV SURVEILLANCE</span>
              <strong>64%</strong>
            </div>

            <div className="coverage-bar">
              <div style={{ width: "64%" }} />
            </div>

            <div className="coverage-stat">
              <span>COMMUNICATION COVERAGE</span>
              <strong>91%</strong>
            </div>

            <div className="coverage-bar">
              <div style={{ width: "91%" }} />
            </div>

          </div>

          <div className="panel">

            <div className="panel-header">
              <div>
                <h2>Network Status</h2>
                <span>FIELD CONNECTIVITY</span>
              </div>

              <Radio size={20} />
            </div>

            <div className="network-row">
              <span>COMMAND CENTER</span>
              <strong>ONLINE</strong>
            </div>

            <div className="network-row">
              <span>UAV NETWORK</span>
              <strong>ONLINE</strong>
            </div>

            <div className="network-row">
              <span>FIELD UNITS</span>
              <strong>CONNECTED</strong>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}