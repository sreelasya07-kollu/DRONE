const API_BASE = "http://localhost:8000";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`API Error ${response.status}`);
  }

  return response.json();
}

export const api = {
  health: () => request("/api/health"),

  victims: () => request("/api/victims"),

  hazards: () => request("/api/hazards"),

  drones: () => request("/api/drones"),

  missions: () => request("/api/missions"),

  routes: (data) =>
    request("/api/routes", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  ai: (question) =>
    request("/api/ai", {
      method: "POST",
      body: JSON.stringify({
        question
      })
    }),

  simulation: (data) =>
    request("/api/simulation", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  detection: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/api/detection`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Detection API Error ${response.status}`);
    }

    return response.json();
  }
};

export default api;
