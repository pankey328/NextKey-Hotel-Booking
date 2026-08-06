import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../api";

const HotelDashboardOverview = (props) => {
  const context = useOutletContext();
  const hotelInfo = props.hotelInfo || context?.hotelInfo;
  const rooms = props.rooms || context?.rooms || [];

  const [stats, setStats] = useState({
    newBookingsCount: 0,
    checkInsToday: 0,
    checkOutsToday: 0,
    totalRevenue: 0,
    netRevenue: 0,
    recentBookings: [],
    ratings: { overall: 0, room: 0, cleaning: 0, service: 0, totalReviews: 0 },
  });
  const [loading, setLoading] = useState(true);

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.status === "Available").length;
  const occupiedRooms = rooms.filter((r) => r.status === "Occupied").length;
  const reservedRooms = rooms.filter((r) => r.status === "Reserved").length;
  const maintenanceRooms = rooms.filter(
    (r) => r.status === "Under Maintenance" || r.status === "Out of Service",
  ).length;

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!hotelInfo?._id) return;

      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/bookings/hotel-stats/${hotelInfo._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data && res.data.data) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.log("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [hotelInfo]);

  const getRatingPercentage = (rating) => `${(Number(rating) / 5) * 100}%`;

  if (!hotelInfo) {
    return (
      <div className="text-center py-10 text-gray-500 font-medium">
        Loading Hotel Data...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500 font-medium">
        Loading Dashboard Metrics...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* New Bookings */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Pending Bookings
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

        {/* Check-In Today */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Check-In Today
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

        {/* Check-Out Today */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Check-Out Today
            </h3>
            <div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-lg">
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                ></path>
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {stats.checkOutsToday}
          </div>
        </div>

        {/* Hotel Earnings (Net Revenue) */}
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

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Room Availability */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Room Availability
            </h2>
          </div>

          <div className="w-full h-8 flex rounded-xl overflow-hidden mb-8">
            <div
              className="bg-blue-500 h-full transition-all duration-500"
              style={{
                width: totalRooms
                  ? `${(occupiedRooms / totalRooms) * 100}%`
                  : "0%",
              }}
            ></div>
            <div
              className="bg-yellow-400 h-full transition-all duration-500"
              style={{
                width: totalRooms
                  ? `${(reservedRooms / totalRooms) * 100}%`
                  : "0%",
              }}
            ></div>
            <div
              className="bg-green-400 h-full transition-all duration-500"
              style={{
                width: totalRooms
                  ? `${(availableRooms / totalRooms) * 100}%`
                  : "0%",
              }}
            ></div>
            <div
              className="bg-gray-300 h-full transition-all duration-500"
              style={{
                width: totalRooms
                  ? `${(maintenanceRooms / totalRooms) * 100}%`
                  : "0%",
              }}
            ></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>{" "}
                Occupied
              </div>
              <div className="text-2xl font-bold">{occupiedRooms}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-400"></span>{" "}
                Reserved
              </div>
              <div className="text-2xl font-bold">{reservedRooms}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-400"></span>{" "}
                Available
              </div>
              <div className="text-2xl font-bold">{availableRooms}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-300"></span>{" "}
                Maintenance
              </div>
              <div className="text-2xl font-bold">{maintenanceRooms}</div>
            </div>
          </div>
        </div>

        {/* Dynamic Rating Bar */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Overall Rating
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
                from {stats.ratings.totalReviews} reviews
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

      {/* Dynamic Booking List Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden mt-6">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            Recent Bookings
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-700/50 uppercase border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 font-medium">Guest Name</th>
                <th className="px-6 py-4 font-medium">Room Type</th>
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
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {booking.userId?.name || "Guest"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${booking.status === "confirmed" || booking.status === "checked-in" ? "bg-green-500" : "bg-blue-500"}`}
                        ></span>
                        {booking.roomId?.roomType || "Standard"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(booking.checkInDate).toLocaleDateString(
                        "en-GB",
                        { month: "short", day: "2-digit" },
                      )}{" "}
                      -{" "}
                      {new Date(booking.checkOutDate).toLocaleDateString(
                        "en-GB",
                        { month: "short", day: "2-digit", year: "numeric" },
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

export default HotelDashboardOverview;
