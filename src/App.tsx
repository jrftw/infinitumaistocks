// MARK: App.tsx - Routing Setup
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import PortfolioUploadPage from "./pages/PortfolioUploadPage";
import ManualEntryForm from "./pages/ManualEntryForm";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/upload" element={<PortfolioUploadPage />} />
        <Route path="/manual" element={<ManualEntryForm />} />
        <Route path="/dashboard" element={<ManualEntryForm />} /> {/* 👈 This is your "dashboard" */}
      </Routes>
    </Router>
  );
}

export default App;
