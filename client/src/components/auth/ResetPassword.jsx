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

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});

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
      alert("Password changed successfully");

      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.error(error.response?.data?.message || error.message);
      alert(
        `Error : ${error.response?.data?.message || "Something went wrong"}`,
      );
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
            Update Password
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 font-light">
            Secure your account with a new password.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Email Input */}
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

          {/* Current Password Input */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2 ml-1">
              Current Password
            </label>
            <input
              type="password"
              placeholder="Enter current password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`w-full px-4 py-3.5 rounded-xl border bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none transition-colors ${
                error.password
                  ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                  : "border-neutral-200 dark:border-neutral-800 focus:border-neutral-400 dark:focus:border-neutral-600"
              }`}
            />
            {error.password && (
              <p className="text-red-500 dark:text-red-400 text-xs font-medium mt-1.5 ml-1">
                {error.password}
              </p>
            )}
          </div>

          {/* New Password Input */}
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

          {/* Confirm Password Input */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2 ml-1">
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
            Save Password
          </button>

          <div className="text-center mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-sm">
            <Link
              to="/"
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
              Cancel and return
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
