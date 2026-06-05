import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import NewComplaintPage from "./pages/NewComplaintPage";
import MyComplaintsPage from "./pages/MyComplaintsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminComplaintsPage from "./pages/admin/AdminComplaintsPage";
import AdminComplaintDetailPage from "./pages/admin/AdminComplaintDetailPage";
import AdminMapPage from "./pages/admin/AdminMapPage";
import WorkerQueuePage from "./pages/worker/WorkerQueuePage";
import WorkerComplaintDetailPage from "./pages/worker/WorkerComplaintDetailPage";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";
import "./styles/global.css";

// Scoping wrapper to contain and protect unmigrated legacy styles
const LegacyWrapper = ({ children }) => (
  <div className="legacy-theme w-full min-h-[calc(100vh-64px)]">
    {children}
  </div>
);

export default function App() {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300 font-sans">
      {/* Top Navbar */}
      <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      {/* Sidebar for Authenticated Users */}
      {isAuthenticated && (
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      )}

      {/* Main Content Area */}
      <main
        className={`pt-16 min-h-[calc(100vh-64px)] transition-all duration-300
          ${isAuthenticated 
            ? (isSidebarOpen ? "pl-64 md:pl-[260px]" : "pl-[76px]") 
            : "pl-0"
          }
        `}
      >
        <Routes>
          {/* Public */}
          <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

          {/* Common */}
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

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
            <div className="page-wrapper flex items-center justify-center min-h-[400px]">
              <div className="text-center p-8 rounded-2xl border border-dashed border-inherit bg-emerald-500/5">
                <span className="text-4xl">🔍</span>
                <h2 className="text-2xl font-bold mt-4">Page not found</h2>
                <p className="opacity-70 mt-2">The page you're looking for doesn't exist.</p>
              </div>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}