import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
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
          <Route path="/login" element={<LegacyWrapper><PublicOnlyRoute><LoginPage /></PublicOnlyRoute></LegacyWrapper>} />
          <Route path="/register" element={<LegacyWrapper><PublicOnlyRoute><RegisterPage /></PublicOnlyRoute></LegacyWrapper>} />

          {/* Common */}
          <Route path="/" element={<LegacyWrapper><ProtectedRoute><HomePage /></ProtectedRoute></LegacyWrapper>} />

          {/* Citizen */}
          <Route path="/complaints/new" element={<LegacyWrapper><ProtectedRoute roles={["citizen"]}><NewComplaintPage /></ProtectedRoute></LegacyWrapper>} />
          <Route path="/complaints/my"  element={<LegacyWrapper><ProtectedRoute roles={["citizen"]}><MyComplaintsPage /></ProtectedRoute></LegacyWrapper>} />

          {/* Admin */}
          <Route path="/admin"                    element={<LegacyWrapper><ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute></LegacyWrapper>} />
          <Route path="/admin/complaints"         element={<LegacyWrapper><ProtectedRoute roles={["admin"]}><AdminComplaintsPage /></ProtectedRoute></LegacyWrapper>} />
          <Route path="/admin/complaints/:id"     element={<LegacyWrapper><ProtectedRoute roles={["admin"]}><AdminComplaintDetailPage /></ProtectedRoute></LegacyWrapper>} />
          <Route path="/admin/map"                element={<LegacyWrapper><ProtectedRoute roles={["admin"]}><AdminMapPage /></ProtectedRoute></LegacyWrapper>} />

          {/* Worker */}
          <Route path="/worker"       element={<ProtectedRoute roles={["worker"]}><WorkerQueuePage /></ProtectedRoute>} />
          <Route path="/worker/:id"   element={<LegacyWrapper><ProtectedRoute roles={["worker"]}><WorkerComplaintDetailPage /></ProtectedRoute></LegacyWrapper>} />

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