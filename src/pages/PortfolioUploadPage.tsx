// MARK: Portfolio CSV Upload Page - PortfolioUploadPage.tsx
import { useState } from "react";
import Papa from "papaparse";

type PortfolioItem = {
  symbol: string;
  quantity: number;
  costBasis: number;
};

export default function PortfolioUploadPage() {
  const [data, setData] = useState<PortfolioItem[]>([]);
  const [fileName, setFileName] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const parsed = results.data.map((row: any) => ({
          symbol: row.symbol.toUpperCase(),
          quantity: parseFloat(row.quantity),
          costBasis: parseFloat(row.costBasis),
        }));
        setData(parsed);
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-800">Upload Portfolio (CSV)</h1>

      <div className="flex flex-col items-center">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="mb-4 p-2 rounded bg-white shadow"
        />

        {fileName && (
          <div className="text-sm text-gray-700 mb-4">
            Uploaded: <strong>{fileName}</strong>
          </div>
        )}

        {data.length > 0 && (
          <table className="w-full max-w-3xl bg-white rounded-xl shadow-lg mt-6 overflow-hidden">
            <thead className="bg-blue-100">
              <tr>
                <th className="p-3 text-left">Symbol</th>
                <th className="p-3 text-left">Quantity</th>
                <th className="p-3 text-left">Cost Basis</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, i) => (
                <tr key={i} className="border-t">
                  <td className="p-3">{item.symbol}</td>
                  <td className="p-3">{item.quantity}</td>
                  <td className="p-3">${item.costBasis.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
