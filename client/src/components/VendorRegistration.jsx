import React, { useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

const VendorRegistration = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    applicantName: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/vendors/register", formData);
      setSuccess(true);
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
        <div className="bg-white dark:bg-neutral-900 rounded-[2rem] shadow-xl p-10 max-w-md text-center border border-neutral-200/50 dark:border-neutral-800">
          <div className="w-20 h-20 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-lg">
            ✓
          </div>
          <h2 className="text-3xl font-serif text-neutral-900 dark:text-white mb-3 capitalize">
            Application Submitted
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 font-light leading-relaxed">
            Your vendor application is currently under review. If approved, you
            will receive login credentials via email to begin managing your
            collection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 py-12 px-4 sm:px-6">
      <div className="bg-white dark:bg-neutral-900 rounded-[2rem] shadow-xl p-8 sm:p-12 w-full max-w-xl border border-neutral-200/50 dark:border-neutral-800 relative overflow-hidden">
        {/* Header Section */}
        <div className="flex flex-col mb-10 border-b border-neutral-200 dark:border-neutral-800 pb-6">
          <div className="flex items-start justify-between w-full">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif tracking-tight text-neutral-900 dark:text-white capitalize mb-2">
                Become a Partner
              </h1>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm md:text-base font-light">
                Register your business to curate your properties.
              </p>
            </div>
            <Link
              to="/check-partner-status"
              className="hidden sm:flex items-center text-[10px] font-bold uppercase tracking-widest text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors mt-2"
            >
              Check Status
              <svg
                className="w-3 h-3 ml-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>

          {/* Mobile Status Link */}
          <Link
            to="/check-partner-status"
            className="sm:hidden mt-4 inline-flex items-center text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 transition-colors"
          >
            Check Application Status
            <svg
              className="w-3.5 h-3.5 ml-1.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
                Company / Business Name
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                className="w-full px-5 py-4 rounded-xl border-none bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none"
                placeholder="e.g. Oasis Hospitality"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
                Applicant Name
              </label>
              <input
                type="text"
                required
                value={formData.applicantName}
                onChange={(e) =>
                  setFormData({ ...formData, applicantName: e.target.value })
                }
                className="w-full px-5 py-4 rounded-xl border-none bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none"
                placeholder="Full Name"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
                Business Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-5 py-4 rounded-xl border-none bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none"
                placeholder="contact@company.com"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-5 py-4 rounded-xl border-none bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold px-8 py-4 rounded-xl shadow-lg active:scale-95 transition-transform disabled:opacity-70 disabled:active:scale-100 flex justify-center items-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin"></div>
              ) : (
                "Submit Application"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorRegistration;
