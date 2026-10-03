import {
  Plus,
  RefreshCw,
  Users,
  HeartPulse
} from "lucide-react";

import { useEffect, useState } from "react";

import VictimCard from "../components/VictimCard";
import {
  createVictim,
  getVictims
} from "../services/api";

export default function Victims() {

  const [victims, setVictims] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    latitude: "",
    longitude: "",
    severity: "medium",
    people_count: 1,
    status: "reported",
    source: "manual",
    notes: ""
  });

  const loadVictims = async () => {
    try {
      const response = await getVictims();
      setVictims(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadVictims();
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await createVictim({
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        people_count: Number(form.people_count)
      });

      setForm({
        name: "",
        latitude: "",
        longitude: "",
        severity: "medium",
        people_count: 1,
        status: "reported",
        source: "manual",
        notes: ""
      });

      setShowForm(false);
      await loadVictims();

    } catch (error) {
      console.error(error);
      alert("Unable to create victim record.");
    } finally {
      setLoading(false);
    }
  };

  const critical = victims.filter(
    (v) => v.severity === "critical"
  ).length;

  return (
    <div>

      <div className="page-header">

        <div>
          <div className="eyebrow">
            OPERATIONS / VICTIMS
          </div>

          <h1>Victim Management</h1>

          <p>
            Track casualties, severity and
            response priority.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            setShowForm(!showForm)
          }
        >
          <Plus size={18} />
          REGISTER VICTIM
        </button>

      </div>

      <div className="metrics-grid compact-metrics">

        <div className="metric-card">
          <Users size={20} />
          <div className="metric-value">
            {victims.length}
          </div>
          <div className="metric-title">
            REGISTERED VICTIMS
          </div>
        </div>

        <div className="metric-card">
          <HeartPulse size={20} />
          <div className="metric-value">
            {critical}
          </div>
          <div className="metric-title">
            CRITICAL CASES
          </div>
        </div>

      </div>

      {showForm && (
        <form
          className="form-panel"
          onSubmit={submit}
        >

          <div className="panel-header">
            <div>
              <h2>Register Victim</h2>
              <span>NEW INCIDENT RECORD</span>
            </div>
          </div>

          <div className="form-grid">

            <input
              placeholder="Victim / Group name"
              value={form.name}
              required
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value
                })
              }
            />

            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={form.latitude}
              required
              onChange={(e) =>
                setForm({
                  ...form,
                  latitude: e.target.value
                })
              }
            />

            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={form.longitude}
              required
              onChange={(e) =>
                setForm({
                  ...form,
                  longitude: e.target.value
                })
              }
            />

            <select
              value={form.severity}
              onChange={(e) =>
                setForm({
                  ...form,
                  severity: e.target.value
                })
              }
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <input
              type="number"
              min="1"
              placeholder="People count"
              value={form.people_count}
              onChange={(e) =>
                setForm({
                  ...form,
                  people_count: e.target.value
                })
              }
            />

            <input
              placeholder="Notes"
              value={form.notes}
              onChange={(e) =>
                setForm({
                  ...form,
                  notes: e.target.value
                })
              }
            />

          </div>

          <button
            className="primary-button"
            disabled={loading}
          >
            {loading
              ? "SAVING..."
              : "CREATE RECORD"}
          </button>

        </form>
      )}

      <div className="section-heading">

        <div>
          <h2>Victim Registry</h2>
          <span>FIELD REPORTS</span>
        </div>

        <button
          className="secondary-button"
          onClick={loadVictims}
        >
          <RefreshCw size={15} />
          REFRESH
        </button>

      </div>

      <div className="data-grid">

        {victims.length === 0 ? (
          <div className="empty-state large">
            No victim records found.
          </div>
        ) : (
          victims.map((victim) => (
            <VictimCard
              key={victim.id}
              victim={victim}
            />
          ))
        )}

      </div>

    </div>
  );
}