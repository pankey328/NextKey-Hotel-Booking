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
      // Pre-fill form
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

  // Ask for Tracking ID
  if (!vendorData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Partner Application Status
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
            Enter the Tracking ID sent to your email.
          </p>
          <form onSubmit={handleCheckStatus}>
            <input
              type="text"
              required
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter Tracking ID"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all"
            >
              {loading ? "Checking..." : "Check Status"}
            </button>
          </form>
          <div className="mt-4">
            <Link
              to="/partner-registration"
              className="text-sm text-blue-600 hover:underline"
            >
              Back to Registration
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Approved State
  if (vendorData.status === "approved") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Application Approved!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your vendor credentials have been sent to <b>{vendorData.email}</b>.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Pending / Rejected State
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-10 w-full max-w-xl border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Update Application
          </h1>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              vendorData.status === "rejected"
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            }`}
          >
            {vendorData.status}
          </span>
        </div>

        {vendorData.status === "rejected" && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <h3 className="text-red-800 dark:text-red-400 font-bold mb-1">
              Rejection Reason:
            </h3>
            <p className="text-red-700 dark:text-red-300 text-sm">
              {vendorData.rejectRemark}
            </p>
            <p className="text-red-600 dark:text-red-400 text-xs mt-2 font-medium">
              Please update your details below and resubmit.
            </p>
          </div>
        )}

        <form onSubmit={handleUpdateSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Company / Business Name
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 rounded-lg border dark:border-gray-600 border-gray-300 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Applicant Name
            </label>
            <input
              type="text"
              value={formData.applicantName}
              onChange={(e) =>
                setFormData({ ...formData, applicantName: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 rounded-lg border dark:border-gray-600 border-gray-300 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Business Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 rounded-lg border dark:border-gray-600 border-gray-300 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 rounded-lg border dark:border-gray-600 border-gray-300 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-70"
          >
            {loading ? "Updating..." : "Resubmit Application"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckVendorStatus;
