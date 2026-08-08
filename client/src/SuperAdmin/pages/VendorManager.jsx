import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import useDebounce from "../../hooks/useDebounce";

const VendorManager = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("approved");
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 1000);
  const [sortBy, setSortBy] = useState("newest");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const [dateRange, setDateRange] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectRemark, setRejectRemark] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (dateRange === "all") {
      setStartDate("");
      setEndDate("");
      return;
    }

    const end = new Date();
    let start = new Date();

    if (dateRange === "7days") start.setDate(end.getDate() - 7);
    if (dateRange === "30days") start.setDate(end.getDate() - 30);
    if (dateRange === "year") start.setFullYear(end.getFullYear() - 1);

    setStartDate(start.toISOString());
    setEndDate(end.toISOString());
  }, [dateRange]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortBy, limit, dateRange]);

  useEffect(() => {
    setSearchInput("");
    setSortBy("newest");
    setDateRange("all");
    setPage(1);
  }, [activeTab]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      let url =
        activeTab === "bin"
          ? `/vendors?isDeleted=true`
          : `/vendors?isDeleted=false&status=${activeTab}`;

      url += `&page=${page}&limit=${limit}`;

      if (debouncedSearch) url += `&search=${debouncedSearch}`;
      if (sortBy) url += `&sortBy=${sortBy}`;
      if (startDate && endDate)
        url += `&startDate=${startDate}&endDate=${endDate}`;

      const res = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVendors(res.data.data || res.data);

      const newTotalPages = res.data.totalPages || 1;
      setTotalPages(newTotalPages);

      // Auto-navigate to the previous page if we delete the last item on the current page
      if (page > newTotalPages && page > 1) {
        setPage(newTotalPages);
      }
    } catch (error) {
      console.log(error);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [activeTab, debouncedSearch, sortBy, page, limit, startDate, endDate]);

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
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 font-sans h-full flex flex-col">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-gray-900 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden shrink-0">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Vendor Approvals
          </h1>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-2">
            Review and manage businesses applying to list properties
          </p>
        </div>

        <div className="relative z-10 w-full md:w-auto">
          <button
            onClick={() => navigate("/superadmin-dashboard/add-vendor")}
            className="w-full md:w-auto px-6 py-3 rounded-xl text-[12px] font-bold uppercase tracking-wide bg-blue-600 hover:bg-blue-700 text-white transition-all active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
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
      </div>

      {/* TABS & CONTROLS ROW */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-5 border-b border-gray-200 dark:border-gray-800 pb-4 xl:pb-0 shrink-0">
        {/* TABS (LEFT) */}
        <div className="flex gap-6 px-2 overflow-x-auto whitespace-nowrap w-full xl:w-auto border-b-0 hide-scrollbar">
          {["approved", "pending", "rejected", "bin"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-1 text-[13px] font-bold uppercase tracking-wide border-b-2 transition-all cursor-pointer capitalize ${
                activeTab === tab
                  ? "border-gray-900 text-gray-900 dark:border-white dark:text-white"
                  : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
              }`}
            >
              {tab === "bin" ? "Deleted Bin" : `${tab} Requests`}
            </button>
          ))}
        </div>

        {/* CONTROLS (DATE, SORT, SEARCH) - RIGHT */}
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto mb-3 px-2 sm:px-0">
          {/* DATE RANGE DROPDOWN */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full sm:w-auto border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-[13px] font-medium outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors shadow-sm cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>

          {/* SORT DROPDOWN */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-[13px] font-medium outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors shadow-sm cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="company_asc">Company: A to Z</option>
            <option value="company_desc">Company: Z to A</option>
            <option value="applicant_asc">Applicant: A to Z</option>
            <option value="applicant_desc">Applicant: Z to A</option>
          </select>

          {/* SEARCH INPUT */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search company, applicant..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-[13px] font-medium outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors shadow-sm placeholder-gray-400"
            />
            {/* Loading spinner */}
            {searchInput !== debouncedSearch && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-900 dark:border-gray-600 dark:border-t-white rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col flex-1 overflow-hidden min-h-[50vh]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-950/50 text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-5">Company Info</th>
                <th className="px-6 py-5">Applicant</th>
                <th className="px-6 py-5">Contact</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-[13px]">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce"
                          style={{ animationDelay: "-0.3s" }}
                        ></div>
                        <div
                          className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce"
                          style={{ animationDelay: "-0.15s" }}
                        ></div>
                        <div className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce"></div>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm font-medium">
                        Loading vendors...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="p-16 text-center text-gray-500 dark:text-gray-400 font-medium"
                  >
                    {debouncedSearch
                      ? `No matching vendors found for "${debouncedSearch}".`
                      : `No ${activeTab === "bin" ? "deleted" : activeTab} vendor requests found.`}
                  </td>
                </tr>
              ) : (
                vendors.map((vendor) => (
                  <tr
                    key={vendor._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="font-extrabold text-gray-900 dark:text-white text-sm">
                        {vendor.companyName}
                      </div>
                      <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                        ID: {vendor.trackingId || "N/A"}
                      </div>
                    </td>

                    <td className="px-6 py-5 font-medium text-gray-700 dark:text-gray-300">
                      {vendor.applicantName}
                    </td>

                    <td className="px-6 py-5">
                      <div className="font-medium text-gray-900 dark:text-gray-300">
                        {vendor.email}
                      </div>
                      <div className="text-[12px] font-bold tracking-wider text-gray-500 mt-0.5">
                        {vendor.phone}
                      </div>
                    </td>

                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <button
                          onClick={() => handleView(vendor)}
                          className="px-4 py-2 text-[12px] font-bold rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer active:scale-95"
                        >
                          View
                        </button>

                        {/* Pending actions */}
                        {activeTab === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(vendor._id)}
                              className="px-4 py-2 text-[12px] font-bold rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer active:scale-95"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => openRejectModal(vendor)}
                              className="px-4 py-2 text-[12px] font-bold rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40 transition-colors cursor-pointer active:scale-95"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {/* Soft Delete, Restore, Hard Delete */}
                        {activeTab !== "bin" ? (
                          <>
                            <button
                              onClick={() =>
                                handleAction("softDelete", vendor._id)
                              }
                              className="px-4 py-2 text-[12px] font-bold rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40 transition-colors cursor-pointer active:scale-95"
                            >
                              Bin
                            </button>
                            <button
                              onClick={() =>
                                handleAction("hardDelete", vendor._id)
                              }
                              className="px-4 py-2 text-[12px] font-bold rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40 transition-colors cursor-pointer active:scale-95"
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                handleAction("restore", vendor._id)
                              }
                              className="px-4 py-2 text-[12px] font-bold rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer active:scale-95"
                            >
                              Restore
                            </button>
                            <button
                              onClick={() =>
                                handleAction("hardDelete", vendor._id)
                              }
                              className="px-4 py-2 text-[12px] font-bold rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40 transition-colors cursor-pointer active:scale-95"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {!loading && vendors.length > 0 && (
          <div className="mt-auto flex flex-col sm:flex-row justify-between items-center p-5 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-medium text-gray-500">
                Rows per page:
              </span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-[13px] font-bold bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-white outline-none cursor-pointer focus:border-gray-400 transition-colors"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
              </select>
            </div>

            <div className="flex items-center gap-5 text-[13px] text-gray-600 dark:text-gray-300 font-medium">
              <span>
                Page{" "}
                <span className="font-bold text-gray-900 dark:text-white">
                  {page}
                </span>{" "}
                of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer active:scale-95 shadow-sm font-bold text-gray-700 dark:text-gray-200"
                >
                  Prev
                </button>
                <button
                  disabled={page === totalPages || totalPages === 0}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer active:scale-95 shadow-sm font-bold text-gray-700 dark:text-gray-200"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* VIEW MODAL */}
      {showViewModal && selectedVendor && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-800 relative">
            <button
              onClick={() => setShowViewModal(false)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
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
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>

            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Vendor Profile
              </h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-2">
                Business & Contact Details
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                  Company Name
                </span>
                <span className="font-extrabold text-gray-900 dark:text-white text-base">
                  {selectedVendor.companyName}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                  Applicant Name
                </span>
                <span className="font-bold text-gray-900 dark:text-white text-[13px]">
                  {selectedVendor.applicantName}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                  Email
                </span>
                <span className="font-bold text-gray-900 dark:text-white text-[13px] truncate max-w-[240px]">
                  {selectedVendor.email}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                  Phone
                </span>
                <span className="font-bold text-gray-900 dark:text-white text-[13px]">
                  {selectedVendor.phone}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                  Status
                </span>
                <span
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest ${
                    selectedVendor.status === "approved"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : selectedVendor.status === "rejected"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}
                >
                  {selectedVendor.status}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                  Tracking ID
                </span>
                <span className="font-mono text-[11px] font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
                  {selectedVendor.trackingId || "N/A"}
                </span>
              </div>

              {selectedVendor.status === "rejected" &&
                selectedVendor.rejectRemark && (
                  <div className="p-5 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/30 rounded-2xl">
                    <h4 className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-2">
                      Rejection Reason
                    </h4>
                    <p className="text-[13px] font-medium text-rose-700 dark:text-rose-400">
                      {selectedVendor.rejectRemark}
                    </p>
                  </div>
                )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="w-full px-6 py-3 rounded-xl text-[12px] font-bold uppercase tracking-wide bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white transition-all cursor-pointer active:scale-95 shadow-md"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && selectedVendor && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[110] p-4 transition-opacity animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-800 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-rose-500"></div>

            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Reject Vendor Application
              </h2>
              <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                Provide a reason for rejecting{" "}
                <strong>{selectedVendor.companyName}</strong>. This feedback
                will be visible to them.
              </p>
            </div>

            <form onSubmit={handleRejectSubmit}>
              <textarea
                rows="4"
                required
                value={rejectRemark}
                onChange={(e) => setRejectRemark(e.target.value)}
                placeholder="E.g., Invalid business name, phone number doesn't work..."
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[13px] font-medium text-gray-900 dark:text-white focus:border-rose-500 outline-none transition-colors shadow-sm resize-none mb-6 placeholder-gray-400"
              ></textarea>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-6 py-3 rounded-xl text-[12px] font-bold uppercase tracking-wide border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer active:scale-95 shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl text-[12px] font-bold uppercase tracking-wide bg-rose-600 hover:bg-rose-700 text-white transition-all cursor-pointer active:scale-95 shadow-md hover:shadow-lg"
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
