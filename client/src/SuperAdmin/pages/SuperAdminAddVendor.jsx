import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";

const SuperAdminAddVendor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    applicantName: "",
    email: "",
    phone: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await api.post("/vendors/superadmin/add", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(
        "Vendor successfully created, auto-approved, and credentials emailed!",
      );
      navigate("/superadmin-dashboard/vendors");
    } catch (error) {
      alert(error.response?.data?.message || "Error creating vendor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 font-sans">
      <div className="max-w-3xl mx-auto p-6 sm:p-10 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 animate-in fade-in duration-500">
        {/* HEADER SECTION */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-gray-800 pb-6 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              Add New Vendor
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] uppercase tracking-widest rounded-lg shadow-sm border border-emerald-200 dark:border-emerald-800/30">
                Auto-Approve
              </span>
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-2">
              Instantly create a vendor profile and email credentials
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="relative z-10 w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer shadow-sm"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                autoComplete="off"
                value={formData.companyName}
                onChange={handleChange}
                required
                placeholder="e.g. NextKey Hospitality"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Applicant Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="applicantName"
                autoComplete="off"
                value={formData.applicantName}
                onChange={handleChange}
                required
                placeholder="e.g. John Doe"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                autoComplete="off"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="vendor@company.com"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                autoComplete="off"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+91 9876543210"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm placeholder-gray-400"
              />
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl text-[12px] font-bold uppercase tracking-wide border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer active:scale-95 shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl text-[12px] font-bold uppercase tracking-wide bg-emerald-600 hover:bg-emerald-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 shadow-md hover:shadow-lg flex items-center gap-2"
            >
              {loading && (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
              {loading ? "Creating..." : "Create Vendor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminAddVendor;
