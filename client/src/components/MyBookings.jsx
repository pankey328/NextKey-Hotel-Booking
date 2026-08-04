import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import {
  XMarkIcon,
  MapPinIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

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
    if (!window.confirm("Are you sure you want to cancel this reservation?"))
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
      alert("Reservation cancelled successfully.");
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
    <div className="flex justify-between items-center mb-4 bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800">
      <span className="text-sm font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400">
        {label}
      </span>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRatings({ ...ratings, [field]: star })}
            className="focus:outline-none transition-transform active:scale-90"
          >
            <StarSolid
              className={`w-6 h-6 transition-colors duration-200 ${
                ratings[field] >= star
                  ? "text-yellow-400"
                  : "text-neutral-300 dark:text-neutral-600"
              }`}
            />
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
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/30";
      case "confirmed":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30";
      case "checked-in":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30";
      case "checked-out":
        return "bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700";
      case "cancelled":
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30";
      default:
        return "bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfdfd] dark:bg-neutral-950 flex space-x-2 justify-center items-center">
        <div className="w-3 h-3 bg-neutral-300 dark:bg-neutral-700 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 bg-neutral-300 dark:bg-neutral-700 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 bg-neutral-300 dark:bg-neutral-700 rounded-full animate-bounce"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfdfd] dark:bg-neutral-950 transition-colors duration-500 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-serif text-neutral-900 dark:text-white tracking-tight mb-2">
            My Itineraries
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 font-light">
            Manage your upcoming stays and review past experiences.
          </p>
        </div>

        {/* Custom Tabs */}
        <div className="flex space-x-8 mb-10 border-b border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-4 px-1 text-sm font-bold uppercase tracking-widest transition-all duration-300 relative ${
              activeTab === "active"
                ? "text-black dark:text-white"
                : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            }`}
          >
            Active Stays
            {activeTab === "active" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black dark:bg-white rounded-t-md"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`pb-4 px-1 text-sm font-bold uppercase tracking-widest transition-all duration-300 relative ${
              activeTab === "past"
                ? "text-black dark:text-white"
                : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            }`}
          >
            Past & Cancelled
            {activeTab === "past" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black dark:bg-white rounded-t-md"></span>
            )}
          </button>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-[2rem] p-12 sm:p-16 text-center shadow-xl shadow-black/5 dark:shadow-black/20 border border-neutral-100 dark:border-neutral-800">
            <h3 className="text-2xl font-serif text-neutral-900 dark:text-white mb-3">
              No {activeTab} bookings found.
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-8 font-light max-w-md mx-auto">
              Time to pack your bags and plan your next luxury getaway. Explore
              our collection of premium properties.
            </p>
            <Link
              to="/search"
              className="inline-block bg-black dark:bg-white text-white dark:text-black font-semibold py-3.5 px-8 rounded-xl hover:shadow-lg transition-transform active:scale-95"
            >
              Start Exploring
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className="group bg-white dark:bg-neutral-900 rounded-[2rem] shadow-xl shadow-black/5 dark:shadow-black/20 border border-neutral-100 dark:border-neutral-800 overflow-hidden flex flex-col md:flex-row transition-all duration-300 hover:shadow-2xl"
              >
                {/* Hotel Image */}
                <div className="w-full md:w-64 h-56 md:h-auto bg-neutral-100 dark:bg-neutral-800 shrink-0 overflow-hidden relative">
                  <img
                    src={
                      booking.hotelId?.imageUrl ||
                      "https://via.placeholder.com/600x400"
                    }
                    alt="Hotel"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-4 left-4">
                    <span
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${getStatusColor(
                        booking.status,
                      )} uppercase tracking-widest backdrop-blur-md`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-serif text-neutral-900 dark:text-white mb-4 leading-tight">
                      {booking.hotelId?.name || "Hotel Unavailable"}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-start gap-3">
                        <MapPinIcon className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-0.5">
                            Room Reserved
                          </p>
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">
                            {booking.roomId?.roomType || "Standard Room"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CalendarIcon className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-0.5">
                            Dates
                          </p>
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">
                            {new Date(booking.checkInDate).toLocaleDateString()}{" "}
                            &rarr;{" "}
                            {new Date(
                              booking.checkOutDate,
                            ).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {booking.totalDays} Night(s)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-0.5">
                        Total Amount
                      </span>
                      <span className="text-2xl font-serif text-neutral-900 dark:text-white">
                        ₹{booking.finalPrice}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
                      <Link
                        to={`/hotel/${booking.hotelId?._id}`}
                        className="flex-1 sm:flex-none text-center px-6 py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white rounded-xl text-sm font-semibold transition-colors"
                      >
                        View Hotel
                      </Link>

                      {/* Cancel Button */}
                      {(booking.status === "pending" ||
                        booking.status === "confirmed") && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="flex-1 sm:flex-none text-center px-6 py-2.5 bg-white dark:bg-neutral-900 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm font-semibold transition-colors"
                        >
                          Cancel
                        </button>
                      )}

                      {/* Rate Your Stay Button */}
                      {booking.status === "checked-out" && !booking.isRated && (
                        <button
                          onClick={() => openReviewModal(booking)}
                          className="flex-1 sm:flex-none text-center px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-95"
                        >
                          Rate Stay
                        </button>
                      )}

                      {/* Reviewed Status Badge */}
                      {booking.status === "checked-out" && booking.isRated && (
                        <span className="flex-1 sm:flex-none text-center px-6 py-2.5 text-green-600 dark:text-green-400 font-bold text-sm bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-xl">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-white dark:bg-neutral-900 rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-white/20 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
              <h2 className="text-2xl font-serif text-neutral-900 dark:text-white">
                Share your experience
              </h2>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700">
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 font-light">
                How was your stay at{" "}
                <strong className="text-neutral-900 dark:text-white font-medium">
                  {selectedBooking.hotelId?.name}
                </strong>
                ? Your feedback helps us maintain our luxury standards.
              </p>

              <div className="space-y-2 mb-8">
                <StarSelector label="Room Comfort" field="room" />
                <StarSelector label="Cleanliness" field="cleaning" />
                <StarSelector label="Staff & Service" field="service" />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-3 ml-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you loved or what could be improved..."
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-xl p-4 outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors h-32 resize-none text-sm placeholder-neutral-400"
                ></textarea>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 bg-neutral-50 dark:bg-neutral-950/50 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-6 py-3.5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-xl font-semibold transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                disabled={reviewLoading}
                className="bg-black dark:bg-white text-white dark:text-black px-8 py-3.5 rounded-xl font-semibold shadow-lg disabled:opacity-50 transition-transform active:scale-95 w-full sm:w-auto flex justify-center items-center"
              >
                {reviewLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 dark:border-black/20 border-t-white dark:border-t-black rounded-full animate-spin"></div>
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
