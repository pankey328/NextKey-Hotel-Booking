import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../api";
import {
  FunnelIcon,
  MapPinIcon,
  StarIcon as StarOutline,
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

  const fetchHotels = async (currentFilters = filters) => {
    setLoading(true);

    try {
      let url = "/search/hotels?";

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
    } catch (error) {
      console.error("Error fetching hotels", error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useDebounce(filters.search, 1000);

  useEffect(() => {
    fetchHotels();
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
    fetchHotels();
    if (window.innerWidth < 1024) setShowMobileFilters(false);
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] dark:bg-neutral-950 transition-colors duration-500 font-sans text-neutral-900 dark:text-neutral-100 pt-10 sm:pt-12 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto mb-10 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <h1 className="text-4xl md:text-5xl font-serif tracking-tight mb-2 text-neutral-900 dark:text-white">
          Curated Stays
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm md:text-base">
          Refine your search to find the perfect luxury experience.
        </p>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* MOBILE FILTER TOGGLE  */}
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="lg:hidden w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 py-4 px-6 rounded-2xl flex items-center justify-between text-neutral-900 dark:text-white font-medium shadow-sm transition-active active:scale-95"
        >
          <div className="flex items-center gap-3">
            <FunnelIcon className="w-5 h-5" />
            <span>
              {showMobileFilters ? "Hide Filters" : "Filter Properties"}
            </span>
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-neutral-400">
            {hotels.length} Found
          </div>
        </button>

        {/* SIDEBAR FILTERS */}
        <aside
          className={`${
            showMobileFilters ? "block" : "hidden"
          } lg:block w-full lg:w-[320px] flex-shrink-0`}
        >
          <div className="bg-white dark:bg-neutral-900/50 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/20 border border-neutral-100 dark:border-neutral-800 lg:sticky lg:top-28 transition-colors duration-500">
            <h2 className="hidden lg:block text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-8">
              Search Parameters
            </h2>

            <form onSubmit={handleApplyFilters} className="space-y-8">
              {/* Search Box */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
                  Property Name
                </label>
                <input
                  type="text"
                  name="search"
                  placeholder="e.g. The Grand Plaza"
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 text-sm outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors dark:text-white placeholder-neutral-400"
                />
              </div>

              {/* LOCATION FILTERS */}
              <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
                  Location
                </label>
                <select
                  name="stateId"
                  value={filters.stateId}
                  onChange={handleFilterChange}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 text-sm outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors appearance-none cursor-pointer"
                >
                  <option value="">All States</option>
                  {statesList.map((state) => (
                    <option key={state._id} value={state._id}>
                      {state.name}
                    </option>
                  ))}
                </select>

                <select
                  name="districtId"
                  value={filters.districtId}
                  onChange={handleFilterChange}
                  disabled={!filters.stateId}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 text-sm outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">All Districts</option>
                  {districtsList.map((district) => (
                    <option key={district._id} value={district._id}>
                      {district.name}
                    </option>
                  ))}
                </select>

                <select
                  name="cityId"
                  value={filters.cityId}
                  onChange={handleFilterChange}
                  disabled={!filters.districtId}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 text-sm outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">All Cities</option>
                  {citiesList.map((city) => (
                    <option key={city._id} value={city._id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hotel Attributes */}
              <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
                    Property Type
                  </label>
                  <select
                    name="hotelType"
                    value={filters.hotelType}
                    onChange={handleFilterChange}
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 text-sm outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">All Types</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Resort">Resort</option>
                    <option value="Villa">Villa</option>
                    <option value="Hostel">Hostel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
                    Class
                  </label>
                  <select
                    name="starRating"
                    value={filters.starRating}
                    onChange={handleFilterChange}
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 text-sm outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors appearance-none cursor-pointer"
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
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-4">
                  Amenities
                </label>
                <div className="space-y-3 max-h-56 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
                  {hotelFeaturesList.map((feature) => (
                    <label
                      key={feature}
                      className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer group"
                    >
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={filters.features.includes(feature)}
                          onChange={() => handleFeatureChange(feature)}
                          className="peer appearance-none w-5 h-5 border border-neutral-300 dark:border-neutral-700 rounded-md bg-neutral-50 dark:bg-neutral-900 checked:bg-black dark:checked:bg-white checked:border-black dark:checked:border-white transition-colors cursor-pointer"
                        />
                        <svg
                          className="absolute w-3 h-3 text-white dark:text-black opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
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
                  className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-4 rounded-xl transition-transform active:scale-95 shadow-lg"
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={() => {
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
                    fetchHotels(resetFilters);
                  }}
                  className="w-full bg-transparent border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300 font-semibold py-4 rounded-xl transition-colors"
                >
                  Reset All
                </button>
              </div>
            </form>
          </div>
        </aside>

        {/* MAIN CONTENT (HOTEL GRID) */}
        <main className="w-full lg:flex-1">
          <div className="hidden lg:flex items-center justify-between mb-8">
            <h2 className="text-2xl font-serif text-neutral-900 dark:text-white">
              {hotels.length}{" "}
              <span className="italic font-light text-neutral-500">
                Properties Available
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="flex space-x-2 justify-center items-center py-32 h-[50vh]">
              <div className="w-3 h-3 bg-neutral-300 dark:bg-neutral-700 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-3 h-3 bg-neutral-300 dark:bg-neutral-700 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-3 h-3 bg-neutral-300 dark:bg-neutral-700 rounded-full animate-bounce"></div>
            </div>
          ) : hotels.length === 0 ? (
            <div className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm p-16 text-center rounded-3xl border border-neutral-100 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors duration-300 mt-8">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPinIcon className="w-8 h-8 text-neutral-400" />
              </div>
              <p className="text-2xl font-serif text-neutral-900 dark:text-white mb-2">
                No properties found
              </p>
              <p className="font-light text-sm">
                We couldn't find any stays matching your current filters.
                <br />
                Try broadening your search.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              {hotels.map((hotel) => (
                <div
                  key={hotel._id}
                  className="group bg-white dark:bg-neutral-900 rounded-[2rem] border border-neutral-100 dark:border-neutral-800 overflow-hidden hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/40 transition-all duration-500 flex flex-col"
                >
                  {/* Image Section */}
                  <div className="relative h-[240px] md:h-[280px] w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <img
                      src={
                        hotel.imageUrl ||
                        "https://via.placeholder.com/800x600?text=No+Image"
                      }
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                    />

                    {/* Star Badge */}
                    <div className="absolute top-4 right-4 bg-white/70 dark:bg-black/50 backdrop-blur-md text-neutral-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 border border-white/20">
                      <span>{hotel.starRating}</span>
                      <StarSolid className="w-3.5 h-3.5 text-yellow-500" />
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 md:p-8 flex-1 flex flex-col">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2">
                      {hotel.hotelType}
                    </div>

                    <h3 className="text-2xl font-serif text-neutral-900 dark:text-white mb-3 line-clamp-1 leading-tight">
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
                      <div className="flex flex-wrap gap-2 mb-6">
                        {hotel.features.slice(0, 3).map((f, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-medium tracking-wide uppercase bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 px-2.5 py-1 rounded-md"
                          >
                            {f}
                          </span>
                        ))}
                        {hotel.features.length > 3 && (
                          <span className="text-[10px] font-medium tracking-wide uppercase bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 px-2.5 py-1 rounded-md">
                            +{hotel.features.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-auto pt-6 border-t border-neutral-100 dark:border-neutral-800">
                      <Link
                        to={`/hotel/${hotel._id}`}
                        className="block w-full text-center bg-neutral-50 hover:bg-black dark:bg-neutral-800 dark:hover:bg-white text-black hover:text-white dark:text-white dark:hover:text-black border border-neutral-200 dark:border-neutral-700 hover:border-transparent py-3.5 rounded-xl font-semibold transition-all duration-300"
                      >
                        View Property
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchHotels;
