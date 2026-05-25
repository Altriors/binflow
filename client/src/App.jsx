import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NewComplaintPage from "./pages/NewComplaintPage";
import MyComplaintsPage from "./pages/MyComplaintsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminComplaintsPage from "./pages/admin/AdminComplaintsPage";
import AdminComplaintDetailPage from "./pages/admin/AdminComplaintDetailPage";
import AdminMapPage from "./pages/admin/AdminMapPage";
import WorkerQueuePage from "./pages/worker/WorkerQueuePage";
import WorkerComplaintDetailPage from "./pages/worker/WorkerComplaintDetailPage";
import "./styles/global.css";

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
      <Routes>
        {/* Public */}
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

        {/* Common */}
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />

        {/* Citizen */}
        <Route path="/complaints/new" element={<ProtectedRoute roles={["citizen"]}><NewComplaintPage /></ProtectedRoute>} />
        <Route path="/complaints/my"  element={<ProtectedRoute roles={["citizen"]}><MyComplaintsPage /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin"                    element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/complaints"         element={<ProtectedRoute roles={["admin"]}><AdminComplaintsPage /></ProtectedRoute>} />
        <Route path="/admin/complaints/:id"     element={<ProtectedRoute roles={["admin"]}><AdminComplaintDetailPage /></ProtectedRoute>} />
        <Route path="/admin/map"                element={<ProtectedRoute roles={["admin"]}><AdminMapPage /></ProtectedRoute>} />

        {/* Worker */}
        <Route path="/worker"       element={<ProtectedRoute roles={["worker"]}><WorkerQueuePage /></ProtectedRoute>} />
        <Route path="/worker/:id"   element={<ProtectedRoute roles={["worker"]}><WorkerComplaintDetailPage /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={
          <div className="page-wrapper">
            <div className="empty-state">
              <span className="empty-state-icon">🔍</span>
              <h2>Page not found</h2>
              <p>The page you're looking for doesn't exist.</p>
            </div>
          </div>
        } />
      </Routes>
      </main>
    </div>
  );
}