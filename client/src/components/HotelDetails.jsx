import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../api";
import {
  MapPinIcon,
  FunnelIcon,
  XMarkIcon,
  CheckIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import useDebounce from "../hooks/useDebounce";

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

  const [allBlocks, setAllBlocks] = useState([]);
  const [roomBookings, setRoomBookings] = useState({});

  const [loading, setLoading] = useState(true);
  const [fetchingRooms, setFetchingRooms] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeModalImage, setActiveModalImage] = useState(null);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [roomToBook, setRoomToBook] = useState(null);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [totalDays, setTotalDays] = useState(0);
  const [coupons, setCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [roomFilters, setRoomFilters] = useState({
    search: "",
    minPrice: "",
    maxPrice: "",
    bedType: "",
    status: "",
    cancellationPolicy: "",
    minDiscount: "",
    facilities: [],
  });

  // fetch hotel details, calender dates
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const hotelRes = await api.get(`/search/hotels/${id}`);
        setHotel(hotelRes.data.data);

        const availabilityRes = await api.get(`/bookings/availability/${id}`);
        setAllBlocks(availabilityRes.data.data || []);
      } catch (error) {
        console.error("Error fetching initial data", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchInitialData();
  }, [id]);

  // connect rooms to calender dates
  useEffect(() => {
    const bookingMap = {};
    for (const room of rooms) {
      bookingMap[room._id] = allBlocks.filter(
        (b) => b.roomId?.toString() === room._id.toString(),
      );
    }
    setRoomBookings(bookingMap);
  }, [rooms, allBlocks]);

  // fetch rooms
  const fetchRooms = async (currentFilters = roomFilters) => {
    setFetchingRooms(true);
    try {
      let url = `/search/hotels/${id}/rooms?`;

      if (currentFilters.search) url += `search=${currentFilters.search}&`;
      if (currentFilters.minPrice)
        url += `minPrice=${currentFilters.minPrice}&`;
      if (currentFilters.maxPrice)
        url += `maxPrice=${currentFilters.maxPrice}&`;
      if (currentFilters.bedType) url += `bedType=${currentFilters.bedType}&`;
      if (currentFilters.status) url += `status=${currentFilters.status}&`;
      if (currentFilters.cancellationPolicy)
        url += `cancellationPolicy=${currentFilters.cancellationPolicy}&`;
      if (currentFilters.minDiscount)
        url += `minDiscount=${currentFilters.minDiscount}&`;

      if (currentFilters.facilities && currentFilters.facilities.length > 0) {
        url += `features=${currentFilters.facilities.join(",")}&`;
      }

      const roomRes = await api.get(url);
      setRooms(roomRes.data.data || []);
    } catch (error) {
      console.error("Error fetching rooms", error);
    } finally {
      setFetchingRooms(false);
    }
  };

  const debouncedSearch = useDebounce(roomFilters.search, 1000);

  useEffect(() => {
    fetchRooms();
  }, [debouncedSearch]);

  // date, price, coupon
  useEffect(() => {
    const fetchData = async () => {
      if (!checkIn || !checkOut || !roomToBook) {
        setTotalDays(0);
        setCoupons([]);
        return;
      }

      const days = Math.max(
        0,
        Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)),
      );
      setTotalDays(days);
      setAppliedCoupon(null);

      const token = localStorage.getItem("token");
      if (!token) return;

      const formatDate = (date) => date.toISOString().split("T")[0];

      try {
        await api.post(
          "/bookings/temp-lock",
          {
            roomId: roomToBook._id,
            checkInDate: formatDate(checkIn),
            checkOutDate: formatDate(checkOut),
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        const { data } = await api.get(`/coupons/${hotel._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const now = new Date();
        const validCoupons = (data.data || []).filter(
          (coupon) =>
            coupon.status === "active" &&
            new Date(coupon.availFrom) <= now &&
            new Date(coupon.expiryDate) > now,
        );

        setCoupons(validCoupons);
      } catch (err) {
        alert(
          err.response?.data?.message || "These dates just became unavailable.",
        );
        setCheckIn(null);
        setCheckOut(null);
        setTotalDays(0);
        setCoupons([]);
      }
    };

    fetchData();
  }, [checkIn, checkOut, roomToBook, hotel]);

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

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchRooms();
    if (window.innerWidth < 1024) setShowMobileFilters(false);
  };

  const clearRoomFilters = () => {
    const emptyFilters = {
      search: "",
      minPrice: "",
      maxPrice: "",
      bedType: "",
      status: "",
      cancellationPolicy: "",
      minDiscount: "",
      facilities: [],
    };
    setRoomFilters(emptyFilters);
    fetchRooms(emptyFilters);
  };

  const handleViewRoom = (room) => {
    setSelectedRoom(room);
    setActiveModalImage(
      room.images?.[0] || "https://via.placeholder.com/800x600",
    );
    setShowRoomModal(true);
  };

  const handleOpenBooking = async (room) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in to book a room.");

    setBookingLoading(true);
    try {
      const availabilityRes = await api.get(`/bookings/availability/${id}`);
      setAllBlocks(availabilityRes.data.data || []);

      setRoomToBook(room);
      setCheckIn(null);
      setCheckOut(null);
      setTotalDays(0);
      setAppliedCoupon(null);
      setShowBookingModal(true);
    } catch (err) {
      alert("Failed to load calendar. Please try again.");
    } finally {
      setBookingLoading(false);
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
    if (totalDays <= 0 || !checkIn || !checkOut)
      return alert("Please select valid dates.");

    setBookingLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("You must be logged in to book a room.");

      const formatLocalDate = (dateObj) => {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const payload = {
        hotelId: hotel._id,
        roomId: roomToBook._id,
        couponId: appliedCoupon ? appliedCoupon._id : null,
        checkInDate: formatLocalDate(checkIn),
        checkOutDate: formatLocalDate(checkOut),
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

  const getBlockedDateRanges = (roomId) => {
    const blocks = roomBookings[roomId] || [];
    const bookedDates = [];
    const pendingDates = [];
    const tempDates = [];

    for (const b of blocks) {
      if (!b.checkInDate || !b.checkOutDate) continue;

      let currentDate = new Date(b.checkInDate);
      currentDate.setHours(0, 0, 0, 0);

      const endDate = new Date(b.checkOutDate);
      endDate.setHours(0, 0, 0, 0);

      while (currentDate <= endDate) {
        const dateObj = new Date(currentDate);
        const dateStr = dateObj.toDateString();

        if (b.status === "pending") {
          pendingDates.push(dateStr);
        } else if (b.status === "temp-locked") {
          tempDates.push(dateStr);
        } else {
          bookedDates.push(dateStr);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    return { bookedDates, pendingDates, tempDates };
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#fdfdfd] dark:bg-neutral-950 flex space-x-2 justify-center items-center">
        <div className="w-3 h-3 bg-neutral-300 dark:bg-neutral-700 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 bg-neutral-300 dark:bg-neutral-700 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 bg-neutral-300 dark:bg-neutral-700 rounded-full animate-bounce"></div>
      </div>
    );

  if (!hotel)
    return (
      <div className="min-h-screen bg-[#fdfdfd] dark:bg-neutral-950 flex justify-center items-center text-xl font-serif text-neutral-500">
        Property not found.
      </div>
    );

  const today = new Date();

  return (
    <div className="bg-[#fdfdfd] dark:bg-neutral-950 transition-colors duration-500 min-h-screen pb-24 font-sans text-neutral-900 dark:text-neutral-100">
      <style>{`
        .react-datepicker__day--booked-disabled { background-color: #ef4444 !important; color: white !important; border-radius: 0.5rem; cursor: not-allowed !important; opacity: 0.7;}
        .react-datepicker__day--pending-disabled { background-color: #facc15 !important; color: black !important; border-radius: 0.5rem; cursor: not-allowed !important; opacity: 0.7;}
        .react-datepicker__day--temp-disabled { background-color: #9ca3af !important; color: white !important; border-radius: 0.5rem; cursor: not-allowed !important; opacity: 0.7;}
        .react-datepicker-wrapper { display: block; width: 100%; }
        .react-datepicker__input-container input { width: 100%; outline: none; }
      `}</style>

      {/* HERO HEADER */}
      <div className="relative w-full h-[55vh] min-h-[450px] bg-neutral-900 flex items-end pb-16">
        <img
          src={hotel.imageUrl || "https://via.placeholder.com/1600x800"}
          alt={hotel.name}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fdfdfd] via-[#fdfdfd]/20 to-transparent dark:from-neutral-950 dark:via-neutral-950/40"></div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-1.5 bg-white/80 dark:bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-white mb-4 border border-white/20">
            {hotel.starRating}{" "}
            <StarSolid className="w-3.5 h-3.5 text-yellow-500" />
            <span className="mx-1 opacity-50">•</span> {hotel.hotelType}
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif tracking-tight text-neutral-900 dark:text-white mb-2 leading-tight">
            {hotel.name}
          </h1>
          <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 font-medium text-lg">
            <MapPinIcon className="w-5 h-5" />
            {hotel.cityId?.name}, {hotel.stateId?.name}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-20 flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* MOBILE FILTER */}
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="lg:hidden w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 py-4 px-6 rounded-2xl flex items-center justify-between text-neutral-900 dark:text-white font-medium shadow-sm transition-active active:scale-95"
        >
          <div className="flex items-center gap-3">
            <FunnelIcon className="w-5 h-5" />
            <span>{showMobileFilters ? "Hide Filters" : "Filter Rooms"}</span>
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-neutral-400">
            {rooms.length} Available
          </div>
        </button>

        {/* ROOM FILTERS SIDEBAR */}
        <aside
          className={`${
            showMobileFilters ? "block" : "hidden"
          } lg:block w-full lg:w-[320px] flex-shrink-0`}
        >
          <div className="bg-white dark:bg-neutral-900/50 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/20 border border-neutral-100 dark:border-neutral-800 lg:sticky lg:top-28 transition-colors duration-500">
            <div className="flex justify-between items-center mb-8">
              <h2 className="hidden lg:block text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Refine Search
              </h2>
              <button
                onClick={clearRoomFilters}
                className="text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-white opacity-50 hover:opacity-100 transition-opacity"
              >
                Clear All
              </button>
            </div>

            <form onSubmit={handleApplyFilters} className="space-y-6">
              {/* Search Box */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
                  Room Name
                </label>
                <input
                  type="text"
                  name="search"
                  placeholder="e.g. Suite, Deluxe"
                  value={roomFilters.search}
                  onChange={handleRoomFilterChange}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 text-sm outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors dark:text-white placeholder-neutral-400"
                />
              </div>

              {/* Price Range */}
              <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
                  Price Range (₹)
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min"
                    value={roomFilters.minPrice}
                    onChange={handleRoomFilterChange}
                    className="w-1/2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 text-sm outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors dark:text-white"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max"
                    value={roomFilters.maxPrice}
                    onChange={handleRoomFilterChange}
                    className="w-1/2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 text-sm outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors dark:text-white"
                  />
                </div>
              </div>

              {/* Attributes */}
              <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
                    Bed Size
                  </label>
                  <select
                    name="bedType"
                    value={roomFilters.bedType}
                    onChange={handleRoomFilterChange}
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 text-sm outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors appearance-none cursor-pointer"
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

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
                    Cancellation
                  </label>
                  <select
                    name="cancellationPolicy"
                    value={roomFilters.cancellationPolicy}
                    onChange={handleRoomFilterChange}
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 text-sm outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors appearance-none cursor-pointer"
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
              </div>

              {/* Room Facilities */}
              <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-4">
                  Amenities
                </label>
                <div className="space-y-3 max-h-56 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
                  {roomFacilitiesList.map((facility) => (
                    <label
                      key={facility}
                      className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer group"
                    >
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={roomFilters.facilities.includes(facility)}
                          onChange={() => handleRoomFacilityChange(facility)}
                          className="peer appearance-none w-5 h-5 border border-neutral-300 dark:border-neutral-700 rounded-md bg-neutral-50 dark:bg-neutral-900 checked:bg-black dark:checked:bg-white checked:border-black dark:checked:border-white transition-colors cursor-pointer"
                        />
                        <CheckIcon className="absolute w-3 h-3 text-white dark:text-black opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity stroke-[3]" />
                      </div>
                      <span className="group-hover:text-black dark:group-hover:text-white transition-colors">
                        {facility}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button
                  type="submit"
                  className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-4 rounded-xl transition-transform active:scale-95 shadow-lg"
                >
                  Apply Filters
                </button>
              </div>
            </form>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="w-full lg:flex-1">
          <div className="hidden lg:flex items-center justify-between mb-8">
            <h2 className="text-2xl font-serif text-neutral-900 dark:text-white">
              The Collection
            </h2>
          </div>

          {fetchingRooms ? (
            <div className="flex space-x-2 justify-center items-center py-32">
              <div className="w-3 h-3 bg-neutral-300 dark:bg-neutral-700 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-3 h-3 bg-neutral-300 dark:bg-neutral-700 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-3 h-3 bg-neutral-300 dark:bg-neutral-700 rounded-full animate-bounce"></div>
            </div>
          ) : rooms.length === 0 ? (
            <div className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm p-16 text-center rounded-3xl border border-neutral-100 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors duration-300 mt-8">
              <p className="text-2xl font-serif text-neutral-900 dark:text-white mb-2">
                No rooms available
              </p>
              <p className="font-light text-sm mb-6">
                Try adjusting your filters to find available spaces.
              </p>
              <button
                onClick={clearRoomFilters}
                className="inline-block border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold px-6 py-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {rooms.map((room) => (
                <div
                  key={room._id}
                  className="group flex flex-col lg:flex-row bg-white dark:bg-neutral-900 rounded-[2rem] border border-neutral-100 dark:border-neutral-800 overflow-hidden hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-black/40 transition-all duration-500"
                >
                  {/* Room Image */}
                  <div
                    className="w-full lg:w-2/5 h-64 lg:h-auto relative cursor-pointer overflow-hidden bg-neutral-100 dark:bg-neutral-800"
                    onClick={() => handleViewRoom(room)}
                  >
                    <img
                      src={
                        room.images?.[0] ||
                        "https://via.placeholder.com/800x600"
                      }
                      alt={room.roomType}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300">
                      <span className="bg-white/90 dark:bg-black/80 backdrop-blur text-neutral-900 dark:text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                        View Gallery
                      </span>
                    </div>
                  </div>

                  {/* Room Details */}
                  <div className="w-full lg:w-3/5 p-6 lg:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4">
                        <h3 className="text-2xl font-serif text-neutral-900 dark:text-white leading-tight">
                          {room.roomType}
                        </h3>
                        <div className="sm:text-right">
                          <span className="text-2xl font-medium text-neutral-900 dark:text-white">
                            ₹{room.pricePerNight}
                          </span>
                          <span className="text-sm text-neutral-500 block">
                            per night
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-6 font-light leading-relaxed">
                        {room.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 px-2.5 py-1.5 rounded-md">
                          {room.bedType}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 px-2.5 py-1.5 rounded-md">
                          Max: {room.maxAdults} Guests
                        </span>
                        {room.facilities?.slice(0, 2).map((fac, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-bold uppercase tracking-widest bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-2.5 py-1.5 rounded-md flex items-center gap-1"
                          >
                            <CheckCircleIcon className="w-3 h-3" /> {fac}
                          </span>
                        ))}
                        {room.facilities?.length > 2 && (
                          <span className="text-[10px] font-bold uppercase tracking-widest bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 px-2.5 py-1.5 rounded-md">
                            +{room.facilities.length - 2} More
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-neutral-100 dark:border-neutral-800">
                      <button
                        onClick={() => handleOpenBooking(room)}
                        className="w-full sm:w-auto sm:px-10 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 font-semibold py-3.5 rounded-xl shadow-md transition-transform active:scale-95"
                      >
                        Reserve Room
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-white dark:bg-neutral-900 rounded-[2rem] w-full max-w-4xl shadow-2xl border border-white/20 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center px-8 py-6 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="text-2xl font-serif text-neutral-900 dark:text-white">
                {selectedRoom.roomType}
              </h2>
              <button
                onClick={() => setShowRoomModal(false)}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="px-8 py-6 flex flex-col lg:flex-row gap-8 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
              {/* Image Gallery */}
              <div className="w-full lg:w-1/2 flex flex-col gap-4">
                <div className="w-full h-72 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                  <img
                    src={activeModalImage}
                    alt={selectedRoom.roomType}
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />
                </div>
                {selectedRoom.images && selectedRoom.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {selectedRoom.images.map((img, index) => (
                      <div
                        key={index}
                        onClick={() => setActiveModalImage(img)}
                        className={`w-full h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                          activeModalImage === img
                            ? "border-black dark:border-white opacity-100"
                            : "border-transparent opacity-50 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`view ${index}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Room Details Block */}
              <div className="w-full lg:w-1/2 space-y-6 flex flex-col">
                <div className="flex justify-between items-end pb-4 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    Rate
                  </span>
                  <span className="font-serif text-3xl text-neutral-900 dark:text-white">
                    ₹{selectedRoom.pricePerNight}{" "}
                    <span className="text-sm font-sans font-light text-neutral-500">
                      / night
                    </span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                      Bed Type
                    </span>
                    <span className="font-medium dark:text-white">
                      {selectedRoom.bedType}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                      Capacity
                    </span>
                    <span className="font-medium dark:text-white">
                      Up to {selectedRoom.maxAdults} Adults
                    </span>
                  </div>
                </div>

                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                  {selectedRoom.description}
                </p>

                {selectedRoom.facilities &&
                  selectedRoom.facilities.length > 0 && (
                    <div className="pt-2">
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">
                        Amenities Included
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedRoom.facilities.map((facility, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg text-[11px] font-medium tracking-wide uppercase border border-neutral-200 dark:border-neutral-700 flex items-center gap-1.5"
                          >
                            <CheckIcon className="w-3.5 h-3.5 text-neutral-400" />{" "}
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="mt-auto pt-6 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    onClick={() => {
                      setShowRoomModal(false);
                      handleOpenBooking(selectedRoom);
                    }}
                    className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-4 rounded-xl shadow-lg transition-transform active:scale-95"
                  >
                    Proceed to Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {showBookingModal && roomToBook && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-white dark:bg-neutral-900 rounded-[2rem] w-full max-w-lg shadow-2xl border border-white/20 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center px-8 py-6 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="text-xl font-serif text-neutral-900 dark:text-white">
                Reservation Details
              </h2>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="px-8 py-6 overflow-y-auto space-y-8 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
              {/* Room Summary Header */}
              <div className="flex gap-4 items-center">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 dark:border-neutral-700 flex-shrink-0">
                  <img
                    src={roomToBook.images?.[0]}
                    alt="room"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
                    Selected Room
                  </div>
                  <h3 className="font-serif text-lg text-neutral-900 dark:text-white leading-tight">
                    {roomToBook.roomType}
                  </h3>
                  <p className="text-sm font-medium text-neutral-500 mt-1">
                    ₹{roomToBook.pricePerNight}{" "}
                    <span className="font-light">/ night</span>
                  </p>
                </div>
              </div>

              {/* Date Pickers */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">
                    Check-in
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={checkIn}
                      onChange={(date) => {
                        setCheckIn(date);
                        if (checkOut && date >= checkOut) setCheckOut(null);
                      }}
                      selectsStart
                      startDate={checkIn}
                      endDate={checkOut}
                      minDate={today}
                      filterDate={(date) => {
                        const { bookedDates, pendingDates, tempDates } =
                          getBlockedDateRanges(roomToBook._id);
                        const dStr = date.toDateString();
                        return (
                          !bookedDates.includes(dStr) &&
                          !pendingDates.includes(dStr) &&
                          !tempDates.includes(dStr)
                        );
                      }}
                      dayClassName={(date) => {
                        const { bookedDates, pendingDates, tempDates } =
                          getBlockedDateRanges(roomToBook._id);
                        const dStr = date.toDateString();
                        if (pendingDates.includes(dStr))
                          return "react-datepicker__day--pending-disabled";
                        if (tempDates.includes(dStr))
                          return "react-datepicker__day--temp-disabled";
                        if (bookedDates.includes(dStr))
                          return "react-datepicker__day--booked-disabled";
                        return undefined;
                      }}
                      placeholderText="Select Date"
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 text-sm font-medium outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">
                    Check-out
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={checkOut}
                      onChange={(date) => setCheckOut(date)}
                      selectsEnd
                      startDate={checkIn}
                      endDate={checkOut}
                      minDate={
                        checkIn ? new Date(checkIn.getTime() + 86400000) : today
                      }
                      filterDate={(date) => {
                        const { bookedDates, pendingDates, tempDates } =
                          getBlockedDateRanges(roomToBook._id);
                        const dStr = date.toDateString();
                        if (
                          bookedDates.includes(dStr) ||
                          pendingDates.includes(dStr) ||
                          tempDates.includes(dStr)
                        )
                          return false;
                        if (!checkIn) return true;
                        return !bookedDates
                          .concat(pendingDates, tempDates)
                          .some((bStr) => {
                            const bDate = new Date(bStr);
                            return bDate > checkIn && bDate <= date;
                          });
                      }}
                      dayClassName={(date) => {
                        const { bookedDates, pendingDates, tempDates } =
                          getBlockedDateRanges(roomToBook._id);
                        const dStr = date.toDateString();
                        if (pendingDates.includes(dStr))
                          return "react-datepicker__day--pending-disabled";
                        if (tempDates.includes(dStr))
                          return "react-datepicker__day--temp-disabled";
                        if (bookedDates.includes(dStr))
                          return "react-datepicker__day--booked-disabled";
                        return undefined;
                      }}
                      placeholderText="Select Date"
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 text-sm font-medium outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Coupon Section */}
              {totalDays > 0 && (
                <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-3">
                    Offers & Promos
                  </label>
                  {coupons.length === 0 ? (
                    <p className="text-sm font-light text-neutral-400 italic">
                      No promotions available for these dates.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-200">
                      {coupons.map((coupon) => {
                        const isEligible =
                          Number(basePrice) >= Number(coupon.minPrice);
                        return (
                          <div
                            key={coupon._id}
                            className={`flex justify-between items-center p-4 rounded-xl border ${
                              isEligible
                                ? "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                : "border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 opacity-60"
                            }`}
                          >
                            <div>
                              <span className="font-bold font-mono text-sm tracking-wide text-neutral-900 dark:text-white">
                                {coupon.code}
                              </span>
                              <p className="text-[11px] font-medium text-neutral-500 mt-0.5">
                                {coupon.discount}% OFF (Min spend: ₹
                                {coupon.minPrice})
                              </p>
                            </div>
                            <button
                              onClick={() => setAppliedCoupon(coupon)}
                              disabled={
                                !isEligible || appliedCoupon?._id === coupon._id
                              }
                              className={`text-xs px-4 py-2 rounded-lg font-bold uppercase tracking-wider transition-colors ${
                                !isEligible
                                  ? "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 cursor-not-allowed"
                                  : appliedCoupon?._id === coupon._id
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-neutral-900 text-white dark:bg-white dark:text-black hover:opacity-80"
                              }`}
                            >
                              {!isEligible
                                ? "Locked"
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
                <div className="bg-neutral-50 dark:bg-neutral-950 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800 space-y-4">
                  <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                    <span className="font-light">
                      Base Rate ({totalDays} nights)
                    </span>
                    <span className="font-medium text-neutral-900 dark:text-white">
                      ₹{basePrice}
                    </span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400 font-medium">
                      <span>Promo Discount</span>
                      <span>- ₹{discountAmount}</span>
                    </div>
                  )}

                  <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 flex justify-between items-end">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                      Total Payable
                    </span>
                    <span className="font-serif text-2xl text-neutral-900 dark:text-white">
                      ₹{finalPrice}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 lg:px-8 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={handleConfirmBooking}
                disabled={totalDays <= 0 || bookingLoading}
                className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-4 rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {bookingLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 dark:border-black/20 border-t-white dark:border-t-black rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  "Confirm Reservation"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelDetails;
