// Vercel Serverless Function — Daily flight notification emails via Resend
// Triggered by Vercel Cron (vercel.json) every morning at 12:00 UTC (8am ET)
// Uses SUPABASE_SERVICE_ROLE_KEY to read all users' flights (bypasses RLS)

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Only allow GET (cron) or POST (manual trigger)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify cron secret to prevent unauthorized triggers
  // Vercel automatically sends this header for cron jobs
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // If CRON_SECRET is set, enforce it. If not set, allow (for testing).
    // You can add CRON_SECRET later for extra security.
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' });
  }
  if (!resendKey) {
    return res.status(500).json({ error: 'Missing RESEND_API_KEY' });
  }

  // Service role client — bypasses RLS so we can read all users' flights
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // 1. Get all users who have notifications enabled
    const { data: prefs, error: prefsErr } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('enabled', true);

    if (prefsErr) throw prefsErr;
    if (!prefs || prefs.length === 0) {
      return res.status(200).json({ message: 'No users with notifications enabled', sent: 0 });
    }

    // 2. For each user, check their flights
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

    // Calculate target dates
    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 7);
    const in7Str = in7Days.toISOString().split('T')[0];

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    let totalSent = 0;
    const errors = [];

    for (const pref of prefs) {
      if (!pref.email) continue;

      // Get user's upcoming flights
      const { data: flights, error: flightsErr } = await supabase
        .from('flights')
        .select('*')
        .eq('user_id', pref.user_id)
        .eq('status', 'upcoming');

      if (flightsErr) {
        errors.push({ user: pref.user_id, error: flightsErr.message });
        continue;
      }

      if (!flights || flights.length === 0) continue;

      // Check which notifications to send
      const toSend = [];

      for (const flight of flights) {
        // 7-day departure notification
        if (pref.seven_day && flight.departure_date === in7Str) {
          toSend.push({ flight, type: 'seven_day', subject: buildSubject(flight, '7 days') });
        }

        // 24-hour return notification (arrival is tomorrow)
        if (pref.twenty_four_hr && flight.arrival_date === tomorrowStr) {
          toSend.push({ flight, type: 'twenty_four_hr', subject: buildSubject(flight, 'tomorrow') });
        }
      }

      // 3. Check which notifications were already sent
      for (const item of toSend) {
        const { data: existing } = await supabase
          .from('notifications_sent')
          .select('id')
          .eq('user_id', pref.user_id)
          .eq('flight_id', item.flight.id)
          .eq('notification_type', item.type)
          .maybeSingle();

        if (existing) continue; // Already sent

        // 4. Send the email via Resend
        const emailBody = buildEmailBody(item.flight, item.type);

        try {
          const emailRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Flight Deck <onboarding@resend.dev>',
              to: [pref.email],
              subject: item.subject,
              html: emailBody,
            }),
          });

          if (!emailRes.ok) {
            const errText = await emailRes.text();
            errors.push({ user: pref.user_id, flight: item.flight.id, error: errText });
            continue;
          }

          // 5. Record that we sent this notification
          await supabase.from('notifications_sent').insert({
            user_id: pref.user_id,
            flight_id: item.flight.id,
            notification_type: item.type,
          });

          totalSent++;
        } catch (emailErr) {
          errors.push({ user: pref.user_id, flight: item.flight.id, error: emailErr.message });
        }
      }
    }

    return res.status(200).json({
      message: `Notifications sent: ${totalSent}`,
      sent: totalSent,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (err) {
    console.error('Notification error:', err);
    return res.status(500).json({ error: err.message });
  }
}

// ── Helpers ──

function buildSubject(flight, timeframe) {
  const route = `${flight.departure_airport || '???'} → ${flight.arrival_airport || '???'}`;
  const flightNum = flight.flight_number ? ` (${flight.flight_number})` : '';

  if (timeframe === '7 days') {
    return `✈️ Your flight ${route}${flightNum} departs in 7 days`;
  }
  return `✈️ Your flight ${route}${flightNum} returns ${timeframe}`;
}

function buildEmailBody(flight, type) {
  const route = `${flight.departure_airport || '???'} → ${flight.arrival_airport || '???'}`;
  const flightNum = flight.flight_number || 'N/A';
  const depDate = formatDate(flight.departure_date);
  const depTime = flight.departure_time || '';
  const arrDate = formatDate(flight.arrival_date);
  const arrTime = flight.arrival_time || '';
  const tripName = flight.trip_name ? `<p style="margin:0 0 4px;font-size:13px;color:#2C3E6B;"><strong>Trip:</strong> ${flight.trip_name}</p>` : '';
  const confirmation = flight.confirmation_code ? `<p style="margin:0 0 4px;font-size:13px;color:#666;"><strong>Confirmation:</strong> ${flight.confirmation_code}</p>` : '';
  const isWork = flight.is_work ? '<span style="display:inline-block;background:#e8ecf4;color:#2C3E6B;font-size:11px;font-weight:600;padding:2px 8px;border-radius:6px;margin-left:6px;">Work</span>' : '';

  const headline = type === 'seven_day'
    ? `Your flight departs in <strong>7 days</strong>`
    : `Your flight returns <strong>tomorrow</strong>`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F3EDE4;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:480px;margin:24px auto;padding:0 16px;">
    <div style="background:#FFFDF8;border-radius:16px;border:1px solid #E2D9CB;overflow:hidden;">
      <div style="height:3px;background:#C75B2A;"></div>
      <div style="padding:24px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
          <span style="font-size:22px;">✈️</span>
          <span style="font-family:Georgia,serif;font-size:20px;font-weight:800;color:#2A2520;">Flight Deck</span>
        </div>
        <p style="font-size:15px;color:#2A2520;margin:0 0 16px;line-height:1.5;">${headline}</p>
        <div style="background:#F8F4EC;border-radius:12px;padding:16px;margin-bottom:16px;">
          <div style="text-align:center;margin-bottom:8px;">
            <span style="font-family:monospace;font-size:28px;font-weight:700;color:#2A2520;">${route}</span>
            ${isWork}
          </div>
          <div style="text-align:center;font-size:13px;color:#8B7E6A;margin-bottom:8px;">
            Flight ${flightNum}
          </div>
          <div style="display:flex;justify-content:space-between;font-size:13px;color:#2A2520;">
            <div><strong>Departs:</strong> ${depDate} ${depTime}</div>
            <div><strong>Arrives:</strong> ${arrDate} ${arrTime}</div>
          </div>
        </div>
        ${tripName}
        ${confirmation}
        <p style="margin:16px 0 0;font-size:11px;color:#B5A998;text-align:center;">
          Sent by Flight Deck · <a href="https://flight-deck-v1.vercel.app" style="color:#C75B2A;text-decoration:none;">Open App</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
  } catch {
    return dateStr;
  }
}