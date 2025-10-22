import React, { useState, useEffect } from "react";
import api from "../api/api";
import { setCookie, getCookie, deleteCookie } from '../utils/cookies';
import queryClient from "../queryClient";
import { AuthContext } from "./AuthContextCore";
// Re-export the context so existing imports using named export keep working
export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper: parse JWT payload safely
  const parseJwt = (token) => {
    try {
      const base64Payload = token.split(".")[1];
      const payload = JSON.parse(
        decodeURIComponent(
          atob(base64Payload)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        )
      );
      return payload;
    } catch {
      return null;
    }
  };

  const fetchUserProfile = async () => {
    try {
      // rely on api defaults if Authorization header is set
      const res = await api.get("/auth/profile");
      // normalize response shapes
      const raw = res.data?.data || res.data || null;
      const profile = raw?.user || raw || null;

      // default permissions shape - include all known flags the UI expects
      const defaultPermissions = {
        superAdmin: false,
        dashboard: false,
        dailyPlans: false,
        allLeads: false,
        inventory: false,
        projectsWorking: false,
        brokersRequirements: false,
        myTeam: false,
        findOpportunity: false,
        learnGrow: false,
        dataBase: false,
        rentalLeads: false,
        buyerLeads: false,
        deadLeads: false,
        completedLeads: false,
        rentalInventory: false,
        saleInventory: false,
        completedInventory: false
      };

      // permissions may be present under profile.permissions or as top-level keys on profile
      const permsSource = (profile && (profile.permissions || profile)) || {};
      const normalizedPermissions = { ...defaultPermissions };
      Object.keys(defaultPermissions).forEach((k) => {
        // support snake_case variants too
        const snake = k.replace(/([A-Z])/g, '_$1').toLowerCase();
        normalizedPermissions[k] = Boolean(permsSource[k] ?? permsSource[snake] ?? false);
      });

      const finalProfile = profile ? { ...profile, permissions: normalizedPermissions } : null;
      setUser(finalProfile); // Set full user profile with normalized permissions
    } catch (error) {
      console.error(
        "Failed to fetch user profile:",
        error.response?.data || error.message
      );
      setUser(null);
    }
  };

  // Restore user from token on page refresh
  useEffect(() => {
    const checkUser = async () => {
      const token = getCookie('token');
      if (token) {
        // set api default header so all api requests include token
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // decode and validate expiry
        const payload = parseJwt(token);
        if (payload && payload.exp && Date.now() > payload.exp * 1000) {
          // token expired -> clear and don't try to fetch profile
            console.warn("Token expired, clearing stored token");
            deleteCookie('token');
          delete api.defaults.headers.common["Authorization"];
          setUser(null);
          setLoading(false);
          return;
        }

        // token valid - fetch profile
        await fetchUserProfile();
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });

      const token = res.data.token;

  // Store token in cookie (note: HttpOnly must be set by server for stronger security)
  setCookie('token', token, { days: 7 });
  // set default Authorization header for api instance
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      await fetchUserProfile(); // Fetch profile after login

      return { success: true };
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      const res = await api.post("/auth/register", { name, email, password });
      return { success: true, data: res.data };
    } catch (error) {
      console.error(
        "Registration failed:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  // Logout function
  const logout = () => {
    deleteCookie('token');
    setUser(null);
    // remove default header so api requests aren't sent with stale token
    delete api.defaults.headers.common["Authorization"];
    // Clear react-query cache immediately on logout to avoid showing stale data
    try {
      queryClient.clear();
    } catch (err) {
      console.error("Failed to clear queryClient on logout:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
