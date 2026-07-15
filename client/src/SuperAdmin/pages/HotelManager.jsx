import React, { useState, useEffect } from "react";
import api from "../../api";

const HotelManager = () => {
  const [activeTab, setActiveTab] = useState("pending"); // 'pending', 'approved', 'rejected', 'bin'

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectRemark, setRejectRemark] = useState("");

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const url =
        activeTab === "bin"
          ? `/hotels?isDeleted=true`
          : `/hotels?isDeleted=false&status=${activeTab}`;

      const res = await api.get(url);
      setHotels(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [activeTab]);

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this hotel and generate credentials?")) return;
    try {
      await api.put(`/hotels/approve/${id}`);
      fetchHotels();
    } catch (error) {
      alert(error.response?.data?.message || "Error approving hotel.");
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectRemark.trim()) return alert("Rejection remark is required.");
    try {
      await api.put(`/hotels/reject/${selectedHotel._id}`, {
        remark: rejectRemark,
      });
      setShowRejectModal(false);
      setRejectRemark("");
      setSelectedHotel(null);
      fetchHotels();
    } catch (error) {
      alert(error.response?.data?.message || "Error rejecting hotel.");
    }
  };

  const handleAction = async (action, id) => {
    try {
      if (action === "softDelete") {
        await api.patch(`/hotels/${id}/soft-delete`);
      } 
      else if (action === "restore") {
        await api.patch(`/hotels/${id}/restore`);
      } 
      else if (action === "hardDelete") {
        const confirmDelete = window.confirm(
          "Are you sure? This cannot be undone.",
        );
        if (!confirmDelete) return;

        await api.delete(`/hotels/${id}`);
      }

      fetchHotels();
    } catch (error) {
      alert(error.response?.data?.message || `Error performing ${action}`);
    }
  };

  const openRejectModal = (hotel) => {
    setSelectedHotel(hotel);
    setShowRejectModal(true);
  };

  const handleView = (hotel) => {
    setSelectedHotel(hotel);
    setShowViewModal(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Hotel Partner Approvals
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Review and manage vendor registrations.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 sm:gap-6 border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto whitespace-nowrap text-sm sm:text-base">
        {["pending", "approved", "rejected", "bin"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 font-medium transition-all duration-200 border-b-2 cursor-pointer capitalize ${
              activeTab === tab
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            {tab === "bin" ? "Deleted Bin" : `${tab} Requests`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700/60">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <th className="py-3 px-4 text-xs sm:text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 font-semibold">
                Hotel Info
              </th>
              <th className="py-3 px-4 text-xs sm:text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 font-semibold">
                Location
              </th>
              <th className="py-3 px-4 text-xs sm:text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 font-semibold">
                Contact
              </th>
              <th className="py-3 px-4 text-xs sm:text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 font-semibold text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="py-12 text-center text-gray-500">
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </div>
                </td>
              </tr>
            ) : hotels.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-12 text-center text-gray-500">
                  No {activeTab} hotels found.
                </td>
              </tr>
            ) : (
              hotels.map((hotel) => (
                <tr
                  key={hotel._id}
                  className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-800 dark:text-gray-200">
                      {hotel.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {hotel.hotelType} • {hotel.starRating} Stars
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {hotel.cityId?.name.toUpperCase()},{" "}
                    {hotel.stateId?.name.toUpperCase()}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>{hotel.email}</div>
                    <div className="text-xs">{hotel.phone}</div>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => handleView(hotel)}
                      className="inline-block px-3 py-1.5 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-all cursor-pointer active:scale-95"
                    >
                      View
                    </button>

                    {/* Pending actions */}
                    {activeTab === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(hotel._id)}
                          className="inline-block px-3 py-1.5 rounded-md text-sm font-medium text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30 transition-all cursor-pointer active:scale-95"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openRejectModal(hotel)}
                          className="inline-block px-3 py-1.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-all cursor-pointer active:scale-95"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {/* (Soft Delete, Restore, Hard Delete) */}
                    {activeTab !== "bin" ? (
                      <>
                        <button
                          onClick={() => handleAction("softDelete", hotel._id)}
                          className="inline-block px-3 py-1.5 rounded-md text-sm font-medium text-orange-500 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/30 transition-all cursor-pointer active:scale-95"
                        >
                          Soft Delete
                        </button>
                        <button
                          onClick={() => handleAction("hardDelete", hotel._id)}
                          className="inline-block px-3 py-1.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-all cursor-pointer active:scale-95"
                        >
                          Hard Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleAction("restore", hotel._id)}
                          className="inline-block px-3 py-1.5 rounded-md text-sm font-medium text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30 transition-all cursor-pointer active:scale-95"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handleAction("hardDelete", hotel._id)}
                          className="inline-block px-3 py-1.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-all cursor-pointer active:scale-95"
                        >
                          Hard Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
                Hotel Profile
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
                <img
                  src={selectedHotel.imageUrl}
                  alt={selectedHotel.name}
                  className="w-full h-64 object-cover rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
                />
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
                <div className="pt-2">
                  <span className="text-gray-500 block mb-1">Description:</span>{" "}
                  <p className="text-gray-700 dark:text-gray-300 italic">
                    "{selectedHotel.description}"
                  </p>
                </div>
                {selectedHotel.status === "rejected" && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <strong>Rejection Reason:</strong>{" "}
                    {selectedHotel.rejectRemark}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && selectedHotel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 transition-opacity">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Reject Hotel Application
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Please provide a reason for rejecting{" "}
              <strong>{selectedHotel.name}</strong>. This will be emailed to the
              vendor.
            </p>
            <form onSubmit={handleRejectSubmit}>
              <textarea
                rows="4"
                required
                value={rejectRemark}
                onChange={(e) => setRejectRemark(e.target.value)}
                placeholder="E.g., Incomplete documentation, poor image quality..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 mb-4"
              ></textarea>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all active:scale-95 cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelManager;
