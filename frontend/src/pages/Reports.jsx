import {
  FileText,
  Download,
  ShieldCheck
} from "lucide-react";

export default function Reports() {

  return (
    <div>

      <div className="page-header">

        <div>
          <div className="eyebrow">
            SYSTEM / REPORTING
          </div>

          <h1>Mission Reports</h1>

          <p>
            Operational summaries and incident
            documentation.
          </p>
        </div>

      </div>

      <div className="report-grid">

        <div className="report-card">

          <FileText size={28} />

          <h2>
            Mission Summary
          </h2>

          <p>
            Consolidated mission activity,
            response actions and outcomes.
          </p>

          <button className="secondary-button">
            <Download size={15} />
            GENERATE
          </button>

        </div>

        <div className="report-card">

          <ShieldCheck size={28} />

          <h2>
            Incident Report
          </h2>

          <p>
            Detailed emergency incident and
            response information.
          </p>

          <button className="secondary-button">
            <Download size={15} />
            GENERATE
          </button>

        </div>

        <div className="report-card">

          <FileText size={28} />

          <h2>
            AI Analysis Report
          </h2>

          <p>
            Detection results, priorities and
            AI decision-support activity.
          </p>

          <button className="secondary-button">
            <Download size={15} />
            GENERATE
          </button>

        </div>

      </div>

    </div>
  );
}