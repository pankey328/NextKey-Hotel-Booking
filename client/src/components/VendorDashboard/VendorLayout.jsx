import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import api from "../../api";

const VendorLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

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

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
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

        {/* BOTTOM LINKS */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer"
          >
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to NextKey
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer"
          >
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
              />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <Outlet context={{ myHotels }} />
      </main>
    </div>
  );
};

export default VendorLayout;
