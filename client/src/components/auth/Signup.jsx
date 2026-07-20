import React, { useState } from "react";
import api from "../../api";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmpassword: "",
    otp: "",
  });
  const [error, setError] = useState({});

  // Send OTP
  const sendOtp = async (e) => {
    e.preventDefault();
    setError({});

    try {
      let obj = {};

      if (!signupForm.name.trim()) obj.name = "Name is required";
      if (!signupForm.email.trim()) obj.email = "Email is required";
      if (!signupForm.password) obj.password = "Password is required";

      if (!signupForm.confirmpassword) {
        obj.confirmpassword = "Confirm password is required";
      } else if (signupForm.password !== signupForm.confirmpassword) {
        obj.confirmpassword = "Passwords must be the same";
      }

      if (Object.keys(obj).length > 0) {
        setError(obj);
        return;
      }

      const data = {
        name: signupForm.name,
        email: signupForm.email,
        password: signupForm.password,
      };

      let res = await api.post("/auth/send-otp", data);
      alert(res.data.message || "OTP Sent successfully!");

      setIsOtpSent(true);
    } catch (error) {
      console.log(">>>Error", error.response?.data?.message || error.message);
      alert(`Error: ${error.response?.data?.message || "Failed to send OTP"}`);
    }
  };

  // Verify OTP and Signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});

    if (!signupForm.otp.trim()) {
      setError({ otp: "OTP is required" });
      return;
    }

    try {
      const res = await api.post(`/auth/verify-otp`, {
        email: signupForm.email,
        otp: signupForm.otp,
      });

      alert(res.data.message || "Signup successful!");

      setSignupForm({
        name: "",
        email: "",
        password: "",
        confirmpassword: "",
        otp: "",
      });
      navigate("/login");
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || "Invalid OTP"}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-transparent dark:border-gray-700 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-6 transition-colors">
          {isOtpSent ? "Enter OTP" : "Create an Account"}
        </h2>

        <form
          onSubmit={isOtpSent ? handleSubmit : sendOtp}
          noValidate
          className="space-y-4"
        >
          {!isOtpSent && (
            <>
              <div>
                <input
                  type="text"
                  value={signupForm.name}
                  placeholder="Enter your name"
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, name: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-4 transition duration-200 ${
                    error.name
                      ? "border-red-500 dark:border-red-500 focus:ring-red-200 dark:focus:ring-red-800"
                      : "border-gray-300 dark:border-gray-600 focus:ring-blue-200 dark:focus:ring-blue-800"
                  }`}
                  required
                />
                {error.name && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1 ml-1">
                    {error.name}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="email"
                  value={signupForm.email}
                  placeholder="Enter your email"
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, email: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-4 transition duration-200 ${
                    error.email
                      ? "border-red-500 dark:border-red-500 focus:ring-red-200 dark:focus:ring-red-800"
                      : "border-gray-300 dark:border-gray-600 focus:ring-blue-200 dark:focus:ring-blue-800"
                  }`}
                  required
                />
                {error.email && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1 ml-1">
                    {error.email}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="password"
                  value={signupForm.password}
                  placeholder="Enter your password"
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, password: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-4 transition duration-200 ${
                    error.password
                      ? "border-red-500 dark:border-red-500 focus:ring-red-200 dark:focus:ring-red-800"
                      : "border-gray-300 dark:border-gray-600 focus:ring-blue-200 dark:focus:ring-blue-800"
                  }`}
                  required
                />
                {error.password && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1 ml-1">
                    {error.password}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="password"
                  value={signupForm.confirmpassword}
                  placeholder="Enter confirm password"
                  onChange={(e) =>
                    setSignupForm({
                      ...signupForm,
                      confirmpassword: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-4 transition duration-200 ${
                    error.confirmpassword
                      ? "border-red-500 dark:border-red-500 focus:ring-red-200 dark:focus:ring-red-800"
                      : "border-gray-300 dark:border-gray-600 focus:ring-blue-200 dark:focus:ring-blue-800"
                  }`}
                  required
                />
                {error.confirmpassword && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1 ml-1">
                    {error.confirmpassword}
                  </p>
                )}
              </div>
            </>
          )}

          {isOtpSent && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 text-center transition-colors">
                We've sent a code to{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {signupForm.email}
                </span>
              </p>
              <input
                type="text"
                maxLength="6"
                value={signupForm.otp}
                placeholder="Enter 6-digit OTP"
                onChange={(e) =>
                  setSignupForm({ ...signupForm, otp: e.target.value })
                }
                className={`w-full px-4 py-3 text-center tracking-[0.5em] font-mono text-lg rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-4 transition duration-200 ${
                  error.otp
                    ? "border-red-500 dark:border-red-500 focus:ring-red-200 dark:focus:ring-red-800"
                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-200 dark:focus:ring-blue-800"
                }`}
                required
              />
              {error.otp && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1 ml-1 text-center">
                  {error.otp}
                </p>
              )}

              <button
                type="button"
                onClick={() => setIsOtpSent(false)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-2 w-full text-center transition-colors"
              >
                Change Email Address
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition duration-200 mt-2"
          >
            {isOtpSent ? "Verify & Sign Up" : "Send OTP"}
          </button>

          {!isOtpSent && (
            <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-4 transition-colors">
              <div className="text-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                </span>
                <Link
                  to="/login"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  Log In
                </Link>
              </div>

              <div className="text-center text-sm bg-gray-50 dark:bg-gray-700/40 p-3 rounded-lg border border-gray-100 dark:border-gray-600/50">
                <span className="text-gray-600 dark:text-gray-400">
                  Looking to list your property?{" "}
                </span>
                <Link
                  to="/partner-registration"
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold transition-colors ml-1"
                >
                  Become a Partner
                </Link>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Signup;
