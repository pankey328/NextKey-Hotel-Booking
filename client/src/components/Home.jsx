import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import {
  MapPinIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  CurrencyRupeeIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?location=${searchTerm}`);
    }
  };

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get("/search/hotels");
        setFeaturedHotels(res.data.data.slice(0, 3));
      } catch (error) {
        console.log("Error fetching featured hotels", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-[#fdfdfd] dark:bg-neutral-950 transition-colors duration-500 font-sans text-neutral-900 dark:text-neutral-100">
      {/* HERO SECTION */}
      <section className="relative w-full h-[75vh] min-h-[600px] flex flex-col items-center justify-center">
        <div className="absolute inset-0 overflow-hidden bg-neutral-900">
          <img
            src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=3400&auto=format&fit=crop"
            alt="Luxury Coastal Pool"
            className="w-full h-full object-cover scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-[#fdfdfd] dark:to-neutral-950 transition-colors duration-500"></div>
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 text-center mt-[-10vh]">
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-6 tracking-tight drop-shadow-lg leading-tight">
            Find the perfect stay. <br />
            <span className="italic font-light text-white/80">Anywhere.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-light drop-shadow-md max-w-2xl mx-auto mb-10">
            Exclusive access to a curated collection of luxury hotels, private
            villas, and bespoke boutique experiences.
          </p>
        </div>
      </section>

      {/* SEARCH */}
      <section className="relative z-20 w-full max-w-4xl mx-auto px-4 sm:px-6 -mt-16 sm:-mt-24 mb-16">
        <form
          onSubmit={handleSearch}
          className="w-full flex flex-col sm:flex-row items-center bg-white/30 dark:bg-neutral-900/30 backdrop-blur-2xl p-2 sm:p-3 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/10 dark:shadow-black/40 border border-white/40 dark:border-neutral-700/50 gap-2 sm:gap-3 transition-all"
        >
          <div className="w-full flex-1 flex items-center bg-white/70 dark:bg-black/50 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border border-white/50 dark:border-neutral-600/30 focus-within:bg-white/95 dark:focus-within:bg-black/70 transition-colors cursor-text shadow-sm">
            <MapPinIcon className="w-6 h-6 text-neutral-600 dark:text-neutral-400 mr-3 sm:mr-4 flex-shrink-0" />
            <div className="flex flex-col w-full text-left">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-0.5">
                Destination
              </label>
              <input
                type="text"
                placeholder="Where do you want to go?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none text-base sm:text-lg font-medium"
              />
            </div>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="w-full sm:w-auto bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 px-8 py-4 sm:py-0 sm:h-full sm:min-h-[76px] rounded-xl sm:rounded-2xl font-semibold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md flex-shrink-0"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
            <span className="text-base sm:text-lg">Search Stays</span>
          </button>
        </form>
      </section>

      {/* TRUST INDICATORS*/}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 mb-24">
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-70">
          <div className="flex items-center gap-3">
            <CurrencyRupeeIcon className="w-5 h-5" />
            <span className="text-sm font-medium tracking-wide">
              Best Price Guarantee
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="w-5 h-5" />
            <span className="text-sm font-medium tracking-wide">
              Flexible Booking
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ClockIcon className="w-5 h-5" />
            <span className="text-sm font-medium tracking-wide">
              24/7 Concierge
            </span>
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-32">
        <div className="flex items-end justify-between mb-10 border-b border-neutral-200 dark:border-neutral-800 pb-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-serif tracking-tight mb-2">
              The Collection
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm md:text-base">
              Handpicked destinations for the discerning traveler.
            </p>
          </div>
          <Link
            to="/search"
            className="hidden sm:flex items-center text-sm font-semibold uppercase tracking-widest group hover:opacity-70 transition-opacity"
          >
            View All
            <ArrowRightIcon className="w-4 h-4 ml-2 transform group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="flex space-x-2 justify-center py-32">
            <div className="w-3 h-3 bg-neutral-300 dark:bg-neutral-700 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-3 h-3 bg-neutral-300 dark:bg-neutral-700 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-3 h-3 bg-neutral-300 dark:bg-neutral-700 rounded-full animate-bounce"></div>
          </div>
        ) : featuredHotels.length === 0 ? (
          <div className="text-center py-32 text-neutral-500 font-medium">
            No properties featured at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* LARGE LEFT CARD */}
            {featuredHotels[0] && (
              <Link
                to={`/hotel/${featuredHotels[0]._id}`}
                className="col-span-1 md:col-span-8 group relative overflow-hidden rounded-2xl h-[500px] md:h-[600px] bg-neutral-100 dark:bg-neutral-900"
              >
                <img
                  src={
                    featuredHotels[0].imageUrl ||
                    "https://via.placeholder.com/1200x800"
                  }
                  alt={featuredHotels[0].name}
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-12">
                  <div className="text-xs font-bold uppercase tracking-widest text-white/80 mb-3">
                    {featuredHotels[0].cityId?.name || "Featured Destination"}
                  </div>
                  <h3 className="text-white font-serif text-4xl md:text-5xl mb-4 leading-tight">
                    {featuredHotels[0].name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm font-medium text-white group-hover:gap-4 transition-all duration-300">
                    Explore Property <ArrowRightIcon className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            )}

            {/* SMALL CARDS CONTAINER */}
            <div className="col-span-1 md:col-span-4 flex flex-col gap-6">
              {/* TOP RIGHT CARD */}
              {featuredHotels[1] && (
                <Link
                  to={`/hotel/${featuredHotels[1]._id}`}
                  className="group relative overflow-hidden rounded-2xl h-[240px] md:h-[288px] bg-neutral-100 dark:bg-neutral-900 flex-1"
                >
                  <img
                    src={
                      featuredHotels[1].imageUrl ||
                      "https://via.placeholder.com/800x600"
                    }
                    alt={featuredHotels[1].name}
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-1000 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-1">
                      {featuredHotels[1].cityId?.name || "Featured"}
                    </div>
                    <h3 className="text-white font-serif text-2xl mb-2">
                      {featuredHotels[1].name}
                    </h3>
                  </div>
                </Link>
              )}

              {/* BOTTOM RIGHT CARD */}
              {featuredHotels[2] && (
                <Link
                  to={`/hotel/${featuredHotels[2]._id}`}
                  className="group relative overflow-hidden rounded-2xl h-[240px] md:h-[288px] bg-neutral-100 dark:bg-neutral-900 flex-1"
                >
                  <img
                    src={
                      featuredHotels[2].imageUrl ||
                      "https://via.placeholder.com/800x600"
                    }
                    alt={featuredHotels[2].name}
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-1000 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-1">
                      {featuredHotels[2].cityId?.name || "Featured"}
                    </div>
                    <h3 className="text-white font-serif text-2xl mb-2">
                      {featuredHotels[2].name}
                    </h3>
                  </div>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Mobile View All Button */}
        <div className="mt-10 text-center sm:hidden">
          <Link
            to="/search"
            className="inline-block bg-black dark:bg-white text-white dark:text-black font-semibold px-8 py-4 rounded-xl w-full shadow-lg active:scale-95 transition-transform"
          >
            Explore All Properties
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
