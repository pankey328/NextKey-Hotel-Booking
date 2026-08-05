import React, { useState, useEffect } from "react";
import api from "../../api";
import useDebounce from "../../hooks/useDebounce";

const CityManager = () => {
  const [activeTab, setActiveTab] = useState("active");

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);

  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [newCityName, setNewCityName] = useState("");

  const [loading, setLoading] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 1000);
  const [sortBy, setSortBy] = useState("newest");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedCity, setSelectedCity] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortBy, limit]);

  const fetchStates = async () => {
    try {
      const res = await api.get("/states?isDeleted=false");
      setStates(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchDistrictsByState = async (stateId) => {
    try {
      const res = await api.get(
        `/districts?stateId=${stateId}&isDeleted=false`,
      );
      setDistricts(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCities = async (
    stateId = selectedStateId,
    districtId = selectedDistrictId,
  ) => {
    try {
      setLoading(true);
      const isDeleted = activeTab === "inactive";
      let url = `/cities?isDeleted=${isDeleted}&page=${page}&limit=${limit}`;

      if (districtId) url += `&districtId=${districtId}`;
      if (stateId) url += `&stateId=${stateId}`;
      if (debouncedSearch) url += `&search=${debouncedSearch}`;
      if (sortBy) url += `&sortBy=${sortBy}`;

      const res = await api.get(url);
      setCities(res.data.data || []);

      const newTotalPages = res.data.totalPages || 1;
      setTotalPages(newTotalPages);

      // Auto-navigate to the previous page if we delete the last item on the current page
      if (page > newTotalPages && page > 1) {
        setPage(newTotalPages);
      }
    } catch (error) {
      console.log(error);
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  useEffect(() => {
    fetchCities();
  }, [
    activeTab,
    debouncedSearch,
    sortBy,
    page,
    limit,
    selectedStateId,
    selectedDistrictId,
  ]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchInput("");
    setSortBy("newest");
    setPage(1);
  };

  const handleStateChange = (e) => {
    const stateId = e.target.value;
    setSelectedStateId(stateId);
    setSelectedDistrictId("");
    fetchDistrictsByState(stateId);

    setSearchInput("");
    setSortBy("newest");
    setPage(1);
  };

  const handleDistrictChange = (e) => {
    const districtId = e.target.value;
    setSelectedDistrictId(districtId);

    setSearchInput("");
    setSortBy("newest");
    setPage(1);
  };

  const handleAddCity = async (e) => {
    e.preventDefault();

    if (!newCityName.trim() || !selectedDistrictId || !selectedStateId) {
      alert("Please select state, district and enter city name.");
      return;
    }

    try {
      await api.post("/cities", {
        name: newCityName,
        districtId: selectedDistrictId,
        stateId: selectedStateId,
      });

      setNewCityName("");
      fetchCities(selectedStateId, selectedDistrictId);
    } catch (error) {
      alert(error.response?.data?.message || "Error adding city");
    }
  };

  const handleAction = async (action, id) => {
    try {
      if (action === "softDelete") {
        await api.patch(`/cities/${id}/soft-delete`);
      } else if (action === "restore") {
        await api.patch(`/cities/${id}/restore`);
      } else if (action === "hardDelete") {
        const confirmDelete = window.confirm(
          "Are you sure? This cannot be undone.",
        );

        if (!confirmDelete) return;

        await api.delete(`/cities/${id}`);
      }

      fetchCities(selectedStateId, selectedDistrictId);
    } catch (error) {
      alert(error.response?.data?.message || `Error performing ${action}`);
    }
  };

  const handleView = (city) => {
    setSelectedCity(city);
    setShowViewModal(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 transition-colors duration-300 flex flex-col h-full">
      {/* Form */}
      <div className="flex flex-col mb-8">
        <div className="w-full">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            City Management
          </h1>
          <form
            onSubmit={handleAddCity}
            className="flex flex-col md:flex-row gap-3 w-full max-w-5xl"
          >
            {/* Select State */}
            <select
              value={selectedStateId}
              onChange={handleStateChange}
              className="w-full md:flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer text-sm sm:text-base"
              required
            >
              <option value="">Select State...</option>
              {states.map((state) => (
                <option key={state._id} value={state._id}>
                  {state.name.toUpperCase()}
                </option>
              ))}
            </select>

            {/* Select District */}
            <select
              value={selectedDistrictId}
              onChange={handleDistrictChange}
              className="w-full md:flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors cursor-pointer text-sm sm:text-base"
              required
              disabled={!selectedStateId || districts.length === 0}
            >
              <option value="">Select District...</option>
              {districts.map((district) => (
                <option key={district._id} value={district._id}>
                  {district.name.toUpperCase()}
                </option>
              ))}
            </select>

            {/* Name City */}
            <input
              type="text"
              placeholder="Enter city name..."
              value={newCityName}
              onChange={(e) => setNewCityName(e.target.value)}
              className="w-full md:flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm sm:text-base"
              required
              disabled={!selectedStateId || !selectedDistrictId}
            />

            <button
              type="submit"
              className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-95 text-white font-medium rounded-lg transition-all duration-200 cursor-pointer shadow-sm hover:shadow whitespace-nowrap text-sm sm:text-base"
            >
              + Add City
            </button>
          </form>
        </div>
      </div>

      {/* TABS & CONTROLS ROW */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 border-b border-gray-200 dark:border-gray-700 mb-6 pb-2 lg:pb-0">
        {/* TABS (LEFT) */}
        <div className="flex gap-4 sm:gap-6 text-sm sm:text-base w-full lg:w-auto overflow-x-auto whitespace-nowrap border-b-0">
          <button
            onClick={() => handleTabChange("active")}
            className={`pb-3 px-1 font-medium transition-all duration-200 border-b-2 cursor-pointer ${
              activeTab === "active"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 font-bold"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 dark:text-gray-400"
            }`}
          >
            Active Cities
          </button>
          <button
            onClick={() => handleTabChange("inactive")}
            className={`pb-3 px-1 font-medium transition-all duration-200 border-b-2 cursor-pointer ${
              activeTab === "inactive"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 font-bold"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 dark:text-gray-400"
            }`}
          >
            Inactive Cities
          </button>
        </div>

        {/* CONTROLS (SORT & SEARCH) - RIGHT */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto mb-2 px-2 sm:px-0">
          {/* SORT DROPDOWN */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
          </select>

          {/* SEARCH INPUT */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search city name..."
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

      {/* Table Container */}
      <div className="overflow-hidden rounded-lg border border-gray-100 dark:border-gray-700/60 flex flex-col flex-1">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <th className="py-3 px-3 sm:px-4 text-xs sm:text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 font-semibold">
                  City Name
                </th>
                <th className="py-3 px-3 sm:px-4 text-xs sm:text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 font-semibold">
                  District
                </th>
                <th className="py-3 px-3 sm:px-4 text-xs sm:text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 font-semibold">
                  State
                </th>
                <th className="py-3 px-3 sm:px-4 text-xs sm:text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-16 text-center">
                    {/* 3 DOTS LOADER */}
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
                        Loading cities...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : cities.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm sm:text-base"
                  >
                    {debouncedSearch
                      ? `No matching cities found for "${debouncedSearch}".`
                      : `No ${activeTab} cities found.`}
                  </td>
                </tr>
              ) : (
                cities.map((city) => (
                  <tr
                    key={city._id}
                    className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="py-3 sm:py-4 px-3 sm:px-4 text-gray-800 dark:text-gray-200 font-medium text-sm sm:text-base">
                      {city.name.toUpperCase()}
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-4 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                      {city.districtId?.name.toUpperCase() || "Unknown"}
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-4 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                      {city.stateId?.name.toUpperCase() || "Unknown"}
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-4 text-right space-x-1 sm:space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleView(city)}
                        className="inline-block px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-all cursor-pointer active:scale-95"
                      >
                        View
                      </button>

                      {activeTab === "active" ? (
                        <>
                          <button
                            onClick={() => handleAction("softDelete", city._id)}
                            className="inline-block px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium text-orange-500 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/30 transition-all cursor-pointer active:scale-95"
                          >
                            Soft Delete
                          </button>
                          <button
                            onClick={() => handleAction("hardDelete", city._id)}
                            className="inline-block px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-all cursor-pointer active:scale-95"
                          >
                            Hard Delete
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleAction("restore", city._id)}
                            className="inline-block px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30 transition-all cursor-pointer active:scale-95"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => handleAction("hardDelete", city._id)}
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

        {/* PAGINATION FOOTER */}
        {!loading && cities.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Rows per page:
              </span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-white outline-none cursor-pointer focus:ring-1 focus:ring-blue-500"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
              </select>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-1.5">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 rounded-md bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer active:scale-95 shadow-sm"
                >
                  Prev
                </button>
                <button
                  disabled={page === totalPages || totalPages === 0}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-md bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer active:scale-95 shadow-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* VIEW MODAL */}
      {showViewModal && selectedCity && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all scale-100 opacity-100">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                City Details
              </h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedCity(null);
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
                  {selectedCity.name.toUpperCase()}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  District
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {selectedCity.districtId?.name.toUpperCase() || "Unknown"}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  State
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {selectedCity.stateId?.name.toUpperCase() || "Unknown"}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Status
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    selectedCity.isDeleted
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  }`}
                >
                  {selectedCity.isDeleted ? "Inactive" : "Active"}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Created On
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {new Date(selectedCity.createdAt).toLocaleDateString(
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
                  setSelectedCity(null);
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

export default CityManager;
