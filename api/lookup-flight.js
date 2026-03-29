/**
 * Vercel serverless: proxies flight lookup to Anthropic (API key stays server-side).
 * Set ANTHROPIC_API_KEY in Vercel project Environment Variables.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return res.status(503).json({
      ok: false,
      error: "Flight lookup is not configured. Add ANTHROPIC_API_KEY to your Vercel project environment variables.",
    });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      return res.status(400).json({ ok: false, error: "Invalid JSON body" });
    }
  }

  const flightNumber = (body?.flightNumber || "").trim();
  const departureDate = (body?.departureDate || "").trim();
  if (!flightNumber || !departureDate) {
    return res.status(400).json({ ok: false, error: "flightNumber and departureDate are required" });
  }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [
          {
            role: "user",
            content: `Look up flight ${flightNumber} on ${departureDate}. Find the departure airport (IATA), arrival airport (IATA), scheduled departure time (24h HH:MM), scheduled arrival time (24h HH:MM), arrival date (YYYY-MM-DD), departure terminal, arrival terminal, and airline name. Return ONLY a JSON object (no markdown, no explanation): {"airline":"str|null","departureAirport":"IATA|null","arrivalAirport":"IATA|null","departureTime":"HH:MM|null","arrivalTime":"HH:MM|null","arrivalDate":"YYYY-MM-DD|null","departureTerminal":"str|null","arrivalTerminal":"str|null"}`,
          },
        ],
      }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      const msg =
        data?.error?.message ||
        data?.message ||
        `Anthropic API error (${upstream.status})`;
      return res.status(502).json({ ok: false, error: msg });
    }

    const texts = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    const clean = texts.replace(/```json|```/g, "").trim();
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(422).json({
        ok: false,
        error: "Couldn't find flight details. Check the flight number and date.",
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return res.status(422).json({
        ok: false,
        error: "Couldn't parse flight details from the response.",
      });
    }

    return res.status(200).json({ ok: true, flight: parsed });
  } catch (e) {
    return res.status(500).json({
      ok: false,
      error: e?.message || "Lookup failed",
    });
  }
}
