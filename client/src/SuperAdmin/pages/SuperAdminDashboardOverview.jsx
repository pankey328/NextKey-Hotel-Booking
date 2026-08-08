import React, { useState, useEffect } from "react";
import api from "../../api";

const SuperAdminDashboardOverview = () => {
  const [data, setData] = useState({
    stats: {
      totalVendors: 0,
      totalHotels: 0,
      totalRooms: 0,
      totalLocations: 0,
      totalGrossRevenue: 0,
      totalPlatformRevenue: 0,
    },
    hotelRevenue: [],
    vendorRevenue: [],
  });
  const [loading, setLoading] = useState(true);

  const [activeTable, setActiveTable] = useState("hotels");

  useEffect(() => {
    const fetchSuperAdminStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/superadmin/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data && res.data.data) {
          setData(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch superadmin stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuperAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm max-w-7xl mx-auto">
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
        <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm font-medium">
          Loading Platform Statistics...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 font-sans">
      {/* TOP STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Gross Volume */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-widest">
                Gross Volume
              </h3>
              <div className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                ₹{(data.stats?.totalGrossRevenue || 0).toLocaleString("en-IN")}
              </div>
            </div>
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center shrink-0">
              <svg
                className="w-6 h-6"
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
          <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-2">
            Total money processed
          </div>
        </div>

        {/* Platform Revenue */}
        <div className="bg-gray-900 dark:bg-gray-950 p-6 rounded-3xl border border-gray-800 shadow-lg flex flex-col justify-between hover:shadow-xl transition-shadow duration-200 relative overflow-hidden">
          {/* Subtle gradient glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex justify-between items-start mb-2">
            <div>
              <h3 className="text-[11px] font-bold text-gray-400 mb-1 uppercase tracking-widest">
                Platform Revenue
              </h3>
              <div className="text-3xl font-extrabold text-white tracking-tight">
                ₹
                {(data.stats?.totalPlatformRevenue || 0).toLocaleString(
                  "en-IN",
                )}
              </div>
            </div>
            <div className="w-12 h-12 bg-gray-800 text-blue-400 rounded-2xl flex items-center justify-center shrink-0">
              <svg
                className="w-6 h-6"
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
          <div className="relative z-10 text-[11px] font-bold uppercase tracking-widest text-blue-400/80 mt-2">
            Platform cut (10%)
          </div>
        </div>

        {/* Total Vendors */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-widest">
                Approved Vendors
              </h3>
              <div className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {data.stats?.totalVendors || 0}
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center shrink-0">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
            </div>
          </div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-2">
            Registered Partners
          </div>
        </div>

        {/* Total Hotels */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-widest">
                Active Hotels
              </h3>
              <div className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {data.stats?.totalHotels || 0}
              </div>
            </div>
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shrink-0">
              <svg
                className="w-6 h-6"
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
          <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-2">
            Live Properties
          </div>
        </div>
      </div>

      {/* MIDDLE ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Properties List */}
        <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Top Performing Properties
            </h2>
          </div>
          <div className="space-y-4">
            {data.hotelRevenue.slice(0, 4).map((hotel, idx) => (
              <div
                key={hotel._id || idx}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 transition-colors cursor-default group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl flex items-center justify-center font-extrabold text-lg shadow-sm shrink-0">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {hotel.hotelName}
                    </h4>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mt-1">
                      {hotel.totalBookings} Completed Bookings
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-gray-900 dark:text-white">
                    ₹{(hotel.grossRevenue || 0).toLocaleString("en-IN")}
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-blue-500 mt-1">
                    Fee: ₹{(hotel.platformFee || 0).toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            ))}
            {data.hotelRevenue.length === 0 && (
              <div className="text-center py-10 text-gray-400 font-medium">
                No property data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Platform Scale Widget */}
        <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Platform Scale
              </h2>
            </div>
            <div className="flex items-end gap-3 mb-8">
              <div className="text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {data.stats?.totalLocations || 0}
              </div>
              <div className="mb-2">
                <div className="text-[13px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">
                  Active Locations
                </div>
                <div className="text-[11px] font-medium text-gray-400 mt-0.5">
                  Cities and districts
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
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
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    ></path>
                  </svg>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">
                  Listed Rooms
                </span>
              </div>
              <span className="font-extrabold text-gray-900 dark:text-white text-xl">
                {data.stats?.totalRooms || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* REVENUE LEADERBOARDS TABLE */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-200 dark:border-gray-800 gap-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Platform Leaderboards
          </h2>

          <div className="flex bg-gray-100 dark:bg-gray-950 rounded-xl p-1.5 border border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setActiveTable("hotels")}
              className={`px-6 py-2 text-[12px] font-bold uppercase tracking-wide rounded-lg transition-all ${
                activeTable === "hotels"
                  ? "bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Hotels
            </button>
            <button
              onClick={() => setActiveTable("vendors")}
              className={`px-6 py-2 text-[12px] font-bold uppercase tracking-wide rounded-lg transition-all ${
                activeTable === "vendors"
                  ? "bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Vendors
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap min-w-[800px]">
            <thead className="bg-gray-50 dark:bg-gray-950/50 text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-5">
                  {activeTable === "hotels" ? "Hotel Name" : "Vendor Company"}
                </th>
                <th className="px-6 py-5">Completed Bookings</th>
                <th className="px-6 py-5">Gross Revenue</th>
                <th className="px-6 py-5">Partner Earning (90%)</th>
                <th className="px-6 py-5 text-blue-600 dark:text-blue-500">
                  Platform Fee (10%)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-[13px]">
              {(activeTable === "hotels"
                ? data.hotelRevenue
                : data.vendorRevenue
              ).map((item, idx) => (
                <tr
                  key={item._id || idx}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                >
                  <td className="px-6 py-5 font-extrabold text-gray-900 dark:text-white">
                    {activeTable === "hotels"
                      ? item.hotelName
                      : item.vendorName}
                    {activeTable === "vendors" && (
                      <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-1 block">
                        {item.contactEmail}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5 text-gray-500 font-medium">
                    {item.totalBookings} Bookings
                  </td>
                  <td className="px-6 py-5 font-bold text-gray-600 dark:text-gray-300">
                    ₹{(item.grossRevenue || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-5 font-bold text-emerald-600 dark:text-emerald-400">
                    ₹
                    {activeTable === "hotels"
                      ? (item.hotelEarning || 0).toLocaleString("en-IN")
                      : (item.vendorEarning || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-5 font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10">
                    ₹{(item.platformFee || 0).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
              {(activeTable === "hotels"
                ? data.hotelRevenue
                : data.vendorRevenue
              ).length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-16 text-center text-gray-400 font-medium text-sm"
                  >
                    No completed bookings found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboardOverview;
