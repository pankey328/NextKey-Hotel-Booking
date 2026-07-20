import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search`);
  };

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get("/search/hotels");
        setFeaturedHotels(res.data.data.slice(0, 3));
      } catch (error) {
        console.error("Error fetching featured hotels", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans">
      {/* 1. HERO SECTION & SEARCH BAR */}
      <section className="relative w-full h-[500px] flex items-center justify-center">
        {/* Background Image/Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-800 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
          {/* Optional: Add a subtle background image here with low opacity */}
          <img
            src="https://media.istockphoto.com/id/2110310187/photo/luxury-tropical-pool-villa-at-dusk.jpg?s=612x612&w=0&k=20&c=r8UTpMnbLWD_DOKHAcu6dw-MJEcGg0CTqt0ICa84D84="
            alt="Luxury Hotel"
            className="w-full h-full object-cover opacity-20 mix-blend-overlay"
          />
        </div>

        <div className="relative z-10 w-full max-w-4xl px-4 sm:px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-md tracking-tight">
            Find Your Perfect Stay
          </h1>
          <p className="text-lg md:text-xl text-blue-100 dark:text-gray-300 mb-10 drop-shadow">
            Discover luxury hotels, cozy villas, and resorts at the best prices.
          </p>

          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3 bg-white/10 dark:bg-black/20 p-3 rounded-2xl backdrop-blur-md shadow-lg"
          >
            <div className="flex-1 relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-gray-500 text-xl">
                📍
              </span>
              <input
                type="text"
                placeholder="e.g., Jaipur, Resort, or Hotel Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-xl text-gray-800 text-lg outline-none border-2 border-transparent focus:border-blue-500 transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-md transition-transform active:scale-95"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* 2. FEATURED PROPERTIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Featured Properties
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Top-rated stays highly recommended by our guests.
            </p>
          </div>
          <Link
            to="/search"
            className="hidden sm:inline-block text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            View All &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <p className="text-gray-500 text-lg font-medium">
              Loading amazing properties...
            </p>
          </div>
        ) : featuredHotels.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No properties featured at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredHotels.map((hotel) => (
              <Link
                to={`/hotel/${hotel._id}`}
                key={hotel._id}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 block"
              >
                {/* Image */}
                <div className="h-56 bg-gray-200 overflow-hidden relative">
                  <img
                    src={
                      hotel.imageUrl ||
                      "https://via.placeholder.com/400x250?text=No+Image"
                    }
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur text-gray-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    {hotel.starRating} ★
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1 truncate">
                    {hotel.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    📍 {hotel.cityId?.name || "City"},{" "}
                    {hotel.stateId?.name || "State"}
                  </p>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg">
                      {hotel.hotelType}
                    </span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 transition-colors">
                      View Details &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Mobile View All Button */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/search"
            className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white font-medium px-6 py-3 rounded-lg w-full"
          >
            View All Properties
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
