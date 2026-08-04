import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import useDebounce from "../../hooks/useDebounce";

const VendorManager = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("pending");
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 1000);
  const [sortBy, setSortBy] = useState("newest");

  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectRemark, setRejectRemark] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    setSearchInput("");
    setSortBy("newest");
  }, [activeTab]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      let url =
        activeTab === "bin"
          ? `/vendors?isDeleted=true`
          : `/vendors?isDeleted=false&status=${activeTab}`;

      if (debouncedSearch) {
        url += `&search=${debouncedSearch}`;
      }
      if (sortBy) {
        url += `&sortBy=${sortBy}`;
      }

      const res = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVendors(res.data.data || res.data);
    } catch (error) {
      console.log(error);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [activeTab, debouncedSearch, sortBy]);

  const handleApprove = async (id) => {
    try {
      await api.put(
        `/vendors/approve/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      fetchVendors();
    } catch (error) {
      alert(error.response?.data?.message || "Error approving vendor.");
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectRemark.trim()) return alert("Rejection remark is required.");
    try {
      await api.put(
        `/vendors/reject/${selectedVendor._id}`,
        { remark: rejectRemark },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setShowRejectModal(false);
      setRejectRemark("");
      setSelectedVendor(null);
      fetchVendors();
    } catch (error) {
      alert(error.response?.data?.message || "Error rejecting vendor.");
    }
  };

  const handleAction = async (action, id) => {
    try {
      if (action === "softDelete") {
        await api.patch(
          `/vendors/${id}/soft-delete`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      } else if (action === "restore") {
        await api.patch(
          `/vendors/${id}/restore`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      } else if (action === "hardDelete") {
        const confirmDelete = window.confirm("Are you sure?.");
        if (!confirmDelete) return;

        await api.delete(`/vendors/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      fetchVendors();
    } catch (error) {
      alert(error.response?.data?.message || `Error performing ${action}`);
    }
  };

  const openRejectModal = (vendor) => {
    setSelectedVendor(vendor);
    setShowRejectModal(true);
  };

  const handleView = (vendor) => {
    setSelectedVendor(vendor);
    setShowViewModal(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 transition-colors duration-300">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Vendor Partner Approvals
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Review and manage businesses applying to list properties.
          </p>
        </div>

        <button
          onClick={() => navigate("/superadmin-dashboard/add-vendor")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add Vendor
        </button>
      </div>

      {/* TABS & CONTROLS ROW */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 border-b border-gray-200 dark:border-gray-700 mb-6 pb-2 lg:pb-0">
        {/* TABS (LEFT) */}
        <div className="flex gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap text-sm sm:text-base w-full lg:w-auto border-b-0">
          {["pending", "approved", "rejected", "bin"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 font-medium transition-all duration-200 border-b-2 cursor-pointer capitalize ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
              }`}
            >
              {tab === "bin" ? "Deleted Bin" : `${tab} Requests`}
            </button>
          ))}
        </div>

        {/* CONTROLS (SEARCH & SORT) - RIGHT */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto mb-2 px-2 sm:px-0">
          {/* SORT DROPDOWN */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="company_asc">Company: A to Z</option>
            <option value="company_desc">Company: Z to A</option>
            <option value="applicant_asc">Applicant: A to Z</option>
            <option value="applicant_desc">Applicant: Z to A</option>
          </select>

          {/* SEARCH INPUT */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search company, applicant, email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
            {/* Loading spinner */}
            {searchInput !== debouncedSearch && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700/60">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <th className="py-3 px-4 text-xs sm:text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 font-semibold">
                Company Info
              </th>
              <th className="py-3 px-4 text-xs sm:text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 font-semibold">
                Applicant
              </th>
              <th className="py-3 px-4 text-xs sm:text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 font-semibold">
                Contact
              </th>
              <th className="py-3 px-4 text-xs sm:text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 font-semibold text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="py-16 text-center">
                  {/* LOADER */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: "-0.3s" }}
                      ></div>
                      <div
                        className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: "-0.15s" }}
                      ></div>
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm font-medium">
                      Loading vendors...
                    </p>
                  </div>
                </td>
              </tr>
            ) : vendors.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-12 text-center text-gray-500">
                  {debouncedSearch
                    ? `No matching vendors found for "${debouncedSearch}".`
                    : `No ${activeTab === "bin" ? "deleted" : activeTab} vendor requests found.`}
                </td>
              </tr>
            ) : (
              vendors.map((vendor) => (
                <tr
                  key={vendor._id}
                  className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-800 dark:text-gray-200">
                      {vendor.companyName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Tracking ID: {vendor.trackingId || "N/A"}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {vendor.applicantName}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>{vendor.email}</div>
                    <div className="text-xs">{vendor.phone}</div>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => handleView(vendor)}
                      className="inline-block px-3 py-1.5 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-all cursor-pointer active:scale-95"
                    >
                      View
                    </button>

                    {/* Pending actions */}
                    {activeTab === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(vendor._id)}
                          className="inline-block px-3 py-1.5 rounded-md text-sm font-medium text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30 transition-all cursor-pointer active:scale-95"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openRejectModal(vendor)}
                          className="inline-block px-3 py-1.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-all cursor-pointer active:scale-95"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {/* Soft Delete, Restore, Hard Delete */}
                    {activeTab !== "bin" ? (
                      <>
                        <button
                          onClick={() => handleAction("softDelete", vendor._id)}
                          className="inline-block px-3 py-1.5 rounded-md text-sm font-medium text-orange-500 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/30 transition-all cursor-pointer active:scale-95"
                        >
                          Soft Delete
                        </button>
                        <button
                          onClick={() => handleAction("hardDelete", vendor._id)}
                          className="inline-block px-3 py-1.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-all cursor-pointer active:scale-95"
                        >
                          Hard Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleAction("restore", vendor._id)}
                          className="inline-block px-3 py-1.5 rounded-md text-sm font-medium text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30 transition-all cursor-pointer active:scale-95"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handleAction("hardDelete", vendor._id)}
                          className="inline-block px-3 py-1.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-all cursor-pointer active:scale-95"
                        >
                          Hard Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* VIEW MODAL */}
      {showViewModal && selectedVendor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Vendor Profile
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="px-6 py-5 space-y-4 text-sm">
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                <span className="text-gray-500 dark:text-gray-400">
                  Company Name:
                </span>
                <span className="font-semibold text-gray-800 dark:text-white text-right">
                  {selectedVendor.companyName}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                <span className="text-gray-500 dark:text-gray-400">
                  Applicant Name:
                </span>
                <span className="font-semibold text-gray-800 dark:text-white text-right">
                  {selectedVendor.applicantName}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                <span className="text-gray-500 dark:text-gray-400">Email:</span>
                <span className="font-medium text-gray-800 dark:text-white text-right">
                  {selectedVendor.email}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                <span className="font-medium text-gray-800 dark:text-white text-right">
                  {selectedVendor.phone}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                <span className="text-gray-500 dark:text-gray-400">
                  Status:
                </span>
                <span
                  className={`font-bold uppercase tracking-wider ${
                    selectedVendor.status === "approved"
                      ? "text-green-600"
                      : selectedVendor.status === "rejected"
                        ? "text-red-600"
                        : "text-yellow-600"
                  }`}
                >
                  {selectedVendor.status}
                </span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-gray-500 dark:text-gray-400">
                  Tracking ID:
                </span>
                <span className="font-mono text-xs text-gray-800 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {selectedVendor.trackingId || "N/A"}
                </span>
              </div>

              {selectedVendor.status === "rejected" && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                  <strong>Rejection Reason:</strong>{" "}
                  {selectedVendor.rejectRemark}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && selectedVendor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 transition-opacity">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Reject Vendor Application
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Please provide a reason for rejecting{" "}
              <strong>{selectedVendor.companyName}</strong>. This will be
              visible to them when they check their status.
            </p>
            <form onSubmit={handleRejectSubmit}>
              <textarea
                rows="4"
                required
                value={rejectRemark}
                onChange={(e) => setRejectRemark(e.target.value)}
                placeholder="E.g., Invalid business name, phone number doesn't work..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 mb-4"
              ></textarea>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all active:scale-95 cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorManager;
