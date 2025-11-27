// import React, { useState, useContext } from "react";
// import logo from "/logo.svg";
// import { Link, useNavigate } from "react-router-dom";
// import { AuthContext } from "../../context/AuthContext"; // ✅ Add this
// import { Eye, EyeOff } from 'lucide-react';


// const Login = () => {
//   const [loginEmail, setLoginEmail] = useState("");
//   const [loginPassword, setLoginPassword] = useState("");
//   const [signupName, setSignupName] = useState("");
//   const [signupEmail, setSignupEmail] = useState("");
//   const [signupPassword, setSignupPassword] = useState("");
//   const [showLoginPassword, setShowLoginPassword] = useState(false);
//   const [showSignupPassword, setShowSignupPassword] = useState(false);
//   const { login, register } = useContext(AuthContext);
//   const handleLogin = async () => {
//     const success = await login(loginEmail, loginPassword);
//     if (success) {
//       navigate("/"); // ✅ Navigate to dashboard
//     } else {
//       alert("Invalid email or password");
//     }
//   };
//   const handleRegister = async () => {
//     try {
//       await register(signupName, signupEmail, signupPassword);
//       alert("Registration successful! Please login.");
//       setIsFlipped(false); // Flip back to login
//     } catch (error) {
//       alert("Registration failed: " + error.response?.data?.message);
//     }
//   };

//   const [isFlipped, setIsFlipped] = useState(false);
//   const navigate = useNavigate();

//   return (
//     <div className="relative h-screen overflow-hidden">
//       {/* Logo */}
//       <div className="absolute m-5">
//         <img src={logo} alt="" className="object-cover w-36" />
//       </div>

//       {/* Main Layout */}
//       <div className="flex flex-row h-screen">
//         {/* Left Panel with Flip */}
//         <div
//           className="w-[35%] flex items-center justify-center bg-center bg-cover"
//           style={{
//             backgroundImage:
//               "linear-gradient(rgba(255,255,255,0.6), rgba(255,255,255,0.6)), url('/bgleft.png')",
//           }}
//         >
//           {/* Card Container */}
//           <div className="w-80 h-[400px] perspective mt-[30%]">
//             <div
//               className={`w-full h-full transition-transform duration-1000 transform-style-preserve-3d ${
//                 isFlipped ? "rotate-y-180" : ""
//               }`}
//             >
//               {/* Login Form (Front) */}
//               <div className="absolute flex flex-col w-full h-full backface-hidden">
//                 <div className="flex flex-row items-center justify-center gap-2">
//                   <h2 className="text-2xl font-medium">Login to</h2>
//                   <img src={logo} alt="" className="object-cover h-5 w-28" />
//                 </div>

//                 <input
//                   type="text"
//                   placeholder="Email"
//                   value={loginEmail}
//                   onChange={(e) => setLoginEmail(e.target.value)}
//                   className="w-full px-2 py-1 text-base border rounded-md mt-11"
//                 />
//                 <div className="relative mt-3">
//                   <input
//                     type={showLoginPassword ? 'text' : 'password'}
//                     placeholder="Password"
//                     value={loginPassword}
//                     onChange={(e) => setLoginPassword(e.target.value)}
//                     className="w-full px-2 py-1 text-base border rounded-md"
//                   />
//                   <button
//                     type="button"
//                     aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
//                     onClick={() => setShowLoginPassword(s => !s)}
//                     className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 focus:outline-none"
//                   >
//                     {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                   </button>
//                 </div>

//                 <div className="flex flex-row items-start justify-between mt-2">
//                   <div className="flex items-center gap-1">
//                     <input type="checkbox" className="text-xs" />
//                     <p className="text-xs">Keep Me Login</p>
//                   </div>
//                   <div className="flex flex-col items-end">
//                     <button className="text-xs text-[#334DE5]">
//                       Forgotten Password!
//                     </button>
//                     <p className="text-xs">
//                       New Here?{" "}
//                       <button
//                         onClick={() => setIsFlipped(true)}
//                         className="text-[#334DE5]"
//                       >
//                         Register here
//                       </button>
//                     </p>
//                   </div>
//                 </div>
//                 <button
//                   type="button"
//                   className="w-full bg-[#334DE5] text-white rounded-md py-[6px] mt-10"
//                   onClick={handleLogin}
//                 >
//                   Login
//                 </button>
//               </div>

//               {/* Signup Form (Back) */}
//               <div className="absolute flex flex-col w-full h-full rotate-y-180 backface-hidden">
//                 <div className="flex flex-row items-center justify-center gap-2">
//                   <h2 className="text-2xl font-medium">Sign Up</h2>
//                   <img src={logo} alt="" className="object-cover h-5 w-28" />
//                 </div>

