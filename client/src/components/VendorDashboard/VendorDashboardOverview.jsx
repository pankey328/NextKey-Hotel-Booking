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
      <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
        <div className="flex items-center space-x-2">
          <div
            className="w-3 h-3 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce"
            style={{ animationDelay: "-0.3s" }}
          ></div>
          <div
            className="w-3 h-3 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce"
            style={{ animationDelay: "-0.15s" }}
          ></div>
          <div className="w-3 h-3 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce"></div>
        </div>
        <div className="text-gray-500 font-medium text-sm">
          Fetching Data Across All Properties...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 font-sans">
      {/* TOP STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Properties */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-[13px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                Total Properties
              </h3>
              <div className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {stats.totalProperties}
              </div>
            </div>
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
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
        </div>

        {/* Check-In Today */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-[13px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                Total Check-Ins
              </h3>
              <div className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {stats.checkInsToday}
              </div>
            </div>
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
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
        </div>

        {/* Total Pending */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-[13px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                Total Pending
              </h3>
              <div className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {stats.newBookingsCount}
              </div>
            </div>
            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
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
        </div>

        {/* Vendor Earnings */}
        <div className="bg-gray-900 dark:bg-gray-950 p-5 rounded-2xl border border-gray-800 shadow-lg flex flex-col justify-between hover:shadow-xl transition-shadow duration-200">
          <div className="flex justify-between items-start mb-1">
            <div>
              <h3 className="text-[13px] font-bold text-gray-400 mb-1 uppercase tracking-wider">
                Earnings
              </h3>
              <div className="text-2xl font-extrabold text-white tracking-tight">
                ₹{(stats.netRevenue || 0).toLocaleString("en-IN")}
              </div>
            </div>
            <div className="w-10 h-10 bg-gray-800 text-gray-300 rounded-xl flex items-center justify-center">
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
          <div className="text-[11px] font-medium text-gray-500 mt-2">
            Gross: ₹{(stats.totalRevenue || 0).toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* MIDDLE ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hotel List */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Active Properties
            </h2>
          </div>
          <div className="space-y-4">
            {myHotels.filter((h) => h.status === "approved").length === 0 ? (
              <div className="text-center py-10 text-gray-400 font-medium">
                No active properties found.
              </div>
            ) : (
              myHotels
                .filter((h) => h.status === "approved")
                .slice(0, 4)
                .map((hotel) => (
                  <div
                    key={hotel._id}
                    onClick={() =>
                      navigate(`/admin-dashboard/hotel/${hotel._id}/overview`)
                    }
                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors cursor-pointer group shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl flex items-center justify-center text-lg font-extrabold">
                        {hotel.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {hotel.name}
                        </h4>
                        <p className="text-[12px] font-bold uppercase tracking-wider text-gray-500 mt-1">
                          {hotel.cityId?.name} • {hotel.starRating}★{" "}
                          {hotel.hotelType}
                        </p>
                      </div>
                    </div>
                    <span className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all">
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
                          d="M9 5l7 7-7 7"
                        ></path>
                      </svg>
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Global Rating */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Network Rating
            </h2>
          </div>
          <div className="flex items-end gap-3 mb-8">
            <div className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-baseline">
              {stats.ratings.overall > 0 ? stats.ratings.overall : "--"}
              <span className="text-lg text-gray-400 font-medium ml-1">/5</span>
            </div>
            <div className="mb-1">
              <div className="text-[13px] font-bold text-gray-700 dark:text-gray-300">
                {stats.ratings.overall >= 4.5
                  ? "Impressive"
                  : stats.ratings.overall >= 4
                    ? "Good"
                    : "Average"}
              </div>
              <div className="text-[11px] font-medium text-gray-400">
                across {stats.ratings.totalReviews} reviews
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center text-[13px]">
              <span className="w-24 font-bold text-gray-600 dark:text-gray-400">
                Cleanliness
              </span>
              <div className="flex-1 h-2 mx-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-1000 ease-out rounded-full"
                  style={{ width: getRatingPercentage(stats.ratings.cleaning) }}
                ></div>
              </div>
              <span className="font-extrabold text-gray-900 dark:text-gray-100 w-6 text-right">
                {stats.ratings.cleaning > 0 ? stats.ratings.cleaning : "--"}
              </span>
            </div>
            <div className="flex items-center text-[13px]">
              <span className="w-24 font-bold text-gray-600 dark:text-gray-400">
                Room Quality
              </span>
              <div className="flex-1 h-2 mx-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-1000 ease-out rounded-full"
                  style={{ width: getRatingPercentage(stats.ratings.room) }}
                ></div>
              </div>
              <span className="font-extrabold text-gray-900 dark:text-gray-100 w-6 text-right">
                {stats.ratings.room > 0 ? stats.ratings.room : "--"}
              </span>
            </div>
            <div className="flex items-center text-[13px]">
              <span className="w-24 font-bold text-gray-600 dark:text-gray-400">
                Service
              </span>
              <div className="flex-1 h-2 mx-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-1000 ease-out rounded-full"
                  style={{ width: getRatingPercentage(stats.ratings.service) }}
                ></div>
              </div>
              <span className="font-extrabold text-gray-900 dark:text-gray-100 w-6 text-right">
                {stats.ratings.service > 0 ? stats.ratings.service : "--"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Bookings List */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Recent Global Bookings
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left whitespace-nowrap">
            <thead className="text-gray-500 bg-gray-50 dark:bg-gray-950/50 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">
                  Hotel
                </th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">
                  Guest Name
                </th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">
                  Check-In & Out
                </th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.recentBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-10 text-gray-400 font-medium"
                  >
                    No recent bookings found.
                  </td>
                </tr>
              ) : (
                stats.recentBookings.map((booking) => (
                  <tr
                    key={booking._id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                      {booking.hotelId?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-600 dark:text-gray-300">
                      {booking.userId?.name || "Guest"}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      {new Date(booking.checkInDate).toLocaleDateString(
                        "en-GB",
                        { month: "short", day: "2-digit", year: "numeric" },
                      )}
                      {" - "}
                      {new Date(booking.checkOutDate).toLocaleDateString(
                        "en-GB",
                        { month: "short", day: "2-digit", year: "numeric" },
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide uppercase ${
                          booking.status === "pending"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                            : booking.status === "checked-in" ||
                                booking.status === "confirmed"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : booking.status === "cancelled"
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
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
