const API_BASE = "http://localhost:8000";


async function request(
  endpoint,
  options = {}
) {

  const response = await fetch(
    `${API_BASE}${endpoint}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    }
  );

  if (!response.ok) {

    let message = `API Error ${response.status}`;

    try {

      const data =
        await response.json();

      if (data.detail) {
        message = data.detail;
      }

    } catch {
      // Keep default error message.
    }

    throw new Error(message);
  }

  return response.json();
}


export const api = {

  // -------------------------------------------------------
  // SYSTEM
  // -------------------------------------------------------

  health: () =>
    request("/api/health"),

  readiness: () =>
    request("/api/health/ready"),


  // -------------------------------------------------------
  // OPERATIONS
  // -------------------------------------------------------

  operationsMap: (
    victimId = null
  ) => {

    const endpoint =
      victimId !== null
        ? `/api/operations/map?victim_id=${victimId}`
        : "/api/operations/map";

    return request(endpoint);
  },


  operationsDrones: () =>
    request("/api/operations/drones"),


  // -------------------------------------------------------
  // VICTIMS
  // -------------------------------------------------------

  victims: () =>
    request("/api/victims"),


  victim: (
    victimId
  ) =>
    request(
      `/api/victims/${victimId}`
    ),


  // -------------------------------------------------------
  // HAZARDS
  // -------------------------------------------------------

  hazards: () =>
    request("/api/hazards"),


  // -------------------------------------------------------
  // DRONES
  // -------------------------------------------------------

  drones: () =>
    request("/api/drones"),


  // -------------------------------------------------------
  // MISSIONS
  // -------------------------------------------------------

  missions: () =>
    request("/api/missions"),


  // -------------------------------------------------------
  // ROUTING
  // -------------------------------------------------------

  calculateRoute: (
    data
  ) =>
    request(
      "/api/routes/calculate",
      {
        method: "POST",
        body: JSON.stringify(data)
      }
    ),


  calculateAStar: (
    data
  ) =>
    request(
      "/api/routes/astar",
      {
        method: "POST",
        body: JSON.stringify(data)
      }
    ),


  // Backwards-compatible alias
  routes: (
    data
  ) =>
    request(
      "/api/routes/calculate",
      {
        method: "POST",
        body: JSON.stringify(data)
      }
    ),


  // -------------------------------------------------------
  // DETECTION / YOLO
  // -------------------------------------------------------

  detectionStatus: () =>
    request(
      "/api/detection/status"
    ),


  detection: async (
    file,
    confidence = 0.35
  ) => {

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    const response =
      await fetch(
        `${API_BASE}/api/detection/image?confidence=${confidence}`,
        {
          method: "POST",
          body: formData
        }
      );

    if (!response.ok) {

      throw new Error(
        `Detection API Error ${response.status}`
      );
    }

    return response.json();
  },


  // -------------------------------------------------------
  // RESQ AI
  // -------------------------------------------------------

  ai: (
    question
  ) =>
    request(
      "/api/ai/ask",
      {
        method: "POST",
        body: JSON.stringify({
          query: question
        })
      }
    ),


  aiRetrieve: (
    question
  ) =>
    request(
      "/api/ai/retrieve",
      {
        method: "POST",
        body: JSON.stringify({
          query: question
        })
      }
    ),


  priority: (
    data
  ) =>
    request(
      "/api/ai/priority",
      {
        method: "POST",
        body: JSON.stringify(data)
      }
    ),


  // -------------------------------------------------------
  // SIMULATION
  // -------------------------------------------------------

  simulation: (
    data
  ) =>
    request(
      "/api/simulation/run",
      {
        method: "POST",
        body: JSON.stringify(data)
      }
    )

};


export default api;