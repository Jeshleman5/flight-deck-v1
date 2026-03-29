// Vercel Serverless Function — flight lookup
// Priority: AviationStack (precise times) → Claude web search (fallback)

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { flightNumber, departureDate } = req.body || {};
  if (!flightNumber) return res.status(400).json({ error: "flightNumber is required" });

  // Parse airline code and flight num from input like "LX 23" or "LX23"
  const cleaned = flightNumber.replace(/\s+/g, "").toUpperCase();
  const match = cleaned.match(/^([A-Z]{2}|\d[A-Z]|[A-Z]\d)(\d+)$/);
  const airlineCode = match ? match[1] : "";
  const flightNum = match ? match[2] : cleaned;

  // ── Try AviationStack first ──
  const avKey = process.env.AVIATIONSTACK_API_KEY;
  if (avKey) {
    try {
      // Note: AviationStack free tier only supports HTTP, not HTTPS
      const avUrl = `http://api.aviationstack.com/v1/flights?access_key=${avKey}&flight_iata=${airlineCode}${flightNum}&limit=1`;
      const avResp = await fetch(avUrl);
      const avData = await avResp.json();

      if (avData.data && avData.data.length > 0) {
        const f = avData.data[0];

        const flight = {
          airline: f.airline?.iata || airlineCode,
          airlineName: f.airline?.name || "",
          flightNumber: flightNumber,
          departureAirport: f.departure?.iata || "",
          departureCity: f.departure?.airport || "",
          arrivalAirport: f.arrival?.iata || "",
          arrivalCity: f.arrival?.airport || "",
          departureDate: departureDate || f.flight_date || "",
          departureTime: extractTime(f.departure?.scheduled),
          arrivalDate: extractDate(f.arrival?.scheduled) || departureDate || "",
          arrivalTime: extractTime(f.arrival?.scheduled),
          departureTerminal: f.departure?.terminal || "",
          arrivalTerminal: f.arrival?.terminal || "",
          status: f.flight_status || "scheduled",
          source: "aviationstack",
        };

        return res.status(200).json({ flight });
      }
    } catch (err) {
      console.error("AviationStack error:", err.message);
      // Fall through to Claude fallback
    }
  }

  // ── Fallback: Claude web search ──
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "No API keys configured. Add AVIATIONSTACK_API_KEY or ANTHROPIC_API_KEY in Vercel settings.",
    });
  }

  const prompt = `Look up flight ${flightNumber}${departureDate ? ` on ${departureDate}` : " (today or next scheduled)"}.

Return ONLY a JSON object with these fields (no markdown, no explanation, no backticks):
{
  "airline": "2-letter IATA code (e.g. UA, AA, DL)",
  "airlineName": "Full airline name",
  "flightNumber": "Full flight number as entered",
  "departureAirport": "3-letter IATA code",
  "departureCity": "City name",
  "arrivalAirport": "3-letter IATA code",
  "arrivalCity": "City name",
  "departureDate": "YYYY-MM-DD",
  "departureTime": "HH:MM (24hr local time)",
  "arrivalDate": "YYYY-MM-DD",
  "arrivalTime": "HH:MM (24hr local time)",
  "departureTerminal": "Terminal if known, empty string if not",
  "arrivalTerminal": "Terminal if known, empty string if not",
  "status": "scheduled/on-time/delayed/cancelled if known"
}

If you cannot find this flight, return: {"error": "Flight not found"}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Anthropic API error:", response.status, errBody);
      return res.status(502).json({ error: `Anthropic API returned ${response.status}` });
    }

    const data = await response.json();
    const textBlocks = (data.content || []).filter((b) => b.type === "text");
    const rawText = textBlocks.map((b) => b.text).join("\n");

    try {
      const cleanedText = rawText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const flight = JSON.parse(cleanedText);
      flight.source = "claude";
      return res.status(200).json({ flight });
    } catch (parseErr) {
      return res.status(200).json({ flight: null, raw: rawText, parseError: "Could not parse flight data" });
    }
  } catch (err) {
    console.error("Lookup error:", err);
    return res.status(500).json({ error: err.message });
  }
}

// ── Helpers ──
function extractTime(isoString) {
  if (!isoString) return "";
  try {
    const timePart = isoString.split("T")[1];
    if (!timePart) return "";
    return timePart.substring(0, 5);
  } catch {
    return "";
  }
}

function extractDate(isoString) {
  if (!isoString) return "";
  try {
    return isoString.split("T")[0];
  } catch {
    return "";
  }
}