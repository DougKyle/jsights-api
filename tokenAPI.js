require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('jSightsAI API is live and listening 🚀');
});

app.get('/tokeninfo', async (req, res) => {
  const symbol = req.query.symbol?.toUpperCase();
  const apiKey = process.env.CMC_API_KEY;

  try {
    const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest', {
  headers: { 'X-CMC_PRO_API_KEY': apiKey },
  params: { symbol },
});


   const token = response.data.data[symbol];

    if (!token) {
      return res.status(404).json({ error: `Token ${symbol} not found` });
    }

    const quote = token.quote.USD;
    const price = `$${quote.price.toFixed(2)}`;
    const marketCap = `$${quote.market_cap.toLocaleString()}`;
    const change24h = quote.percent_change_24h;
    const change7d = quote.percent_change_7d;
    const change30d = quote.percent_change_30d;
    const circulating = token.circulating_supply?.toLocaleString();
    const maxSupply = token.max_supply?.toLocaleString() || "∞";
    const rank = token.cmc_rank;
    const marketPairs = token.num_market_pairs;

    // 🔍 Tokenomics Score
    let score = 0;
    if (token.max_supply) score += 30;
    if (token.circulating_supply && token.max_supply && token.circulating_supply / token.max_supply > 0.75) score += 25;
    if (Math.abs(change30d) < 10) score += 20;
    if (marketPairs > 2000) score += 25;

    // 🧠 Narrative Tags
    const narrativeMap = {
      BTC: ["🪙 Digital Gold", "🏦 Store of Value"],
      ETH: ["💻 Smart Contracts", "🔗 DeFi Backbone"],
      XRP: ["🌍 Payments", "💼 Institutional Use"],
      BNB: ["🔥 Burn Utility", "🏰 CEX + DeFi"],
      USDT: ["💵 Stablecoin", "🔒 Pegged Asset"],
      SHIB: ["🐶 Meme Coin", "🔥 High Risk / High Reward"],
    };
    const narratives = narrativeMap[symbol] || ["📊 General Token"];

    // 🚨 Inflation Risk
    const inflationRisk = token.max_supply ? "🟢 Capped Supply" : "🔴 Uncapped — Inflation Risk";

    res.json({
      name: token.name,
      symbol: token.symbol,
      price,
      marketCap,
      change24h: `${change24h.toFixed(2)}%`,
      change7d: `${change7d.toFixed(2)}%`,
      change30d: `${change30d.toFixed(2)}%`,
      circulating,
      maxSupply,
      rank,
      marketPairs,
      inflationRisk,
      tokenomicsScore: score,
      narratives,
    });

  } catch (err) {
    console.error("API Error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 jSightsAI API is live at http://localhost:${PORT}/tokeninfo`);
});
