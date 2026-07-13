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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-transparent dark:border-gray-700 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-6 transition-colors">
          Reset Password
        </h2>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1 transition-colors">
              Current Password
            </label>
            <input
              type="password"
              placeholder="Enter current password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
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
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition duration-200 mt-6"
          >
            Reset Password
          </button>

          <div className="text-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-sm transition-colors">
            <Link
              to="/home"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium transition-colors"
            >
              Cancel and return
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
