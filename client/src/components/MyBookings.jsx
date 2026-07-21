import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  const fetchMyBookings = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/bookings/my-bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBookings(res.data.data);
    } catch (error) {
      console.error("Error fetching bookings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;

    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/bookings/${bookingId}/status`,
        { status: "cancelled" },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, status: "cancelled" } : b,
        ),
      );
      alert("Booking cancelled successfully.");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  const activeStatuses = ["pending", "confirmed", "checked-in"];

  const pastStatuses = ["checked-out", "cancelled", "rejected"];

  const filteredBookings = bookings.filter((b) =>
    activeTab === "active"
      ? activeStatuses.includes(b.status)
      : pastStatuses.includes(b.status),
  );

  const getStatusColor = (status) => {
    if (status === "pending") {
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    } else if (status === "confirmed") {
      return "bg-blue-100 text-blue-800 border-blue-200";
    } else if (status === "checked-in") {
      return "bg-green-100 text-green-800 border-green-200";
    } else if (status === "checked-out") {
      return "bg-gray-100 text-gray-800 border-gray-200";
    } else if (status === "cancelled") {
      return "bg-red-100 text-red-800 border-red-200";
    } else if (status === "rejected") {
      return "bg-orange-100 text-orange-800 border-orange-200";
    } else {
      return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <p className="text-xl font-bold dark:text-white">
          Loading your trips...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">
          My Trips
        </h1>

        <div className="flex space-x-4 mb-8 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-3 px-1 font-medium text-lg border-b-2 transition-colors ${
              activeTab === "active"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Active Bookings
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`pb-3 px-1 font-medium text-lg border-b-2 transition-colors ${
              activeTab === "past"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Past & Cancelled
          </button>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-10 text-center shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">
              No {activeTab} bookings found.
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Time to pack your bags and plan your next adventure!
            </p>
            <Link
              to="/"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors"
            >
              Start Exploring
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col sm:flex-row"
              >
                {/* Hotel Image */}
                <div className="w-full sm:w-48 h-48 sm:h-auto bg-gray-200 shrink-0">
                  <img
                    src={
                      booking.hotelId?.imageUrl ||
                      "https://via.placeholder.com/300x200"
                    }
                    alt="Hotel"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Booking Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {booking.hotelId?.name || "Hotel Unavailable"}
                      </h3>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(
                          booking.status,
                        )} uppercase tracking-wide`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1">
                      Room: {booking.roomId?.roomType || "Standard Room"}
                    </p>

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(booking.checkInDate).toLocaleDateString()}{" "}
                      &rarr;{" "}
                      {new Date(booking.checkOutDate).toLocaleDateString()}
                      <span className="mx-2">•</span>
                      {booking.totalDays} Night(s)
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 block">
                        Total Amount
                      </span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        ₹{booking.finalPrice}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <Link
                        to={`/hotel/${booking.hotelId?._id}`}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        View Hotel
                      </Link>

                      {/* Cancel Button */}
                      {(booking.status === "pending" ||
                        booking.status === "confirmed") && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg text-sm font-medium transition-colors border border-red-100 dark:border-red-800/30"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
