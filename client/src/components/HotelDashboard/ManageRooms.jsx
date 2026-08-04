import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import useDebounce from "../../hooks/useDebounce";

const ManageRooms = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 1000);
  const [sortBy, setSortBy] = useState("newest");

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeModalImage, setActiveModalImage] = useState(0);

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    setSearchInput("");
    setSortBy("newest");
  }, [activeTab]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const isDeleted = activeTab === "inactive";

      let url = `/rooms/my-rooms?isDeleted=${isDeleted}`;
      if (debouncedSearch) {
        url += `&search=${debouncedSearch}`;
      }
      if (sortBy) {
        url += `&sortBy=${sortBy}`;
      }

      const res = await api.get(url, config);
      setRooms(res.data.data || []);
    } catch (error) {
      console.error("Error fetching rooms", error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [activeTab, debouncedSearch, sortBy]);

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
    <div>
      {/* TABS & CONTROLS ROW */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 border-b border-gray-200 dark:border-gray-700 mb-6 pb-2 lg:pb-0">
        {/* TABS (LEFT) */}
        <div className="flex gap-4 px-2 overflow-x-auto whitespace-nowrap w-full lg:w-auto border-b-0">
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-3 px-1 font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === "active"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 font-bold"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            Active Rooms
          </button>
          <button
            onClick={() => setActiveTab("inactive")}
            className={`pb-3 px-1 font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === "inactive"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 font-bold"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            Inactive Bin
          </button>
        </div>

        {/* CONTROLS (SEARCH & SORT) - RIGHT */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto mb-2 px-2 sm:px-0">
          {/* SORT DROPDOWN */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
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
              placeholder="Search Room Type, No., Name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
            {/* Tiny loading spinner */}
            {searchInput !== debouncedSearch && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ROOM CARDS GRID */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
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
            Fetching rooms...
          </p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          {debouncedSearch
            ? `No matching rooms found for "${debouncedSearch}".`
            : `No ${activeTab} rooms found.`}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Card Image */}
              <div
                className="h-48 bg-gray-200 dark:bg-gray-700 relative cursor-pointer"
                onClick={() => handleView(room)}
              >
                {room.images && room.images.length > 0 ? (
                  <img
                    src={room.images[0]}
                    alt={`Room ${room.roomNumber}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}

                {/* Room Availability Status Badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md shadow-sm ${
                      room.status === "Available"
                        ? "bg-green-500 text-white"
                        : room.status === "Occupied"
                          ? "bg-red-500 text-white"
                          : room.status === "Reserved"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-500 text-white"
                    }`}
                  >
                    {room.status}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3
                      className="text-lg font-bold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => handleView(room)}
                    >
                      Room {room.roomNumber}{" "}
                      {room.roomName && `- ${room.roomName}`}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {room.roomType} • Floor {room.floorNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      ₹{room.pricePerNight}
                    </span>
                    <span className="text-xs text-gray-500 block">/ night</span>
                  </div>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  <p>Capacity: {room.totalGuests} Guests</p>
                  <p>
                    Beds: {room.numberOfBeds} {room.bedType}
                  </p>
                </div>

                {/* Card Actions (Footer) */}
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex-1">
                    <select
                      value={room.status}
                      onChange={(e) =>
                        handleStatusChange(room._id, e.target.value)
                      }
                      disabled={activeTab === "inactive"}
                      className="w-full text-xs font-medium px-2 py-1.5 rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 outline-none cursor-pointer"
                    >
                      <option value="Available">Set Available</option>
                      <option value="Occupied">Set Occupied</option>
                      <option value="Reserved">Set Reserved</option>
                      <option value="Under Maintenance">Maintenance</option>
                      <option value="Out of Service">Out of Service</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    {activeTab === "active" ? (
                      <>
                        <Link
                          to={`/hotel-dashboard/edit-room/${room._id}`}
                          className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleAction("softDelete", room._id)}
                          className="px-3 py-1.5 text-xs font-medium rounded-md bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 cursor-pointer"
                        >
                          Bin
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleAction("restore", room._id)}
                          className="px-3 py-1.5 text-xs font-medium rounded-md bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 cursor-pointer"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handleAction("hardDelete", room._id)}
                          className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 cursor-pointer"
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

      {/* ROOM DETAILS MODAL */}
      {showViewModal && selectedRoom && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 transition-opacity overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-5xl shadow-2xl relative my-auto overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            <button
              onClick={() => setShowViewModal(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors cursor-pointer"
            >
              &times;
            </button>

            <div className="w-full md:w-1/2 bg-gray-100 dark:bg-gray-900 flex flex-col">
              <div className="h-64 md:h-96 w-full relative">
                {selectedRoom.images && selectedRoom.images.length > 0 ? (
                  <img
                    src={selectedRoom.images[activeModalImage]}
                    alt="Room"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Images Available
                  </div>
                )}
                <div className="absolute bottom-4 left-4">
                  <span
                    className={`px-3 py-1 text-xs font-bold uppercase rounded-md shadow-md ${
                      selectedRoom.status === "Available"
                        ? "bg-green-500 text-white"
                        : selectedRoom.status === "Occupied"
                          ? "bg-red-500 text-white"
                          : selectedRoom.status === "Reserved"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-500 text-white"
                    }`}
                  >
                    {selectedRoom.status}
                  </span>
                </div>
              </div>

              {selectedRoom.images && selectedRoom.images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto bg-gray-200 dark:bg-gray-950">
                  {selectedRoom.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Thumb ${idx}`}
                      onClick={() => setActiveModalImage(idx)}
                      className={`h-16 w-16 object-cover rounded-md cursor-pointer border-2 transition-all ${
                        activeModalImage === idx
                          ? "border-blue-500 opacity-100"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="w-full md:w-1/2 p-6 overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Room {selectedRoom.roomNumber}{" "}
                {selectedRoom.roomName && `- ${selectedRoom.roomName}`}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                {selectedRoom.roomType} • Floor {selectedRoom.floorNumber}
              </p>

              <div className="space-y-6">
                {selectedRoom.description && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Description
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {selectedRoom.description}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Pricing
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div>
                      <span className="text-gray-500 block text-xs">
                        Per Night
                      </span>
                      <span className="font-bold dark:text-white">
                        ₹{selectedRoom.pricePerNight}
                      </span>
                    </div>
                    {selectedRoom.weekendPrice && (
                      <div>
                        <span className="text-gray-500 block text-xs">
                          Weekend
                        </span>
                        <span className="font-semibold dark:text-white">
                          ₹{selectedRoom.weekendPrice}
                        </span>
                      </div>
                    )}
                    {selectedRoom.holidayPrice && (
                      <div>
                        <span className="text-gray-500 block text-xs">
                          Holiday
                        </span>
                        <span className="font-semibold dark:text-white">
                          ₹{selectedRoom.holidayPrice}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500 block text-xs">Taxes</span>
                      <span className="font-semibold dark:text-white">
                        {selectedRoom.taxIncluded ? "Included" : "Excluded"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Capacity & Beds
                  </h4>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                      {selectedRoom.maxAdults} Adults
                    </span>
                    {selectedRoom.maxChildren > 0 && (
                      <span className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                        {selectedRoom.maxChildren} Children
                      </span>
                    )}
                    <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                      {selectedRoom.numberOfBeds}x {selectedRoom.bedType}
                    </span>
                  </div>
                </div>

                {selectedRoom.facilities &&
                  selectedRoom.facilities.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Facilities
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedRoom.facilities.map((fac, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md border border-gray-200 dark:border-gray-600"
                          >
                            {fac}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Policies
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Cancellation:</span>{" "}
                    {selectedRoom.cancellationPolicy}
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

export default ManageRooms;
