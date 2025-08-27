import React, { useState } from 'react';
import logo from '../../public/logo.svg';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    // Here you can add authentication logic before navigating
    navigate('/'); // ✅ Navigate to main dashboard (or use /dashboard if you add that route)
  };

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Logo */}
      <div className="absolute m-5">
        <img src={logo} alt="" className="object-cover w-36" />
      </div>

      {/* Main Layout */}
      <div className="flex flex-row h-screen">
        {/* Left Panel with Flip */}
        <div
          className="w-[35%] flex items-center justify-center bg-center bg-cover"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6), rgba(255,255,255,0.6)), url('/bgleft.png')",
          }}
        >
          {/* Card Container */}
          <div className="w-80 h-[400px] perspective mt-[30%]">
            <div
              className={`w-full h-full transition-transform duration-1000 transform-style-preserve-3d ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* Login Form (Front) */}
              <div className="absolute flex flex-col w-full h-full backface-hidden">
                <div className="flex flex-row items-center justify-center gap-2">
                  <h2 className="text-2xl font-medium">Login to</h2>
                  <img src={logo} alt="" className="object-cover h-5 w-28" />
                </div>

                <input
                  type="text"
                  placeholder="Email"
                  className="w-full px-2 py-1 text-base border rounded-md mt-11"
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full px-2 py-1 mt-3 text-base border rounded-md"
                />

                <div className="flex flex-row items-start justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <input type="checkbox" className="text-xs" />
                    <p className="text-xs">Keep Me Login</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <button className="text-xs text-[#334DE5]">Forgotten Password!</button>
                    <p className="text-xs">
                      New Here?{' '}
                      <button onClick={() => setIsFlipped(true)} className="text-[#334DE5]">
                        Register here
                      </button>
                    </p>
                  </div>
                </div>
                <button
                  type='button'
                  className="w-full bg-[#334DE5] text-white rounded-md py-[6px] mt-10"
                  onClick={handleLogin}
                >
                  Login
                </button>
              </div>

              {/* Signup Form (Back) */}
              <div className="absolute flex flex-col w-full h-full rotate-y-180 backface-hidden">
                <div className="flex flex-row items-center justify-center gap-2">
                  <h2 className="text-2xl font-medium">Sign Up</h2>
                  <img src={logo} alt="" className="object-cover h-5 w-28" />
                </div>

                <input
                  type="text"
                  placeholder="Name"
                  className="w-full px-2 py-1 border rounded-md mt-11"
                />
                <input
                  type="text"
                  placeholder="Email"
                  className="w-full px-2 py-1 mt-3 border rounded-md"
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full px-2 py-1 mt-3 border rounded-md"
                />

                <p className="mt-2 text-xs">
                  Already have an account?{' '}
                  <button
                    onClick={() => setIsFlipped(false)}
                    className="text-[#334DE5]"
                  >
                    Login here
                  </button>
                </p>

                <button className="w-full bg-[#334DE5] text-white rounded-md py-[6px] mt-6">
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="relative w-[65%] perspective">
          <div
            className={`absolute inset-0 w-full h-full transition-transform duration-1000 transform-style-preserve-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* Front Side of Right BG */}
            <div
              className="absolute inset-0 bg-center bg-cover backface-hidden"
              style={{ backgroundImage: "url('/bgright.png')" }}
            ></div>

            {/* Back Side of Right BG */}
            <div
              className="absolute inset-0 bg-center bg-cover rotate-y-180 backface-hidden"
              style={{ backgroundImage: "url('/bg_right_back.png')" }}
            ></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs absolute bottom-[18px] left-5 text-gray-500">
        Powered By WebnestMedia
      </p>

      {/* Extra CSS for flip */}
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
