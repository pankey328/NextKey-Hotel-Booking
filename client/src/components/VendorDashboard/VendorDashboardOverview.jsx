import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import api from "../../api";

const VendorDashboardOverview = () => {
  const { myHotels } = useOutletContext() || { myHotels: [] };
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalProperties: 0,
    newBookingsCount: 0,
    checkInsToday: 0,
    checkOutsToday: 0,
    totalRevenue: 0,
    netRevenue: 0,
    recentBookings: [],
    ratings: { overall: 0, room: 0, cleaning: 0, service: 0, totalReviews: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/bookings/vendor-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data && res.data.data) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.log("Failed to fetch vendor dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorStats();
  }, []);

  const getRatingPercentage = (rating) => `${(Number(rating) / 5) * 100}%`;

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500 font-medium">
        Fetching Data Across All Properties...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Total Properties
            </h3>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-lg">
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                ></path>
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {stats.totalProperties}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Total Check-Ins
            </h3>
            <div className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-lg">
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
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                ></path>
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {stats.checkInsToday}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Total Pending
            </h3>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {stats.newBookingsCount}
          </div>
        </div>

        {/* Vendor Earnings (Net Revenue) */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                Earnings
              </h3>
              <div className="p-2 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 rounded-lg">
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
                    d="M6 3h12 M6 8h12 M6 13l8.5 8 M6 13h3 M9 13c6.667 0 6.667-10 0-10"
                  ></path>
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              ₹{(stats.netRevenue || 0).toLocaleString("en-IN")}
            </div>
          </div>
          <div className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-1">
            Gross: ₹{(stats.totalRevenue || 0).toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hotel List */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Active Properties
            </h2>
          </div>
          <div className="space-y-4">
            {myHotels
              .filter((h) => h.status === "approved")
              .slice(0, 4)
              .map((hotel) => (
                <div
                  key={hotel._id}
                  onClick={() =>
                    navigate(`/admin-dashboard/hotel/${hotel._id}/overview`)
                  }
                  className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 dark:bg-blue-900/40 rounded-lg flex items-center justify-center font-bold">
                      {hotel.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {hotel.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {hotel.cityId?.name} • {hotel.starRating}★{" "}
                        {hotel.hotelType}
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400 group-hover:text-blue-600">
                    &rarr;
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Global Rating */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Network Rating
            </h2>
          </div>
          <div className="flex items-end gap-3 mb-6">
            <div className="text-5xl font-extrabold text-gray-900 dark:text-white">
              {stats.ratings.overall > 0 ? stats.ratings.overall : "--"}
              <span className="text-2xl text-gray-400 font-medium">/5</span>
            </div>
            <div className="mb-1">
              <div className="text-sm font-bold text-gray-800 dark:text-gray-200">
                {stats.ratings.overall >= 4.5
                  ? "Impressive"
                  : stats.ratings.overall >= 4
                    ? "Good"
                    : "Average"}
              </div>
              <div className="text-xs text-gray-500">
                across {stats.ratings.totalReviews} reviews
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <span className="w-24 text-gray-600 dark:text-gray-400">
                Cleanliness
              </span>
              <div className="flex-1 h-2 mx-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="bg-yellow-400 h-full transition-all duration-1000"
                  style={{ width: getRatingPercentage(stats.ratings.cleaning) }}
                ></div>
              </div>
              <span className="font-bold w-6 text-right">
                {stats.ratings.cleaning > 0 ? stats.ratings.cleaning : "--"}
              </span>
            </div>
            <div className="flex items-center text-sm">
              <span className="w-24 text-gray-600 dark:text-gray-400">
                Room Quality
              </span>
              <div className="flex-1 h-2 mx-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="bg-yellow-400 h-full transition-all duration-1000"
                  style={{ width: getRatingPercentage(stats.ratings.room) }}
                ></div>
              </div>
              <span className="font-bold w-6 text-right">
                {stats.ratings.room > 0 ? stats.ratings.room : "--"}
              </span>
            </div>
            <div className="flex items-center text-sm">
              <span className="w-24 text-gray-600 dark:text-gray-400">
                Service
              </span>
              <div className="flex-1 h-2 mx-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="bg-yellow-400 h-full transition-all duration-1000"
                  style={{ width: getRatingPercentage(stats.ratings.service) }}
                ></div>
              </div>
              <span className="font-bold w-6 text-right">
                {stats.ratings.service > 0 ? stats.ratings.service : "--"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Bookings List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden mt-6">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            Recent Global Bookings
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-700/50 uppercase border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 font-medium">Hotel</th>
                <th className="px-6 py-4 font-medium">Guest Name</th>
                <th className="px-6 py-4 font-medium">Check-In & Out</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentBookings.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500">
                    No recent bookings found.
                  </td>
                </tr>
              ) : (
                stats.recentBookings.map((booking) => (
                  <tr
                    key={booking._id}
                    className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                  >
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                      {booking.hotelId?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-600 dark:text-gray-300">
                      {booking.userId?.name || "Guest"}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(booking.checkInDate).toLocaleDateString(
                        "en-GB",
                        { month: "short", day: "2-digit" },
                      )}{" "}
                      -{" "}
                      {new Date(booking.checkOutDate).toLocaleDateString(
                        "en-GB",
                        { month: "short", day: "2-digit" },
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : booking.status === "checked-in"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {booking.status}
                      </span>
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

export default VendorDashboardOverview;
