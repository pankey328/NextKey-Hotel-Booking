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
    <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd] dark:bg-neutral-950 p-4 transition-colors duration-500 font-sans py-12">
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
            {isOtpSent ? "Verify Email" : "Create Account"}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 font-light">
            {isOtpSent
              ? "Enter the code we just sent to your inbox."
              : "Join our exclusive collection of premium stays."}
          </p>
        </div>

        <form
          onSubmit={isOtpSent ? handleSubmit : sendOtp}
          noValidate
          className="space-y-5"
        >
          {!isOtpSent && (
            <>
              {/* Name Input */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2 ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={signupForm.name}
                  placeholder="e.g. John Doe"
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, name: e.target.value })
                  }
                  className={`w-full px-4 py-3.5 rounded-xl border bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none transition-colors ${
                    error.name
                      ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                      : "border-neutral-200 dark:border-neutral-800 focus:border-neutral-400 dark:focus:border-neutral-600"
                  }`}
                  required
                />
                {error.name && (
                  <p className="text-red-500 dark:text-red-400 text-xs font-medium mt-1.5 ml-1">
                    {error.name}
                  </p>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2 ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={signupForm.email}
                  placeholder="name@example.com"
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, email: e.target.value })
                  }
                  className={`w-full px-4 py-3.5 rounded-xl border bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none transition-colors ${
                    error.email
                      ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                      : "border-neutral-200 dark:border-neutral-800 focus:border-neutral-400 dark:focus:border-neutral-600"
                  }`}
                  required
                />
                {error.email && (
                  <p className="text-red-500 dark:text-red-400 text-xs font-medium mt-1.5 ml-1">
                    {error.email}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2 ml-1">
                  Password
                </label>
                <input
                  type="password"
                  value={signupForm.password}
                  placeholder="Create a strong password"
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, password: e.target.value })
                  }
                  className={`w-full px-4 py-3.5 rounded-xl border bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none transition-colors ${
                    error.password
                      ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                      : "border-neutral-200 dark:border-neutral-800 focus:border-neutral-400 dark:focus:border-neutral-600"
                  }`}
                  required
                />
                {error.password && (
                  <p className="text-red-500 dark:text-red-400 text-xs font-medium mt-1.5 ml-1">
                    {error.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2 ml-1">
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
                  className={`w-full px-4 py-3.5 rounded-xl border bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none transition-colors ${
                    error.confirmpassword
                      ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                      : "border-neutral-200 dark:border-neutral-800 focus:border-neutral-400 dark:focus:border-neutral-600"
                  }`}
                  required
                />
                {error.confirmpassword && (
                  <p className="text-red-500 dark:text-red-400 text-xs font-medium mt-1.5 ml-1">
                    {error.confirmpassword}
                  </p>
                )}
              </div>
            </>
          )}

          {isOtpSent && (
            <div className="space-y-6">
              {/* Display Target Email */}
              <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded-xl p-4 text-center">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-bold mb-1">
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
                  className={`w-full px-4 py-3.5 text-center tracking-[0.5em] font-mono text-xl rounded-xl border bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder-neutral-300 dark:placeholder-neutral-600 focus:outline-none transition-colors ${
                    error.otp
                      ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                      : "border-neutral-200 dark:border-neutral-800 focus:border-neutral-400 dark:focus:border-neutral-600"
                  }`}
                  required
                />
                {error.otp && (
                  <p className="text-red-500 dark:text-red-400 text-xs font-medium mt-1.5 text-center">
                    {error.otp}
                  </p>
                )}
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsOtpSent(false)}
                  className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  Edit email address
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 mt-4"
          >
            {isOtpSent ? "Verify & Sign Up" : "Continue"}
          </button>

          {!isOtpSent && (
            <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800 flex flex-col gap-5">
              <div className="text-center text-sm">
                <span className="text-neutral-500 dark:text-neutral-400">
                  Already have an account?{" "}
                </span>
                <Link
                  to="/login"
                  className="font-semibold text-neutral-900 dark:text-white hover:underline transition-all"
                >
                  Sign In
                </Link>
              </div>

              {/* Partner CTA */}
              <div className="text-center flex flex-col items-center bg-neutral-50 dark:bg-neutral-950 p-5 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                  For Property Owners
                </span>
                <Link
                  to="/partner-registration"
                  className="text-sm font-medium text-black dark:text-white border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-6 py-2.5 rounded-lg transition-colors"
                >
                  List your property
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
