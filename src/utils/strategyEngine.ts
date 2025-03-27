// MARK: AI Strategy Engine - strategyEngine.ts
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

// Yahoo Finance quote summary endpoint (unofficial public endpoint)
export async function getLivePrice(symbol: string): Promise<number> {
  try {
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`
    );
    const price = response.data.quoteResponse.result[0]?.regularMarketPrice;
    return price ?? 0;
  } catch (err) {
    console.error(`Failed to fetch price for ${symbol}`, err);
    return 0;
  }
}

export async function analyzePortfolioAsync(
  portfolio: PortfolioItem[]
): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  for (const item of portfolio) {
    const currentPrice = await getLivePrice(item.symbol);
    const priceChange = ((currentPrice - item.costBasis) / item.costBasis) * 100;

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
      reason,
    });
  }

  return recommendations;
}
