import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";
import useDebounce from "../../hooks/useDebounce";
import ExportHotelsButton from "./ExportHotelsButton";

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
    <div className="flex flex-col h-full animate-fade-in">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Manage Properties
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <ExportHotelsButton
            vendorId={currentVendorId}
            disabled={paginatedHotels.length === 0 || loading}
          />
          <Link
            to="/admin-dashboard/add-hotel"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-md transition-all active:scale-95 whitespace-nowrap w-full sm:w-auto text-center"
          >
            + Add New Property
          </Link>
        </div>
      </div>

      {/* TABS & SEARCH ROW */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 border-b border-gray-200 dark:border-gray-700 mb-6 pb-2 lg:pb-0">
        <div className="flex gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap text-sm sm:text-base w-full lg:w-auto">
          <button
            onClick={() => handleTabChange("active")}
            className={`pb-3 px-1 font-medium transition-all duration-200 border-b-2 cursor-pointer ${activeTab === "active" ? "border-blue-600 text-blue-600 dark:text-blue-400 font-bold" : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"}`}
          >
            Active Properties
          </button>
          <button
            onClick={() => handleTabChange("inactive")}
            className={`pb-3 px-1 font-medium transition-all duration-200 border-b-2 cursor-pointer ${activeTab === "inactive" ? "border-blue-600 text-blue-600 dark:text-blue-400 font-bold" : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"}`}
          >
            Inactive / Deleted Bin
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto mb-2 px-2 lg:px-0">
          <select
            value={dateRange}
            onChange={(e) => {
              setDateRange(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-auto border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm outline-none cursor-pointer"
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
            className="w-full sm:w-auto border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm outline-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
          </select>
          <div className="relative w-full sm:w-56">
            <input
              type="text"
              placeholder="Search property..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 text-sm outline-none"
            />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Property Name
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Status & Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="3" className="py-16 text-center text-gray-500">
                    Loading properties...
                  </td>
                </tr>
              ) : paginatedHotels.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-12 text-center text-gray-500">
                    {debouncedSearch
                      ? `No properties found matching "${debouncedSearch}".`
                      : `No ${activeTab} properties found.`}
                  </td>
                </tr>
              ) : (
                paginatedHotels.map((hotel) => (
                  <tr
                    key={hotel._id}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-800 dark:text-white">
                        {hotel.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {hotel.hotelType} • {hotel.starRating}★
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                      {hotel.cityId?.name}, {hotel.stateId?.name}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${hotel.status === "approved" ? "bg-green-100 text-green-800 border-green-200" : hotel.status === "rejected" ? "bg-red-100 text-red-800 border-red-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"}`}
                        >
                          {hotel.status}
                        </span>
                        {hotel.status === "rejected" &&
                          activeTab === "active" && (
                            <div
                              className="text-xs text-red-500 truncate"
                              title={hotel.rejectRemark}
                            >
                              Reason: {hotel.rejectRemark}
                            </div>
                          )}
                        <div className="flex flex-wrap gap-2 justify-end mt-1">
                          <button
                            onClick={() => handleView(hotel)}
                            className="text-xs px-3 py-1.5 rounded-md font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
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
                                    className="text-xs px-3 py-1.5 rounded-md font-medium bg-green-50 text-green-600 hover:bg-green-100 cursor-pointer"
                                  >
                                    Manage Dashboard
                                  </button>
                                  <Link
                                    to={`/admin-dashboard/add-room/${hotel._id}`}
                                    className="text-xs px-3 py-1.5 rounded-md font-medium bg-purple-50 text-purple-600 hover:bg-purple-100"
                                  >
                                    + Add Room
                                  </Link>
                                  <Link
                                    to={`/admin-dashboard/coupons/${hotel._id}`}
                                    className="text-xs px-3 py-1.5 rounded-md font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                                  >
                                    Coupons
                                  </Link>
                                </>
                              )}
                              {(hotel.status === "pending" ||
                                hotel.status === "rejected") && (
                                <Link
                                  to={`/admin-dashboard/edit-hotel/${hotel.trackingId}`}
                                  className="text-xs px-3 py-1.5 rounded-md font-medium bg-blue-50 text-blue-600 hover:bg-blue-100"
                                >
                                  Edit
                                </Link>
                              )}
                              <button
                                onClick={() =>
                                  handleAction("softDelete", hotel._id)
                                }
                                className="text-xs px-3 py-1.5 rounded-md font-medium bg-orange-50 text-orange-600 hover:bg-orange-100 cursor-pointer"
                              >
                                Delete
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() =>
                                  handleAction("restore", hotel._id)
                                }
                                className="text-xs px-3 py-1.5 rounded-md font-medium bg-green-50 text-green-600 cursor-pointer"
                              >
                                Restore
                              </button>
                              <button
                                onClick={() =>
                                  handleAction("hardDelete", hotel._id)
                                }
                                className="text-xs px-3 py-1.5 rounded-md font-medium bg-red-50 text-red-600 cursor-pointer"
                              >
                                Permanent Delete
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
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Rows per page:
              </span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm outline-none cursor-pointer"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
              </select>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-1.5">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 rounded-md bg-white border border-gray-300 disabled:opacity-50 cursor-pointer"
                >
                  Prev
                </button>
                <button
                  disabled={page === totalPages || totalPages === 0}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-md bg-white border border-gray-300 disabled:opacity-50 cursor-pointer"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Property Details
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl cursor-pointer"
              >
                &times;
              </button>
            </div>
            <div className="px-6 py-5 flex flex-col md:flex-row gap-6 max-h-[70vh] overflow-y-auto text-sm">
              <div className="w-full md:w-1/2">
                {selectedHotel.imageUrl ? (
                  <img
                    src={selectedHotel.imageUrl}
                    alt={selectedHotel.name}
                    className="w-full h-64 object-cover rounded-xl shadow-sm border border-gray-200"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center">
                    No Image
                  </div>
                )}
              </div>
              <div className="w-full md:w-1/2 space-y-3">
                <div>
                  <span className="text-gray-500">Name:</span>{" "}
                  <span className="font-semibold dark:text-white">
                    {selectedHotel.name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Type:</span>{" "}
                  <span className="font-medium dark:text-white">
                    {selectedHotel.hotelType} ({selectedHotel.starRating}★)
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>{" "}
                  <span className="dark:text-white">{selectedHotel.email}</span>
                </div>
                <div>
                  <span className="text-gray-500">Phone:</span>{" "}
                  <span className="dark:text-white">{selectedHotel.phone}</span>
                </div>
                <div>
                  <span className="text-gray-500">Location:</span>{" "}
                  <span className="dark:text-white">
                    {selectedHotel.cityId?.name},{" "}
                    {selectedHotel.districtId?.name},{" "}
                    {selectedHotel.stateId?.name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Description:</span>
                  <p className="text-gray-700 italic">
                    {selectedHotel.description || "None"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorProperties;
