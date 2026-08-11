import React, { useState, useEffect } from "react";
import api from "../../api";
import useDebounce from "../../hooks/useDebounce";

const StateManager = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [states, setStates] = useState([]);
  const [newStateName, setNewStateName] = useState("");
  const [loading, setLoading] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 1000);
  const [sortBy, setSortBy] = useState("newest");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedState, setSelectedState] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortBy, limit]);

  const fetchStates = async () => {
    setLoading(true);
    try {
      const isDeleted = activeTab === "inactive";
      let url = `/states?isDeleted=${isDeleted}&page=${page}&limit=${limit}`;

      if (debouncedSearch) {
        url += `&search=${debouncedSearch}`;
      }
      if (sortBy) {
        url += `&sortBy=${sortBy}`;
      }

      const res = await api.get(url);
      setStates(res.data.data || []);

      const newTotalPages = res.data.totalPages || 1;
      setTotalPages(newTotalPages);

      // Auto-navigate to the previous page if we delete the last item on current page
      if (page > newTotalPages && page > 1) {
        setPage(newTotalPages);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to fetch states.");
      setStates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStates();
  }, [activeTab, debouncedSearch, sortBy, page, limit]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchInput("");
    setSortBy("newest");
    setPage(1);
  };

  const handleAddState = async (e) => {
    e.preventDefault();
    if (!newStateName.trim()) {
      return alert("State name is required.");
    }
    try {
      setIsSubmitting(true);
      await api.post("/states", { name: newStateName });
      setNewStateName("");
      fetchStates();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create state.");
    } finally {
      setIsSubmitting(false);
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
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 font-sans h-full flex flex-col">
      {/* HEADER & ADD FORM */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white dark:bg-gray-900 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden shrink-0">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            State Management
          </h1>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-2">
            Configure system operational regions
          </p>
        </div>

        <form
          onSubmit={handleAddState}
          className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto relative z-10"
        >
          <input
            type="text"
            placeholder="Enter new state name..."
            value={newStateName}
            onChange={(e) => setNewStateName(e.target.value)}
            className="w-full sm:w-64 px-4 py-3 text-[13px] font-bold rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none cursor-text shadow-sm focus:border-gray-400 transition-colors placeholder-gray-400 uppercase tracking-wide"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-[12px] font-bold uppercase tracking-wide bg-blue-600 hover:bg-blue-700 text-white transition-all active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M12 4v16m8-8H4"
                  ></path>
                </svg>
                Add State
              </>
            )}
          </button>
        </form>
      </div>

      {/* TABS & CONTROLS ROW */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-5 border-b border-gray-200 dark:border-gray-800 pb-4 xl:pb-0 shrink-0">
        {/* TABS (LEFT) */}
        <div className="flex gap-6 px-2 overflow-x-auto whitespace-nowrap w-full xl:w-auto border-b-0 hide-scrollbar">
          <button
            onClick={() => handleTabChange("active")}
            className={`pb-4 px-1 text-[13px] font-bold uppercase tracking-wide border-b-2 transition-all cursor-pointer ${
              activeTab === "active"
                ? "border-gray-900 text-gray-900 dark:border-white dark:text-white"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            Active States
          </button>
          <button
            onClick={() => handleTabChange("inactive")}
            className={`pb-4 px-1 text-[13px] font-bold uppercase tracking-wide border-b-2 transition-all cursor-pointer ${
              activeTab === "inactive"
                ? "border-gray-900 text-gray-900 dark:border-white dark:text-white"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            Inactive / Deleted
          </button>
        </div>

        {/* CONTROLS (SEARCH & SORT) - RIGHT */}
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto mb-3 px-2 sm:px-0">
          {/* SORT DROPDOWN */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-[13px] font-medium outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors shadow-sm cursor-pointer"
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
              placeholder="Search state name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-[13px] font-medium outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors shadow-sm placeholder-gray-400"
            />
            {searchInput !== debouncedSearch && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-900 dark:border-gray-600 dark:border-t-white rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col flex-1 overflow-hidden min-h-[50vh]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-950/50 text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-5">State Name</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-[13px]">
              {loading ? (
                <tr>
                  <td colSpan="2" className="p-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce"
                          style={{ animationDelay: "-0.3s" }}
                        ></div>
                        <div
                          className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce"
                          style={{ animationDelay: "-0.15s" }}
                        ></div>
                        <div className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce"></div>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm font-medium">
                        Loading states...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : states.length === 0 ? (
                <tr>
                  <td
                    colSpan="2"
                    className="p-16 text-center text-gray-500 dark:text-gray-400 font-medium"
                  >
                    {debouncedSearch
                      ? `No matching states found for "${debouncedSearch}".`
                      : `No ${activeTab} states found.`}
                  </td>
                </tr>
              ) : (
                states.map((state) => (
                  <tr
                    key={state._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="px-6 py-5 font-extrabold text-gray-900 dark:text-white uppercase tracking-widest text-sm">
                      {state.name}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleView(state)}
                          className="px-4 py-2 text-[12px] font-bold rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer active:scale-95"
                        >
                          View
                        </button>

                        {activeTab === "active" ? (
                          <>
                            <button
                              onClick={() =>
                                handleAction("softDelete", state._id)
                              }
                              className="px-4 py-2 text-[12px] font-bold rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40 transition-colors cursor-pointer active:scale-95"
                            >
                              Bin
                            </button>
                            <button
                              onClick={() =>
                                handleAction("hardDelete", state._id)
                              }
                              className="px-4 py-2 text-[12px] font-bold rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40 transition-colors cursor-pointer active:scale-95"
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleAction("restore", state._id)}
                              className="px-4 py-2 text-[12px] font-bold rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer active:scale-95"
                            >
                              Restore
                            </button>
                            <button
                              onClick={() =>
                                handleAction("hardDelete", state._id)
                              }
                              className="px-4 py-2 text-[12px] font-bold rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40 transition-colors cursor-pointer active:scale-95"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {!loading && states.length > 0 && (
          <div className="mt-auto flex flex-col sm:flex-row justify-between items-center p-5 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-medium text-gray-500">
                Rows per page:
              </span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-[13px] font-bold bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-white outline-none cursor-pointer focus:border-gray-400 transition-colors"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
              </select>
            </div>

            <div className="flex items-center gap-5 text-[13px] text-gray-600 dark:text-gray-300 font-medium">
              <span>
                Page{" "}
                <span className="font-bold text-gray-900 dark:text-white">
                  {page}
                </span>{" "}
                of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer active:scale-95 shadow-sm font-bold text-gray-700 dark:text-gray-200"
                >
                  Prev
                </button>
                <button
                  disabled={page === totalPages || totalPages === 0}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer active:scale-95 shadow-sm font-bold text-gray-700 dark:text-gray-200"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showViewModal && selectedState && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-800 relative">
            <button
              onClick={() => {
                setShowViewModal(false);
                setSelectedState(null);
              }}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
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
                ></path>
              </svg>
            </button>

            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                State Details
              </h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-2">
                System Record Information
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                  Name
                </span>
                <span className="font-extrabold text-gray-900 dark:text-white text-base uppercase tracking-wider">
                  {selectedState.name}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                  Status
                </span>
                <span
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest ${
                    selectedState.isDeleted
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  }`}
                >
                  {selectedState.isDeleted ? "Inactive" : "Active"}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                  Created On
                </span>
                <span className="font-bold text-gray-900 dark:text-white text-[13px]">
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

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedState(null);
                }}
                className="w-full px-6 py-3 rounded-xl text-[12px] font-bold uppercase tracking-wide bg-gray-900 hover:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white transition-all cursor-pointer active:scale-95 shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StateManager;
