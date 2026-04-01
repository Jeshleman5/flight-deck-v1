// Vercel Serverless Function — flight status refresh
// Calls AviationStack directly (FREE, no Anthropic API cost)

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  
    const { flightNumber, departureDate } = req.body || {};
    if (!flightNumber) return res.status(400).json({ error: "flightNumber is required" });
  
    const avKey = process.env.AVIATIONSTACK_API_KEY;
    if (!avKey) {
      return res.status(500).json({ error: "AVIATIONSTACK_API_KEY not configured in Vercel." });
    }
  
    // Parse airline code and flight number from input like "LX23" or "UA 2345"
    const cleaned = flightNumber.replace(/\s+/g, "").toUpperCase();
    const match = cleaned.match(/^([A-Z]{2}|\d[A-Z]|[A-Z]\d)(\d+)$/);
    const airlineCode = match ? match[1] : "";
    const flightNum = match ? match[2] : cleaned;
  
    try {
      // AviationStack free tier only supports HTTP (not HTTPS)
      const url = `http://api.aviationstack.com/v1/flights?access_key=${avKey}&flight_iata=${airlineCode}${flightNum}&limit=5`;
      const response = await fetch(url);
      const data = await response.json();
  
      if (data.error) {
        console.error("AviationStack error:", data.error);
        return res.status(502).json({ error: "AviationStack API error: " + (data.error.info || data.error.message || "Unknown") });
      }
  
      const flights = data.data || [];
  
      // Try to match by departure date if provided
      let flight = null;
      if (departureDate && flights.length > 0) {
        flight = flights.find(f => {
          const depDate = extractDate(f.departure?.scheduled || f.departure?.estimated || "");
          return depDate === departureDate;
        });
      }
      // Fall back to first result
      if (!flight && flights.length > 0) {
        flight = flights[0];
      }
  
      if (!flight) {
        return res.status(200).json({ status: null, message: "No status data found for this flight." });
      }
  
      // Build status response
      const dep = flight.departure || {};
      const arr = flight.arrival || {};
      const flightStatus = flight.flight_status || "";
  
      const result = {
        flightStatus: normalizeStatus(flightStatus),
        departureTime: extractTime(dep.estimated || dep.scheduled || ""),
        arrivalTime: extractTime(arr.estimated || arr.scheduled || ""),
        departureGate: dep.gate || "",
        arrivalGate: arr.gate || "",
        departureTerminal: dep.terminal || "",
        arrivalTerminal: arr.terminal || "",
        departureDelay: dep.delay || 0,  // minutes
        arrivalDelay: arr.delay || 0,    // minutes
        scheduledDeparture: extractTime(dep.scheduled || ""),
        scheduledArrival: extractTime(arr.scheduled || ""),
        refreshedAt: new Date().toISOString(),
      };
  
      return res.status(200).json({ status: result });
    } catch (err) {
      console.error("Refresh error:", err);
      return res.status(500).json({ error: err.message });
    }
  }
  
  function normalizeStatus(raw) {
    const s = (raw || "").toLowerCase();
    if (s === "active" || s === "en-route") return "in-flight";
    if (s === "landed") return "landed";
    if (s === "cancelled") return "cancelled";
    if (s === "diverted") return "diverted";
    if (s === "scheduled") return "on-time";
    if (s === "delayed") return "delayed";
    return s || "unknown";
  }
  
  function extractTime(isoString) {
    if (!isoString) return "";
    try {
      const timePart = isoString.split("T")[1];
      if (!timePart) return "";
      return timePart.substring(0, 5);
    } catch { return ""; }
  }
  
  function extractDate(isoString) {
    if (!isoString) return "";
    try { return isoString.split("T")[0]; } catch { return ""; }
  }
  