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
      <div className="flex h-[50vh] items-center justify-center text-gray-500 font-medium text-sm">
        Loading Hotel Reservations...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      
      {/* TABS & FILTERS ROW */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-5 border-b border-gray-200 dark:border-gray-800 pb-4 xl:pb-0">
        
        {/* TABS (LEFT) */}
        <div className="flex gap-6 px-2 overflow-x-auto whitespace-nowrap w-full xl:w-auto border-b-0 hide-scrollbar">
          <button
            onClick={() => handleFilterViewChange("all")}
            className={`pb-4 px-1 text-[13px] font-bold uppercase tracking-wide border-b-2 transition-all cursor-pointer ${
              filterView === "all"
                ? "border-gray-900 text-gray-900 dark:border-white dark:text-white"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            All Bookings
          </button>

          <button
            onClick={() => handleFilterViewChange("pending")}
            className={`pb-4 px-1 text-[13px] font-bold uppercase tracking-wide border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              filterView === "pending"
                ? "border-gray-900 text-gray-900 dark:border-white dark:text-white"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            Pending
            <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 py-0.5 px-2 rounded-md text-[10px] font-extrabold">
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => handleFilterViewChange("arriving")}
            className={`pb-4 px-1 text-[13px] font-bold uppercase tracking-wide border-b-2 transition-all cursor-pointer ${
              filterView === "arriving"
                ? "border-gray-900 text-gray-900 dark:border-white dark:text-white"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            Arriving Today
          </button>

          <button
            onClick={() => handleFilterViewChange("checked_in")}
            className={`pb-4 px-1 text-[13px] font-bold uppercase tracking-wide border-b-2 transition-all cursor-pointer ${
              filterView === "checked_in"
                ? "border-gray-900 text-gray-900 dark:border-white dark:text-white"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            Checked In
          </button>
        </div>

        {/* CONTROLS (DATE, SORT, SEARCH) - RIGHT */}
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto mb-3 px-2 sm:px-0">
          
          {/* DATE DROPDOWN */}
          <select
            value={dateRange}
            onChange={handleDateRangeChange}
            className="w-full sm:w-auto border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-[13px] font-medium outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors cursor-pointer shadow-sm"
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
            className="w-full sm:w-auto border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-[13px] font-medium outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors cursor-pointer shadow-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name_asc">Guest Name: A to Z</option>
            <option value="name_desc">Guest Name: Z to A</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="price_asc">Price: Low to High</option>
          </select>

          {/* SEARCH INPUT */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search status, email, room..."
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

      {/* DATA TABLE */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-950/50 text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-5">Guest</th>
                <th className="px-6 py-5">Room Details</th>
                <th className="px-6 py-5">Dates</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-[13px]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: "-0.3s" }}></div>
                        <div className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: "-0.15s" }}></div>
                        <div className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce"></div>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm font-medium">
                        Finding reservations...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium">
                    No bookings found for this category or search.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr
                    key={booking._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {booking.guestName || booking.userId?.name || "Guest"}
                      </p>
                      <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                        {booking.guestEmail || booking.userId?.email}
                      </p>
                      {(booking.adults > 0 || booking.children > 0) && (
                        <p className="text-[11px] text-gray-500 mt-1 font-semibold">
                          {booking.adults || 1} Adult(s)
                          {booking.children > 0 && `, ${booking.children} Child(ren)`}
                        </p>
                      )}
                      {(booking.guestPhone || booking.userId?.phone) && (
                        <p className="text-[11px] text-gray-500 font-medium">
                          {booking.guestPhone || booking.userId?.phone}
                        </p>
                      )}
                      {booking.specialRequests && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-1 italic font-medium line-clamp-2" title={booking.specialRequests}>
                          Note: {booking.specialRequests}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800 dark:text-gray-200">
                        {booking.roomId?.roomType}
                      </p>
                      <p className="text-[12px] text-gray-500 font-medium mt-0.5">
                        <span className="text-gray-900 dark:text-gray-300 font-bold">₹{booking.finalPrice}</span>{" "}
                        ({booking.totalDays} nights)
                      </p>
                    </td>

                    <td className="px-6 py-4 text-[12px] text-gray-600 dark:text-gray-300 space-y-1 font-medium">
                      <p>
                        <span className="text-gray-400">In:</span>{" "}
                        {new Date(booking.checkInDate).toLocaleDateString("en-GB", { month: "short", day: "2-digit", year: "numeric" })}
                      </p>
                      <p>
                        <span className="text-gray-400">Out:</span>{" "}
                        {new Date(booking.checkOutDate).toLocaleDateString("en-GB", { month: "short", day: "2-digit", year: "numeric" })}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide ${
                          booking.status === "pending"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : booking.status === "confirmed"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : booking.status === "checked-in"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : booking.status === "cancelled" || booking.status === "rejected"
                                  ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {booking.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(booking._id, "confirmed")}
                              className="px-4 py-2 text-[12px] font-bold rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer active:scale-95"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(booking._id, "rejected")}
                              className="px-4 py-2 text-[12px] font-bold rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40 transition-colors cursor-pointer active:scale-95"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {booking.status === "confirmed" && (
                          <button
                            onClick={() => handleStatusUpdate(booking._id, "checked-in")}
                            className="px-4 py-2 text-[12px] font-bold rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors cursor-pointer active:scale-95"
                          >
                            Check In
                          </button>
                        )}
                        {booking.status === "checked-in" && (
                          <button
                            onClick={() => handleStatusUpdate(booking._id, "checked-out")}
                            className="px-4 py-2 text-[12px] font-bold rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer active:scale-95"
                          >
                            Check Out
                          </button>
                        )}
                        {(booking.status === "checked-out" ||
                          booking.status === "cancelled" ||
                          booking.status === "rejected") && (
                          <span className="text-[12px] text-gray-400 font-medium px-2 py-2">
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
          <div className="flex flex-col sm:flex-row justify-between items-center p-5 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 gap-4">
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
                Page <span className="font-bold text-gray-900 dark:text-white">{page}</span> of {totalPages}
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
    </div>
  );
};

export default Reservations;