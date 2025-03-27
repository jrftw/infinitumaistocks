// MARK: StockChart.tsx - 7-Day Historical Line Chart
import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Props = {
  symbol: string;
};

export default function StockChart({ symbol }: Props) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const end = Math.floor(Date.now() / 1000);
        const start = end - 7 * 24 * 60 * 60;

        const response = await axios.get(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?symbol=${symbol}&period1=${start}&period2=${end}&interval=1d`
        );

        const result = response.data.chart.result[0];
        const timestamps = result.timestamp;
        const prices = result.indicators.quote[0].close;

        const formatted = timestamps.map((t: number, i: number) => ({
          date: new Date(t * 1000).toLocaleDateString(),
          price: prices[i],
        }));

        setData(formatted);
      } catch (error) {
        console.error("Chart error:", error);
      }
    }

    fetchHistory();
  }, [symbol]);

  return (
    <div className="bg-white rounded-xl p-4 shadow mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{symbol} - 7 Day Chart</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={["auto", "auto"]} />
          <Tooltip />
          <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
