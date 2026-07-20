import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";

const roomFacilitiesList = [
  "Wi-Fi",
  "Air Conditioner (AC)",
  "Swimming Pool Access",
  "Gym Access",
  "Spa Access",
  "Smart TV",
  "Room Service",
  "Balcony",
  "Bathtub",
  "Mini Bar",
];

const HotelDetails = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeModalImage, setActiveModalImage] = useState(null);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [roomToBook, setRoomToBook] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [totalDays, setTotalDays] = useState(0);
  const [coupons, setCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [roomFilters, setRoomFilters] = useState({
    minPrice: "",
    maxPrice: "",
    bedType: "",
    status: "",
    cancellationPolicy: "",
    minDiscount: "",
    facilities: [],
  });

  useEffect(() => {
    const fetchHotelAndRooms = async () => {
      try {
        const hotelRes = await api.get(`/search/hotels/${id}`);
        setHotel(hotelRes.data.data);

        const roomRes = await api.get(`/search/hotels/${id}/rooms`);
        setRooms(roomRes.data.data);
      } catch (error) {
        console.error("Error fetching data", error.response?.data || error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchHotelAndRooms();
    }
  }, [id]);

  useEffect(() => {
    if (checkIn && checkOut) {
      const inDate = new Date(checkIn);
      const outDate = new Date(checkOut);
      const diffTime = outDate - inDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setTotalDays(diffDays > 0 ? diffDays : 0);
      setAppliedCoupon(null);
    } else {
      setTotalDays(0);
    }
  }, [checkIn, checkOut]);

  const handleRoomFilterChange = (e) => {
    const { name, value } = e.target;
    setRoomFilters({ ...roomFilters, [name]: value });
  };

  const handleRoomFacilityChange = (facility) => {
    let facilities = [...roomFilters.facilities];
    if (facilities.includes(facility)) {
      facilities = facilities.filter((item) => item !== facility);
    } else {
      facilities.push(facility);
    }
    setRoomFilters({ ...roomFilters, facilities });
  };

  const clearRoomFilters = () => {
    setRoomFilters({
      minPrice: "",
      maxPrice: "",
      bedType: "",
      status: "",
      cancellationPolicy: "",
      minDiscount: "",
      facilities: [],
    });
  };

  const filteredRooms = rooms.filter((room) => {
    if (
      roomFilters.minPrice &&
      room.pricePerNight < Number(roomFilters.minPrice)
    )
      return false;
    if (
      roomFilters.maxPrice &&
      room.pricePerNight > Number(roomFilters.maxPrice)
    )
      return false;
    if (roomFilters.bedType && room.bedType !== roomFilters.bedType)
      return false;
    if (roomFilters.status && room.status !== roomFilters.status) return false;
    if (
      roomFilters.cancellationPolicy &&
      room.cancellationPolicy !== roomFilters.cancellationPolicy
    )
      return false;
    if (
      roomFilters.minDiscount &&
      room.discount < Number(roomFilters.minDiscount)
    )
      return false;

    if (roomFilters.facilities.length > 0) {
      const hasAll = roomFilters.facilities.every((f) =>
        room.facilities?.includes(f),
      );
      if (!hasAll) return false;
    }
    return true;
  });

  const handleViewRoom = (room) => {
    setSelectedRoom(room);
    setActiveModalImage(
      room.images?.[0] || "https://via.placeholder.com/400x300",
    );
    setShowRoomModal(true);
  };

  const handleOpenBooking = async (room) => {
    setRoomToBook(room);
    setCheckIn("");
    setCheckOut("");
    setTotalDays(0);
    setAppliedCoupon(null);
    setShowBookingModal(true);

    const token = localStorage.getItem("token");

    try {
      const res = await api.get(`/coupons/${hotel._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allCoupons = res.data.data || [];
      const now = new Date();

      const validCoupons = allCoupons.filter((c) => {
        const isStatusActive = c.status === "active";
        const isNotExpired = new Date(c.expiryDate) > now;
        const isStarted = new Date(c.availFrom) <= now;
        return isStatusActive && isNotExpired && isStarted;
      });

      setCoupons(validCoupons);
    } catch (err) {
      console.error("Could not fetch coupons", err);
    }
  };

  const basePrice =
    totalDays > 0 && roomToBook ? totalDays * roomToBook.pricePerNight : 0;

  let discountAmount = 0;
  if (appliedCoupon && basePrice >= appliedCoupon.minPrice) {
    let calculatedDiscount = (basePrice * appliedCoupon.discount) / 100;
    discountAmount = Math.min(calculatedDiscount, appliedCoupon.maxDiscount);
  }

  const finalPrice = basePrice - discountAmount;

  const handleConfirmBooking = async () => {
    if (totalDays <= 0) return alert("Please select valid dates.");

    setBookingLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("You must be logged in to book a room.");

      const payload = {
        hotelId: hotel._id,
        roomId: roomToBook._id,
        couponId: appliedCoupon ? appliedCoupon._id : null,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        totalDays,
        originalPrice: basePrice,
        finalPrice,
      };

      await api.post("/bookings/create", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Booking Request Submitted Successfully! Status: Pending");
      setShowBookingModal(false);
      setRoomToBook(null);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create booking");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center p-20 text-xl font-bold dark:text-white transition-colors duration-300">
        Loading Property...
      </div>
    );
  if (!hotel)
    return (
      <div className="text-center p-20 text-xl font-bold text-red-500 dark:text-red-400 transition-colors duration-300">
        Hotel not found.
      </div>
    );

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300 min-h-screen pb-12">
      {/* Hero Header */}
      <div className="w-full h-80 bg-gray-800 dark:bg-gray-950 relative">
        <img
          src={hotel.imageUrl || "https://via.placeholder.com/1200x400"}
          alt={hotel.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-2">
            {hotel.name}
          </h1>
          <p className="text-lg md:text-xl font-medium">
            {hotel.cityId?.name}, {hotel.stateId?.name}
          </p>
          <div className="mt-4 bg-yellow-400 text-black px-4 py-1 rounded-full font-bold">
            {hotel.starRating} Star {hotel.hotelType}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-10 relative z-10 flex flex-col md:flex-row gap-6">
        {/* ROOM FILTERS SIDEBAR */}
        <aside className="w-full md:w-1/4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-100 dark:border-gray-700 h-fit transition-colors duration-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Filter Rooms
            </h2>
            <button
              onClick={clearRoomFilters}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-4">
            {/* Price Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price Range (₹)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min"
                  value={roomFilters.minPrice}
                  onChange={handleRoomFilterChange}
                  className="w-1/2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max"
                  value={roomFilters.maxPrice}
                  onChange={handleRoomFilterChange}
                  className="w-1/2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Bed Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bed Size
              </label>
              <select
                name="bedType"
                value={roomFilters.bedType}
                onChange={handleRoomFilterChange}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2 text-sm transition-colors"
              >
                <option value="">Any Bed</option>
                <option value="Single Bed">Single Bed</option>
                <option value="Double Bed">Double Bed</option>
                <option value="Queen Bed">Queen Bed</option>
                <option value="King Bed">King Bed</option>
                <option value="Twin Beds">Twin Beds</option>
                <option value="Sofa Bed">Sofa Bed</option>
                <option value="Bunk Bed">Bunk Bed</option>
              </select>
            </div>

            {/* Room Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Availability
              </label>
              <select
                name="status"
                value={roomFilters.status}
                onChange={handleRoomFilterChange}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2 text-sm transition-colors"
              >
                <option value="">Any Status</option>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Reserved">Reserved</option>
              </select>
            </div>

            {/* Cancellation Policy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cancellation
              </label>
              <select
                name="cancellationPolicy"
                value={roomFilters.cancellationPolicy}
                onChange={handleRoomFilterChange}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2 text-sm transition-colors"
              >
                <option value="">Any Policy</option>
                <option value="Free Cancellation">Free Cancellation</option>
                <option value="Non-Refundable">Non-Refundable</option>
                <option value="Cancellation Before 24 Hours">
                  Before 24 Hours
                </option>
                <option value="Cancellation Before 48 Hours">
                  Before 48 Hours
                </option>
              </select>
            </div>

            {/* Discount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Discount (%)
              </label>
              <input
                type="number"
                name="minDiscount"
                placeholder="e.g. 10"
                value={roomFilters.minDiscount}
                onChange={handleRoomFilterChange}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            {/* Room Facilities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Room Facilities
              </label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {roomFacilitiesList.map((facility) => (
                  <label
                    key={facility}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={roomFilters.facilities.includes(facility)}
                      onChange={() => handleRoomFacilityChange(facility)}
                      className="w-3.5 h-3.5 rounded text-blue-600 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                    />
                    {facility}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ROOM LISTING */}
        <main className="w-full md:w-3/4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 mb-8 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="flex justify-between items-end border-b dark:border-gray-700 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Available Rooms
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {filteredRooms.length} results
            </span>
          </div>

          {filteredRooms.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
              No rooms match your current filters.
              <br />
              <button
                onClick={clearRoomFilters}
                className="text-blue-600 dark:text-blue-400 hover:underline mt-2 text-sm"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredRooms.map((room) => (
                <div
                  key={room._id}
                  className="flex flex-col md:flex-row border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div
                    className="w-full md:w-1/3 h-48 md:h-auto bg-gray-200 dark:bg-gray-700 relative cursor-pointer group overflow-hidden"
                    onClick={() => handleViewRoom(room)}
                  >
                    <img
                      src={
                        room.images?.[0] ||
                        "https://via.placeholder.com/300x200"
                      }
                      alt={room.roomType}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded shadow-lg flex items-center gap-2">
                        View Details
                      </span>
                    </div>
                  </div>

                  <div className="w-full md:w-2/3 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                          {room.roomType}
                        </h3>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            ₹{room.pricePerNight}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 block">
                            / night
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
                        {room.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded border dark:border-gray-600">
                          🛏️ {room.bedType}
                        </span>
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded border dark:border-gray-600">
                          👥 Max: {room.maxAdults} Adults
                        </span>
                        {room.facilities?.slice(0, 3).map((fac, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded border border-green-100 dark:border-green-800"
                          >
                            ✓ {fac}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={() => handleOpenBooking(room)}
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium px-8 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* VIEW ROOM MODAL */}
      {showRoomModal && selectedRoom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Room Profile
              </h2>
              <button
                onClick={() => setShowRoomModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="px-6 py-5 flex flex-col md:flex-row gap-6 overflow-y-auto">
              <div className="w-full md:w-1/2 flex flex-col gap-3">
                <img
                  src={activeModalImage}
                  alt={selectedRoom.roomType}
                  className="w-full h-64 object-cover rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300"
                />
                {selectedRoom.images && selectedRoom.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {selectedRoom.images.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        onClick={() => setActiveModalImage(img)}
                        alt={`view ${index + 1}`}
                        className={`w-full h-16 object-cover rounded-lg shadow-sm border-2 cursor-pointer transition-all duration-200 ${activeModalImage === img ? "border-blue-500 opacity-100" : "border-transparent opacity-60 hover:opacity-100 hover:border-gray-300 dark:hover:border-gray-500"}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="w-full md:w-1/2 space-y-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Room Type:
                  </span>{" "}
                  <span className="font-semibold text-lg dark:text-white">
                    {selectedRoom.roomType}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Price:
                  </span>{" "}
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    ₹{selectedRoom.pricePerNight} / night
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Bed Size:
                  </span>{" "}
                  <span className="dark:text-white">
                    {selectedRoom.bedType}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Capacity:
                  </span>{" "}
                  <span className="dark:text-white">
                    Up to {selectedRoom.maxAdults} Adults
                  </span>
                </div>

                {selectedRoom.facilities &&
                  selectedRoom.facilities.length > 0 && (
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400 block mb-2">
                        Facilities:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedRoom.facilities.map((facility, index) => (
                          <span
                            key={index}
                            className="px-2.5 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs border border-green-100 dark:border-green-800"
                          >
                            ✓ {facility}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowRoomModal(false);
                      handleOpenBooking(selectedRoom);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg shadow-sm transition-colors"
                  >
                    Book This Room
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {showBookingModal && roomToBook && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Complete Booking
              </h2>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="px-6 py-5 overflow-y-auto space-y-6">
              {/* Room Summary */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl flex justify-between items-center border border-gray-100 dark:border-gray-600">
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white">
                    {roomToBook.roomType}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ₹{roomToBook.pricePerNight} / night
                  </p>
                </div>
                <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden">
                  <img
                    src={roomToBook.images?.[0]}
                    alt="room"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Date Pickers */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    min={checkIn || today}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Coupon Section */}
              {totalDays > 0 && (
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-800 dark:text-white">
                    Available Coupons
                  </label>
                  {coupons.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      No coupons available.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {coupons.map((coupon) => {
                        const isEligible =
                          Number(basePrice) >= Number(coupon.minPrice);
                        return (
                          <div
                            key={coupon._id}
                            className={`flex justify-between items-center p-3 border rounded-lg ${
                              isEligible
                                ? "border-green-300 bg-green-50 dark:bg-green-900/20"
                                : "border-gray-200 bg-gray-50 opacity-60"
                            }`}
                          >
                            <div>
                              <span className="font-bold text-gray-800 dark:text-white">
                                {coupon.code}
                              </span>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {coupon.discount}% OFF (Min spend: ₹
                                {coupon.minPrice})
                              </p>
                            </div>

                            <button
                              onClick={() => setAppliedCoupon(coupon)}
                              disabled={
                                !isEligible || appliedCoupon?._id === coupon._id
                              }
                              className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${
                                !isEligible
                                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                  : appliedCoupon?._id === coupon._id
                                    ? "bg-green-600 text-white"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                              }`}
                            >
                              {!isEligible
                                ? "Min ₹" + coupon.minPrice
                                : appliedCoupon?._id === coupon._id
                                  ? "Applied"
                                  : "Apply"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Price Calculation */}
              {totalDays > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>
                      ₹{roomToBook.pricePerNight} x {totalDays} nights
                    </span>
                    <span>₹{basePrice}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                      <span>Coupon Discount ({appliedCoupon.code})</span>
                      <span>- ₹{discountAmount}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex justify-between font-bold text-lg text-gray-800 dark:text-white">
                    <span>Total Amount</span>
                    <span>₹{finalPrice}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <button
                onClick={handleConfirmBooking}
                disabled={totalDays <= 0 || bookingLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingLoading
                  ? "Processing..."
                  : `Confirm Booking • ₹${finalPrice || 0}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelDetails;
