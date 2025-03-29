const functions = require("firebase-functions");
const axios = require("axios");
const cors = require("cors")();

exports.yahooProxy = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    res.set("Access-Control-Allow-Origin", "*"); // ✅ Fix CORS
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS");

    const symbol = req.query.symbol;
    if (!symbol) {
      return res
          .status(400)
          .json({error: "Missing symbol query param"});
    }

    const url =
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;

    try {
      const response = await axios.get(url);
      return res.status(200).json(response.data);
    } catch (error) {
      console.error("🔥 Proxy error:", error.message);
      return res
          .status(500)
          .json({error: "Failed to fetch from Yahoo Finance"});
    }
  });
});
