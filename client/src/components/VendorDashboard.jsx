import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import FrontDesk from "./FrontDesk";

const VendorDashboard = () => {
  const [currentView, setCurrentView] = useState("properties");

  const [selectedHotelId, setSelectedHotelId] = useState("");

  const [activeTab, setActiveTab] = useState("active");
  const [myHotels, setMyHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchMyHotels = async () => {
    setLoading(true);
    try {
      const isDeleted = activeTab === "inactive";
      const res = await api.get(`/hotels?isDeleted=${isDeleted}`, config);

      setMyHotels(res.data.data || []);

      if (res.data.data?.length > 0 && !selectedHotelId) {
        setSelectedHotelId(res.data.data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching hotels", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyHotels();
  }, [activeTab]);

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
          <button
            onClick={() => setCurrentView("properties")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${
              currentView === "properties"
                ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-bold"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            }`}
          >
            Manage Properties
          </button>

          <button
            onClick={() => setCurrentView("front-desk")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${
              currentView === "front-desk"
                ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-bold"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            }`}
          >
            Hotel Bookings
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* MOBILE VIEW SWITCH */}
        <div className="flex md:hidden gap-2 mb-6 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setCurrentView("properties")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              currentView === "properties"
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-300"
            }`}
          >
            Properties
          </button>
          <button
            onClick={() => setCurrentView("front-desk")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              currentView === "front-desk"
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-300"
            }`}
          >
            Bookings
          </button>
        </div>

        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {currentView === "properties"
                ? "Manage Properties"
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
          ) : (
            myHotels.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                  Select Hotel:
                </label>
                <select
                  value={selectedHotelId}
                  onChange={(e) => setSelectedHotelId(e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none cursor-pointer"
                >
                  {myHotels.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
            )
          )}
        </div>

        {/* DYNAMIC VIEW ROUTER */}
        {currentView === "front-desk" ? (
          /* FRONT DESK VIEW */
          selectedHotelId ? (
            <FrontDesk hotelId={selectedHotelId} />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center text-gray-500 border border-gray-100 dark:border-gray-700">
              Please register or select an approved property to manage bookings.
            </div>
          )
        ) : (
          /* PROPERTIES MANAGEMENT VIEW */
          <div>
            {/* Tabs */}
            <div className="flex gap-4 sm:gap-6 border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto whitespace-nowrap text-sm sm:text-base">
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
                        <td
                          colSpan="3"
                          className="py-12 text-center text-gray-500"
                        >
                          Loading properties...
                        </td>
                      </tr>
                    ) : myHotels.length === 0 ? (
                      <tr>
                        <td
                          colSpan="3"
                          className="py-12 text-center text-gray-500"
                        >
                          No {activeTab} properties found.
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
