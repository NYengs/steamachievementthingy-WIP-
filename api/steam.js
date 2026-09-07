// /api/steam.js
// Vercel serverless function — runs on Vercel's servers, not the browser.
// Calls Steam server-to-server, so no CORS restriction applies, and the
// API key never gets shipped to the client.

export default async function handler(req, res) {
  const { steamid } = req.query;

  if (!steamid) {
    return res.status(400).json({ error: "Missing steamid parameter" });
  }

  const STEAM_API_KEY = process.env.STEAM_API_KEY;

  if (!STEAM_API_KEY) {
    return res.status(500).json({ error: "Server is missing STEAM_API_KEY" });
  }

  const steamUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${encodeURIComponent(steamid)}&format=json`;

  try {
    const steamRes = await fetch(steamUrl);

    if (!steamRes.ok) {
      return res.status(steamRes.status).json({ error: "Steam API request failed" });
    }

    const data = await steamRes.json();

    // Only your own site needs to read this — lock it down instead of "*".
    res.setHeader("Access-Control-Allow-Origin", "https://duostatly.vercel.app");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch from Steam API" });
  }
}
