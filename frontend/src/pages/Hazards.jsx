import {
  AlertTriangle,
  Plus,
  RefreshCw
} from "lucide-react";

import { useEffect, useState } from "react";

import HazardCard from "../components/HazardCard";
import {
  createHazard,
  getHazards
} from "../services/api";

export default function Hazards() {

  const [hazards, setHazards] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    type: "Flood",
    latitude: "",
    longitude: "",
    severity: "high",
    radius_m: 100,
    status: "active",
    description: ""
  });

  const load = async () => {
    try {
      const response = await getHazards();
      setHazards(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    try {
      await createHazard({
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        radius_m: Number(form.radius_m)
      });

      setShowForm(false);

      setForm({
        type: "Flood",
        latitude: "",
        longitude: "",
        severity: "high",
        radius_m: 100,
        status: "active",
        description: ""
      });

      load();

    } catch (error) {
      console.error(error);
      alert("Unable to create hazard.");
    }
  };

  return (
    <div>

      <div className="page-header">

        <div>
          <div className="eyebrow">
            OPERATIONS / HAZARDS
          </div>

          <h1>Hazard Intelligence</h1>

          <p>
            Identify and monitor dangerous
            operational zones.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            setShowForm(!showForm)
          }
        >
          <Plus size={18} />
          ADD HAZARD
        </button>

      </div>

      {showForm && (
        <form
          className="form-panel"
          onSubmit={submit}
        >

          <div className="panel-header">
            <div>
              <h2>Register Hazard</h2>
              <span>THREAT ZONE INPUT</span>
            </div>

            <AlertTriangle />
          </div>

          <div className="form-grid">

            <input
              placeholder="Hazard type"
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value
                })
              }
            />

            <input
              type="number"
              step="any"
              placeholder="Latitude"
              required
              value={form.latitude}
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
              required
              value={form.longitude}
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
              <option value="critical">
                Critical
              </option>
              <option value="high">
                High
              </option>
              <option value="medium">
                Medium
              </option>
              <option value="low">
                Low
              </option>
            </select>

            <input
              type="number"
              placeholder="Radius in meters"
              value={form.radius_m}
              onChange={(e) =>
                setForm({
                  ...form,
                  radius_m: e.target.value
                })
              }
            />

            <input
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value
                })
              }
            />

          </div>

          <button className="primary-button">
            CREATE HAZARD
          </button>

        </form>
      )}

      <div className="section-heading">

        <div>
          <h2>Active Hazard Zones</h2>
          <span>
            {hazards.length} DETECTED
          </span>
        </div>

        <button
          className="secondary-button"
          onClick={load}
        >
          <RefreshCw size={15} />
          REFRESH
        </button>

      </div>

      <div className="data-grid">

        {hazards.length === 0 ? (
          <div className="empty-state large">
            No active hazards.
          </div>
        ) : (
          hazards.map((hazard) => (
            <HazardCard
              key={hazard.id}
              hazard={hazard}
            />
          ))
        )}

      </div>

    </div>
  );
}