import React, { useState, useEffect } from "react";
import api from "../../api";

const DistrictManager = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [districts, setDistricts] = useState([]);
  const [states, setStates] = useState([]);

  const [selectedStateId, setSelectedStateId] = useState("");
  const [newDistrictName, setNewDistrictName] = useState("");

  const [loading, setLoading] = useState(false);

  // View Modal
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const fetchStates = async () => {
    try {
      const res = await api.get("/states?isDeleted=false");
      setStates(res.data.data);
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  const fetchDistricts = async (stateId = selectedStateId) => {
    try {
      setLoading(true);
      const isDeleted = activeTab === "inactive";
      let url = `/districts?isDeleted=${isDeleted}`;

      if (stateId) {
        url += `&stateId=${stateId}`;
      }

      const res = await api.get(url);
      setDistricts(res.data.data);
    } catch (error) {
      console.error("Error fetching districts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStates();
    fetchDistricts();
  }, [activeTab]);

  // When state changes filter districts
  const handleStateChange = (e) => {
    const stateId = e.target.value;
    setSelectedStateId(stateId);
    fetchDistricts(stateId);
  };

  const handleAddDistrict = async (e) => {
    e.preventDefault();

    if (!newDistrictName.trim() || !selectedStateId) {
      alert("Please select a state and enter a district name.");
      return;
    }

    try {
      await api.post("/districts", {
        name: newDistrictName,
        stateId: selectedStateId,
      });

      setNewDistrictName("");
      fetchDistricts(selectedStateId);
    } catch (error) {
      alert(error.response?.data?.message || "Error adding district");
    }
  };

  const handleAction = async (action, id) => {
    try {
      if (action === "softDelete") {
        await api.patch(`/districts/${id}/soft-delete`);
      } else if (action === "restore") {
        await api.patch(`/districts/${id}/restore`);
      } else if (action === "hardDelete") {
        const confirmDelete = window.confirm(
          "Are you sure? This cannot be undone.",
        );

        if (!confirmDelete) return;

        await api.delete(`/districts/${id}`);
      }

      fetchDistricts(selectedStateId);
    } catch (error) {
      alert(error.response?.data?.message || `Error performing ${action}`);
    }
  };

  const handleView = (district) => {
    setSelectedDistrict(district);
    setShowViewModal(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 transition-colors duration-300">
      <div className="flex flex-col mb-8">
        <div className="w-full max-w-4xl">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            District Management
          </h1>

          <form
            onSubmit={handleAddDistrict}
            className="flex flex-col sm:flex-row gap-3"
          >
            <select
              value={selectedStateId}
              onChange={handleStateChange}
              className="w-full sm:flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer text-sm sm:text-base"
              required
            >
              <option value="" disabled>
                Select State...
              </option>
              {states.map((state) => (
                <option key={state._id} value={state._id}>
                  {state.name.toUpperCase()}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Enter new district name..."
              value={newDistrictName}
              onChange={(e) => setNewDistrictName(e.target.value)}
              className="w-full sm:flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm sm:text-base"
              required
            />

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-95 text-white font-medium rounded-lg transition-all duration-200 cursor-pointer shadow-sm hover:shadow whitespace-nowrap text-sm sm:text-base"
            >
              + Add District
            </button>
          </form>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 sm:gap-6 border-b border-gray-200 dark:border-gray-700 mb-6 text-sm sm:text-base">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-3 px-1 font-medium transition-all duration-200 border-b-2 cursor-pointer ${
            activeTab === "active"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 dark:text-gray-400"
          }`}
        >
          Active Districts
        </button>

        <button
          onClick={() => setActiveTab("inactive")}
          className={`pb-3 px-1 font-medium transition-all duration-200 border-b-2 cursor-pointer ${
            activeTab === "inactive"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 dark:text-gray-400"
          }`}
        >
          Inactive Districts
        </button>
      </div>

      {/* Table Wrapper */}
      <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700/60">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <th className="py-3 px-3 sm:px-4 text-xs sm:text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 font-semibold">
                District Name
              </th>
              <th className="py-3 px-3 sm:px-4 text-xs sm:text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 font-semibold">
                Parent State
              </th>
              <th className="py-3 px-3 sm:px-4 text-xs sm:text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 font-semibold text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="py-12 text-center text-gray-500">
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </div>
                </td>
              </tr>
            ) : districts.length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm sm:text-base"
                >
                  {`No ${activeTab} districts found.`}
                </td>
              </tr>
            ) : (
              districts.map((district) => (
                <tr
                  key={district._id}
                  className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="py-3 sm:py-4 px-3 sm:px-4 text-gray-800 dark:text-gray-200 font-medium text-sm sm:text-base">
                    {district.name.toUpperCase()}
                  </td>

                  <td className="py-3 sm:py-4 px-3 sm:px-4 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    {district.stateId?.name.toUpperCase() || "Unknown"}
                  </td>

                  <td className="py-3 sm:py-4 px-3 sm:px-4 text-right space-x-1 sm:space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => handleView(district)}
                      className="inline-block px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-all cursor-pointer active:scale-95"
                    >
                      View
                    </button>

                    {activeTab === "active" ? (
                      <>
                        <button
                          onClick={() =>
                            handleAction("softDelete", district._id)
                          }
                          className="inline-block px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium text-orange-500 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/30 transition-all cursor-pointer active:scale-95"
                        >
                          Soft Delete
                        </button>

                        <button
                          onClick={() =>
                            handleAction("hardDelete", district._id)
                          }
                          className="inline-block px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-all cursor-pointer active:scale-95"
                        >
                          Hard Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleAction("restore", district._id)}
                          className="inline-block px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30 transition-all cursor-pointer active:scale-95"
                        >
                          Restore
                        </button>

                        <button
                          onClick={() =>
                            handleAction("hardDelete", district._id)
                          }
                          className="inline-block px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-all cursor-pointer active:scale-95"
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

      {/* ENHANCED VIEW MODAL */}
      {showViewModal && selectedDistrict && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all scale-100 opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                District Details
              </h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedDistrict(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4 text-sm sm:text-base">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Name
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedDistrict.name.toUpperCase()}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Parent State
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {selectedDistrict.stateId?.name.toUpperCase() || "Unknown"}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Status
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    selectedDistrict.isDeleted
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  }`}
                >
                  {selectedDistrict.isDeleted ? "Inactive" : "Active"}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Created On
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {new Date(selectedDistrict.createdAt).toLocaleDateString(
                    undefined,
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    },
                  )}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedDistrict(null);
                }}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-medium rounded-lg transition-all duration-200 cursor-pointer shadow-sm hover:shadow w-full sm:w-auto text-center text-sm sm:text-base"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistrictManager;
