import React, { useState, useEffect } from "react";
import api from "../../api";

const StateManager = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [states, setStates] = useState([]);
  const [newStateName, setNewStateName] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedState, setSelectedState] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const fetchStates = async () => {
    setLoading(true);
    try {
      const isDeleted = activeTab === "inactive";
      const res = await api.get(`/states?isDeleted=${isDeleted}`);

      setStates(res.data.data);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to fetch states.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStates();
  }, [activeTab]);

  const handleAddState = async (e) => {
    e.preventDefault();
    if (!newStateName.trim()) {
      return alert("State name is required.");
    }
    try {
      await api.post("/states", { name: newStateName });
      setNewStateName("");
      fetchStates();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create state.");
    }
  };

  const handleAction = async (action, id) => {
    try {
      if (action === "softDelete") {
        await api.patch(`/states/${id}/soft-delete`);
      }

      if (action === "restore") {
        await api.patch(`/states/${id}/restore`);
      }

      if (action === "hardDelete") {
        const confirmDelete = window.confirm(
          "Are you sure you want to permanently delete this state?",
        );

        if (!confirmDelete) return;

        await api.delete(`/states/${id}`);
      }

      fetchStates();
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong.");
    }
  };

  const handleView = (state) => {
    setSelectedState(state);
    setShowViewModal(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 transition-colors duration-300">
      <div className="flex flex-col mb-8">
        <div className="w-full max-w-3xl">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            State Management
          </h1>

          <form
            onSubmit={handleAddState}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              placeholder="Enter new state name..."
              value={newStateName}
              onChange={(e) => setNewStateName(e.target.value)}
              className="w-full sm:flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm sm:text-base"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-95 text-white font-medium rounded-lg transition-all duration-200 cursor-pointer shadow-sm hover:shadow text-sm sm:text-base whitespace-nowrap"
            >
              + Add State
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
          Active States
        </button>

        <button
          onClick={() => setActiveTab("inactive")}
          className={`pb-3 px-1 font-medium transition-all duration-200 border-b-2 cursor-pointer ${
            activeTab === "inactive"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 dark:text-gray-400"
          }`}
        >
          Inactive States
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700/60">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <th className="py-3 px-3 sm:px-4 text-xs sm:text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 font-semibold">
                State Name
              </th>
              <th className="py-3 px-3 sm:px-4 text-xs sm:text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 font-semibold text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} className="py-12 text-center text-gray-500">
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </div>
                </td>
              </tr>
            ) : states.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm sm:text-base"
                >
                  No {activeTab} states found.
                </td>
              </tr>
            ) : (
              states.map((state) => (
                <tr
                  key={state._id}
                  className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="py-3 sm:py-4 px-3 sm:px-4 text-gray-800 dark:text-gray-200 font-medium text-sm sm:text-base">
                    {state.name.toUpperCase()}
                  </td>

                  <td className="py-3 sm:py-4 px-3 sm:px-4 text-right space-x-1 sm:space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => handleView(state)}
                      className="inline-block px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-all cursor-pointer active:scale-95"
                    >
                      View
                    </button>

                    {activeTab === "active" ? (
                      <>
                        <button
                          onClick={() => handleAction("softDelete", state._id)}
                          className="inline-block px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium text-orange-500 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/30 transition-all cursor-pointer active:scale-95"
                        >
                          Soft Delete
                        </button>
                        <button
                          onClick={() => handleAction("hardDelete", state._id)}
                          className="inline-block px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-all cursor-pointer active:scale-95"
                        >
                          Hard Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleAction("restore", state._id)}
                          className="inline-block px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30 transition-all cursor-pointer active:scale-95"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handleAction("hardDelete", state._id)}
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

      {/* MODAL */}
      {showViewModal && selectedState && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all scale-100 opacity-100">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                State Details
              </h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedState(null);
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
                <span className="font-semibold text-gray-900 dark:text-white text-lg">
                  {selectedState.name.toUpperCase()}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Status
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    selectedState.isDeleted
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  }`}
                >
                  {selectedState.isDeleted ? "Inactive" : "Active"}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Created On
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {new Date(selectedState.createdAt).toLocaleDateString(
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
                  setSelectedState(null);
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

export default StateManager;
