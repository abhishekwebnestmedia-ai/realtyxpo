import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";

// Compact Login/Signup component
// Email & password required for both flows per requirements
const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useContext(AuthContext);

  const [mode, setMode] = useState("login"); // 'login' or 'signup'
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!emailPattern.test(loginEmail)) return toast.error("Enter valid email");
    if (!loginPassword) return toast.error("Password required");
    const res = await login(loginEmail, loginPassword);
    if (res?.success) {
      toast.success("Login successful");
      navigate("/");
    } else toast.error(res?.message || "Login failed");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!emailPattern.test(signupEmail)) return toast.error("Enter valid email");
    if (!signupPassword) return toast.error("Password required");
    const res = await register({ name: signupName || undefined, email: signupEmail, password: signupPassword });
    if (res?.success) {
      toast.success("Registered. Please login.");
      setMode("login");
      setSignupPassword("");
    } else toast.error(res?.message || "Registration failed");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">{mode === "login" ? "Login" : "Sign Up"}</h1>
          <button
            type="button"
            className="text-sm text-blue-600 hover:underline"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "Create account" : "Have an account? Login"}
          </button>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                pattern={emailPattern.source}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>
            <div className="relative">
              <label className="block text-sm mb-1">Password</label>
              <input
                type={showLoginPassword ? "text" : "password"}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword((v) => !v)}
                className="absolute right-2 top-9 -translate-y-1/2 text-gray-600"
                aria-label="Toggle password visibility"
              >
                {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700">
              Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Name (optional)</label>
              <input
                type="text"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
                pattern={emailPattern.source}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>
            <div className="relative">
              <label className="block text-sm mb-1">Password</label>
              <input
                type={showSignupPassword ? "text" : "password"}
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowSignupPassword((v) => !v)}
                className="absolute right-2 top-9 -translate-y-1/2 text-gray-600"
                aria-label="Toggle password visibility"
              >
                {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700">
              Sign Up
            </button>
          </form>
        )}

        <p className="text-xs text-gray-500 mt-6 text-center">Developed by WebnestMedia</p>
      </div>
    </div>
  );
};

export default Login;
