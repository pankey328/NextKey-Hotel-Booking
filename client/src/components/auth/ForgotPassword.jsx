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
  const [successMessage, setSuccessMessage] = useState("");

  const sendOtp = async (e) => {
    e.preventDefault();
    let err = {};
    setError({});
    setSuccessMessage("");

    if (!form.email.trim()) {
      err.email = "Email is required";
    }

    if (Object.keys(err).length > 0) {
      setError(err);
      return;
    }

    try {
      const res = await api.post("auth/forget-password", {
        email: form.email,
      });

      setSuccessMessage(res.data.message || "Recovery code sent successfully!");
      setOtpSent(true);
    } catch (error) {
      setError({
        form: error.response?.data?.message || "Error sending recovery code",
      });
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    let err = {};
    setError({});
    setSuccessMessage("");

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
      const res = await api.post("/auth/verify-forget", {
        email: form.email,
        otp: form.otp,
        newpassword: form.newpassword,
        confirmpassword: form.confirmpassword,
      });

      setSuccessMessage(
        res.data.message || "Password changed successfully! Redirecting...",
      );
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setError({
        form: error.response?.data?.message || "Error resetting password",
      });
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center bg-white dark:bg-neutral-950 px-4 sm:px-6 lg:px-8 transition-colors duration-500 font-sans overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-[400px] bg-blue-500/5 dark:bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="relative w-full max-w-[420px] bg-white dark:bg-neutral-900/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 sm:p-8 border border-neutral-100 dark:border-neutral-800 transition-all duration-500 z-10">
        {/* Heading Section */}
        <div className="text-center mb-5 mt-1">
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white tracking-tight">
            {!otpSent ? "Reset Password" : "New Password"}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1.5 font-light">
            {!otpSent
              ? "Enter your email to receive a recovery code."
              : "Create a secure new password for your account."}
          </p>
        </div>

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 text-center animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-emerald-700 dark:text-emerald-400 text-xs font-medium">
              {successMessage}
            </p>
          </div>
        )}

        {error.form && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-center animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-red-600 dark:text-red-400 text-xs font-medium">
              {error.form}
            </p>
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={sendOtp} noValidate className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1.5 ml-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border bg-neutral-50 dark:bg-neutral-950/50 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none transition-colors ${
                  error.email
                    ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                    : "border-neutral-200 dark:border-neutral-800 focus:border-neutral-400 dark:focus:border-neutral-500"
                }`}
              />
              {error.email && (
                <p className="text-red-500 dark:text-red-400 text-[10px] font-medium mt-1 ml-1">
                  {error.email}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!form.email}
              className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-3.5 rounded-xl shadow-md hover:opacity-90 transition-all active:scale-[0.98] mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send Recovery Code
            </button>

            <div className="text-center mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-neutral-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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
          <form onSubmit={resetPassword} noValidate className="space-y-3">
            {/* Code Sent To Display */}
            <div className="bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-100 dark:border-neutral-800 rounded-xl p-3 text-center mb-3">
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-bold mb-1">
                Code Sent To
              </p>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {form.email}
              </p>
            </div>

            {/* OTP Input */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1.5 ml-1 text-center">
                6-Digit Secure Code
              </label>
              <input
                type="text"
                maxLength="6"
                placeholder="••••••"
                value={form.otp}
                onChange={(e) => setForm({ ...form, otp: e.target.value })}
                className={`w-full px-4 py-3 text-center tracking-[0.5em] font-mono text-xl rounded-xl border bg-neutral-50 dark:bg-neutral-950/50 text-neutral-900 dark:text-white placeholder-neutral-300 dark:placeholder-neutral-600 focus:outline-none transition-colors ${
                  error.otp
                    ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                    : "border-neutral-200 dark:border-neutral-800 focus:border-neutral-400 dark:focus:border-neutral-500"
                }`}
              />
              {error.otp && (
                <p className="text-red-500 dark:text-red-400 text-[10px] font-medium mt-1 text-center">
                  {error.otp}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1.5 ml-1">
                New Password
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                value={form.newpassword}
                onChange={(e) =>
                  setForm({ ...form, newpassword: e.target.value })
                }
                className={`w-full px-4 py-3 rounded-xl border bg-neutral-50 dark:bg-neutral-950/50 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none transition-colors ${
                  error.newpassword
                    ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                    : "border-neutral-200 dark:border-neutral-800 focus:border-neutral-400 dark:focus:border-neutral-500"
                }`}
              />
              {error.newpassword && (
                <p className="text-red-500 dark:text-red-400 text-[10px] font-medium mt-1 ml-1">
                  {error.newpassword}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1.5 ml-1">
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
                className={`w-full px-4 py-3 rounded-xl border bg-neutral-50 dark:bg-neutral-950/50 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none transition-colors ${
                  error.confirmpassword
                    ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                    : "border-neutral-200 dark:border-neutral-800 focus:border-neutral-400 dark:focus:border-neutral-500"
                }`}
              />
              {error.confirmpassword && (
                <p className="text-red-500 dark:text-red-400 text-[10px] font-medium mt-1 ml-1">
                  {error.confirmpassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-3.5 rounded-xl shadow-md hover:opacity-90 transition-all active:scale-[0.98] mt-3"
            >
              Update Password
            </button>

            <div className="text-center mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setForm({
                    ...form,
                    otp: "",
                    newpassword: "",
                    confirmpassword: "",
                  });
                  setError({});
                  setSuccessMessage("");
                }}
                className="text-xs sm:text-sm font-medium text-neutral-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Use a different email address
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
