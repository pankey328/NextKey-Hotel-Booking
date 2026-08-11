import React, { useState } from "react";
import api from "../../api";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmpassword: "",
    otp: "",
  });
  const [error, setError] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  // Send OTP
  const sendOtp = async (e) => {
    e.preventDefault();
    setError({});
    setSuccessMessage("");

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

      setLoading(true);

      const data = {
        name: signupForm.name,
        email: signupForm.email,
        password: signupForm.password,
      };

      let res = await api.post("/auth/send-otp", data);

      setSuccessMessage(
        res.data.message || "OTP sent successfully to your email!",
      );
      setIsOtpSent(true);
    } catch (error) {
      console.log(">>>Error", error.response?.data?.message || error.message);
      setError({
        form:
          error.response?.data?.message ||
          "Failed to send OTP. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and Signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSuccessMessage("");

    if (!signupForm.otp.trim()) {
      setError({ otp: "OTP is required" });
      return;
    }

    setLoading(true);

    try {
      const res = await api.post(`/auth/verify-otp`, {
        email: signupForm.email,
        otp: signupForm.otp,
      });

      setSuccessMessage(
        res.data.message || "Signup successful! Redirecting...",
      );

      setSignupForm({
        name: "",
        email: "",
        password: "",
        confirmpassword: "",
        otp: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setError({
        form: error.response?.data?.message || "Invalid OTP. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center bg-white dark:bg-neutral-950 px-4 sm:px-6 lg:px-8 transition-colors duration-500 font-sans overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-[400px] bg-blue-500/5 dark:bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="relative w-full max-w-[420px] bg-white dark:bg-neutral-900/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 sm:p-8 border border-neutral-100 dark:border-neutral-800 transition-all duration-500 z-10">
        {/* Heading Section */}
        <div className="text-center mb-5 mt-1">
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white tracking-tight">
            {isOtpSent ? "Verify Email" : "Create Account"}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1.5 font-light">
            {isOtpSent
              ? "Enter the code we just sent to your inbox."
              : "Join our exclusive collection of premium stays."}
          </p>
        </div>

        <form
          onSubmit={isOtpSent ? handleSubmit : sendOtp}
          noValidate
          className="space-y-3"
        >
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

          {!isOtpSent && (
            <>
              {/* Name Input */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1.5 ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={signupForm.name}
                  placeholder="e.g. John Doe"
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, name: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-xl border bg-neutral-50 dark:bg-neutral-950/50 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none transition-colors ${
                    error.name
                      ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                      : "border-neutral-200 dark:border-neutral-800 focus:border-neutral-400 dark:focus:border-neutral-500"
                  }`}
                  required
                />
                {error.name && (
                  <p className="text-red-500 dark:text-red-400 text-[10px] font-medium mt-1 ml-1">
                    {error.name}
                  </p>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1.5 ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={signupForm.email}
                  placeholder="name@example.com"
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, email: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-xl border bg-neutral-50 dark:bg-neutral-950/50 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none transition-colors ${
                    error.email
                      ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                      : "border-neutral-200 dark:border-neutral-800 focus:border-neutral-400 dark:focus:border-neutral-500"
                  }`}
                  required
                />
                {error.email && (
                  <p className="text-red-500 dark:text-red-400 text-[10px] font-medium mt-1 ml-1">
                    {error.email}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1.5 ml-1">
                  Password
                </label>
                <input
                  type="password"
                  value={signupForm.password}
                  placeholder="Create a strong password"
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, password: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-xl border bg-neutral-50 dark:bg-neutral-950/50 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none transition-colors ${
                    error.password
                      ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                      : "border-neutral-200 dark:border-neutral-800 focus:border-neutral-400 dark:focus:border-neutral-500"
                  }`}
                  required
                />
                {error.password && (
                  <p className="text-red-500 dark:text-red-400 text-[10px] font-medium mt-1 ml-1">
                    {error.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-1.5 ml-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={signupForm.confirmpassword}
                  placeholder="Confirm your password"
                  onChange={(e) =>
                    setSignupForm({
                      ...signupForm,
                      confirmpassword: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-3 rounded-xl border bg-neutral-50 dark:bg-neutral-950/50 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none transition-colors ${
                    error.confirmpassword
                      ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                      : "border-neutral-200 dark:border-neutral-800 focus:border-neutral-400 dark:focus:border-neutral-500"
                  }`}
                  required
                />
                {error.confirmpassword && (
                  <p className="text-red-500 dark:text-red-400 text-[10px] font-medium mt-1 ml-1">
                    {error.confirmpassword}
                  </p>
                )}
              </div>
            </>
          )}

          {isOtpSent && (
            <div className="space-y-4 py-2">
              {/* Display Target Email */}
              <div className="bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-100 dark:border-neutral-800 rounded-xl p-3 text-center">
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-bold mb-1">
                  Code Sent To
                </p>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  {signupForm.email}
                </p>
              </div>

              {/* OTP Input */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2 ml-1 text-center">
                  6-Digit Secure Code
                </label>
                <input
                  type="text"
                  maxLength="6"
                  value={signupForm.otp}
                  placeholder="••••••"
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, otp: e.target.value })
                  }
                  className={`w-full px-4 py-3 text-center tracking-[0.5em] font-mono text-xl rounded-xl border bg-neutral-50 dark:bg-neutral-950/50 text-neutral-900 dark:text-white placeholder-neutral-300 dark:placeholder-neutral-600 focus:outline-none transition-colors ${
                    error.otp
                      ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                      : "border-neutral-200 dark:border-neutral-800 focus:border-neutral-400 dark:focus:border-neutral-500"
                  }`}
                  required
                />
                {error.otp && (
                  <p className="text-red-500 dark:text-red-400 text-[10px] font-medium mt-1.5 text-center">
                    {error.otp}
                  </p>
                )}
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setIsOtpSent(false)}
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Edit email address
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-3.5 rounded-xl shadow-md hover:opacity-90 transition-all active:scale-[0.98] mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-current"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>{isOtpSent ? "Verifying..." : "Sending OTP..."}</span>
              </>
            ) : isOtpSent ? (
              "Verify & Sign Up"
            ) : (
              "Continue"
            )}
          </button>

          {!isOtpSent && (
            <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <div className="text-center text-xs sm:text-sm">
                <span className="text-neutral-500 dark:text-neutral-400">
                  Already have an account?{" "}
                </span>
                <Link
                  to="/login"
                  className="font-semibold text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Sign In
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
