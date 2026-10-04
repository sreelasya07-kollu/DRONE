const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `API ${response.status}: ${text || response.statusText}`
    );
  }

  return response.json();
}

export const api = {

  // SYSTEM
  health: () =>
    request("/api/health"),

  readiness: () =>
    request("/api/health/ready"),

  // =====================================================
  // OPERATIONS
  // =====================================================

  operationsMap: (victimId = null) => {
    const query = victimId
      ? `?victim_id=${victimId}`
      : "";

    return request(`/api/operations/map${query}`);
  },

  operationsDrones: () =>
    request("/api/operations/drones"),

  // =====================================================
  // VICTIMS
  // =====================================================

  victims: () =>
    request("/api/victims"),

  victim: (victimId) =>
    request(`/api/victims/${victimId}`),

  // =====================================================
  // HAZARDS
  // =====================================================

  hazards: () =>
    request("/api/hazards"),

  // =====================================================
  // DRONES
  // =====================================================

  drones: () =>
    request("/api/drones"),

  // =====================================================
  // MISSIONS
  // =====================================================

  missions: () =>
    request("/api/missions"),

  // =====================================================
  // ROUTES
  // =====================================================

  calculateRoute: (data) =>
    request("/api/routes/calculate", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  calculateAStar: (data) =>
    request("/api/routes/astar", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  routes: (data) =>
    request("/api/routes/calculate", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  // =====================================================
  // DETECTION
  // =====================================================

  detectionStatus: () =>
    request("/api/detection/status"),

  detection: async (file, confidence = 0.35) => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("confidence", confidence);

    const response = await fetch(
      `${API_BASE}/api/detection/image`,
      {
        method: "POST",
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error(
        `Detection API ${response.status}`
      );
    }

    return response.json();
  },

  // =====================================================
  // AI
  // =====================================================

  ai: (question) =>
    request("/api/ai/ask", {
      method: "POST",
      body: JSON.stringify({
        query: question
      })
    }),

  aiRetrieve: (question) =>
    request("/api/ai/retrieve", {
      method: "POST",
      body: JSON.stringify({
        query: question
      })
    }),

  priority: (data) =>
    request("/api/ai/priority", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  // =====================================================
  // SIMULATION
  // =====================================================

  simulation: (data) =>
    request("/api/simulation/run", {
      method: "POST",
      body: JSON.stringify(data)
    })
};


// =======================================================
// RESQ AI COMPATIBILITY EXPORT
// =======================================================

export async function askAI(question) {
  return request("/api/ai/ask", {
    method: "POST",
    body: JSON.stringify({
      query: question
    })
  });
}

export default api;