// MARK: strategyEngine.ts - Live Pricing + AI Recommendations + Firebase Proxy
import axios from "axios";

export type PortfolioItem = {
  symbol: string;
  quantity: number;
  costBasis: number;
};

export type Recommendation = {
  symbol: string;
  currentPrice: number;
  action: "BUY" | "SELL" | "HOLD" | "SHORT";
  reason: string;
};

// 🔁 Optional symbol correction map
const symbolMap: Record<string, string> = {
  TSMC: "TSM", // Taiwan Semiconductor
  FACEBOOK: "META",
  GOOGLE: "GOOGL"
};

export function resolveSymbol(input: string): string {
  const upper = input.toUpperCase();
  const resolved = symbolMap[upper] || upper;
  console.log(`🔍 resolveSymbol: '${input}' → '${resolved}'`);
  return resolved;
}

// ✅ Uses your deployed Firebase Function
export async function getLivePrice(symbol: string): Promise<number> {
  const resolved = resolveSymbol(symbol);

  const url = `https://yahooproxy-ie7uxurmaa-uc.a.run.app?symbol=${resolved}`;
  console.log(`🌐 Fetching price for ${resolved} via:\n${url}`);

  try {
    const response = await axios.get(url);
    const data = response?.data;

    console.log(`📦 Raw Yahoo Response for ${resolved}:`, data);

    if (!data || !data.quoteResponse || !Array.isArray(data.quoteResponse.result)) {
      console.warn(`⚠️ Malformed or missing quoteResponse for ${resolved}`);
      return 0;
    }

    const result = data.quoteResponse.result;
    if (result.length === 0) {
      console.warn(`❌ No data returned for ${resolved}`);
      return 0;
    }

    const price = result[0]?.regularMarketPrice;
    if (typeof price !== "number") {
      console.warn(`❌ Missing or invalid price for ${resolved}`, result[0]);
      return 0;
    }

    console.log(`✅ ${resolved} live price: $${price}`);
    return price;
  } catch (err) {
    console.error(`🔥 Error fetching price for ${resolved}`, err);
    return 0;
  }
}

// 🧠 AI recommendation engine with live price + detailed logging
export async function analyzePortfolioAsync(
  portfolio: PortfolioItem[]
): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  console.log("📊 Analyzing portfolio:", portfolio);

  for (const item of portfolio) {
    console.log(`➡️ Analyzing ${item.symbol}...`);
    const currentPrice = await getLivePrice(item.symbol);

    if (currentPrice === 0) {
      console.log(`⚠️ Skipping ${item.symbol} due to missing price`);
      recommendations.push({
        symbol: item.symbol,
        currentPrice: 0,
        action: "HOLD",
        reason: "Live price not available or symbol invalid"
      });
      continue;
    }

    const priceChange = ((currentPrice - item.costBasis) / item.costBasis) * 100;
    console.log(`📈 Price change for ${item.symbol}: ${priceChange.toFixed(2)}%`);

    let action: Recommendation["action"];
    let reason: string;

    if (priceChange >= 20) {
      action = "SELL";
      reason = `Up ${priceChange.toFixed(2)}% — secure profit`;
    } else if (priceChange <= -15) {
      action = "SHORT";
      reason = `Down ${priceChange.toFixed(2)}% — consider short if trend continues`;
    } else if (priceChange > -5 && priceChange < 5) {
      action = "HOLD";
      reason = `Stable around cost basis`;
    } else {
      action = "BUY";
      reason = `Undervalued — potential upside`;
    }

    recommendations.push({
      symbol: item.symbol,
      currentPrice,
      action,
      reason
    });

    console.log(`🧠 Recommendation for ${item.symbol}:`, {
      currentPrice,
      action,
      reason
    });
  }

  return recommendations;
}