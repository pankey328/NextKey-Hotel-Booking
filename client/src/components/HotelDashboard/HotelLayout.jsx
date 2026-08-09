import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import api from "../../api";

const HotelLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [hotelInfo, setHotelInfo] = useState(null);
  const [rooms, setRooms] = useState([]);
  
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const res = await api.get(`/rooms/my-rooms?isDeleted=false`, config);
        setRooms(res.data.data || []);
        if (res.data.hotelInfo) {
          setHotelInfo(res.data.hotelInfo);
        }
      } catch (error) {
        console.error("Error fetching hotel data", error);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const isDashboard = location.pathname === "/hotel-dashboard";
  const isReservations = location.pathname.includes("/reservations");
  const isRooms = location.pathname.includes("/rooms");

  const SidebarItem = ({ to, label, iconPath, activeCondition }) => (
    <Link
      to={to}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-[13px] uppercase tracking-wide transition-all duration-300 cursor-pointer ${
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
            <span className="font-medium text-gray-400 italic">Partner</span>
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
              fetchpriority="high"
              className="w-9 h-9 object-contain drop-shadow-sm"
            />
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-none">
                NextKey{" "}
                <span className="font-medium text-gray-400 italic">
                  Partner
                </span>
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-0.5">
                Manager Panel
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-full transition-colors"
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
            to="/hotel-dashboard"
            label="Dashboard"
            activeCondition={isDashboard}
            iconPath="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
          <SidebarItem
            to="/hotel-dashboard/reservations"
            label="Reservations"
            activeCondition={isReservations}
            iconPath="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
          <SidebarItem
            to="/hotel-dashboard/rooms"
            label="Manage Rooms"
            activeCondition={isRooms}
            iconPath="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </nav>

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
            Exit Dashboard
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

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* TOP HOTEL PROFILE HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-gray-100 dark:bg-gray-800/50 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 bg-gray-900 text-white dark:bg-gray-800 dark:text-gray-100 rounded-xl flex items-center justify-center text-3xl font-extrabold shadow-sm shrink-0">
              {hotelInfo?.name ? hotelInfo.name.charAt(0).toUpperCase() : "H"}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {hotelInfo ? hotelInfo.name : "Loading Hotel Details..."}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm mt-1">
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md font-bold uppercase tracking-wider text-[10px]">
                  {hotelInfo ? hotelInfo.hotelType : "Hotel Dashboard"}
                </span>
                <span className="text-gray-500 font-medium text-[13px] hidden sm:inline">
                  {hotelInfo
                    ? hotelInfo.email
                    : "Manage properties and bookings"}
                </span>
              </div>
            </div>
          </div>

          {isRooms && (
            <Link
              to="/hotel-dashboard/add-room"
              className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-xl font-bold text-[13px] uppercase tracking-wide shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 relative z-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add New Room
            </Link>
          )}
        </div>

        <Outlet context={{ hotelInfo, rooms }} />
      </main>
    </div>
  );
};

export default HotelLayout;