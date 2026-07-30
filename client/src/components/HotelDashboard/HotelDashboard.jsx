import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api";

import HotelDashboardOverview from "./HotelDashboardOverview";
import ManageRooms from "./ManageRooms";
import Reservations from "./Reservations";

const HotelDashboard = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [hotelInfo, setHotelInfo] = useState(null);
  const [rooms, setRooms] = useState([]);

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

  const SidebarItem = ({ id, label, iconPath }) => (
    <button
      onClick={() => setCurrentView(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${
        currentView === id
          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-bold"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
      }`}
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
          d={iconPath}
        ></path>
      </svg>
      {label}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* DASHBOARD SIDEBAR */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-extrabold text-gray-800 dark:text-white tracking-wide">
            Manager Panel
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Hotel Operations Dashboard
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem
            id="dashboard"
            label="Dashboard"
            iconPath="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
          <SidebarItem
            id="Reservations"
            label="Reservations"
            iconPath="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
          <SidebarItem
            id="rooms"
            label="Manage Rooms"
            iconPath="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </nav>
      </aside>

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* MOBILE VIEW */}
        <div className="flex md:hidden flex-wrap gap-2 mb-6 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setCurrentView("dashboard")}
            className={`flex-1 py-2 px-1 text-xs font-bold rounded-lg transition-all ${currentView === "dashboard" ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-300"}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentView("Reservations")}
            className={`flex-1 py-2 px-1 text-xs font-bold rounded-lg transition-all ${currentView === "Reservations" ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-300"}`}
          >
            Reservations
          </button>
          <button
            onClick={() => setCurrentView("rooms")}
            className={`flex-1 py-2 px-1 text-xs font-bold rounded-lg transition-all ${currentView === "rooms" ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-300"}`}
          >
            Rooms
          </button>
        </div>

        {/* TOP HOTEL PROFILE BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 rounded-xl flex items-center justify-center text-2xl font-bold shadow-sm">
              {hotelInfo?.name ? hotelInfo.name.charAt(0).toUpperCase() : "H"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                {hotelInfo ? hotelInfo.name : "Loading Hotel Details..."}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm mt-1">
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded font-medium text-xs">
                  {hotelInfo ? hotelInfo.hotelType : "Hotel Dashboard"}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  •{" "}
                  {hotelInfo
                    ? hotelInfo.email
                    : "Manage properties and guest bookings"}
                </span>
              </div>
            </div>
          </div>

          {currentView === "rooms" && (
            <Link
              to="/hotel-dashboard/add-room"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-sm transition-all flex items-center gap-2"
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

        {currentView === "dashboard" && (
          <HotelDashboardOverview hotelInfo={hotelInfo} rooms={rooms} />
        )}

        {currentView === "Reservations" &&
          (hotelInfo ? (
            <Reservations hotelId={hotelInfo._id} />
          ) : (
            <div className="text-center py-12 text-gray-500">
              Loading hotel reservations...
            </div>
          ))}

        {currentView === "rooms" && <ManageRooms />}
      </main>
    </div>
  );
};

export default HotelDashboard;
