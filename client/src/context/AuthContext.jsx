import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const isAuthenticated = Boolean(token && user);

  useEffect(() => {
    async function bootstrapAuth() {
      const savedToken = localStorage.getItem("token");
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        if (data?.success) {
          setUser(data.data);
        } else {
          localStorage.removeItem("token");
        }
      } catch (_error) {
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    }

    bootstrapAuth();
  }, []);

  async function login(payload) {
    try {
      const { data } = await api.post("/auth/login", payload);
      if (!data?.success) {
        throw new Error(data?.message || "Login failed");
      }
      localStorage.setItem("token", data.data.token);
      setUser(data.data.user);
      toast.success(data.message || "Login successful");
      return { ok: true, user: data.data.user };
    } catch (error) {
      const message = error?.response?.data?.message || "Login failed";
      toast.error(message);
      return { ok: false, message };
    }
  }

  async function register(payload) {
    try {
      const { data } = await api.post("/auth/register", payload);
      if (!data?.success) {
        throw new Error(data?.message || "Registration failed");
      }
      localStorage.setItem("token", data.data.token);
      setUser(data.data.user);
      toast.success(data.message || "Registration successful");
      return { ok: true, user: data.data.user };
    } catch (error) {
      const message = error?.response?.data?.message || "Registration failed";
      toast.error(message);
      return { ok: false, message };
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    toast.success("Logged out");
  }

  async function updateProfile(payload) {
    try {
      const { data } = await api.put("/auth/profile", payload);
      if (!data?.success) {
        throw new Error(data?.message || "Profile update failed");
      }
      localStorage.setItem("token", data.data.token);
      setUser(data.data.user);
      toast.success(data.message || "Profile updated successfully");
      return { ok: true, user: data.data.user };
    } catch (error) {
      const message = error?.response?.data?.message || "Profile update failed";
      toast.error(message);
      return { ok: false, message };
    }
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, loading, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
