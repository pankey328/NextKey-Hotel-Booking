import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import useDebounce from "../../hooks/useDebounce";

const HotelManager = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("approved");

  const [hotels, setHotels] = useState([]);
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

  const [selectedHotel, setSelectedHotel] = useState(null);
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

  const fetchHotels = async () => {
    setLoading(true);
    try {
      let url =
        activeTab === "bin"
          ? `/hotels?isDeleted=true`
          : `/hotels?isDeleted=false&status=${activeTab}`;

      url += `&page=${page}&limit=${limit}`;

      if (debouncedSearch) url += `&search=${debouncedSearch}`;
      if (sortBy) url += `&sortBy=${sortBy}`;
      if (startDate && endDate)
        url += `&startDate=${startDate}&endDate=${endDate}`;

      const res = await api.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setHotels(res.data.data || []);

      const newTotalPages = res.data.totalPages || 1;
      setTotalPages(newTotalPages);

      // Auto-navigate to the previous page if we delete the last item on the current page
      if (page > newTotalPages && page > 1) {
        setPage(newTotalPages);
      }
    } catch (error) {
      console.error(error);
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [activeTab, debouncedSearch, sortBy, page, limit, startDate, endDate]);

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this hotel and generate credentials?")) return;
    try {
      await api.put(
        `/hotels/approve/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      fetchHotels();
    } catch (error) {
      alert(error.response?.data?.message || "Error approving hotel.");
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectRemark.trim()) return alert("Rejection remark is required.");
    try {
      await api.put(
        `/hotels/reject/${selectedHotel._id}`,
        {
          remark: rejectRemark,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setShowRejectModal(false);
      setRejectRemark("");
      setSelectedHotel(null);
      fetchHotels();
    } catch (error) {
      alert(error.response?.data?.message || "Error rejecting hotel.");
    }
  };

  const handleAction = async (action, id) => {
    try {
      if (action === "softDelete") {
        await api.patch(
          `/hotels/${id}/soft-delete`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else if (action === "restore") {
        await api.patch(
          `/hotels/${id}/restore`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else if (action === "hardDelete") {
        const confirmDelete = window.confirm(
          "Are you sure? This cannot be undone.",
        );
        if (!confirmDelete) return;

        await api.delete(`/hotels/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      fetchHotels();
    } catch (error) {
      alert(error.response?.data?.message || `Error performing ${action}`);
    }
  };

  const openRejectModal = (hotel) => {
    setSelectedHotel(hotel);
    setShowRejectModal(true);
  };

  const handleView = (hotel) => {
    setSelectedHotel(hotel);
    setShowViewModal(true);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 font-sans h-full flex flex-col">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-gray-900 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden shrink-0">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Hotel Approvals
          </h1>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-2">
            Review and manage vendor property registrations
          </p>
        </div>

        <div className="relative z-10 w-full md:w-auto">
          <button
            onClick={() => navigate("/superadmin-dashboard/add-hotel")}
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
            Add Hotel
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
              className={`pb-4 px-1 text-[13px] font-bold uppercase tracking-wide border-b-2 transition-all cursor-pointer ${
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
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
          </select>

          {/* SEARCH INPUT */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search Name, Email, Type..."
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
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-950/50 text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-5">Hotel Info</th>
                <th className="px-6 py-5">Vendor</th>
                <th className="px-6 py-5">Location</th>
                <th className="px-6 py-5">Contact</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-[13px]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center">
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
                        Loading hotels...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : hotels.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-16 text-center text-gray-500 dark:text-gray-400 font-medium"
                  >
                    {debouncedSearch
                      ? `No matching hotels found for "${debouncedSearch}".`
                      : `No ${activeTab === "bin" ? "deleted" : activeTab} hotels found.`}
                  </td>
                </tr>
              ) : (
                hotels.map((hotel) => (
                  <tr
                    key={hotel._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    {/* Hotel Info */}
                    <td className="px-6 py-5">
                      <div className="font-extrabold text-gray-900 dark:text-white text-sm">
                        {hotel.name}
                      </div>
                      <div className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mt-1">
                        {hotel.hotelType} • {hotel.starRating}★
                      </div>
                    </td>

                    {/* VENDOR INFO */}
                    <td className="px-6 py-5">
                      <div className="font-extrabold text-gray-900 dark:text-white text-[13px]">
                        {hotel.vendorId?.companyName || "No Company"}
                      </div>
                      <div className="font-medium text-gray-600 dark:text-gray-400 text-[12px] mt-0.5">
                        {hotel.vendorId?.applicantName || "Unknown Applicant"}
                      </div>
                      <div className="text-[11px] font-bold tracking-wider text-gray-400 mt-1">
                        {hotel.vendorId?.email || "No Email"}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-5 font-medium text-gray-600 dark:text-gray-400">
                      {hotel.cityId?.name?.toUpperCase()},{" "}
                      {hotel.stateId?.name?.toUpperCase()}
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-5">
                      <div className="font-medium text-gray-900 dark:text-gray-300">
                        {hotel.email}
                      </div>
                      <div className="text-[12px] font-bold tracking-wider text-gray-500 mt-0.5">
                        {hotel.phone}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <button
                          onClick={() => handleView(hotel)}
                          className="px-4 py-2 text-[12px] font-bold rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer active:scale-95"
                        >
                          View
                        </button>

                        {/* Pending actions */}
                        {activeTab === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(hotel._id)}
                              className="px-4 py-2 text-[12px] font-bold rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer active:scale-95"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => openRejectModal(hotel)}
                              className="px-4 py-2 text-[12px] font-bold rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40 transition-colors cursor-pointer active:scale-95"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {/* (Soft Delete, Restore, Hard Delete) */}
                        {activeTab !== "bin" ? (
                          <>
                            <button
                              onClick={() =>
                                handleAction("softDelete", hotel._id)
                              }
                              className="px-4 py-2 text-[12px] font-bold rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40 transition-colors cursor-pointer active:scale-95"
                            >
                              Bin
                            </button>
                            <button
                              onClick={() =>
                                handleAction("hardDelete", hotel._id)
                              }
                              className="px-4 py-2 text-[12px] font-bold rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40 transition-colors cursor-pointer active:scale-95"
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleAction("restore", hotel._id)}
                              className="px-4 py-2 text-[12px] font-bold rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer active:scale-95"
                            >
                              Restore
                            </button>
                            <button
                              onClick={() =>
                                handleAction("hardDelete", hotel._id)
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
        {!loading && hotels.length > 0 && (
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
      {showViewModal && selectedHotel && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6 transition-opacity overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-4xl shadow-2xl relative my-auto overflow-hidden flex flex-col md:flex-row border border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setShowViewModal(false)}
              className="absolute top-5 right-5 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md transition-colors cursor-pointer"
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

            {/* Left Image Pane */}
            <div className="w-full md:w-2/5 h-64 md:h-auto bg-gray-100 dark:bg-gray-950 relative border-r border-gray-200 dark:border-gray-800">
              {selectedHotel.imageUrl ? (
                <img
                  src={selectedHotel.imageUrl}
                  alt={selectedHotel.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-sm">
                  No Cover Image
                </div>
              )}
              <div className="absolute top-6 left-6">
                <span
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-lg backdrop-blur-md border border-white/20 ${
                    selectedHotel.status === "approved"
                      ? "bg-emerald-500/90 text-white"
                      : selectedHotel.status === "rejected"
                        ? "bg-rose-600/90 text-white"
                        : selectedHotel.status === "pending"
                          ? "bg-amber-500/90 text-white"
                          : "bg-gray-600/90 text-white"
                  }`}
                >
                  {selectedHotel.status}
                </span>
              </div>
            </div>

            {/* Right Details Pane */}
            <div className="w-full md:w-3/5 p-8 sm:p-10 max-h-[80vh] overflow-y-auto">
              <div className="mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
                  {selectedHotel.name}
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md">
                    {selectedHotel.hotelType}
                  </span>
                  <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 rounded-md">
                    {selectedHotel.starRating}★ Rating
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {/* VENDOR DETAILS IN MODAL */}
                <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                  <span className="text-blue-500 dark:text-blue-400 text-[10px] uppercase font-bold tracking-widest block mb-3">
                    Managed By (Vendor)
                  </span>
                  <div className="font-extrabold text-gray-900 dark:text-white mb-1">
                    🏢{" "}
                    {selectedHotel.vendorId?.companyName ||
                      "No Company Provided"}
                  </div>
                  <div className="font-medium text-gray-700 dark:text-gray-200 text-[13px] mb-2">
                    👤{" "}
                    {selectedHotel.vendorId?.applicantName ||
                      "Unknown Applicant"}
                  </div>
                  <div className="flex flex-col gap-1 text-[12px] font-bold tracking-wider text-gray-500 dark:text-gray-400">
                    <span>
                      ✉️ {selectedHotel.vendorId?.email || "No Email"}
                    </span>
                    <span>
                      📞 {selectedHotel.vendorId?.phone || "No Phone"}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                    Contact Information
                  </h4>
                  <ul className="space-y-3 text-[13px] font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <li className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-gray-400 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        ></path>
                      </svg>
                      <span className="truncate">{selectedHotel.email}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-gray-400 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        ></path>
                      </svg>
                      {selectedHotel.phone}
                    </li>
                    <li className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-gray-400 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        ></path>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                      </svg>
                      <span className="leading-relaxed">
                        {selectedHotel.address},<br />
                        {selectedHotel.cityId?.name},{" "}
                        {selectedHotel.districtId?.name},<br />
                        {selectedHotel.stateId?.name} - {selectedHotel.pincode}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Features Section */}
                {selectedHotel.features &&
                  selectedHotel.features.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                        Amenities
                      </h4>
                      <div className="flex flex-wrap gap-2 bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                        {selectedHotel.features.map((feature, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-[11px] font-bold uppercase tracking-widest border border-gray-200 dark:border-gray-600 shadow-sm"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {selectedHotel.description && (
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Property Description
                    </h4>
                    <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                      {selectedHotel.description}
                    </p>
                  </div>
                )}

                {selectedHotel.status === "rejected" &&
                  selectedHotel.rejectRemark && (
                    <div className="mt-4 p-5 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/30 rounded-2xl">
                      <h4 className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-2">
                        Rejection Reason
                      </h4>
                      <p className="text-[13px] font-medium text-rose-700 dark:text-rose-400">
                        {selectedHotel.rejectRemark}
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && selectedHotel && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[110] p-4 transition-opacity animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-800 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-rose-500"></div>

            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Reject Application
              </h2>
              <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                Provide a reason for rejecting{" "}
                <strong>{selectedHotel.name}</strong>. This feedback will be
                emailed directly to the vendor.
              </p>
            </div>

            <form onSubmit={handleRejectSubmit}>
              <textarea
                rows="4"
                required
                value={rejectRemark}
                onChange={(e) => setRejectRemark(e.target.value)}
                placeholder="E.g., Incomplete business documentation, poor image quality..."
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

export default HotelManager;
