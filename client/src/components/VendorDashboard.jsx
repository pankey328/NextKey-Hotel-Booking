import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState("active"); 
  const [myHotels, setMyHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);

  const token = localStorage.getItem("token");

  const fetchMyHotels = async () => {
    setLoading(true);
    try {
      const isDeleted = activeTab === "inactive";
      const res = await api.get(`/hotels?isDeleted=${isDeleted}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMyHotels(res.data.data || res.data);
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
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Vendor Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your properties and check approval statuses.
            </p>
          </div>
          <Link
            to="/admin-dashboard/add-hotel"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-md transition-all active:scale-95"
          >
            + Add New Property
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 sm:gap-6 border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto whitespace-nowrap text-sm sm:text-base">
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-3 px-1 font-medium transition-all duration-200 border-b-2 cursor-pointer ${
              activeTab === "active"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            Active Properties
          </button>
          <button
            onClick={() => setActiveTab("inactive")}
            className={`pb-3 px-1 font-medium transition-all duration-200 border-b-2 cursor-pointer ${
              activeTab === "inactive"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            Inactive / Deleted Bin
          </button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Property Name
                  </th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-right">
                    Status & Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" className="py-12 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : myHotels.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-12 text-center text-gray-500">
                      No {activeTab} properties found.
                    </td>
                  </tr>
                ) : (
                  myHotels.map((hotel) => (
                    <tr
                      key={hotel._id}
                      className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-800 dark:text-white">
                          {hotel.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {hotel.hotelType} • {hotel.starRating} Stars
                        </div>
                      </td>

                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                        {hotel.cityId?.name}, {hotel.stateId?.name}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block ${
                              hotel.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : hotel.status === "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {hotel.status}
                          </span>

                          {/* Rejection remark if applicable */}
                          {hotel.status === "rejected" &&
                            activeTab === "active" && (
                              <div
                                className="text-xs text-red-500 max-w-xs text-right truncate"
                                title={hotel.rejectRemark}
                              >
                                Reason: {hotel.rejectRemark}
                              </div>
                            )}

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2 justify-end mt-1">
                            <button
                              onClick={() => handleView(hotel)}
                              className="text-xs px-3 py-1.5 rounded-md font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                              View
                            </button>

                            {activeTab === "active" ? (
                              <>
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
                                  className="text-xs px-3 py-1.5 rounded-md font-medium bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 transition-colors"
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
                                  className="text-xs px-3 py-1.5 rounded-md font-medium bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 transition-colors"
                                >
                                  Restore
                                </button>
                                <button
                                  onClick={() =>
                                    handleAction("hardDelete", hotel._id)
                                  }
                                  className="text-xs px-3 py-1.5 rounded-md font-medium bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 transition-colors"
                                >
                                  Hard Delete
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

      {/* VIEW MODAL */}
      {showViewModal && selectedHotel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Property Details
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="px-6 py-5 flex flex-col md:flex-row gap-6 max-h-[70vh] overflow-y-auto">
              {/* Image */}
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

              {/* Details */}
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
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 block mb-1">Description:</span>{" "}
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
