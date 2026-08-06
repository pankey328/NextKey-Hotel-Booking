import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../api";
import useDebounce from "../../hooks/useDebounce";

const Reservations = (props) => {
  const context = useOutletContext();
  const hotelId = props.hotelId || context?.hotelInfo?._id;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterView, setFilterView] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 1000);
  const [sortBy, setSortBy] = useState("newest");
  const [pendingCount, setPendingCount] = useState(0);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const [dateRange, setDateRange] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, hotelId]);

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
    const fetchBookings = async () => {
      if (!hotelId) return;

      setLoading(true);
      try {
        let url = `/bookings/hotel/${hotelId}?page=${page}&limit=${limit}&filterView=${filterView}`;

        if (debouncedSearch) url += `&search=${debouncedSearch}`;
        if (sortBy) url += `&sortBy=${sortBy}`;
        if (startDate && endDate)
          url += `&startDate=${startDate}&endDate=${endDate}`;

        const res = await api.get(url, config);

        setBookings(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
        setPendingCount(res.data.pendingCount || 0);
      } catch (error) {
        console.error("Error fetching bookings", error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [
    hotelId,
    page,
    limit,
    filterView,
    debouncedSearch,
    sortBy,
    startDate,
    endDate,
  ]);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await api.put(
        `/bookings/${bookingId}/status`,
        { status: newStatus },
        config,
      );

      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, status: newStatus } : b,
        ),
      );

      if (newStatus !== "pending") {
        setPendingCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleFilterViewChange = (view) => {
    setFilterView(view);
    setPage(1);
  };

  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  if (!hotelId) {
    return (
      <div className="text-center py-12 text-gray-500 font-medium">
        Loading Hotel Reservations...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* TABS & FILTERS ROW */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4 border-b border-gray-200 dark:border-gray-700 pb-2 xl:pb-0">
        {/* TABS (LEFT) */}
        <div className="flex gap-4 px-2 overflow-x-auto whitespace-nowrap w-full xl:w-auto border-b-0">
          <button
            onClick={() => handleFilterViewChange("all")}
            className={`pb-3 px-1 font-medium border-b-2 transition-all cursor-pointer ${
              filterView === "all"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 font-bold"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            All Bookings
          </button>

          <button
            onClick={() => handleFilterViewChange("pending")}
            className={`pb-3 px-1 font-medium border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              filterView === "pending"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 font-bold"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            Pending
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs font-bold">
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => handleFilterViewChange("arriving")}
            className={`pb-3 px-1 font-medium border-b-2 transition-all cursor-pointer ${
              filterView === "arriving"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 font-bold"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            Arriving Today
          </button>

          <button
            onClick={() => handleFilterViewChange("checked_in")}
            className={`pb-3 px-1 font-medium border-b-2 transition-all cursor-pointer ${
              filterView === "checked_in"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 font-bold"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            Checked In
          </button>
        </div>

        {/* CONTROLS (DATE, SORT, SEARCH) - RIGHT */}
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto mb-2 px-2 sm:px-0">
          {/* DATE DROPDOWN */}
          <select
            value={dateRange}
            onChange={handleDateRangeChange}
            className="w-full sm:w-auto border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>

          {/* SORT DROPDOWN */}
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="w-full sm:w-auto border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name_asc">Guest Name: A to Z</option>
            <option value="name_desc">Guest Name: Z to A</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="price_asc">Price: Low to High</option>
          </select>

          {/* SEARCH INPUT */}
          <div className="relative w-full sm:w-60">
            <input
              type="text"
              placeholder="Search status, email, room..."
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

      {/* DATA TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                <th className="p-5 font-semibold">Guest</th>
                <th className="p-5 font-semibold">Room details</th>
                <th className="p-5 font-semibold">Dates</th>
                <th className="p-5 font-semibold">Status</th>
                <th className="p-5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-16 text-center">
                    {/* 3 DOTS LOADER */}
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
                        Finding reservations...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    No bookings found for this category or search.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr
                    key={booking._id}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="p-5">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {booking.userId?.name || "Guest"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {booking.userId?.email}
                      </p>
                    </td>

                    <td className="p-5">
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {booking.roomId?.roomType}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-0.5">
                        ₹{booking.finalPrice}{" "}
                        <span className="text-gray-400 font-normal">
                          ({booking.totalDays} nights)
                        </span>
                      </p>
                    </td>

                    <td className="p-5 text-xs text-gray-600 dark:text-gray-300 space-y-1">
                      <p>
                        <span className="font-medium text-gray-400">In:</span>{" "}
                        {new Date(booking.checkInDate).toLocaleDateString()}
                      </p>
                      <p>
                        <span className="font-medium text-gray-400">Out:</span>{" "}
                        {new Date(booking.checkOutDate).toLocaleDateString()}
                      </p>
                    </td>

                    <td className="p-5">
                      <span
                        className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md shadow-sm ${
                          booking.status === "pending"
                            ? "bg-yellow-500 text-white"
                            : booking.status === "confirmed"
                              ? "bg-blue-500 text-white"
                              : booking.status === "checked-in"
                                ? "bg-green-500 text-white"
                                : "bg-gray-500 text-white"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>

                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">
                        {booking.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusUpdate(booking._id, "confirmed")
                              }
                              className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 transition-colors cursor-pointer active:scale-95"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(booking._id, "rejected")
                              }
                              className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 transition-colors cursor-pointer active:scale-95"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {booking.status === "confirmed" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(booking._id, "checked-in")
                            }
                            className="px-3 py-1.5 text-xs font-medium rounded-md bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 transition-colors cursor-pointer active:scale-95"
                          >
                            Check In
                          </button>
                        )}
                        {booking.status === "checked-in" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(booking._id, "checked-out")
                            }
                            className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 transition-colors cursor-pointer active:scale-95"
                          >
                            Check Out
                          </button>
                        )}
                        {(booking.status === "checked-out" ||
                          booking.status === "cancelled" ||
                          booking.status === "rejected") && (
                          <span className="text-xs text-gray-400 italic">
                            Complete
                          </span>
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
        {!loading && bookings.length > 0 && (
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
                className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-white outline-none cursor-pointer focus:ring-1 focus:ring-blue-500"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
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
                  className="px-3 py-1.5 rounded-md bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer active:scale-95 shadow-sm"
                >
                  Prev
                </button>
                <button
                  disabled={page === totalPages || totalPages === 0}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-md bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer active:scale-95 shadow-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservations;
