import React, { createContext, useState, useEffect } from "react";
import api from "../api/api";

export const AuthContext = createContext();

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
      setUser(res.data); // Set full user profile
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
      const token = localStorage.getItem("token");
      if (token) {
        // set api default header so all api requests include token
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // decode and validate expiry
        const payload = parseJwt(token);
        if (payload && payload.exp && Date.now() > payload.exp * 1000) {
          // token expired -> clear and don't try to fetch profile
          console.warn("Token expired, clearing stored token");
          localStorage.removeItem("token");
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

      localStorage.setItem("token", token);
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
    localStorage.removeItem("token");
    setUser(null);
    // remove default header so api requests aren't sent with stale token
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
