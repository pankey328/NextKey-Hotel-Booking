import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../api";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import {
  FunnelIcon,
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import useDebounce from "../hooks/useDebounce";

const hotelFeaturesList = [
  "Parking",
  "Elevator",
  "Luggage Storage",
  "Restaurant",
  "Cafe",
  "Bar",
  "Gym",
  "Swimming Pool",
  "EV Charging Station",
  "Garden",
  "Terrace",
  "Laundry Service",
];

const SearchHotels = () => {
  const location = useLocation();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    stateId: "",
    districtId: "",
    cityId: "",
    starRating: "",
    hotelType: "",
    features: [],
  });

  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await api.get("/states");
        setStatesList(res.data.data || []);
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };
    fetchStates();
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (!filters.stateId) {
        setDistrictsList([]);
        return;
      }
      try {
        const res = await api.get(
          `/districts?stateId=${filters.stateId}&isDeleted=false`,
        );
        setDistrictsList(res.data.data || []);
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    };
    fetchDistricts();
  }, [filters.stateId]);

  useEffect(() => {
    const fetchCities = async () => {
      if (!filters.districtId) {
        setCitiesList([]);
        return;
      }
      try {
        const res = await api.get(
          `/cities?stateId=${filters.stateId}&districtId=${filters.districtId}&isDeleted=false`,
        );
        setCitiesList(res.data.data || []);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };
    fetchCities();
  }, [filters.districtId]);

  const fetchHotels = async (
    currentFilters = filters,
    page = 1,
    limit = itemsPerPage,
  ) => {
    setLoading(true);

    try {
      let url = `/search/hotels?page=${page}&limit=${limit}&`;

      if (currentFilters.search) url += `search=${currentFilters.search}&`;
      if (currentFilters.stateId) url += `stateId=${currentFilters.stateId}&`;
      if (currentFilters.districtId)
        url += `districtId=${currentFilters.districtId}&`;
      if (currentFilters.cityId) url += `cityId=${currentFilters.cityId}&`;
      if (currentFilters.starRating)
        url += `starRating=${currentFilters.starRating}&`;
      if (currentFilters.hotelType)
        url += `hotelType=${currentFilters.hotelType}&`;

      if (currentFilters.features && currentFilters.features.length > 0) {
        url += `features=${currentFilters.features.join(",")}&`;
      }

      const res = await api.get(url);
      setHotels(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching hotels", error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useDebounce(filters.search, 1000);

  useEffect(() => {
    setCurrentPage(1);
    fetchHotels(filters, 1, itemsPerPage);
  }, [debouncedSearch]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    if (name === "stateId") {
      setFilters({ ...filters, stateId: value, districtId: "", cityId: "" });
    } else if (name === "districtId") {
      setFilters({ ...filters, districtId: value, cityId: "" });
    } else {
      setFilters({ ...filters, [name]: value });
    }
  };

  const handleFeatureChange = (feature) => {
    let features = [...filters.features];

    if (features.includes(feature)) {
      features = features.filter((item) => item !== feature);
    } else {
      features.push(feature);
    }

    setFilters({ ...filters, features });
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchHotels(filters, 1, itemsPerPage);
    if (window.innerWidth < 1024) setShowMobileFilters(false);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchHotels(filters, newPage, itemsPerPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleItemsPerPageChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setItemsPerPage(newLimit);
    setCurrentPage(1);
    fetchHotels(filters, 1, newLimit);
  };

  const openHotelModal = (id) => {
    const hotelData = hotels.find((h) => h._id === id);
    if (hotelData) {
      setSelectedHotel(hotelData);
      setIsModalOpen(true);
    }
  };

  const handleResetFilters = () => {
    const resetFilters = {
      search: "",
      stateId: "",
      districtId: "",
      cityId: "",
      starRating: "",
      hotelType: "",
      features: [],
    };
    setFilters(resetFilters);
    setCurrentPage(1);
    fetchHotels(resetFilters, 1, itemsPerPage);
  };

  return (
    <div className="relative min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-500 font-sans text-neutral-900 dark:text-neutral-100 pt-8 sm:pt-12 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full -z-10"></div>
      </div>

      {/* Page Header */}
      <div className="max-w-7xl mx-auto mb-8 relative z-10 text-center lg:text-left">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-2 text-neutral-900 dark:text-white">
          Curated Stays
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm md:text-base font-light">
          Refine your search to find the perfect luxury experience.
        </p>
      </div>

      {/* MOBILE */}
      <div className="max-w-7xl mx-auto lg:hidden flex flex-col gap-4 mb-8 relative z-20">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="w-5 h-5 text-neutral-400" />
          </div>
          <input
            type="text"
            name="search"
            placeholder="Search by hotel name or keyword..."
            value={filters.search}
            onChange={handleFilterChange}
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl py-4 pl-11 pr-4 text-sm font-medium outline-none focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors shadow-sm dark:text-white placeholder-neutral-400"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-neutral-900 dark:text-white font-semibold shadow-sm transition-transform active:scale-[0.98]"
          >
            <FunnelIcon className="w-5 h-5" />
            <span>{showMobileFilters ? "Hide" : "Filters"}</span>
          </button>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 py-3.5 px-4 rounded-2xl flex items-center shadow-sm">
            <span className="text-xs text-neutral-500 mr-2 font-bold uppercase tracking-wide">
              Show
            </span>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="bg-transparent text-sm font-bold text-neutral-900 dark:text-white outline-none cursor-pointer"
            >
              <option value={3}>3</option>
              <option value={6}>6</option>
              <option value={12}>12</option>
            </select>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-8 lg:gap-10 border-t border-neutral-100 dark:border-neutral-800 lg:border-none lg:pt-0 pt-6">
        {/* SIDEBAR FILTERS */}
        <aside
          className={`${
            showMobileFilters ? "block" : "hidden"
          } lg:block w-full lg:w-[300px] xl:w-[320px] flex-shrink-0 lg:sticky lg:top-28 self-start max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800 pr-2 pb-4`}
        >
          <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-neutral-100 dark:border-neutral-800 transition-colors duration-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-white">
                Filters
              </h2>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                Clear All
              </button>
            </div>

            <form onSubmit={handleApplyFilters} className="space-y-6">
              {/* LOCATION FILTERS */}
              <div className="space-y-4">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2 ml-1">
                  Location
                </label>
                <select
                  name="stateId"
                  value={filters.stateId}
                  onChange={handleFilterChange}
                  className="w-full bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 text-sm font-medium outline-none focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors appearance-none cursor-pointer"
                >
                  <option value="">All States</option>
                  {statesList.map((state) => (
                    <option key={state._id} value={state._id}>
                      {state.name?.toUpperCase()}
                    </option>
                  ))}
                </select>

                <select
                  name="districtId"
                  value={filters.districtId}
                  onChange={handleFilterChange}
                  disabled={!filters.stateId}
                  className="w-full bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 text-sm font-medium outline-none focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">All Districts</option>
                  {districtsList.map((district) => (
                    <option key={district._id} value={district._id}>
                      {district.name?.toUpperCase()}
                    </option>
                  ))}
                </select>

                <select
                  name="cityId"
                  value={filters.cityId}
                  onChange={handleFilterChange}
                  disabled={!filters.districtId}
                  className="w-full bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 text-sm font-medium outline-none focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">All Cities</option>
                  {citiesList.map((city) => (
                    <option key={city._id} value={city._id}>
                      {city.name?.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hotel Attributes */}
              <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2 ml-1">
                    Property Type
                  </label>
                  <select
                    name="hotelType"
                    value={filters.hotelType}
                    onChange={handleFilterChange}
                    className="w-full bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 text-sm font-medium outline-none focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">All Types</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Resort">Resort</option>
                    <option value="Villa">Villa</option>
                    <option value="Hostel">Hostel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2 ml-1">
                    Class
                  </label>
                  <select
                    name="starRating"
                    value={filters.starRating}
                    onChange={handleFilterChange}
                    className="w-full bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 text-sm font-medium outline-none focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Any Rating</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                  </select>
                </div>
              </div>

              {/* Hotel Features */}
              <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-4 ml-1">
                  Amenities
                </label>
                <div className="space-y-3 max-h-56 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
                  {hotelFeaturesList.map((feature) => (
                    <label
                      key={feature}
                      className="flex items-center gap-3 text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer group"
                    >
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={filters.features.includes(feature)}
                          onChange={() => handleFeatureChange(feature)}
                          className="peer appearance-none w-5 h-5 border border-neutral-300 dark:border-neutral-700 rounded-md bg-neutral-50 dark:bg-neutral-900/50 checked:bg-black dark:checked:bg-white checked:border-black dark:checked:border-white transition-colors cursor-pointer"
                        />
                        <svg
                          className="absolute w-3 h-3 text-white dark:text-black opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity stroke-[3]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <span className="group-hover:text-black dark:group-hover:text-white transition-colors">
                        {feature}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col gap-3">
                <button
                  type="submit"
                  className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-3.5 rounded-xl transition-all hover:opacity-90 active:scale-[0.98] shadow-md"
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="w-full bg-transparent border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 text-neutral-700 dark:text-neutral-300 font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.98]"
                >
                  Reset All
                </button>
              </div>
            </form>
          </div>
        </aside>

        {/* MAIN CONTENT (SEARCH & GRID) */}
        <main className="w-full lg:flex-1 flex flex-col">
          {/* DESKTOP ONLY: Global Search Bar */}
          <div className="hidden lg:block relative mb-8">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="w-5 h-5 text-neutral-400" />
            </div>
            <input
              type="text"
              name="search"
              placeholder="Search by hotel name or keyword..."
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors shadow-sm dark:text-white placeholder-neutral-400"
            />
          </div>

          <div className="hidden lg:flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {hotels.length}{" "}
              <span className="font-medium text-neutral-500">
                Properties Available
              </span>
            </h2>

            {/* Desktop Display Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                Show per page
              </span>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm font-bold text-neutral-900 dark:text-white rounded-lg px-3 py-1.5 outline-none cursor-pointer focus:border-neutral-400 dark:focus:border-neutral-500"
              >
                <option value={3}>3</option>
                <option value={6}>6</option>
                <option value={12}>12</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex space-x-2 justify-center items-center py-32 h-[50vh]">
              <div className="w-3 h-3 bg-neutral-300 dark:bg-neutral-700 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-3 h-3 bg-neutral-300 dark:bg-neutral-700 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-3 h-3 bg-neutral-300 dark:bg-neutral-700 rounded-full animate-bounce"></div>
            </div>
          ) : hotels.length === 0 ? (
            <div className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md p-16 text-center rounded-[2rem] border border-neutral-100 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors duration-300 mt-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
              <div className="w-16 h-16 bg-neutral-50 dark:bg-neutral-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-neutral-200 dark:border-neutral-800">
                <MapPinIcon className="w-8 h-8 text-neutral-400" />
              </div>
              <p className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white mb-2">
                No properties found
              </p>
              <p className="font-light text-sm max-w-sm mx-auto">
                We couldn't find any stays matching your current filters. Try
                broadening your search or resetting parameters.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6 lg:gap-8 mb-10">
                {hotels.map((hotel) => (
                  <div
                    key={hotel._id}
                    className="group bg-white dark:bg-neutral-900/80 backdrop-blur-xl rounded-[2rem] border border-neutral-100 dark:border-neutral-800 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-xl dark:hover:shadow-black/50 transition-all duration-500 flex flex-col"
                  >
                    {/* Image Section (Clickable Quick View) */}
                    <div
                      className="relative h-[240px] md:h-[260px] w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden cursor-pointer group/image"
                      onClick={() => openHotelModal(hotel._id)}
                    >
                      <LazyLoadImage
                        src={
                          hotel.imageUrl ||
                          "https://via.placeholder.com/800x600?text=No+Image"
                        }
                        alt={hotel.name}
                        effect="blur"
                        wrapperClassName="w-full h-full block"
                        className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-700 ease-out"
                      />

                      {/* Quick View Hover Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors duration-300 flex items-center justify-center pointer-events-none">
                        <div className="bg-white/95 text-black px-5 py-2.5 rounded-full font-bold text-xs opacity-0 group-hover/image:opacity-100 transition-all duration-300 translate-y-4 group-hover/image:translate-y-0 shadow-lg tracking-wide uppercase">
                          Quick View
                        </div>
                      </div>

                      {/* Star Badge */}
                      <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/70 backdrop-blur-md text-neutral-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 border border-white/20 pointer-events-none">
                        <span>{hotel.starRating}</span>
                        <StarSolid className="w-3.5 h-3.5 text-yellow-500" />
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
                        {hotel.hotelType}
                      </div>

                      <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white mb-2.5 line-clamp-1 leading-tight">
                        {hotel.name}
                      </h3>

                      <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400 mb-4 gap-1.5 font-medium">
                        <MapPinIcon className="w-4 h-4" />
                        {hotel.cityId?.name}, {hotel.stateId?.name}
                      </div>

                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 line-clamp-2 font-light leading-relaxed">
                        {hotel.description}
                      </p>

                      {/* Features Pills */}
                      {hotel.features && hotel.features.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                          {hotel.features.slice(0, 3).map((f, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-bold tracking-wide uppercase bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 px-2.5 py-1 rounded-md"
                            >
                              {f}
                            </span>
                          ))}
                          {hotel.features.length > 3 && (
                            <span className="text-[10px] font-bold tracking-wide uppercase bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 px-2.5 py-1 rounded-md">
                              +{hotel.features.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="pt-5 border-t border-neutral-100 dark:border-neutral-800">
                        <Link
                          to={`/hotel/${hotel._id}`}
                          className="block w-full text-center bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] hover:opacity-90 shadow-md text-sm"
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-auto pt-6 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeftIcon className="w-4 h-4" /> Previous
                  </button>

                  <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    Page{" "}
                    <span className="text-neutral-900 dark:text-white font-bold">
                      {currentPage}
                    </span>{" "}
                    of {totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* INSTANT QUICK VIEW MODAL */}
      {isModalOpen && selectedHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-neutral-900 rounded-[2rem] shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black backdrop-blur-md rounded-full text-neutral-900 dark:text-white transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 flex-1">
              {/* Modal Header Image */}
              <div className="h-64 w-full relative bg-neutral-200 dark:bg-neutral-800">
                <LazyLoadImage
                  src={
                    selectedHotel.imageUrl ||
                    "https://via.placeholder.com/800x600?text=No+Image"
                  }
                  alt={selectedHotel.name}
                  effect="blur"
                  wrapperClassName="w-full h-full block"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
                <div className="absolute bottom-6 left-6 text-white pointer-events-none">
                  <div className="text-xs font-bold uppercase tracking-widest text-neutral-300 mb-2">
                    {selectedHotel.hotelType}
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight mb-2">
                    {selectedHotel.name}
                  </h2>
                  <div className="flex items-center text-sm gap-1.5 font-medium">
                    <MapPinIcon className="w-4 h-4" />
                    {selectedHotel.cityId?.name}, {selectedHotel.stateId?.name}
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-neutral-100 dark:border-neutral-800">
                  <div>
                    <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-bold">
                      <span>Class:</span>
                      <span>{selectedHotel.starRating}</span>
                      <StarSolid className="w-4 h-4 text-yellow-500" />
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white mb-3">
                  About this property
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-8">
                  {selectedHotel.description}
                </p>

                <h3 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white mb-4">
                  Amenities
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                  {selectedHotel.features?.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      {f}
                    </div>
                  ))}
                </div>

                <Link
                  to={`/hotel/${selectedHotel._id}`}
                  className="block w-full text-center bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold transition-all active:scale-[0.98] hover:opacity-90 shadow-lg"
                >
                  View Available Rooms & Book
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchHotels;
