import React, { useState } from "react";
import api from "../../api";
import { useNavigate, Link } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    otp: "",
    newpassword: "",
    confirmpassword: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState({});

  const sendOtp = async (e) => {
    e.preventDefault();
    let err = {};

    if (!form.email.trim()) {
      err.email = "Email is required";
    }

    if (Object.keys(err).length > 0) {
      setError(err);
      return;
    }

    try {
      await api.post("auth/forget-password", {
        email: form.email,
      });

      setError({});
      alert("OTP sent successfully");
      setOtpSent(true);
    } catch (error) {
      alert(error.response?.data?.message || "Error sending OTP");
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    let err = {};

    if (!form.otp.trim()) err.otp = "OTP is required";
    if (!form.newpassword) err.newpassword = "New password is required";
    if (!form.confirmpassword)
      err.confirmpassword = "Confirm password is required";

    if (
      form.newpassword &&
      form.confirmpassword &&
      form.newpassword !== form.confirmpassword
    ) {
      err.confirmpassword = "Passwords must be same";
    }

    if (Object.keys(err).length > 0) {
      setError(err);
      return;
    }

    try {
      await api.post("/auth/verify-forget", {
        email: form.email,
        otp: form.otp,
        newpassword: form.newpassword,
        confirmpassword: form.confirmpassword,
      });

      setError({});
      alert("Password changed successfully");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Error resetting password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-transparent dark:border-gray-700 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-6 transition-colors">
          Forgot Password
        </h2>

        {!otpSent ? (
          <form onSubmit={sendOtp} noValidate className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
              Enter your email address to reset your
              password.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1 transition-colors">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-4 transition duration-200 ${
                  error.email
                    ? "border-red-500 dark:border-red-500 focus:ring-red-200 dark:focus:ring-red-800"
                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-200 dark:focus:ring-blue-800"
                }`}
              />
              {error.email && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1 ml-1">
                  {error.email}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!form.email}
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition duration-200 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send OTP
            </button>

            <div className="text-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-sm transition-colors">
              <Link
                to="/login"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium transition-colors flex items-center justify-center gap-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={resetPassword} noValidate className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 text-center transition-colors">
              We've sent a code to{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {form.email}
              </span>
            </p>

            <div>
              <input
                type="text"
                maxLength="6"
                placeholder="Enter 6-digit OTP"
                value={form.otp}
                onChange={(e) => setForm({ ...form, otp: e.target.value })}
                className={`w-full px-4 py-3 text-center tracking-[0.5em] font-mono text-lg rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-4 transition duration-200 ${
                  error.otp
                    ? "border-red-500 dark:border-red-500 focus:ring-red-200 dark:focus:ring-red-800"
                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-200 dark:focus:ring-blue-800"
                }`}
              />
              {error.otp && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1 ml-1 text-center">
                  {error.otp}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1 transition-colors">
                New Password
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                value={form.newpassword}
                onChange={(e) =>
                  setForm({ ...form, newpassword: e.target.value })
                }
                className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-4 transition duration-200 ${
                  error.newpassword
                    ? "border-red-500 dark:border-red-500 focus:ring-red-200 dark:focus:ring-red-800"
                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-200 dark:focus:ring-blue-800"
                }`}
              />
              {error.newpassword && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1 ml-1">
                  {error.newpassword}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1 transition-colors">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={form.confirmpassword}
                onChange={(e) =>
                  setForm({
                    ...form,
                    confirmpassword: e.target.value,
                  })
                }
                className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-4 transition duration-200 ${
                  error.confirmpassword
                    ? "border-red-500 dark:border-red-500 focus:ring-red-200 dark:focus:ring-red-800"
                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-200 dark:focus:ring-blue-800"
                }`}
              />
              {error.confirmpassword && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1 ml-1">
                  {error.confirmpassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition duration-200 mt-4"
            >
              Reset Password
            </button>

            <div className="text-center mt-4 text-sm">
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                Change Email Address
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
