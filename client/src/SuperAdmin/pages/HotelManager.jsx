import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import useDebounce from "../../hooks/useDebounce";

const HotelManager = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pending");

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchInput, setSearchInput] = useState("");

  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectRemark, setRejectRemark] = useState("");

  const token = localStorage.getItem("token");

  const debouncedSearch = useDebounce(searchInput, 1000);

  useEffect(() => {
    setSearchInput("");
  }, [activeTab]);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      let url =
        activeTab === "bin"
          ? `/hotels?isDeleted=true`
          : `/hotels?isDeleted=false&status=${activeTab}`;

      if (debouncedSearch) {
        url += `&search=${debouncedSearch}`;
      }

      const res = await api.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setHotels(res.data.data);
    } catch (error) {
      console.error(error);
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [activeTab, debouncedSearch]);

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this hotel and generate credentials?")) return;
    try {
      await api.put(
        `/hotels/approve/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      fetchHotels();
    } catch (error) {
      alert(error.response?.data?.message || "Error approving hotel.");
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectRemark.trim()) return alert("Rejection remark is required.");
    try {
      await api.put(
        `/hotels/reject/${selectedHotel._id}`,
        {
          remark: rejectRemark,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
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
        await api.patch(
          `/hotels/${id}/soft-delete`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else if (action === "restore") {
        await api.patch(
          `/hotels/${id}/restore`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else if (action === "hardDelete") {
        const confirmDelete = window.confirm(
          "Are you sure? This cannot be undone.",
        );
        if (!confirmDelete) return;

        await api.delete(`/hotels/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Hotel Partner Approvals
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Review and manage vendor registrations.
          </p>
        </div>

        <button
          onClick={() => navigate("/superadmin-dashboard/add-hotel")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
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
          Add Hotel
        </button>
      </div>

      {/* TABS & SEARCH ROW */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-200 dark:border-gray-700 mb-6 pb-2 sm:pb-0">
        {/* TABS (LEFT) */}
        <div className="flex gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap text-sm sm:text-base w-full sm:w-auto">
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

        {/* SEARCH INPUT (RIGHT) */}
        <div className="w-full sm:w-80 mb-2 px-2 sm:px-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Hotel Name, Email, Type..."
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
      <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700/60">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <th className="py-3 px-4 text-xs sm:text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 font-semibold">
                Hotel Info
              </th>
              <th className="py-3 px-4 text-xs sm:text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 font-semibold">
                Vendor
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
                <td colSpan="5" className="py-16 text-center">
                  {/* LOADER */}
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
                      Loading hotels...
                    </p>
                  </div>
                </td>
              </tr>
            ) : hotels.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-gray-500">
                  {debouncedSearch
                    ? `No matching hotels found for "${debouncedSearch}".`
                    : `No ${activeTab === "bin" ? "deleted" : activeTab} hotels found.`}
                </td>
              </tr>
            ) : (
              hotels.map((hotel) => (
                <tr
                  key={hotel._id}
                  className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {/* Hotel Info */}
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-800 dark:text-gray-200">
                      {hotel.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {hotel.hotelType} • {hotel.starRating} Stars
                    </div>
                  </td>

                  {/* VENDOR INFO */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                      {hotel.vendorId?.companyName || "No Company"}
                    </div>
                    <div className="font-medium text-gray-600 dark:text-gray-400 text-xs mt-0.5">
                      {hotel.vendorId?.applicantName || "Unknown Applicant"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                      {hotel.vendorId?.email || "No Email"}
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {hotel.cityId?.name?.toUpperCase()},{" "}
                    {hotel.stateId?.name?.toUpperCase()}
                  </td>

                  {/* Contact */}
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>{hotel.email}</div>
                    <div className="text-xs">{hotel.phone}</div>
                  </td>

                  {/* Actions */}
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
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

                {/* VENDOR DETAILS IN MODAL */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border border-gray-100 dark:border-gray-600">
                  <span className="text-gray-500 text-xs uppercase font-bold tracking-wider block mb-2">
                    Managed By (Vendor)
                  </span>
                  <div className="font-bold text-gray-800 dark:text-white mb-1">
                    🏢{" "}
                    {selectedHotel.vendorId?.companyName ||
                      "No Company Provided"}
                  </div>
                  <div className="font-medium text-gray-700 dark:text-gray-200 text-sm">
                    👤{" "}
                    {selectedHotel.vendorId?.applicantName ||
                      "Unknown Applicant"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    ✉️ {selectedHotel.vendorId?.email || "No Email"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    📞 {selectedHotel.vendorId?.phone || "No Phone"}
                  </div>
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

                {/* Features Section */}
                {selectedHotel.features &&
                  selectedHotel.features.length > 0 && (
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 block mb-2">
                        Features & Amenities:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedHotel.features.map((feature, index) => (
                          <span
                            key={index}
                            className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs border border-blue-100 dark:border-blue-800"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
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
