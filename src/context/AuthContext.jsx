import React, { useState, useEffect } from "react";
import api from "../api/api";
import queryClient from "../queryClient";
import { AuthContext } from "./AuthContextCore";
// Re-export the context so existing imports using named export keep working
export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper: parse JWT payload safely (used only for fallback when token is
  // available client-side). When using HttpOnly cookies this is not possible
  // and the server should provide profile via /auth/profile.
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
      // When server manages auth with HttpOnly cookies, this endpoint will
      // return the current user's profile based on the cookie.
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
      return true;
    } catch (error) {
      // Detailed debug output to help diagnose auth failures
      const serverData = error.response?.data;
      console.error("Failed to fetch user profile:", serverData || error.message);
      if (error.response?.status === 401) {
        console.warn('Auth profile returned 401. Server message:', serverData?.message || serverData);
      }
      setUser(null);
      return false;
    }
  };

  // Restore user on page load. Prefer server-side (HttpOnly cookie) session by
  // calling /auth/profile directly. If that fails but a client-side token is
  // present (fallback), try to use it.
  useEffect(() => {
    const checkUser = async () => {
      // If a readable token exists in cookie (fallback storage), set the
      // Authorization header BEFORE calling /auth/profile so servers that
      // expect a Bearer header receive it on the first request. Note: if
      // the cookie is HttpOnly this will be null and we rely on cookie auth.
      try {
        const preToken = localStorage.getItem('token');
        if (preToken) api.defaults.headers.common["Authorization"] = `Bearer ${preToken}`;
      } catch {
        // ignore
      }

      // Try server-managed cookie session first
      const ok = await fetchUserProfile();
      if (ok) {
        setLoading(false);
        return;
      }
      // If server profile failed, continue to fallback handling below.

      // Fallback: if an old client-side token exists (non-HttpOnly cookie),
      // attach it to Authorization header and try again.
  const token = localStorage.getItem('token');
      if (token) {
        // check expiry client-side if possible
        const payload = parseJwt(token);
        if (payload && payload.exp && Date.now() > payload.exp * 1000) {
          console.warn("Token expired, clearing stored token");
          try { localStorage.removeItem('token'); } catch { /* ignore */ }
          delete api.defaults.headers.common["Authorization"];
          setUser(null);
          setLoading(false);
          return;
        }

        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const ok2 = await fetchUserProfile();
        if (!ok2) {
          // fallback failed - clear
          try { localStorage.removeItem('token'); } catch { /* ignore */ }
          delete api.defaults.headers.common["Authorization"];
          setUser(null);
        }
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

      // Preferred flow: server sets an HttpOnly cookie and we can fetch the
      // profile immediately. For backward compatibility, if the server
      // returns a token in the response body, we fall back to setting it
      // client-side (not HttpOnly).
      // Check whether server set a cookie by attempting to read it.
      if (res.data?.token) {
        const token = res.data.token;
  try { localStorage.setItem('token', token); } catch { /* ignore */ }
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

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
  // const register = async (name, email, password) => {
  //   try {
  //     const res = await api.post("/auth/register", { name, email, password });
  //     return { success: true, data: res.data };
  //   } catch (error) {
  //     console.error(
  //       "Registration failed:",
  //       error.response?.data || error.message
  //     );
  //     return {
  //       success: false,
  //       message: error.response?.data?.message || "Registration failed",
  //     };
  //   }
  // };

  // Register function


  // ✅ FIXED REGISTER FUNCTION
const register = async (userData) => {
  try {
    const res = await api.post("/auth/register", userData);
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
  const logout = async () => {
    try {
      // Ask server to clear HttpOnly cookie if supported
      await api.post('/auth/logout');
    } catch (err) {
      // ignore - may not exist on server (fallback below will clear client-side)
      console.warn('Server logout failed or not available:', err?.message || err);
    }

    // Clear any client-side stored token and headers
  try { localStorage.removeItem('token'); } catch { /* ignore */ }
    setUser(null);
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
