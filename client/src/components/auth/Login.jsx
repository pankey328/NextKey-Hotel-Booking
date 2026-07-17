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
    setError({}); // Clear errors

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
      alert("Login Failed");
      setError({
        form: error.response?.data?.message || "Login Failed",
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      console.log("Google User:", user);

      const res = await api.post("/auth/google-login", {
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
        uid: user.uid,
      });

      alert("Google Login Successful");

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
      alert("Google Login Failed");
      setError({
        form: error.response?.data?.message || "Google Login Failed",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-transparent dark:border-gray-700 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-6 transition-colors">
          Welcome Back
        </h2>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Enter your email"
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm({ ...loginForm, email: e.target.value })
              }
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

          <div>
            <input
              type="password"
              placeholder="Enter your password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({ ...loginForm, password: e.target.value })
              }
              className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-4 transition duration-200 ${
                error.password
                  ? "border-red-500 dark:border-red-500 focus:ring-red-200 dark:focus:ring-red-800"
                  : "border-gray-300 dark:border-gray-600 focus:ring-blue-200 dark:focus:ring-blue-800"
              }`}
            />
            {error.password && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1 ml-1">
                {error.password}
              </p>
            )}
          </div>

          {error.form && (
            <p className="text-red-500 dark:text-red-400 text-sm text-center mt-2">
              {error.form}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition duration-200"
          >
            Login
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition duration-200 mt-3"
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

          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-sm transition-colors">
            <Link
              to="/forget-password"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
            >
              Forgot Password?
            </Link>
            <Link
              to="/signup"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
