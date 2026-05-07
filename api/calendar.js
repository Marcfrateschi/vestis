// Fetches Google Calendar events for a given date range.
// Frontend passes the user's access_token (from the google_tokens table).

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Invalid JSON' }); }
  }

  const { access_token, refresh_token, time_min, time_max } = body || {};
  if (!access_token || !time_min || !time_max) {
    return res.status(400).json({ error: 'Missing access_token, time_min, or time_max' });
  }

  const fetchEvents = async (token) => {
    const params = new URLSearchParams({
      timeMin: time_min,
      timeMax: time_max,
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '50',
    });
    return fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  try {
    let response = await fetchEvents(access_token);

    // If token expired, try to refresh
    if (response.status === 401 && refresh_token) {
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token,
          grant_type: 'refresh_token',
        }).toString(),
      });

      const refreshData = await refreshResponse.json();
      if (refreshResponse.ok && refreshData.access_token) {
        response = await fetchEvents(refreshData.access_token);
        const data = await response.json();
        return res.status(200).json({
          events: data.items || [],
          new_access_token: refreshData.access_token,
          expires_in: refreshData.expires_in,
        });
      }
      return res.status(401).json({ error: 'Token expired and refresh failed', detail: refreshData });
    }

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Calendar fetch failed', detail: data });
    }

    return res.status(200).json({ events: data.items || [] });
  } catch (err) {
    return res.status(500).json({ error: 'Calendar error', detail: err.message });
  }
}
