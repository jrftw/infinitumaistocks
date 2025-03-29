// MARK: Manual Entry Page - ManualEntryForm.tsx
import { useState, useEffect } from "react";
import {
  savePortfolio,
  loadPortfolio,
  PortfolioItem as FirestorePortfolioItem,
} from "../firebase";
import {
  analyzePortfolioAsync,
  getLivePrice,
  Recommendation,
} from "../utils/strategyEngine";
import StockChart from "../components/StockChart";
import { useNavigate, Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

type PortfolioItem = FirestorePortfolioItem & {
  currentPrice?: number;
  value?: number;
  gainLoss?: number;
};

export default function ManualEntryForm() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [costBasis, setCostBasis] = useState<number>(0);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  useEffect(() => {
    loadPortfolio().then(async (data) => {
      const enriched = await Promise.all(
        data.map(async (item) => {
          const currentPrice = await getLivePrice(item.symbol);
          const value = currentPrice * item.quantity;
          const gainLoss =
            ((currentPrice - item.costBasis) / item.costBasis) * 100;
          return { ...item, currentPrice, value, gainLoss };
        })
      );
      setPortfolio(enriched);
    });
  }, []);

  useEffect(() => {
    if (portfolio.length > 0) {
      savePortfolio(portfolio);
      analyzePortfolioAsync(portfolio).then(setRecommendations);
    }
  }, [portfolio]);

  const addEntry = async () => {
    if (!symbol || quantity <= 0 || costBasis <= 0) return;

    const livePrice = await getLivePrice(symbol);
    const value = livePrice * quantity;
    const gainLoss = ((livePrice - costBasis) / costBasis) * 100;

    const newItem: PortfolioItem = {
      symbol: symbol.toUpperCase(),
      quantity,
      costBasis,
      currentPrice: livePrice,
      value,
      gainLoss,
    };

    setPortfolio([...portfolio, newItem]);
    setSymbol("");
    setQuantity(0);
    setCostBasis(0);
  };

  const deleteEntry = (index: number) => {
    const updated = [...portfolio];
    updated.splice(index, 1);
    setPortfolio(updated);
  };

  const editEntry = async (
    index: number,
    field: "quantity" | "costBasis",
    value: number
  ) => {
    const updated = [...portfolio];
    updated[index][field] = value;

    const currentPrice = await getLivePrice(updated[index].symbol);
    updated[index].currentPrice = currentPrice;
    updated[index].value = currentPrice * updated[index].quantity;
    updated[index].gainLoss =
      ((currentPrice - updated[index].costBasis) / updated[index].costBasis) *
      100;

    setPortfolio(updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">InfinitumAiStocks</h1>
        <div className="flex gap-4">
          <Link
            to="/upload"
            className="bg-blue-100 text-blue-800 px-4 py-2 rounded hover:bg-blue-200 transition"
          >
            CSV Upload
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Log Out
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm mb-1 text-gray-700">Symbol</label>
            <input
              type="text"
              placeholder="e.g. AAPL"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700">Quantity</label>
            <input
              type="number"
              placeholder="e.g. 10"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value))}
              className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700">
              Avg Cost Per Share
            </label>
            <input
              type="number"
              placeholder="e.g. 145"
              value={costBasis}
              onChange={(e) => setCostBasis(parseFloat(e.target.value))}
              className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <button
          onClick={addEntry}
          className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition w-full"
        >
          Add to Portfolio
        </button>

        {portfolio.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm border-t mt-4 text-left">
              <thead className="bg-blue-100 text-gray-700 font-semibold">
                <tr>
                  <th className="p-3">Symbol</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Avg Cost</th>
                  <th className="p-3">Live Price</th>
                  <th className="p-3">Market Value</th>
                  <th className="p-3">Gain/Loss</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-3 font-semibold">{item.symbol}</td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          editEntry(index, "quantity", parseFloat(e.target.value))
                        }
                        className="w-20 border rounded px-2"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={item.costBasis}
                        onChange={(e) =>
                          editEntry(index, "costBasis", parseFloat(e.target.value))
                        }
                        className="w-20 border rounded px-2"
                      />
                    </td>
                    <td className="p-3">
                      ${item.currentPrice?.toFixed(2) || "–"}
                    </td>
                    <td className="p-3">
                      ${item.value?.toFixed(2) || "–"}
                    </td>
                    <td className="p-3">
                      {item.gainLoss !== undefined ? (
                        <span
                          className={
                            item.gainLoss > 0
                              ? "text-green-600 font-bold"
                              : item.gainLoss < 0
                              ? "text-red-600 font-bold"
                              : "text-gray-600"
                          }
                        >
                          {item.gainLoss.toFixed(2)}%
                        </span>
                      ) : (
                        "–"
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => deleteEntry(index)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-blue-700 mb-4">
              AI Recommendations
            </h2>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li
                  key={index}
                  className="bg-white p-4 rounded shadow border-l-4"
                  style={{
                    borderColor:
                      rec.action === "BUY"
                        ? "#10b981"
                        : rec.action === "SELL"
                        ? "#f59e0b"
                        : rec.action === "SHORT"
                        ? "#ef4444"
                        : "#3b82f6",
                  }}
                >
                  <strong>{rec.symbol}</strong>: {rec.action} @ $
                  {rec.currentPrice.toFixed(2)} — {rec.reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {portfolio.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-blue-700 mb-4">
              Stock History (7-Day)
            </h2>
            {portfolio.map((item, index) => (
              <StockChart key={index} symbol={item.symbol} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}