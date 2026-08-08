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
      <div className="flex h-[50vh] items-center justify-center text-gray-500 font-medium text-sm">
        Loading Hotel Data...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin"></div>
        <div className="text-gray-500 font-medium text-sm">
          Loading Dashboard Metrics...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-500 font-sans">
      {/* TOP STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Bookings */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-[13px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                New Bookings
              </h3>
              <div className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {stats.newBookingsCount}
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
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
                Check-In
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

        {/* Check-Out Today */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-[13px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                Check-Out
              </h3>
              <div className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {stats.checkOutsToday}
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Hotel Earnings */}
        <div className="bg-gray-900 dark:bg-gray-950 p-5 rounded-2xl border border-gray-800 shadow-lg flex flex-col justify-between hover:shadow-xl transition-shadow duration-200">
          <div className="flex justify-between items-start mb-1">
            <div>
              <h3 className="text-[13px] font-bold text-gray-400 mb-1 uppercase tracking-wider">
                Total Revenue
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
        {/* Dynamic Room Availability */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm lg:col-span-2 flex flex-col justify-center">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-6">
            Room Availability
          </h2>

          {/* Styled Segmented Progress Bar */}
          <div className="w-full h-8 flex rounded-xl overflow-hidden mb-8 gap-0.5 bg-gray-100 dark:bg-gray-800">
            {/* Occupied (Blue) */}
            <div
              className="bg-blue-600 h-full transition-all duration-700 ease-out"
              style={{
                width: totalRooms
                  ? `${(occupiedRooms / totalRooms) * 100}%`
                  : "0%",
              }}
            ></div>
            {/* Reserved (Amber) */}
            <div
              className="bg-amber-500 h-full transition-all duration-700 ease-out"
              style={{
                width: totalRooms
                  ? `${(reservedRooms / totalRooms) * 100}%`
                  : "0%",
              }}
            ></div>
            {/* Available (Green) */}
            <div
              className="bg-emerald-500 h-full transition-all duration-700 ease-out"
              style={{
                width: totalRooms
                  ? `${(availableRooms / totalRooms) * 100}%`
                  : "0%",
              }}
            ></div>
            {/* Maintenance (Gray) */}
            <div
              className="bg-gray-400 dark:bg-gray-600 h-full transition-all duration-700 ease-out"
              style={{
                width: totalRooms
                  ? `${(maintenanceRooms / totalRooms) * 100}%`
                  : "0%",
              }}
            ></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="text-[12px] font-bold text-gray-500 mb-1 flex items-center gap-2 uppercase tracking-wide">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600"></span>{" "}
                Occupied
              </div>
              <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {occupiedRooms}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="text-[12px] font-bold text-gray-500 mb-1 flex items-center gap-2 uppercase tracking-wide">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>{" "}
                Reserved
              </div>
              <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {reservedRooms}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="text-[12px] font-bold text-gray-500 mb-1 flex items-center gap-2 uppercase tracking-wide">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>{" "}
                Available
              </div>
              <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {availableRooms}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="text-[12px] font-bold text-gray-500 mb-1 flex items-center gap-2 uppercase tracking-wide">
                <span className="w-2.5 h-2.5 rounded-sm bg-gray-400 dark:bg-gray-600"></span>{" "}
                Maintenance
              </div>
              <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {maintenanceRooms}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Rating Bar */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Overall Rating
            </h2>
          </div>

          <div className="flex items-end gap-3 mb-6">
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
                from {stats.ratings.totalReviews} reviews
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

      {/* RECENT BOOKINGS TABLE */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Booking List
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left whitespace-nowrap">
            <thead className="text-gray-500 bg-gray-50 dark:bg-gray-950/50 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">
                  Guest Name
                </th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">
                  Room Type
                </th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">
                  Stay Dates
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
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">
                      {booking.userId?.name || "Guest"}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">
                      <span className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${booking.status === "confirmed" || booking.status === "checked-in" ? "bg-emerald-500" : "bg-blue-500"}`}
                        ></span>
                        {booking.roomId?.roomType || "Standard"}
                      </span>
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

export default HotelDashboardOverview;