//                 <input
//                   type="text"
//                   placeholder="Name"
//                   value={signupName}
//                   onChange={(e) => setSignupName(e.target.value)}
//                   className="w-full px-2 py-1 border rounded-md mt-11"
//                 />
//                 <input
//                   type="text"
//                   placeholder="Email"
//                   value={signupEmail}
//                   onChange={(e) => setSignupEmail(e.target.value)}
//                   className="w-full px-2 py-1 mt-3 border rounded-md"
//                 />
//                 <div className="relative mt-3">
//                   <input
//                     type={showSignupPassword ? 'text' : 'password'}
//                     placeholder="Password"
//                     value={signupPassword}
//                     onChange={(e) => setSignupPassword(e.target.value)}
//                     className="w-full px-2 py-1 border rounded-md"
//                   />
//                   <button
//                     type="button"
//                     aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
//                     onClick={() => setShowSignupPassword(s => !s)}
//                     className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 focus:outline-none"
//                   >
//                     {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                   </button>
//                 </div>

//                 <p className="mt-2 text-xs">
//                   Already have an account?{" "}
//                   <button
//                     onClick={() => setIsFlipped(false)}
//                     className="text-[#334DE5]"
//                   >
//                     Login here
//                   </button>
//                 </p>

//                 <button
//                   type="button"
//                   className="w-full bg-[#334DE5] text-white rounded-md py-[6px] mt-6"
//                   onClick={handleRegister}
//                 >
//                   Sign Up
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right Panel */}
//         <div className="relative w-[65%] perspective">
//           <div
//             className={`absolute inset-0 w-full h-full transition-transform duration-1000 transform-style-preserve-3d ${
//               isFlipped ? "rotate-y-180" : ""
//             }`}
//           >
//             {/* Front Side of Right BG */}
//             <div
//               className="absolute inset-0 bg-center bg-cover backface-hidden"
//               style={{ backgroundImage: "url('/bgright.png')" }}
//             ></div>

//             {/* Back Side of Right BG */}
//             <div
//               className="absolute inset-0 bg-center bg-cover rotate-y-180 backface-hidden"
//               style={{ backgroundImage: "url('/bg_right_back.png')" }}
//             ></div>
//           </div>
//         </div>
//       </div>

//       {/* Footer */}
//       <p className="text-xs absolute bottom-[18px] left-5 text-gray-500">
//         Developed By WebnestMedia
//       </p>

//       {/* Extra CSS for flip */}
//       <style>{`
//         .perspective { perspective: 1000px; }
//         .transform-style-preserve-3d { transform-style: preserve-3d; }
//         .backface-hidden { backface-visibility: hidden; }
//         .rotate-y-180 { transform: rotateY(180deg); }
//       `}</style>
//     </div>
//   );
// };

// export default Login;










import React, { useState, useContext, useRef, useEffect } from "react";
import logo from "/logo.svg";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import { ForgotPasswordModal } from '../../components/modals';

