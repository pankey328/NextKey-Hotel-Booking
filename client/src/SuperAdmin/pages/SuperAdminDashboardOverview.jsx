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
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center py-12 text-gray-500 font-medium animate-pulse">
          Loading Platform Statistics...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Volume */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                Gross
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
              ₹{(data.stats?.totalGrossRevenue || 0).toLocaleString("en-IN")}
            </div>
          </div>
          <div className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-1">
            Total money processed
          </div>
        </div>

        {/* Platform Revenue */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                Platform Revenue
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
                    d="M6 3h12 M6 8h12 M6 13l8.5 8 M6 13h3 M9 13c6.667 0 6.667-10 0-10"
                  ></path>
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              ₹{(data.stats?.totalPlatformRevenue || 0).toLocaleString("en-IN")}
            </div>
          </div>
          <div className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-1">
            Platform cut (10%)
          </div>
        </div>

        {/* Total Vendors */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Approved Vendors
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {data.stats?.totalVendors || 0}
          </div>
        </div>

        {/* Total Hotels */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Active Hotels
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                ></path>
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {data.stats?.totalHotels || 0}
          </div>
        </div>
      </div>

      {/* MIDDLE ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Properties List */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Top Performing Properties
            </h2>
          </div>
          <div className="space-y-4">
            {data.hotelRevenue.slice(0, 4).map((hotel, idx) => (
              <div
                key={hotel._id || idx}
                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 dark:bg-blue-900/40 rounded-lg flex items-center justify-center font-bold">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {hotel.hotelName}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {hotel.totalBookings} Completed Bookings
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    ₹{(hotel.grossRevenue || 0).toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs font-semibold text-blue-500">
                    Fee: ₹{(hotel.platformFee || 0).toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            ))}
            {data.hotelRevenue.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                No property data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Platform Scale Widget */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Platform Scale
            </h2>
          </div>
          <div className="flex items-end gap-3 mb-6">
            <div className="text-5xl font-extrabold text-gray-900 dark:text-white">
              {data.stats?.totalLocations || 0}
            </div>
            <div className="mb-1">
              <div className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Active Locations
              </div>
              <div className="text-xs text-gray-500">
                Cities and districts covered
              </div>
            </div>
          </div>
          <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                  <svg
                    className="w-4 h-4"
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
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Listed Rooms
                </span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white text-lg">
                {data.stats?.totalRooms || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* REVENUE LEADERBOARDS TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border-b border-gray-100 dark:border-gray-700 gap-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            Platform Leaderboards
          </h2>

          <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
            <button
              onClick={() => setActiveTable("hotels")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTable === "hotels"
                  ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Hotel
            </button>
            <button
              onClick={() => setActiveTable("vendors")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTable === "vendors"
                  ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Vendor
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-700/50 uppercase border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4">
                  {activeTable === "hotels" ? "Hotel Name" : "Vendor Company"}
                </th>
                <th className="px-6 py-4">Completed Bookings</th>
                <th className="px-6 py-4">Gross Revenue</th>
                <th className="px-6 py-4">Partner Earning (90%)</th>
                <th className="px-6 py-4 text-blue-600 dark:text-blue-400 font-bold">
                  Platform Fee (10%)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
              {(activeTable === "hotels"
                ? data.hotelRevenue
                : data.vendorRevenue
              ).map((item, idx) => (
                <tr
                  key={item._id || idx}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                    {activeTable === "hotels"
                      ? item.hotelName
                      : item.vendorName}
                    {activeTable === "vendors" && (
                      <div className="text-xs font-normal text-gray-500 mt-0.5">
                        {item.contactEmail}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {item.totalBookings} Bookings
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-600 dark:text-gray-300">
                    ₹{(item.grossRevenue || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4 font-medium text-green-600">
                    ₹
                    {activeTable === "hotels"
                      ? (item.hotelEarning || 0).toLocaleString("en-IN")
                      : (item.vendorEarning || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-900/10">
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
                    className="px-6 py-12 text-center text-gray-500"
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
