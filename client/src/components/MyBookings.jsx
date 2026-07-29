import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [ratings, setRatings] = useState({ room: 5, cleaning: 5, service: 5 });
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

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

  const openReviewModal = (booking) => {
    setSelectedBooking(booking);
    setRatings({ room: 5, cleaning: 5, service: 5 });
    setComment("");
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    const token = localStorage.getItem("token");
    setReviewLoading(true);
    try {
      await api.post(
        `/bookings/${selectedBooking._id}/review`,
        { ratings, comment },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert("Thank you for your feedback!");
      setShowReviewModal(false);
      fetchMyBookings();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  const StarSelector = ({ label, field }) => (
    <div className="flex justify-between items-center mb-3">
      <span className="font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRatings({ ...ratings, [field]: star })}
            className={`text-2xl transition-colors ${
              ratings[field] >= star
                ? "text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );

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

                    <div className="flex flex-wrap gap-3 items-center">
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

                      {/* Rate Your Stay Button */}
                      {booking.status === "checked-out" && !booking.isRated && (
                        <button
                          onClick={() => openReviewModal(booking)}
                          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-bold shadow transition-colors"
                        >
                          Rate Your Stay
                        </button>
                      )}

                      {/* Reviewed Status Badge */}
                      {booking.status === "checked-out" && booking.isRated && (
                        <span className="px-4 py-2 text-green-600 dark:text-green-400 font-bold text-sm flex items-center">
                          ✓ Reviewed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* REVIEW MODAL */}
      {showReviewModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Rate your stay
              </h2>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                How was your experience at{" "}
                <strong className="text-gray-800 dark:text-gray-200">
                  {selectedBooking.hotelId?.name}
                </strong>
                ?
              </p>

              <StarSelector label="Room Comfort" field="room" />
              <StarSelector label="Cleanliness" field="cleaning" />
              <StarSelector label="Staff & Service" field="service" />

              <div className="mt-6">
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Comments (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you loved or what could be improved..."
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 h-28 resize-none"
                ></textarea>
              </div>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-5 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                disabled={reviewLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm disabled:opacity-50 transition-colors"
              >
                {reviewLoading ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
