import React, { useState } from "react";
import api from "../../api";
import { Link, useNavigate } from "react-router-dom";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase/firebaseConfig";

const Login = () => {
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState({});

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});

    try {
      let obj = {};

      if (!loginForm.email.trim()) {
        obj.email = "Email is required";
      }
      if (!loginForm.password) {
        obj.password = "Password is required";
      }

      if (Object.keys(obj).length > 0) {
        setError(obj);
        return;
      }

      let res = await api.post(`/auth/login`, {
        email: loginForm.email,
        password: loginForm.password,
      });

      setLoginForm({
        email: "",
        password: "",
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("theme", res.data.user.theme);

        if (res.data.user.role === "super_admin") {
          navigate("/superadmin-dashboard");
        } else if (res.data.user.role === "vendor") {
          navigate("/admin-dashboard");
        } else if (res.data.user.role === "hotel") {
          navigate("/hotel-dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
      setError({
        form: error.response?.data?.message || "Login Failed",
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const res = await api.post("/auth/google-login", {
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
        uid: user.uid,
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("theme", res.data.user.theme);

        const userRole = res.data.user.role;

        if (userRole === "super_admin") {
          navigate("/superadmin-dashboard");
        } else if (userRole === "vendor") {
          navigate("/admin-dashboard");
        } else if (userRole === "hotel") {
          navigate("/hotel-dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      console.log(error);
      setError({
        form: error.response?.data?.message || "Google Login Failed",
      });
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center bg-white dark:bg-neutral-950 px-4 sm:px-6 lg:px-8 transition-colors duration-500 font-sans overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-[400px] bg-blue-500/5 dark:bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="relative w-full max-w-[420px] bg-white dark:bg-neutral-900/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 sm:p-8 border border-neutral-100 dark:border-neutral-800 transition-all duration-500">
        {/* Heading Section */}
        <div className="text-center mb-6 mt-2">
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-2 font-light">
            Enter your details to access your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1.5 ml-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm({ ...loginForm, email: e.target.value })
              }
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

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-center mb-1.5 mx-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Password
              </label>
              <Link
                to="/forget-password"
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({ ...loginForm, password: e.target.value })
              }
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

          {/* Global Form Error */}
          {error.form && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-center animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-red-600 dark:text-red-400 text-xs font-medium">
                {error.form}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-3.5 rounded-xl shadow-md hover:opacity-90 transition-all active:scale-[0.98] mt-2"
          >
            Sign In
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 py-2">
            <div className="h-px w-full bg-neutral-200 dark:bg-neutral-800"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 whitespace-nowrap">
              Or
            </span>
            <div className="h-px w-full bg-neutral-200 dark:bg-neutral-800"></div>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-semibold py-3 rounded-xl flex items-center justify-center gap-3 transition-colors active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Footer Link */}
          <div className="text-center pt-2">
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
