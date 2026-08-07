import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

const CheckVendorStatus = () => {
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState("");
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({});

  const handleCheckStatus = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    setLoading(true);
    try {
      const res = await api.get(`/vendors/status/${trackingId}`);
      setVendorData(res.data.data);

      setFormData({
        companyName: res.data.data.companyName,
        applicantName: res.data.data.applicantName,
        email: res.data.data.email,
        phone: res.data.data.phone,
      });
    } catch (error) {
      alert(error.response?.data?.message || "Invalid Tracking ID");
      setVendorData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/vendors/update/${trackingId}`, formData);
      alert("Application updated successfully!");
      setVendorData({ ...vendorData, status: "pending" });
    } catch (error) {
      alert(error.response?.data?.message || "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!vendorData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
        <div className="bg-white dark:bg-neutral-900 rounded-[2rem] shadow-xl p-8 sm:p-12 max-w-md w-full text-center border border-neutral-200/50 dark:border-neutral-800">
          <h2 className="text-3xl font-serif text-neutral-900 dark:text-white mb-3 capitalize tracking-tight">
            Partner Status
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 font-light mb-8">
            Enter the Tracking ID sent to your email to check your application.
          </p>
          <form onSubmit={handleCheckStatus} className="space-y-6">
            <div>
              <input
                type="text"
                required
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="Enter Tracking ID"
                className="w-full px-5 py-4 rounded-xl border-none bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none text-center tracking-widest font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold px-8 py-4 rounded-xl shadow-lg active:scale-95 transition-transform disabled:opacity-70 disabled:active:scale-100 flex justify-center items-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin"></div>
              ) : (
                "Check Status"
              )}
            </button>
          </form>
          <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800">
            <Link
              to="/partner-registration"
              className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <svg
                className="w-3 h-3 mr-1.5 transform rotate-180"
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
              Back to Registration
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (vendorData.status === "approved") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
        <div className="bg-white dark:bg-neutral-900 rounded-[2rem] shadow-xl p-10 max-w-md text-center border border-neutral-200/50 dark:border-neutral-800">
          <div className="w-20 h-20 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-lg">
            ✓
          </div>
          <h2 className="text-3xl font-serif text-neutral-900 dark:text-white mb-3 capitalize">
            Application Approved
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 font-light leading-relaxed mb-8">
            Your vendor credentials have been securely sent to <br />
            <b className="text-neutral-900 dark:text-white font-medium">
              {vendorData.email}
            </b>
            .
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold px-8 py-4 rounded-xl shadow-lg active:scale-95 transition-transform"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 py-12 px-4 sm:px-6">
      <div className="bg-white dark:bg-neutral-900 rounded-[2rem] shadow-xl p-8 sm:p-12 w-full max-w-xl border border-neutral-200/50 dark:border-neutral-800 relative overflow-hidden">
        <div className="flex justify-between items-start mb-8 border-b border-neutral-200 dark:border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl font-serif tracking-tight text-neutral-900 dark:text-white capitalize mb-2">
              Application Details
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm font-light">
              Review or update your submitted information.
            </p>
          </div>
          <span
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mt-1 ${
              vendorData.status === "rejected"
                ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-900/50"
                : "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/50"
            }`}
          >
            {vendorData.status}
          </span>
        </div>

        {vendorData.status === "rejected" && (
          <div className="mb-8 p-6 bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-red-800 dark:text-red-400 mb-2">
              Action Required
            </h3>
            <p className="text-red-900 dark:text-red-300 text-sm font-light leading-relaxed mb-3">
              {vendorData.rejectRemark}
            </p>
            <p className="text-red-700/80 dark:text-red-400/80 text-xs">
              Please update your details below and resubmit for review.
            </p>
          </div>
        )}

        <form onSubmit={handleUpdateSubmit} className="space-y-6">
          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
                Company / Business Name
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                required
                className="w-full px-5 py-4 rounded-xl border-none bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
                Applicant Name
              </label>
              <input
                type="text"
                value={formData.applicantName}
                onChange={(e) =>
                  setFormData({ ...formData, applicantName: e.target.value })
                }
                required
                className="w-full px-5 py-4 rounded-xl border-none bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
                Business Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="w-full px-5 py-4 rounded-xl border-none bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
                className="w-full px-5 py-4 rounded-xl border-none bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none"
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
                "Update & Resubmit"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckVendorStatus;
