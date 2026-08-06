import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import api from "../../api";

const VendorLayout = () => {
  const location = useLocation();
  const [myHotels, setMyHotels] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    api
      .get("/hotels?limit=50", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMyHotels(res.data.data || []))
      .catch((err) => console.error(err));
  }, [token]);

  const isActive = (path) => {
    if (path === "/admin-dashboard" && location.pathname === "/admin-dashboard")
      return true;
    if (path !== "/admin-dashboard" && location.pathname.includes(path))
      return true;
    return false;
  };

  const defaultHotelId =
    myHotels.find((h) => h.status === "approved")?._id || "";

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col transition-colors shrink-0">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Vendor Portal
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Business Management
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link
            to="/admin-dashboard"
            className={`block px-4 py-3 rounded-lg transition-colors ${
              isActive("/admin-dashboard")
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Dashboard Overview
          </Link>
          <Link
            to="/admin-dashboard/properties"
            className={`block px-4 py-3 rounded-lg transition-colors ${
              isActive("/properties")
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Manage Properties
          </Link>

          {/* Dynamic Links requiring a Hotel ID */}
          <Link
            to={
              defaultHotelId
                ? `/admin-dashboard/hotel/${defaultHotelId}/overview`
                : "#"
            }
            className={`block px-4 py-3 rounded-lg transition-colors ${
              isActive("/overview")
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Property Overview
          </Link>

          <Link
            to={
              defaultHotelId
                ? `/admin-dashboard/hotel/${defaultHotelId}/reservations`
                : "#"
            }
            className={`block px-4 py-3 rounded-lg transition-colors ${
              isActive("/reservations")
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Hotel Bookings
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <Outlet context={{ myHotels }} />
      </main>
    </div>
  );
};;

export default VendorLayout;
