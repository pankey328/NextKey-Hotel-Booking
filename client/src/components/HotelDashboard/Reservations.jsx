import React, { useState, useEffect } from "react";
import api from "../../api";

const Reservations = ({ hotelId }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterView, setFilterView] = useState("pending");

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/bookings/hotel/${hotelId}`, config);
      setBookings(res.data.data || []);
    } catch (error) {
      console.error("Error fetching bookings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hotelId) fetchBookings();
  }, [hotelId]);

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
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const filteredBookings = bookings.filter((b) => {
    const checkInStr = b.checkInDate
      ? new Date(b.checkInDate).toISOString().split("T")[0]
      : "";

    if (filterView === "pending") return b.status === "pending";
    if (filterView === "arriving")
      return b.status === "confirmed" && checkInStr === today;
    if (filterView === "checked_in") return b.status === "checked-in";
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 px-2 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setFilterView("pending")}
          className={`pb-3 px-1 font-medium border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            filterView === "pending"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 font-bold"
              : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
          }`}
        >
          Pending
          <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs font-bold">
            {bookings.filter((b) => b.status === "pending").length}
          </span>
        </button>

        <button
          onClick={() => setFilterView("arriving")}
          className={`pb-3 px-1 font-medium border-b-2 transition-all cursor-pointer ${
            filterView === "arriving"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 font-bold"
              : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
          }`}
        >
          Arriving
        </button>

        <button
          onClick={() => setFilterView("checked_in")}
          className={`pb-3 px-1 font-medium border-b-2 transition-all cursor-pointer ${
            filterView === "checked_in"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 font-bold"
              : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
          }`}
        >
          Checked In
        </button>

        <button
          onClick={() => setFilterView("all")}
          className={`pb-3 px-1 font-medium border-b-2 transition-all cursor-pointer ${
            filterView === "all"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 font-bold"
              : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
          }`}
        >
          All
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
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
                  <td
                    colSpan="5"
                    className="p-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    Loading reservations...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    No bookings found for this category.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
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
                              className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(booking._id, "rejected")
                              }
                              className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 transition-colors"
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
                            className="px-3 py-1.5 text-xs font-medium rounded-md bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 transition-colors"
                          >
                            Check In
                          </button>
                        )}
                        {booking.status === "checked-in" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(booking._id, "checked-out")
                            }
                            className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 transition-colors"
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
      </div>
    </div>
  );
};

export default Reservations;
