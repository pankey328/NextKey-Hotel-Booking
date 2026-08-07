import React, { useState } from "react";
import api from "../../api";
import { useNavigate, Link } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    newpassword: "",
    confirmpassword: "",
  });
  const [error, setError] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSuccessMessage("");

    let obj = {};
    if (!form.email.trim()) obj.email = "Email is required";
    if (!form.password) obj.password = "Current password is required";
    if (!form.newpassword) obj.newpassword = "New password is required";

    if (!form.confirmpassword) {
      obj.confirmpassword = "Confirm password is required";
    } else if (form.newpassword !== form.confirmpassword) {
      obj.confirmpassword = "Passwords must be the same";
    }

    if (Object.keys(obj).length > 0) {
      setError(obj);
      return;
    }

    try {
      const result = await api.post("/auth/reset", form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(result.data);
      setSuccessMessage(
        "Password changed successfully! Redirecting to login...",
      );

      localStorage.removeItem("token");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error(error.response?.data?.message || error.message);
      setError({
        form:
          error.response?.data?.message ||
          "Something went wrong. Please check your details.",
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
            Update Password
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1.5 font-light">
            Secure your account with a new password.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-3">
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 text-center animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                {successMessage}
              </p>
            </div>
          )}

          {error.form && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-center animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-red-600 dark:text-red-400 text-xs font-medium">
                {error.form}
              </p>
            </div>
          )}

          {/* Email Input */}
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

          {/* Current Password Input */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1.5 ml-1">
              Current Password
            </label>
            <input
              type="password"
              placeholder="Enter current password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border bg-neutral-50 dark:bg-neutral-950/50 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none transition-colors ${
                error.password
                  ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                  : "border-neutral-200 dark:border-neutral-800 focus:border-neutral-400 dark:focus:border-neutral-500"
              }`}
            />
            {error.password && (
              <p className="text-red-500 dark:text-red-400 text-[10px] font-medium mt-1 ml-1">
                {error.password}
              </p>
            )}
          </div>

          {/* New Password Input */}
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

          {/* Confirm Password Input */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1.5 ml-1">
              Confirm New Password
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
            Save Password
          </button>

          <div className="text-center mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <Link
              to="/"
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
              Cancel and return
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
