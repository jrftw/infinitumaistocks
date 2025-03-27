// MARK: Dashboard Page - Dashboard.tsx
import ManualEntryForm from "./ManualEntryForm";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">📊 Dashboard</h1>
      <ManualEntryForm />
      {/* Add more sections/components here later */}
    </div>
  );
}
