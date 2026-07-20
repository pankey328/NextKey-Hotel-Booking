import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../api";

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

  useEffect(() => {
    fetchHotels();
  }, []);

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
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300 min-h-screen py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        {/* SIDEBAR FILTERS */}
        <aside className="w-full md:w-1/4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit sticky top-6 transition-colors duration-300 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
            Filter Properties
          </h2>

          <form onSubmit={handleApplyFilters} className="space-y-5">
            {/* Search Box */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search Name
              </label>
              <input
                type="text"
                name="search"
                placeholder="Hotel name..."
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>

            {/* LOCATION FILTERS */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                Location
              </label>

              <select
                name="stateId"
                value={filters.stateId}
                onChange={handleFilterChange}
                className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white border rounded-lg p-2.5 mb-2 transition-colors"
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
                className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white border rounded-lg p-2.5 mb-2 disabled:bg-gray-100 dark:disabled:bg-gray-800 dark:disabled:text-gray-500 transition-colors"
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
                className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white border rounded-lg p-2.5 disabled:bg-gray-100 dark:disabled:bg-gray-800 dark:disabled:text-gray-500 transition-colors"
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
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Property Type
                </label>
                <select
                  name="hotelType"
                  value={filters.hotelType}
                  onChange={handleFilterChange}
                  className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white border rounded-lg p-2.5 transition-colors"
                >
                  <option value="">All Types</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Resort">Resort</option>
                  <option value="Villa">Villa</option>
                  <option value="Hostel">Hostel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Star Rating
                </label>
                <select
                  name="starRating"
                  value={filters.starRating}
                  onChange={handleFilterChange}
                  className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white border rounded-lg p-2.5 transition-colors"
                >
                  <option value="">Any Rating</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                </select>
              </div>
            </div>

            {/* Hotel Features (Checkboxes) */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Property Features
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {hotelFeaturesList.map((feature) => (
                  <label
                    key={feature}
                    className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.features.includes(feature)}
                      onChange={() => handleFeatureChange(feature)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                    />
                    {feature}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors mt-4"
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
              className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2.5 rounded-lg transition-colors"
            >
              Clear All
            </button>
          </form>
        </aside>

        {/* HOTEL GRID */}
        <main className="w-full md:w-3/4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            {hotels.length} Properties Found
          </h2>

          {loading ? (
            <div className="flex justify-center py-20 text-gray-500 dark:text-gray-400 text-xl font-medium">
              Searching for properties...
            </div>
          ) : hotels.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-12 text-center rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 transition-colors duration-300">
              <p className="text-xl font-medium mb-2">
                No properties match your filters.
              </p>
              <p>Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel) => (
                <div
                  key={hotel._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col"
                >
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 w-full overflow-hidden relative">
                    <img
                      src={
                        hotel.imageUrl ||
                        "https://via.placeholder.com/400x250?text=No+Image"
                      }
                      alt={hotel.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur text-gray-900 dark:text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                      {hotel.starRating} ★
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate mb-1">
                      {hotel.name}
                    </h3>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mb-3 font-medium">
                      {hotel.hotelType}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                      {hotel.description}
                    </p>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 flex gap-1">
                      📍 {hotel.cityId?.name}, {hotel.stateId?.name}
                    </div>

                    {hotel.features && hotel.features.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {hotel.features.slice(0, 3).map((f, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                      <Link
                        to={`/hotel/${hotel._id}`}
                        className="block w-full text-center bg-gray-900 hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors"
                      >
                        View Rooms
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
