import React, { createContext, useState, useEffect } from "react";
import api from "../api/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch user profile
  

  // ✅ Restore user from token on page refresh
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        await fetchUserProfile(token); // Wait until profile is fetched
      } else {
        setUser(null);
      }
      setLoading(false); // Now loading becomes false only after fetch is done
    };

    checkUser();
  }, []);

  // ✅ Login function
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const token = res.data.token;

      localStorage.setItem("token", token);
      await fetchUserProfile(token); // Fetch profile after login

      return { success: true };
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  // ✅ Register function
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
  const fetchUserProfile = async (token) => {
    try {
      const res = await api.get("/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(res.data); // Set full user profile
    } catch (error) {
      console.error(
        "Failed to fetch user profile:",
        error.response?.data || error.message
      );
      setUser(null);
    }
  };
  // ✅ Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
