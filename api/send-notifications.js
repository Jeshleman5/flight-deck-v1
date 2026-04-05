// Vercel Serverless Function — Family flight notification emails via Resend
// Sends alerts to connected family members about each other's travel
// Triggered by Vercel Cron (vercel.json) every morning at 12:00 UTC (8am ET)

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // 1. Get all users with notifications enabled
    const { data: prefs, error: prefsErr } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('enabled', true);

    if (prefsErr) throw prefsErr;
    if (!prefs || prefs.length === 0) {
      return res.status(200).json({ message: 'No users with notifications enabled', sent: 0 });
    }

    // 2. Calculate target dates
    const today = new Date();

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 7);
    const in7Str = in7Days.toISOString().split('T')[0];

    let totalSent = 0;
    const errors = [];

    for (const pref of prefs) {
      if (!pref.email) continue;

      // 3. Find this user's connected family members
      const { data: myMemberships } = await supabase
        .from('family_members')
        .select('group_id')
        .eq('user_id', pref.user_id);

      if (!myMemberships || myMemberships.length === 0) continue;

      const groupIds = myMemberships.map(m => m.group_id);

      // Get all OTHER members in those groups
      const { data: familyMembers } = await supabase
        .from('family_members')
        .select('user_id')
        .in('group_id', groupIds)
        .neq('user_id', pref.user_id);

      if (!familyMembers || familyMembers.length === 0) continue;

      const familyUserIds = [...new Set(familyMembers.map(m => m.user_id))];

      // 4. Get family members' upcoming flights
      const { data: familyFlights, error: flightsErr } = await supabase
        .from('flights')
        .select('*')
        .in('user_id', familyUserIds)
        .eq('status', 'upcoming');

      if (flightsErr) {
        errors.push({ user: pref.user_id, error: flightsErr.message });
        continue;
      }

      if (!familyFlights || familyFlights.length === 0) continue;

      // 5. Look up family member names from profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', familyUserIds);

      const nameMap = {};
      (profiles || []).forEach(p => {
        nameMap[p.id] = (p.name || 'Family member').split(' ')[0];
      });

      // 6. Check which notifications to send
      const toSend = [];

      // Group flights by user and trip for "trip starting" alerts
      const flightsByUserTrip = {};
      for (const flight of familyFlights) {
        if (flight.trip_name) {
          const key = `${flight.user_id}::${flight.trip_name}`;
          if (!flightsByUserTrip[key]) flightsByUserTrip[key] = [];
          flightsByUserTrip[key].push(flight);
        }
      }

      for (const flight of familyFlights) {
        const travelerName = nameMap[flight.user_id] || 'Family member';

        // Departure alert — flight departs tomorrow
        if (pref.twenty_four_hr && flight.departure_date === tomorrowStr) {
          toSend.push({
            flight,
            type: 'departure_alert',
            travelerName,
            subject: `✈️ ${travelerName} departs tomorrow — ${flight.departure_airport || '???'} → ${flight.arrival_airport || '???'}`,
          });
        }

        // Arrival alert — flight arrives tomorrow
        if ((pref.arrival_alert !== false) && flight.arrival_date === tomorrowStr) {
          toSend.push({
            flight,
            type: 'arrival_alert',
            travelerName,
            subject: `✈️ ${travelerName} arrives tomorrow — ${flight.departure_airport || '???'} → ${flight.arrival_airport || '???'}`,
          });
        }

        // Trip starting — 7 days before the FIRST flight of a trip
        if (pref.seven_day && flight.trip_name && flight.departure_date === in7Str) {
          const key = `${flight.user_id}::${flight.trip_name}`;
          const tripFlights = (flightsByUserTrip[key] || []).sort((a, b) =>
            (a.departure_date || '').localeCompare(b.departure_date || '')
          );
          const earliest = tripFlights[0];

          // Only send if THIS flight is the first leg of the trip
          if (earliest && earliest.id === flight.id) {
            const lastFlight = tripFlights[tripFlights.length - 1];
            const endDate = lastFlight.arrival_date || lastFlight.departure_date;
            toSend.push({
              flight,
              type: 'trip_starting',
              travelerName,
              tripEndDate: endDate,
              subject: `✈️ ${travelerName}'s trip "${flight.trip_name}" starts in 7 days`,
            });
          }
        }
      }

      // 7. Check for already-sent notifications and send new ones
      for (const item of toSend) {
        const { data: existing } = await supabase
          .from('notifications_sent')
          .select('id')
          .eq('user_id', pref.user_id)
          .eq('flight_id', item.flight.id)
          .eq('notification_type', item.type)
          .maybeSingle();

        if (existing) continue;

        const emailBody = buildFamilyEmail(item);

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

// ── Email Builder ──

function buildFamilyEmail(item) {
  const { flight, type, travelerName, tripEndDate } = item;
  const route = `${flight.departure_airport || '???'} → ${flight.arrival_airport || '???'}`;
  const flightNum = flight.flight_number || '';
  const depDate = formatDate(flight.departure_date);
  const depTime = flight.departure_time || '';
  const arrDate = formatDate(flight.arrival_date);
  const arrTime = flight.arrival_time || '';
  const tripName = flight.trip_name || '';
  const isWork = flight.is_work;
  const confirmation = flight.confirmation_code || '';

  let headline, detail;
  if (type === 'departure_alert') {
    headline = `<strong>${travelerName}</strong> departs <strong>tomorrow</strong>`;
    detail = depTime ? `Leaves at ${depTime}` : '';
  } else if (type === 'arrival_alert') {
    headline = `<strong>${travelerName}</strong> arrives <strong>tomorrow</strong>`;
    detail = arrTime ? `Lands at ${arrTime}` : '';
  } else if (type === 'trip_starting') {
    headline = `<strong>${travelerName}'s</strong> trip starts in <strong>7 days</strong>`;
    detail = tripEndDate ? `${depDate} — ${formatDate(tripEndDate)}` : '';
  }

  const workBadge = isWork ? '<span style="display:inline-block;background:#e8ecf4;color:#2C3E6B;font-size:11px;font-weight:600;padding:2px 8px;border-radius:6px;margin-left:6px;">Work</span>' : '';
  const tripBadge = tripName ? `<p style="margin:0 0 4px;font-size:13px;color:#2C3E6B;"><strong>Trip:</strong> ${tripName}</p>` : '';
  const confLine = confirmation ? `<p style="margin:0 0 4px;font-size:13px;color:#666;"><strong>Confirmation:</strong> ${confirmation}</p>` : '';
  const detailLine = detail ? `<p style="margin:8px 0 0;font-size:14px;color:#2A2520;font-weight:600;text-align:center;">${detail}</p>` : '';

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
            ${workBadge}
          </div>
          ${flightNum ? `<div style="text-align:center;font-size:13px;color:#8B7E6A;margin-bottom:8px;">Flight ${flightNum}</div>` : ''}
          <div style="display:flex;justify-content:space-between;font-size:13px;color:#2A2520;">
            <div><strong>Departs:</strong> ${depDate} ${depTime}</div>
            <div><strong>Arrives:</strong> ${arrDate} ${arrTime}</div>
          </div>
          ${detailLine}
        </div>
        ${tripBadge}
        ${confLine}
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