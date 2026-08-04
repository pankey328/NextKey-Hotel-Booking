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
    <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd] dark:bg-neutral-950 p-4 transition-colors duration-500 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-neutral-900 rounded-[2rem] shadow-2xl shadow-black/5 dark:shadow-black/40 p-8 sm:p-10 border border-neutral-100 dark:border-neutral-800 transition-colors duration-500">
        {/* Brand & Heading */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-block font-serif text-2xl tracking-tight text-neutral-900 dark:text-white mb-6 hover:opacity-80 transition-opacity"
          >
            MyApp<span className="text-neutral-400">.</span>
          </Link>
          <h2 className="text-3xl font-serif text-neutral-900 dark:text-white tracking-tight">
            {!otpSent ? "Reset Password" : "New Password"}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 font-light">
            {!otpSent
              ? "Enter your email to receive a secure recovery code."
              : "Create a secure new password for your account."}
          </p>
        </div>

        {!otpSent ? (
          <form onSubmit={sendOtp} noValidate className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2 ml-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`w-full px-4 py-3.5 rounded-xl border bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none transition-colors ${
                  error.email
                    ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                    : "border-neutral-200 dark:border-neutral-800 focus:border-neutral-400 dark:focus:border-neutral-600"
                }`}
              />
              {error.email && (
                <p className="text-red-500 dark:text-red-400 text-xs font-medium mt-1.5 ml-1">
                  {error.email}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!form.email}
              className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send Recovery Code
            </button>

            <div className="text-center mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
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
          <form onSubmit={resetPassword} noValidate className="space-y-5">
            <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded-xl p-4 text-center mb-6">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-bold mb-1">
                Code Sent To
              </p>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {form.email}
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2 ml-1 text-center">
                6-Digit Secure Code
              </label>
              <input
                type="text"
                maxLength="6"
                placeholder="••••••"
                value={form.otp}
                onChange={(e) => setForm({ ...form, otp: e.target.value })}
                className={`w-full px-4 py-3.5 text-center tracking-[0.5em] font-mono text-xl rounded-xl border bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder-neutral-300 dark:placeholder-neutral-600 focus:outline-none transition-colors ${
                  error.otp
                    ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                    : "border-neutral-200 dark:border-neutral-800 focus:border-neutral-400 dark:focus:border-neutral-600"
                }`}
              />
              {error.otp && (
                <p className="text-red-500 dark:text-red-400 text-xs font-medium mt-1.5 text-center">
                  {error.otp}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2 ml-1">
                New Password
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                value={form.newpassword}
                onChange={(e) =>
                  setForm({ ...form, newpassword: e.target.value })
                }
                className={`w-full px-4 py-3.5 rounded-xl border bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none transition-colors ${
                  error.newpassword
                    ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                    : "border-neutral-200 dark:border-neutral-800 focus:border-neutral-400 dark:focus:border-neutral-600"
                }`}
              />
              {error.newpassword && (
                <p className="text-red-500 dark:text-red-400 text-xs font-medium mt-1.5 ml-1">
                  {error.newpassword}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2 ml-1">
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
                className={`w-full px-4 py-3.5 rounded-xl border bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none transition-colors ${
                  error.confirmpassword
                    ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                    : "border-neutral-200 dark:border-neutral-800 focus:border-neutral-400 dark:focus:border-neutral-600"
                }`}
              />
              {error.confirmpassword && (
                <p className="text-red-500 dark:text-red-400 text-xs font-medium mt-1.5 ml-1">
                  {error.confirmpassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 mt-6"
            >
              Update Password
            </button>

            <div className="text-center mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
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
                }}
                className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
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
