import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api";

import VendorDashboardOverview from "./VendorDashboardOverview";
import Reservations from "../HotelDashboard/Reservations";
import HotelDashboardOverview from "../HotelDashboard/HotelDashboardOverview";
import useDebounce from "../../hooks/useDebounce";

const SpecificHotelOverview = ({ hotelId, myHotels }) => {
  const [rooms, setRooms] = useState([]);
  const hotelInfo = myHotels.find((h) => h._id === hotelId);

  useEffect(() => {
    if (!hotelId) return;
    api
      .get(`/search/hotels/${hotelId}/rooms`)
      .then((res) => setRooms(res.data.data || []))
      .catch((err) => console.error(err));
  }, [hotelId]);

  if (!hotelInfo)
    return <div className="p-8 text-gray-500">Hotel not found...</div>;

  return (
    <div className="animate-fade-in">
      <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          {hotelInfo.name}{" "}
          <span className="text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            Property Overview
          </span>
        </h2>
      </div>
      <HotelDashboardOverview hotelInfo={hotelInfo} rooms={rooms} />
    </div>
  );
};

const VendorDashboard = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedHotelId, setSelectedHotelId] = useState("");

  const [activeTab, setActiveTab] = useState("active");
  const [myHotels, setMyHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const debouncedSearch = useDebounce(searchInput, 1000);

  useEffect(() => {
    setSearchInput("");
  }, [activeTab]);

  const fetchMyHotels = async () => {
    setLoading(true);
    try {
      const isDeleted = activeTab === "inactive";

      let url = `/hotels?isDeleted=${isDeleted}`;
      if (debouncedSearch) {
        url += `&search=${debouncedSearch}`;
      }

      const res = await api.get(url, config);

      const fetchedHotels = res.data.data || [];
      setMyHotels(fetchedHotels);

      if (fetchedHotels.length > 0 && !selectedHotelId && !debouncedSearch) {
        const firstApprovedHotel = fetchedHotels.find(
          (h) => h.status === "approved",
        );
        if (firstApprovedHotel) {
          setSelectedHotelId(firstApprovedHotel._id);
        }
      }
    } catch (error) {
      console.error("Error fetching hotels", error);
      setMyHotels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyHotels();
  }, [activeTab, debouncedSearch]);

  const handleAction = async (action, id) => {
    try {
      if (action === "softDelete") {
        if (!window.confirm("Move this property to the inactive bin?")) return;
        await api.patch(`/hotels/${id}/soft-delete`, {}, config);
      } else if (action === "restore") {
        await api.patch(`/hotels/${id}/restore`, {}, config);
      } else if (action === "hardDelete") {
        if (
          !window.confirm(
            "Are you sure? This will permanently delete the property.",
          )
        )
          return;
        await api.delete(`/hotels/${id}`, config);
      }
      fetchMyHotels();
    } catch (error) {
      alert(error.response?.data?.message || `Error performing ${action}`);
    }
  };

  const handleView = (hotel) => {
    setSelectedHotel(hotel);
    setShowViewModal(true);
  };

  const jumpToHotelOverview = (hotelId) => {
    setSelectedHotelId(hotelId);
    setCurrentView("hotel-overview");
  };

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
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-extrabold text-gray-800 dark:text-white tracking-wide">
            Vendor Portal
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Business Administration
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem
            id="dashboard"
            label="Master Dashboard"
            iconPath="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
          <SidebarItem
            id="properties"
            label="Manage Properties"
            iconPath="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
          <SidebarItem
            id="hotel-overview"
            label="Property Dashboard"
            iconPath="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
          <SidebarItem
            id="Reservations"
            label="Hotel Bookings"
            iconPath="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <div className="flex md:hidden flex-wrap gap-2 mb-6 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setCurrentView("dashboard")}
            className={`flex-1 py-2 px-1 text-xs font-bold rounded-lg transition-all ${currentView === "dashboard" ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-300"}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentView("properties")}
            className={`flex-1 py-2 px-1 text-xs font-bold rounded-lg transition-all ${currentView === "properties" ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-300"}`}
          >
            Properties
          </button>
          <button
            onClick={() => setCurrentView("hotel-overview")}
            className={`flex-1 py-2 px-1 text-xs font-bold rounded-lg transition-all ${currentView === "hotel-overview" ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-300"}`}
          >
            Overview
          </button>
          <button
            onClick={() => setCurrentView("Reservations")}
            className={`flex-1 py-2 px-1 text-xs font-bold rounded-lg transition-all ${currentView === "Reservations" ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-300"}`}
          >
            Bookings
          </button>
        </div>

        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {currentView === "dashboard"
                ? "Portfolio Overview"
                : currentView === "properties"
                  ? "Manage Properties"
                  : currentView === "hotel-overview"
                    ? "Hotel Overview"
                    : "Hotel Bookings"}
            </h1>
          </div>

          {currentView === "properties" ? (
            <Link
              to="/admin-dashboard/add-hotel"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-md transition-all active:scale-95"
            >
              + Add New Property
            </Link>
          ) : ["Reservations", "hotel-overview"].includes(currentView) &&
            myHotels.some((h) => h.status === "approved") ? (
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                Select Hotel:
              </label>
              <select
                value={selectedHotelId}
                onChange={(e) => setSelectedHotelId(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none cursor-pointer shadow-sm focus:ring-2 focus:ring-blue-500"
              >
                {myHotels
                  .filter((h) => h.status === "approved")
                  .map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name}
                    </option>
                  ))}
              </select>
            </div>
          ) : null}
        </div>

        {/* VENDOR DASHBOARD OVERVIEW */}
        {currentView === "dashboard" && (
          <VendorDashboardOverview
            myHotels={myHotels}
            jumpToHotelOverview={jumpToHotelOverview}
          />
        )}

        {/* SPECIFIC HOTEL OVERVIEW */}
        {currentView === "hotel-overview" &&
          (selectedHotelId ? (
            <SpecificHotelOverview
              hotelId={selectedHotelId}
              myHotels={myHotels}
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center text-gray-500 border border-gray-100 dark:border-gray-700">
              Please select a property from the dropdown above to view its
              dashboard.
            </div>
          ))}

        {/* SPECIFIC HOTEL RESERVATIONS */}
        {currentView === "Reservations" &&
          (selectedHotelId ? (
            <Reservations hotelId={selectedHotelId} />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center text-gray-500 border border-gray-100 dark:border-gray-700">
              Please select a property from the dropdown above to manage
              bookings.
            </div>
          ))}

        {/* PROPERTIES LIST */}
        {currentView === "properties" && (
          <div>
            {/* TABS & SEARCH ROW */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-200 dark:border-gray-700 mb-6 pb-2 sm:pb-0">
              {/* TABS (LEFT) */}
              <div className="flex gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap text-sm sm:text-base w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab("active")}
                  className={`pb-3 px-1 font-medium transition-all duration-200 border-b-2 cursor-pointer ${
                    activeTab === "active"
                      ? "border-blue-600 text-blue-600 dark:text-blue-400 font-bold"
                      : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
                  }`}
                >
                  Active Properties
                </button>
                <button
                  onClick={() => setActiveTab("inactive")}
                  className={`pb-3 px-1 font-medium transition-all duration-200 border-b-2 cursor-pointer ${
                    activeTab === "inactive"
                      ? "border-blue-600 text-blue-600 dark:text-blue-400 font-bold"
                      : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
                  }`}
                >
                  Inactive / Deleted Bin
                </button>
              </div>

              {/* SEARCH INPUT (RIGHT) */}
              <div className="w-full sm:w-80 mb-2 px-2 sm:px-0">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search property or type..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                  {/* Loading spinner */}
                  {searchInput !== debouncedSearch && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                      <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Property Name
                      </th>
                      <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                        Status & Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-sm">
                    {loading ? (
                      <tr>
                        <td colSpan="3" className="py-16 text-center">
                          {/* LOADER  */}
                          <div className="flex flex-col items-center justify-center">
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                                style={{ animationDelay: "-0.3s" }}
                              ></div>
                              <div
                                className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                                style={{ animationDelay: "-0.15s" }}
                              ></div>
                              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm font-medium">
                              Loading properties...
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : myHotels.length === 0 ? (
                      <tr>
                        <td
                          colSpan="3"
                          className="py-12 text-center text-gray-500"
                        >
                          {debouncedSearch
                            ? `No properties found matching "${debouncedSearch}".`
                            : `No ${activeTab} properties found.`}
                        </td>
                      </tr>
                    ) : (
                      myHotels.map((hotel) => (
                        <tr
                          key={hotel._id}
                          className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="font-bold text-gray-800 dark:text-white">
                              {hotel.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {hotel.hotelType} • {hotel.starRating}★
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                            {hotel.cityId?.name}, {hotel.stateId?.name}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex flex-col items-end gap-2">
                              <span
                                className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
                                  hotel.status === "approved"
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : hotel.status === "rejected"
                                      ? "bg-red-100 text-red-800 border-red-200"
                                      : "bg-yellow-100 text-yellow-800 border-yellow-200"
                                }`}
                              >
                                {hotel.status}
                              </span>

                              {hotel.status === "rejected" &&
                                activeTab === "active" && (
                                  <div
                                    className="text-xs text-red-500 max-w-xs text-right truncate"
                                    title={hotel.rejectRemark}
                                  >
                                    Reason: {hotel.rejectRemark}
                                  </div>
                                )}

                              <div className="flex flex-wrap gap-2 justify-end mt-1">
                                <button
                                  onClick={() => handleView(hotel)}
                                  className="text-xs px-3 py-1.5 rounded-md font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                                >
                                  View
                                </button>

                                {activeTab === "active" ? (
                                  <>
                                    {hotel.status === "approved" && (
                                      <>
                                        <button
                                          onClick={() =>
                                            jumpToHotelOverview(hotel._id)
                                          }
                                          className="text-xs px-3 py-1.5 rounded-md font-medium bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 transition-colors cursor-pointer"
                                        >
                                          Manage Dashboard
                                        </button>
                                        <Link
                                          to={`/admin-dashboard/add-room/${hotel._id}`}
                                          className="text-xs px-3 py-1.5 rounded-md font-medium bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 transition-colors"
                                        >
                                          + Add Room
                                        </Link>
                                        <Link
                                          to={`/admin-dashboard/coupons/${hotel._id}`}
                                          className="text-xs px-3 py-1.5 rounded-md font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 transition-colors"
                                        >
                                          Coupons
                                        </Link>
                                      </>
                                    )}
                                    {(hotel.status === "pending" ||
                                      hotel.status === "rejected") && (
                                      <Link
                                        to={`/admin-dashboard/edit-hotel/${hotel.trackingId}`}
                                        className="text-xs px-3 py-1.5 rounded-md font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 transition-colors"
                                      >
                                        Edit
                                      </Link>
                                    )}
                                    <button
                                      onClick={() =>
                                        handleAction("softDelete", hotel._id)
                                      }
                                      className="text-xs px-3 py-1.5 rounded-md font-medium bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 transition-colors cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleAction("restore", hotel._id)
                                      }
                                      className="text-xs px-3 py-1.5 rounded-md font-medium bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 transition-colors cursor-pointer"
                                    >
                                      Restore
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleAction("hardDelete", hotel._id)
                                      }
                                      className="text-xs px-3 py-1.5 rounded-md font-medium bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 transition-colors cursor-pointer"
                                    >
                                      Permanent Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* VIEW MODAL */}
      {showViewModal && selectedHotel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Property Details
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl cursor-pointer"
              >
                &times;
              </button>
            </div>
            <div className="px-6 py-5 flex flex-col md:flex-row gap-6 max-h-[70vh] overflow-y-auto">
              <div className="w-full md:w-1/2">
                {selectedHotel.imageUrl ? (
                  <img
                    src={selectedHotel.imageUrl}
                    alt={selectedHotel.name}
                    className="w-full h-64 object-cover rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="w-full md:w-1/2 space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>{" "}
                  <span className="font-semibold dark:text-white">
                    {selectedHotel.name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Type:</span>{" "}
                  <span className="font-medium dark:text-white">
                    {selectedHotel.hotelType} ({selectedHotel.starRating}★)
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>{" "}
                  <span className="dark:text-white">{selectedHotel.email}</span>
                </div>
                <div>
                  <span className="text-gray-500">Phone:</span>{" "}
                  <span className="dark:text-white">{selectedHotel.phone}</span>
                </div>
                <div>
                  <span className="text-gray-500">Location:</span>{" "}
                  <span className="dark:text-white">
                    {selectedHotel.cityId?.name},{" "}
                    {selectedHotel.districtId?.name},{" "}
                    {selectedHotel.stateId?.name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Address:</span>{" "}
                  <span className="dark:text-white">
                    {selectedHotel.address}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Description:</span>
                  <p className="text-gray-700 dark:text-gray-300 italic">
                    {selectedHotel.description || "No description provided."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
