import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import api from "../../api";

const VendorLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [myHotels, setMyHotels] = useState([]);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    api
      .get("/hotels?limit=50", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMyHotels(res.data.data || []))
      .catch((err) => console.error(err));
  }, [token]);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

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

  const SidebarItem = ({ to, label, iconPath, activeCondition, disabled }) => (
    <Link
      to={to}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-[13px] uppercase tracking-wide transition-all duration-300 ${
        disabled ? "opacity-50 pointer-events-none" : "cursor-pointer"
      } ${
        activeCondition
          ? "bg-gray-900 text-white dark:bg-gray-800 dark:text-white shadow-md"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-white"
      }`}
    >
      <svg
        className="w-5 h-5 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d={iconPath}
        ></path>
      </svg>
      <span className="truncate">{label}</span>
    </Link>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500 font-sans text-gray-900 dark:text-gray-100 relative">
      <div className="md:hidden flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
          >
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            NextKey{" "}
            <span className="font-medium text-gray-400 italic">Vendor</span>
          </h2>
        </div>
      </div>

      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shrink-0 z-50 transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none ${
          isMobileSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex justify-between items-center p-8 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <img
              src="/favicon.svg"
              alt="NextKey Logo"
              fetchPriority="high"
              className="w-9 h-9 object-contain drop-shadow-sm"
            />
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-none">
                NextKey{" "}
                <span className="font-medium text-gray-400 italic">Vendor</span>
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-0.5">
                Business Management
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-full transition-colors cursor-pointer"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="flex-1 p-5 space-y-2 overflow-y-auto hide-scrollbar">
          <SidebarItem
            to="/admin-dashboard"
            label="Dashboard Overview"
            activeCondition={isActive("/admin-dashboard")}
            iconPath="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
          <SidebarItem
            to="/admin-dashboard/properties"
            label="Manage Properties"
            activeCondition={isActive("/properties")}
            iconPath="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />

          <div className="pt-4 pb-2">
            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Primary Hotel Tools
            </p>
          </div>

          {/* Dynamic Links requiring a Hotel ID */}
          <SidebarItem
            to={
              defaultHotelId
                ? `/admin-dashboard/hotel/${defaultHotelId}/overview`
                : "#"
            }
            label="Property Overview"
            activeCondition={isActive("/overview")}
            disabled={!defaultHotelId}
            iconPath="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
          <SidebarItem
            to={
              defaultHotelId
                ? `/admin-dashboard/hotel/${defaultHotelId}/reservations`
                : "#"
            }
            label="Hotel Bookings"
            activeCondition={isActive("/reservations")}
            disabled={!defaultHotelId}
            iconPath="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </nav>

        {/* BOTTOM SIDEBAR LINKS */}
        <div className="p-5 border-t border-gray-200 dark:border-gray-800 space-y-2">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[13px] uppercase tracking-wide text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all cursor-pointer"
          >
            <svg
              className="w-5 h-5 shrink-0"
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
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[13px] uppercase tracking-wide text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all cursor-pointer"
          >
            <svg
              className="w-5 h-5 shrink-0"
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

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <Outlet context={{ myHotels }} />
      </main>
    </div>
  );
};

export default VendorLayout;
