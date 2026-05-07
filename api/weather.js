// Weather and geocoding via OpenWeatherMap.
// POST { city, days_ahead } → returns coords + forecast for those dates.

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENWEATHER_API_KEY not configured' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Invalid JSON' }); }
  }

  const { city } = body || {};
  if (!city) return res.status(400).json({ error: 'Missing city' });

  try {
    // Step 1: Geocode the city to lat/lon
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (!geoResponse.ok || !geoData[0]) {
      return res.status(404).json({ error: 'City not found', detail: geoData });
    }

    const { lat, lon, name, country, state } = geoData[0];
    const fullLocation = state ? `${name}, ${state}, ${country}` : `${name}, ${country}`;

    // Step 2: Get 5-day forecast (3-hour intervals)
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();

    if (!forecastResponse.ok) {
      return res.status(forecastResponse.status).json({ error: 'Forecast fetch failed', detail: forecastData });
    }

    // Aggregate by day
    const daily = {};
    for (const item of forecastData.list || []) {
      const date = item.dt_txt.split(' ')[0]; // YYYY-MM-DD
      if (!daily[date]) {
        daily[date] = {
          date,
          temps: [],
          rain: 0,
          conditions: new Set(),
          humidities: [],
        };
      }
      daily[date].temps.push(item.main.temp);
      daily[date].rain += item.rain?.['3h'] || 0;
      daily[date].conditions.add(item.weather[0]?.main || 'Clear');
      daily[date].humidities.push(item.main.humidity);
    }

    const days = Object.values(daily).map(d => ({
      date: d.date,
      temp_low: Math.round(Math.min(...d.temps)),
      temp_high: Math.round(Math.max(...d.temps)),
      rain_mm: Math.round(d.rain * 10) / 10,
      conditions: Array.from(d.conditions).join(', '),
      avg_humidity: Math.round(d.humidities.reduce((a, b) => a + b, 0) / d.humidities.length),
    }));

    return res.status(200).json({
      location: fullLocation,
      lat, lon,
      days,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Weather error', detail: err.message });
  }
}
