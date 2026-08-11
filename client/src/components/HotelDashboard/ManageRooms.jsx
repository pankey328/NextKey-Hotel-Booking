import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import useDebounce from "../../hooks/useDebounce";
import ExportRoomsButton from "./ExportRoomsButton";
import ImportRoomsButton from "./ImportRoomsButton";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css"; 

const ManageRooms = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 1000);
  const [sortBy, setSortBy] = useState("newest");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeModalImage, setActiveModalImage] = useState(0);

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const currentHotelId = rooms.length > 0 ? rooms[0].hotelId : null;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const isDeleted = activeTab === "inactive";

      let url = `/rooms/my-rooms?isDeleted=${isDeleted}&page=${page}&limit=${limit}`;
      if (debouncedSearch) {
        url += `&search=${debouncedSearch}`;
      }
      if (sortBy) {
        url += `&sortBy=${sortBy}`;
      }

      const res = await api.get(url, config);
      setRooms(res.data.data || []);

      const newTotalPages = res.data.totalPages || 1;
      setTotalPages(newTotalPages);

      // Auto-navigate to the previous page if we delete the last item on the current page
      if (page > newTotalPages && page > 1) {
        setPage(newTotalPages);
      }
    } catch (error) {
      console.error("Error fetching rooms", error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [activeTab, debouncedSearch, sortBy, page, limit]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchInput("");
    setSortBy("newest");
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  const handleAction = async (action, id) => {
    try {
      if (action === "softDelete") {
        if (!window.confirm("Move this room to the inactive bin?")) return;
        await api.patch(`/rooms/${id}/soft-delete`, {}, config);
      } else if (action === "restore") {
        await api.patch(`/rooms/${id}/restore`, {}, config);
      } else if (action === "hardDelete") {
        if (
          !window.confirm(
            "Permanently delete this room? This cannot be undone.",
          )
        )
          return;
        await api.delete(`/rooms/${id}`, config);
      }
      fetchRooms();
    } catch (error) {
      alert(error.response?.data?.message || `Error performing ${action}`);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/rooms/${id}/status`, { status: newStatus }, config);
      fetchRooms();
    } catch (error) {
      alert(error.response?.data?.message || "Error updating status");
    }
  };

  const handleView = (room) => {
    setSelectedRoom(room);
    setActiveModalImage(0);
    setShowViewModal(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      {/* HEADER SECTION: Title & Export/Import Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Manage Rooms
        </h1>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <ImportRoomsButton
            hotelId={currentHotelId}
            onSuccess={fetchRooms}
          />
          <ExportRoomsButton
            hotelId={currentHotelId}
            disabled={rooms.length === 0 || loading}
          />
        </div>
      </div>

      {/* TABS & CONTROLS ROW */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-5 border-b border-gray-200 dark:border-gray-800 pb-4 xl:pb-0">
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
            Active Rooms
          </button>
          <button
            onClick={() => handleTabChange("inactive")}
            className={`pb-4 px-1 text-[13px] font-bold uppercase tracking-wide border-b-2 transition-all cursor-pointer ${
              activeTab === "inactive"
                ? "border-gray-900 text-gray-900 dark:border-white dark:text-white"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            Inactive Bin
          </button>
        </div>

        {/* CONTROLS (SEARCH & SORT) - RIGHT */}
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto mb-3 px-2 sm:px-0">
          {/* SORT DROPDOWN */}
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="w-full sm:w-auto border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-[13px] font-medium outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors cursor-pointer shadow-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="price_asc">Price: Low to High</option>
          </select>

          {/* SEARCH INPUT */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search Type, No, Name..."
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

      {/* ROOM CARDS GRID */}
      <div className="min-h-[50vh]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
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
              Fetching rooms...
            </p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex items-center justify-center py-24 text-gray-500 dark:text-gray-400 font-medium bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
            {debouncedSearch
              ? `No matching rooms found for "${debouncedSearch}".`
              : `No ${activeTab} rooms found.`}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room._id}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Card Image */}
                <div
                  className="h-52 bg-gray-100 dark:bg-gray-800 relative cursor-pointer group overflow-hidden"
                  onClick={() => handleView(room)}
                >
                  {room.images && room.images.length > 0 ? (
                    <LazyLoadImage
                      src={room.images[0]}
                      alt={`Room ${room.roomNumber}`}
                      effect="blur"
                      wrapperClassName="w-full h-full block"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">
                      No Image
                    </div>
                  )}

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>

                  {/* Room Availability Status Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <span
                      className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-sm backdrop-blur-md border border-white/20 ${
                        room.status === "Available"
                          ? "bg-emerald-500/90 text-white"
                          : room.status === "Occupied"
                            ? "bg-blue-600/90 text-white"
                            : room.status === "Reserved"
                              ? "bg-amber-500/90 text-white"
                              : "bg-gray-600/90 text-white"
                      }`}
                    >
                      {room.status}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3
                        className="text-lg font-extrabold text-gray-900 dark:text-white cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        onClick={() => handleView(room)}
                      >
                        Room {room.roomNumber}{" "}
                        {room.roomName && (
                          <span className="text-gray-400 font-medium">
                            | {room.roomName}
                          </span>
                        )}
                      </h3>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mt-1.5">
                        {room.roomType} • Floor {room.floorNumber}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <span className="text-xl font-extrabold text-gray-900 dark:text-white block">
                        ₹{room.pricePerNight}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mt-0.5">
                        / night
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4 text-xs font-medium text-gray-600 dark:text-gray-300 mb-6 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                        Capacity
                      </span>
                      <span>{room.totalGuests} Guests</span>
                    </div>
                    <div className="w-px bg-gray-200 dark:bg-gray-700"></div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                        Bedding
                      </span>
                      <span>
                        {room.numberOfBeds}x {room.bedType}
                      </span>
                    </div>
                  </div>

                  {/* Card Actions (Footer) */}
                  <div className="mt-auto flex flex-col gap-3">
                    <select
                      value={room.status}
                      onChange={(e) =>
                        handleStatusChange(room._id, e.target.value)
                      }
                      disabled={activeTab === "inactive"}
                      className="w-full text-[11px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 outline-none cursor-pointer focus:border-gray-400 transition-colors shadow-sm disabled:opacity-50"
                    >
                      <option value="Available">Set Available</option>
                      <option value="Occupied">Set Occupied</option>
                      <option value="Reserved">Set Reserved</option>
                      <option value="Under Maintenance">Maintenance</option>
                      <option value="Out of Service">Out of Service</option>
                    </select>

                    <div className="flex gap-3">
                      {activeTab === "active" ? (
                        <>
                          <Link
                            to={`/hotel-dashboard/edit-room/${room._id}`}
                            className="flex-1 flex justify-center px-4 py-2.5 text-[12px] font-bold uppercase tracking-wide rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors active:scale-95 text-center"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleAction("softDelete", room._id)}
                            className="flex-1 px-4 py-2.5 text-[12px] font-bold uppercase tracking-wide rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40 transition-colors cursor-pointer active:scale-95"
                          >
                            Bin
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleAction("restore", room._id)}
                            className="flex-1 px-4 py-2.5 text-[12px] font-bold uppercase tracking-wide rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer active:scale-95"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => handleAction("hardDelete", room._id)}
                            className="flex-1 px-4 py-2.5 text-[12px] font-bold uppercase tracking-wide rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40 transition-colors cursor-pointer active:scale-95"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PAGINATION FOOTER */}
      {!loading && rooms.length > 0 && (
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center p-5 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl shadow-sm gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-medium text-gray-500">
              Cards per page:
            </span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-[13px] font-bold bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-white outline-none cursor-pointer focus:border-gray-400 transition-colors"
            >
              <option value="6">6</option>
              <option value="12">12</option>
              <option value="24">24</option>
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

      {/* ROOM DETAILS MODAL */}
      {showViewModal && selectedRoom && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6 transition-opacity overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-5xl shadow-2xl relative my-auto overflow-hidden flex flex-col md:flex-row max-h-[90vh] border border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setShowViewModal(false)}
              className="absolute top-5 right-5 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md transition-colors cursor-pointer"
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

            {/* Left Side: Images */}
            <div className="w-full md:w-1/2 bg-gray-100 dark:bg-gray-950 flex flex-col relative border-r border-gray-200 dark:border-gray-800">
              <div className="h-64 md:flex-1 w-full relative bg-gray-200 dark:bg-gray-800">
                {selectedRoom.images && selectedRoom.images.length > 0 ? (
                  <LazyLoadImage
                    src={selectedRoom.images[activeModalImage]}
                    alt="Room"
                    effect="blur"
                    wrapperClassName="w-full h-full block"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                    No Images Available
                  </div>
                )}
                <div className="absolute top-6 left-6">
                  <span
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-lg backdrop-blur-md border border-white/20 ${
                      selectedRoom.status === "Available"
                        ? "bg-emerald-500/90 text-white"
                        : selectedRoom.status === "Occupied"
                          ? "bg-blue-600/90 text-white"
                          : selectedRoom.status === "Reserved"
                            ? "bg-amber-500/90 text-white"
                            : "bg-gray-600/90 text-white"
                    }`}
                  >
                    {selectedRoom.status}
                  </span>
                </div>
              </div>

              {selectedRoom.images && selectedRoom.images.length > 1 && (
                <div className="flex gap-3 p-5 overflow-x-auto bg-white dark:bg-gray-900 hide-scrollbar shrink-0">
                  {selectedRoom.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Thumb ${idx}`}
                      onClick={() => setActiveModalImage(idx)}
                      className={`h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-xl cursor-pointer transition-all ${
                        activeModalImage === idx
                          ? "ring-2 ring-gray-900 dark:ring-white ring-offset-2 dark:ring-offset-gray-900 opacity-100"
                          : "opacity-50 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Side: Details */}
            <div className="w-full md:w-1/2 p-6 sm:p-10 overflow-y-auto">
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                  Room {selectedRoom.roomNumber}{" "}
                  {selectedRoom.roomName && (
                    <span className="text-gray-400 font-medium block sm:inline">
                      | {selectedRoom.roomName}
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                    {selectedRoom.roomType}
                  </p>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                    Floor {selectedRoom.floorNumber}
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Description */}
                {selectedRoom.description && (
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">
                      Description
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                      {selectedRoom.description}
                    </p>
                  </div>
                )}

                {/* Pricing Grid */}
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">
                    Pricing Breakdown
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500 block text-[10px] font-bold uppercase tracking-widest mb-1">
                        Per Night
                      </span>
                      <span className="text-xl font-extrabold text-gray-900 dark:text-white">
                        ₹{selectedRoom.pricePerNight}
                      </span>
                    </div>
                    {selectedRoom.weekendPrice && (
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <span className="text-gray-500 block text-[10px] font-bold uppercase tracking-widest mb-1">
                          Weekend
                        </span>
                        <span className="text-lg font-extrabold text-gray-900 dark:text-white">
                          ₹{selectedRoom.weekendPrice}
                        </span>
                      </div>
                    )}
                    {selectedRoom.holidayPrice && (
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <span className="text-gray-500 block text-[10px] font-bold uppercase tracking-widest mb-1">
                          Holiday
                        </span>
                        <span className="text-lg font-extrabold text-gray-900 dark:text-white">
                          ₹{selectedRoom.holidayPrice}
                        </span>
                      </div>
                    )}
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500 block text-[10px] font-bold uppercase tracking-widest mb-1">
                        Taxes
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white mt-1 block">
                        {selectedRoom.taxIncluded ? "Included" : "Excluded"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Capacity & Facilities */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">
                      Capacity
                    </h4>
                    <ul className="space-y-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <li className="flex items-center gap-3">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          ></path>
                        </svg>
                        {selectedRoom.maxAdults} Adults{" "}
                        {selectedRoom.maxChildren > 0 &&
                          `& ${selectedRoom.maxChildren} Children`}
                      </li>
                      <li className="flex items-center gap-3">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          ></path>
                        </svg>
                        {selectedRoom.numberOfBeds}x {selectedRoom.bedType}
                      </li>
                    </ul>
                  </div>

                  {selectedRoom.facilities &&
                    selectedRoom.facilities.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">
                          Amenities
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedRoom.facilities.map((fac, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 text-[11px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md border border-gray-200 dark:border-gray-700"
                            >
                              {fac}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {/* Policies */}
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">
                    Policies
                  </h4>
                  <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-4 rounded-xl text-sm font-medium text-amber-800 dark:text-amber-500">
                    <span className="font-bold uppercase tracking-wide text-[10px] block mb-1">
                      Cancellation Rule:
                    </span>
                    {selectedRoom.cancellationPolicy}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRooms;
