import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NewComplaintPage from "./pages/NewComplaintPage";
import MyComplaintsPage from "./pages/MyComplaintsPage";
import "../src/styles/global.css";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/complaints/new" element={<ProtectedRoute roles={["citizen"]}><NewComplaintPage /></ProtectedRoute>} />
        <Route path="/complaints/my" element={<ProtectedRoute roles={["citizen"]}><MyComplaintsPage /></ProtectedRoute>} />
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
        <Route path="*" element={
          <div className="page-wrapper">
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h2>Page not found</h2>
              <p>The page you're looking for doesn't exist.</p>
            </div>
          </div>
        } />
      </Routes>
    </>
  );
}