const Login = () => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const location = useLocation();
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [designation, setDesignation] = useState("");
  const [address, setAddress] = useState("");
  const [empid, setEmpid] = useState("");

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const navigate = useNavigate();

  const { login, register } = useContext(AuthContext);

  // prevent double-submit: simple time-based guard (800ms)
  const loginLastRef = useRef(0);
  const registerLastRef = useRef(0);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");

  // core login action
  const doLogin = async () => {
    setLoginError("");
    const res = await login(loginEmail, loginPassword);
    if (res && res.success) {
      navigate("/");
      return res;
    }
    // Show server-provided message if available
    const msg = res?.message || "Invalid email or password";
    setLoginError(msg);
    return res;
  };

  // debounced/throttled wrapper to prevent double clicks
  const handleLogin = async () => {
    const now = Date.now();
    if (now - loginLastRef.current < 800) return; // ignore rapid clicks
    loginLastRef.current = now;
    setIsLoggingIn(true);
    try {
      await doLogin();
    } finally {
      // allow next click after small delay
      setTimeout(() => setIsLoggingIn(false), 300);
    }
  };

  const doRegister = async () => {
    setRegisterError("");
    const res = await register({
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      phoneNumber,
      designation,
      address,
      empid,
    });
    if (res && res.success) {
      // success
      toast.success("Registration successful! Please login.");
      setIsFlipped(false);
      return res;
    }
    const msg = res?.message || "Registration failed";
    setRegisterError(msg);
    throw new Error(msg);
  };

  const handleRegister = async () => {
    const now = Date.now();
    if (now - registerLastRef.current < 800) return;
    registerLastRef.current = now;
    setIsRegistering(true);
    try {
      await doRegister();
    } catch (error) {
      // registerError state already set in doRegister; fallback to toast
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setTimeout(() => setIsRegistering(false), 300);
    }
  };

  // Open reset modal automatically when URL contains ?token=...
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      if (token) {
        // Redirect to the dedicated reset-password page (path param)
        navigate(`/reset-password/${token}`);
      }
    } catch {
      // ignore
    }
  }, [location.search, navigate]);




  return (
    <div className="relative h-screen overflow-hidden">
      {/* Logo */}
      <div className="absolute m-5">
        <img src={logo} alt="Logo" className="object-cover w-36" />
      </div>

      <div className="flex flex-row h-screen">
        {/* LEFT PANEL (Form) */}
        <div
          className="lg:w-[35%] w-full lg:p-0 p-8 flex items-center justify-center bg-center bg-cover"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6), rgba(255,255,255,0.6)), url('/bgleft.png')",
          }}
        >
          <div className="w-80 h-[550px] perspective mt-[40%]">
            <div
              className={`w-full h-full transition-transform duration-1000 transform-style-preserve-3d ${
                isFlipped ? "rotate-y-180" : ""
              }`}
            >
              {/* LOGIN FORM */}
              <div className="absolute flex flex-col w-full h-full backface-hidden">
                <div className="flex flex-row items-center justify-center gap-2">
                  <h2 className="text-2xl font-medium">Login to</h2>
                  <img src={logo} alt="Logo" className="object-cover  w-28" />
                </div>

                <input
                  type="text"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
                  className="w-full px-2 py-1 text-base border rounded-md mt-11"
                />
                <div className="relative mt-3">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
                    className="w-full px-2 py-1 text-base border rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
                  >
                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="flex flex-row items-start justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <input type="checkbox" className="text-xs" />
                    <p className="text-xs">Keep Me Logged In</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <button className="text-xs text-[#334DE5]" onClick={() => setIsForgotOpen(true)}>
                      Forgotten Password?
                    </button>
                    <p className="text-xs">
                      New Here?{" "}
                      <button
                        onClick={() => setIsFlipped(true)}
                        className="text-[#334DE5]"
                      >
                        Register here
                      </button>
                    </p>
                  </div>
                </div>

                {loginError && (
                  <div className="mt-4 text-sm text-red-600 " role="alert">{loginError}</div>
                )}
                <button
                  type="button"
                  className={`w-full ${isLoggingIn ? 'opacity-60 cursor-not-allowed' : ''} bg-[#334DE5] text-white rounded-md py-[6px] mt-3`}
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? 'Logging in...' : 'Login'}
                </button>
              </div>

              {/* REGISTER FORM */}
              <div className="absolute flex flex-col w-full h-full rotate-y-180 backface-hidden overflow-y-auto p-2">
                <div className="flex flex-row items-center justify-center gap-2">
                  <h2 className="text-2xl font-medium">Sign Up</h2>
                  <img src={logo} alt="Logo" className="object-cover  w-28" />
                </div>

                <input
                  type="text"
                  placeholder="Name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="w-full px-2 py-1 border rounded-md mt-4"
                />
                <input
                  type="text"
                  placeholder="Email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full px-2 py-1 mt-3 border rounded-md"
                />
                <div className="relative mt-3">
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    placeholder="Password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full px-2 py-1 border rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
                  >
                    {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-2 py-1 mt-3 border rounded-md"
                />
                <input
                  type="text"
                  placeholder="Designation"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-2 py-1 mt-3 border rounded-md"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-2 py-1 mt-3 border rounded-md"
                />
                <input
                  type="text"
                  placeholder="Employee ID"
                  value={empid}
                  onChange={(e) => setEmpid(e.target.value)}
                  className="w-full px-2 py-1 mt-3 border rounded-md"
                />

                <p className="mt-2 text-xs">
                  Already have an account?{" "}
                  <button
                    onClick={() => setIsFlipped(false)}
                    className="text-[#334DE5]"
                  >
                    Login here
                  </button>
                </p>

                {registerError && (
                  <div className="mt-3 text-sm text-red-600" role="alert">{registerError}</div>
                )}
                <button
                  type="button"
                  className={`w-full ${isRegistering ? 'opacity-60 cursor-not-allowed' : ''} bg-[#334DE5] text-white rounded-md py-[6px] mt-3`}
                  onClick={handleRegister}
                  disabled={isRegistering}
                >
                  {isRegistering ? 'Signing up...' : 'Sign Up'}
                </button>
              </div>


            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="relative w-[65%] perspective max-sm:hidden">
          <div
            className={`absolute inset-0 w-full h-full transition-transform duration-1000 transform-style-preserve-3d ${
              isFlipped ? "rotate-y-180" : ""
            }`}
          >
            <div
              className="absolute inset-0 bg-center bg-cover backface-hidden"
              style={{ backgroundImage: "url('/bgright.png')" }}
            ></div>
            <div
              className="absolute inset-0 bg-center bg-cover rotate-y-180 backface-hidden"
              style={{ backgroundImage: "url('/bg_right_back.png')" }}
            ></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs absolute bottom-[18px] left-5 text-gray-500">
        Developed By WebnestMedia
      </p>

      {/* Forgot / Reset Modals */}
      <ForgotPasswordModal isOpen={isForgotOpen} onClose={() => setIsForgotOpen(false)} />

      <style>{`
        .perspective { perspective: 1000px; }
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default Login;