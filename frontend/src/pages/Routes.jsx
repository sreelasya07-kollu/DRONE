import {
  Navigation,
  Route as RouteIcon,
  Zap
} from "lucide-react";

import { useState } from "react";

import MapView from "../components/MapView";
import { calculateRoute } from "../services/api";

export default function RoutesPage() {

  const [form, setForm] = useState({
    origin_lat: 17.3850,
    origin_lon: 78.4867,
    target_lat: 17.4065,
    target_lon: 78.4772
  });

  const [route, setRoute] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const calculate = async () => {

    try {

      setLoading(true);

      const response = await calculateRoute({
        origin_lat: Number(form.origin_lat),
        origin_lon: Number(form.origin_lon),
        target_lat: Number(form.target_lat),
        target_lon: Number(form.target_lon)
      });

      setRoute(response.data.route || []);

      setResult(response.data);

    } catch (error) {

      console.error(error);
      alert(
        error.response?.data?.detail ||
        "Unable to calculate route."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      <div className="page-header">

        <div>
          <div className="eyebrow">
            MISSION CONTROL / ROUTING
          </div>

          <h1>Emergency Route Planner</h1>

          <p>
            Calculate response routes while
            accounting for operational hazards.
          </p>
        </div>

        <div className="emergency-state">
          <span></span>
          ROUTING ENGINE ONLINE
        </div>

      </div>

      <div className="route-layout">

        <div className="panel">

          <div className="panel-header">
            <div>
              <h2>Route Parameters</h2>
              <span>ORIGIN → TARGET</span>
            </div>

            <Navigation size={20} />
          </div>

          <div className="route-form">

            <label>
              ORIGIN LATITUDE

              <input
                type="number"
                step="any"
                value={form.origin_lat}
                onChange={(e) =>
                  setForm({
                    ...form,
                    origin_lat: e.target.value
                  })
                }
              />
            </label>

            <label>
              ORIGIN LONGITUDE

              <input
                type="number"
                step="any"
                value={form.origin_lon}
                onChange={(e) =>
                  setForm({
                    ...form,
                    origin_lon: e.target.value
                  })
                }
              />
            </label>

            <label>
              TARGET LATITUDE

              <input
                type="number"
                step="any"
                value={form.target_lat}
                onChange={(e) =>
                  setForm({
                    ...form,
                    target_lat: e.target.value
                  })
                }
              />
            </label>

            <label>
              TARGET LONGITUDE

              <input
                type="number"
                step="any"
                value={form.target_lon}
                onChange={(e) =>
                  setForm({
                    ...form,
                    target_lon: e.target.value
                  })
                }
              />
            </label>

          </div>

          <button
            className="primary-button full"
            onClick={calculate}
            disabled={loading}
          >
            <RouteIcon size={18} />

            {loading
              ? "CALCULATING..."
              : "CALCULATE EMERGENCY ROUTE"}
          </button>

          {result && (
            <div className="route-result">

              <div>
                <span>DISTANCE</span>
                <strong>
                  {result.distance_km ?? "--"} km
                </strong>
              </div>

              <div>
                <span>ROUTE POINTS</span>
                <strong>
                  {route.length}
                </strong>
              </div>

              <div>
                <span>STATUS</span>
                <strong>
                  OPTIMIZED
                </strong>
              </div>

            </div>
          )}

        </div>

        <div className="route-map">
          <MapView route={route} />
        </div>

      </div>

      <div className="info-strip">

        <div>
          <Zap size={17} />
          <span>
            Hazard-aware routing enabled
          </span>
        </div>

        <div>
          <RouteIcon size={17} />
          <span>
            Emergency priority routing
          </span>
        </div>

      </div>

    </div>
  );
}