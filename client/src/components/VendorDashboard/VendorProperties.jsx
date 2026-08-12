import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";
import useDebounce from "../../hooks/useDebounce";
import ExportHotelsButton from "./ExportHotelsButton";
import ImportHotelsButton from "./ImportHotelsButton";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css"; 

const VendorProperties = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const [activeTab, setActiveTab] = useState("active");
  const [paginatedHotels, setPaginatedHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 1000);
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const [dateRange, setDateRange] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);

  const currentVendorId =
    paginatedHotels.length > 0 ? paginatedHotels[0].vendorId?._id : null;

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
  }, [debouncedSearch]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const isDeleted = activeTab === "inactive";
      let url = `/hotels?isDeleted=${isDeleted}&page=${page}&limit=${limit}`;
      if (debouncedSearch) url += `&search=${debouncedSearch}`;
      if (sortBy) url += `&sortBy=${sortBy}`;
      if (startDate && endDate)
        url += `&startDate=${startDate}&endDate=${endDate}`;

      const res = await api.get(url, config);
      setPaginatedHotels(res.data.data || []);
      const newTotalPages = res.data.totalPages || 1;
      setTotalPages(newTotalPages);

      if (page > newTotalPages && page > 1) {
        setPage(newTotalPages);
      }
    } catch (error) {
      console.error("Error fetching properties", error);
      setPaginatedHotels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [activeTab, debouncedSearch, sortBy, page, limit, startDate, endDate]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchInput("");
    setSortBy("newest");
    setDateRange("all");
    setPage(1);
  };

  const handleAction = async (action, id) => {
    try {
      if (action === "softDelete") {
        if (!window.confirm("Move this property to the inactive bin?")) return;
        await api.patch(`/hotels/${id}/soft-delete`, {}, config);
      } else if (action === "restore") {
        await api.patch(`/hotels/${id}/restore`, {}, config);
      } else if (action === "hardDelete") {
        if (
          !window.confirm(
            "Are you sure? This will permanently delete the property.",
          )
        )
          return;
        await api.delete(`/hotels/${id}`, config);
      }
      fetchProperties();
    } catch (error) {
      alert(error.response?.data?.message || `Error performing ${action}`);
    }
  };

  const handleView = (hotel) => {
    setSelectedHotel(hotel);
    setShowViewModal(true);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 font-sans space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-gray-900 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden shrink-0">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-gray-100 dark:bg-gray-800/50 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Manage Properties
          </h1>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-2">
            View and edit your hotel portfolio
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto relative z-10">
          <ImportHotelsButton
            vendorId={currentVendorId}
            onSuccess={fetchProperties}
          />
          <ExportHotelsButton
            vendorId={currentVendorId}
            disabled={paginatedHotels.length === 0 || loading}
          />
          <Link
            to="/admin-dashboard/add-hotel"
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-[12px] font-bold uppercase tracking-wide bg-blue-600 hover:bg-blue-700 text-white transition-all active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
            Add New Property
          </Link>
        </div>
      </div>

      {/* TABS & SEARCH ROW */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-5 border-b border-gray-200 dark:border-gray-800 pb-4 xl:pb-0 shrink-0">
        {/* TABS */}
        <div className="flex gap-6 px-2 overflow-x-auto whitespace-nowrap w-full xl:w-auto border-b-0 hide-scrollbar">
          <button
            onClick={() => handleTabChange("active")}
            className={`pb-4 px-1 text-[13px] font-bold uppercase tracking-wide border-b-2 transition-all cursor-pointer ${
              activeTab === "active"
                ? "border-gray-900 text-gray-900 dark:border-white dark:text-white"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            Active Properties
          </button>
          <button
            onClick={() => handleTabChange("inactive")}
            className={`pb-4 px-1 text-[13px] font-bold uppercase tracking-wide border-b-2 transition-all cursor-pointer ${
              activeTab === "inactive"
                ? "border-gray-900 text-gray-900 dark:border-white dark:text-white"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            Inactive / Deleted
          </button>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto mb-3 px-2 sm:px-0">
          <select
            value={dateRange}
            onChange={(e) => {
              setDateRange(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-auto border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-[13px] font-medium outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors shadow-sm cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-auto border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-[13px] font-medium outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors shadow-sm cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
          </select>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search property..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-[13px] font-medium outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors shadow-sm placeholder-gray-400"
            />
            {searchInput !== debouncedSearch && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-900 dark:border-gray-600 dark:border-t-white rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col flex-1 overflow-hidden min-h-[50vh]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-950/50 text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-5">Property Details</th>
                <th className="px-6 py-5">Location</th>
                <th className="px-6 py-5 text-right">Status & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-[13px]">
              {loading ? (
                <tr>
                  <td colSpan="3" className="p-20 text-center">
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
                        Loading properties...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : paginatedHotels.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="p-16 text-center text-gray-500 dark:text-gray-400 font-medium"
                  >
                    {debouncedSearch
                      ? `No properties found matching "${debouncedSearch}".`
                      : `No ${activeTab} properties found.`}
                  </td>
                </tr>
              ) : (
                paginatedHotels.map((hotel) => (
                  <tr
                    key={hotel._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        {hotel.imageUrl ? (
                          <LazyLoadImage
                            src={hotel.imageUrl}
                            alt="Hotel"
                            effect="blur"
                            wrapperClassName="w-12 h-12 block flex-shrink-0 rounded-xl"
                            className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-xs font-bold uppercase border border-gray-200 dark:border-gray-700">
                            N/A
                          </div>
                        )}
                        <div>
                          <div className="font-extrabold text-gray-900 dark:text-white text-base">
                            {hotel.name}
                          </div>
                          <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                            {hotel.hotelType} • {hotel.starRating}★
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-medium text-gray-600 dark:text-gray-300">
                      {hotel.cityId?.name}, {hotel.cityId?.stateId?.name || hotel.stateId?.name}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex flex-col items-end gap-3">
                        <span
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                            hotel.status === "approved"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : hotel.status === "rejected"
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          }`}
                        >
                          {hotel.status}
                        </span>

                        {hotel.status === "rejected" &&
                          activeTab === "active" && (
                            <div
                              className="text-[11px] font-medium text-rose-500 max-w-[200px] truncate"
                              title={hotel.rejectRemark}
                            >
                              Reason: {hotel.rejectRemark}
                            </div>
                          )}

                        <div className="flex flex-wrap gap-2 justify-end mt-1">
                          <button
                            onClick={() => handleView(hotel)}
                            className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer active:scale-95 transition-colors"
                          >
                            View
                          </button>

                          {activeTab === "active" ? (
                            <>
                              {hotel.status === "approved" && (
                                <>
                                  <button
                                    onClick={() =>
                                      navigate(
                                        `/admin-dashboard/hotel/${hotel._id}/overview`,
                                      )
                                    }
                                    className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 cursor-pointer active:scale-95 transition-colors"
                                  >
                                    Dashboard
                                  </button>
                                  <Link
                                    to={`/admin-dashboard/add-room/${hotel._id}`}
                                    className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/40 active:scale-95 transition-colors"
                                  >
                                    + Room
                                  </Link>
                                  <Link
                                    to={`/admin-dashboard/coupons/${hotel._id}`}
                                    className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 active:scale-95 transition-colors"
                                  >
                                    Coupons
                                  </Link>
                                </>
                              )}
                              {(hotel.status === "pending" ||
                                hotel.status === "rejected") && (
                                <Link
                                  to={`/admin-dashboard/edit-hotel/${hotel.trackingId}`}
                                  className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 active:scale-95 transition-colors"
                                >
                                  Edit
                                </Link>
                              )}
                              <button
                                onClick={() =>
                                  handleAction("softDelete", hotel._id)
                                }
                                className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40 cursor-pointer active:scale-95 transition-colors"
                              >
                                Bin
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() =>
                                  handleAction("restore", hotel._id)
                                }
                                className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 cursor-pointer active:scale-95 transition-colors"
                              >
                                Restore
                              </button>
                              <button
                                onClick={() =>
                                  handleAction("hardDelete", hotel._id)
                                }
                                className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40 cursor-pointer active:scale-95 transition-colors"
                              >
                                Perm Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {!loading && paginatedHotels.length > 0 && (
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
                        : "bg-amber-500/90 text-white"
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
                        {selectedHotel.cityId?.districtId?.name || selectedHotel.districtId?.name},<br />
                        {selectedHotel.cityId?.stateId?.name || selectedHotel.stateId?.name} - {selectedHotel.pincode}
                      </span>
                    </li>
                  </ul>
                </div>

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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorProperties;
