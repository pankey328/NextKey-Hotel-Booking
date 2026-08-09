import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api"
import heroImage from "../assets/hero-bg.avif"
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css"; 

import {
  ArrowRightIcon,
  ShieldCheckIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";

const Home = () => {
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get("/search/hotels");
        setFeaturedHotels(res.data.data.slice(0, 5));
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
      <section className="relative w-full h-screen min-h-[700px] flex flex-col items-center justify-center pt-20">
        <div className="absolute inset-0 overflow-hidden bg-neutral-900">
          <img
            src={heroImage}
            alt="Luxury Coastal Pool"
            fetchpriority="high"
            className="w-full h-full object-cover scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-[#fdfdfd] dark:to-neutral-950 transition-colors duration-500"></div>
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 text-center">
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-6 tracking-tight drop-shadow-lg leading-tight">
            Find the perfect stay. <br />
            <span className="italic font-light text-white/90">Anywhere.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-light drop-shadow-md max-w-2xl mx-auto mb-10">
            Exclusive access to a curated collection of luxury hotels, private
            villas, and bespoke boutique experiences.
          </p>

          <Link
            to="/search"
            className="inline-flex items-center justify-center gap-3 bg-white/10 dark:bg-neutral-900/15 backdrop-blur-2xl text-white hover:bg-white/20 dark:hover:bg-neutral-900/30 px-10 py-5 rounded-full font-bold text-lg md:text-xl transition-all active:scale-95 shadow-2xl shadow-black/30 border border-white/30 dark:border-white/10"
          >
            Explore Stays <ArrowRightIcon className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* TRUST INDICATORS */}
      <section className="relative z-20 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-16 mb-24">
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-70">
          <div className="flex items-center gap-3">
            <CurrencyRupeeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium tracking-wide">
              Best Price Guarantee
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium tracking-wide">
              Flexible Booking
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ClockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium tracking-wide">
              24/7 Concierge
            </span>
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="flex items-end justify-between mb-10 border-b border-neutral-200 dark:border-neutral-800 pb-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-serif tracking-tight mb-2 capitalize text-neutral-900 dark:text-white">
              The Collection
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm md:text-base font-light">
              Handpicked destinations for the discerning traveler.
            </p>
          </div>
          <Link
            to="/search"
            className="hidden sm:flex items-center text-xs font-bold uppercase tracking-widest group text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            View All
            <ArrowRightIcon className="w-4 h-4 ml-2 transform group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="flex space-x-2 justify-center py-32">
            <div className="w-3 h-3 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-3 h-3 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-3 h-3 bg-neutral-400 rounded-full animate-bounce"></div>
          </div>
        ) : featuredHotels.length === 0 ? (
          <div className="text-center py-32 text-neutral-500 font-light">
            No properties featured at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* TOP ROW: Large Card (Left) */}
            {featuredHotels[0] && (
              <Link
                to={`/hotel/${featuredHotels[0]._id}`}
                className="col-span-1 md:col-span-8 group relative overflow-hidden rounded-[2rem] h-[400px] md:h-[500px] bg-neutral-100 dark:bg-neutral-900 shadow-xl border border-neutral-200/50 dark:border-neutral-800"
              >
                <LazyLoadImage
                  src={
                    featuredHotels[0].imageUrl ||
                    "https://via.placeholder.com/1200x800"
                  }
                  alt={featuredHotels[0].name}
                  effect="blur"
                  wrapperClassName="w-full h-full block"
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 pointer-events-none">
                  <div className="flex items-center justify-between w-full mb-3">
                    <div className="text-xs font-bold uppercase tracking-widest text-white/80">
                      {featuredHotels[0].cityId?.name || "Featured"}
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-bold border border-white/20">
                      <StarIcon className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      {featuredHotels[0].starRating || "4.9"}
                    </div>
                  </div>
                  <h3 className="text-white font-serif text-3xl md:text-4xl mb-2 leading-tight capitalize">
                    {featuredHotels[0].name.toLowerCase()}
                  </h3>
                </div>
              </Link>
            )}

            {/* TOP ROW: Two Stacked Cards (Right) */}
            <div className="col-span-1 md:col-span-4 flex flex-col gap-6">
              {[featuredHotels[1], featuredHotels[2]].map(
                (hotel, idx) =>
                  hotel && (
                    <Link
                      key={idx}
                      to={`/hotel/${hotel._id}`}
                      className="group relative overflow-hidden rounded-[2rem] h-[200px] md:h-[238px] bg-neutral-100 dark:bg-neutral-900 flex-1 shadow-xl border border-neutral-200/50 dark:border-neutral-800"
                    >
                      <LazyLoadImage
                        src={
                          hotel.imageUrl ||
                          "https://via.placeholder.com/800x600"
                        }
                        alt={hotel.name}
                        effect="blur"
                        wrapperClassName="w-full h-full block"
                        className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 pointer-events-none">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                            {hotel.cityId?.name || "Featured"}
                          </div>
                          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs font-bold border border-white/20">
                            <StarIcon className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            {hotel.starRating || "4.8"}
                          </div>
                        </div>
                        <h3 className="text-white font-serif text-xl mb-1 capitalize leading-tight truncate">
                          {hotel.name.toLowerCase()}
                        </h3>
                      </div>
                    </Link>
                  ),
              )}
            </div>

            {/* BOTTOM ROW: Medium Card (Left) */}
            {featuredHotels[3] && (
              <Link
                to={`/hotel/${featuredHotels[3]._id}`}
                className="col-span-1 md:col-span-5 group relative overflow-hidden rounded-[2rem] h-[300px] md:h-[400px] bg-neutral-100 dark:bg-neutral-900 shadow-xl border border-neutral-200/50 dark:border-neutral-800"
              >
                <LazyLoadImage
                  src={
                    featuredHotels[3].imageUrl ||
                    "https://via.placeholder.com/800x600"
                  }
                  alt={featuredHotels[3].name}
                  effect="blur"
                  wrapperClassName="w-full h-full block"
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-8 pointer-events-none">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                      {featuredHotels[3].cityId?.name || "Trending"}
                    </div>
                    <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold border border-white/20">
                      <StarIcon className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      {featuredHotels[3].starRating || "4.7"}
                    </div>
                  </div>
                  <h3 className="text-white font-serif text-2xl md:text-3xl mb-1 capitalize leading-tight">
                    {featuredHotels[3].name.toLowerCase()}
                  </h3>
                </div>
              </Link>
            )}

            {/* BOTTOM ROW: Large Card (Right) */}
            {featuredHotels[4] && (
              <Link
                to={`/hotel/${featuredHotels[4]._id}`}
                className="col-span-1 md:col-span-7 group relative overflow-hidden rounded-[2rem] h-[300px] md:h-[400px] bg-neutral-100 dark:bg-neutral-900 shadow-xl border border-neutral-200/50 dark:border-neutral-800"
              >
                <LazyLoadImage
                  src={
                    featuredHotels[4].imageUrl ||
                    "https://via.placeholder.com/1200x800"
                  }
                  alt={featuredHotels[4].name}
                  effect="blur"
                  wrapperClassName="w-full h-full block"
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-8 pointer-events-none">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                      {featuredHotels[4].cityId?.name || "Exclusive"}
                    </div>
                    <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold border border-white/20">
                      <StarIcon className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      {featuredHotels[4].starRating || "4.9"}
                    </div>
                  </div>
                  <h3 className="text-white font-serif text-3xl md:text-4xl mb-1 capitalize leading-tight">
                    {featuredHotels[4].name.toLowerCase()}
                  </h3>
                </div>
              </Link>
            )}
          </div>
        )}

        <div className="mt-10 text-center sm:hidden">
          <Link
            to="/search"
            className="inline-block bg-black dark:bg-white text-white dark:text-black font-semibold px-8 py-4 rounded-xl w-full shadow-lg active:scale-95 transition-transform"
          >
            Explore All Properties
          </Link>
        </div>
      </section>

      {/* CURATED VIBES */}
      <section className="bg-neutral-50 dark:bg-neutral-900/30 py-24 border-y border-neutral-100 dark:border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif tracking-tight mb-3">
              Find Your Vibe
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400">
              Discover properties based on the experience you crave.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Link
              to="/search"
              className="group relative h-64 rounded-2xl overflow-hidden shadow-sm bg-neutral-200 dark:bg-neutral-800"
            >
              <LazyLoadImage
                src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=800&auto=format&fit=crop"
                placeholderSrc="https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=10&w=50&auto=format&fit=crop"
                alt="Beachfront"
                effect="blur"
                wrapperClassName="w-full h-full block"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors pointer-events-none"></div>
              <h3 className="absolute bottom-6 left-6 text-white font-serif text-2xl pointer-events-none">
                Coastal Escapes
              </h3>
            </Link>

            <Link
              to="/search"
              className="group relative h-64 rounded-2xl overflow-hidden shadow-sm bg-neutral-200 dark:bg-neutral-800"
            >
              <LazyLoadImage
                src="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop"
                placeholderSrc="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=10&w=50&auto=format&fit=crop"
                alt="Mountains"
                effect="blur"
                wrapperClassName="w-full h-full block"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors pointer-events-none"></div>
              <h3 className="absolute bottom-6 left-6 text-white font-serif text-2xl pointer-events-none">
                Mountain Retreats
              </h3>
            </Link>

            <Link
              to="/search"
              className="group relative h-64 rounded-2xl overflow-hidden shadow-sm bg-neutral-200 dark:bg-neutral-800"
            >
              <LazyLoadImage
                src="https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=800&auto=format&fit=crop"
                placeholderSrc="https://images.unsplash.com/photo-1449844908441-8829872d2607?q=10&w=50&auto=format&fit=crop"
                alt="Urban"
                effect="blur"
                wrapperClassName="w-full h-full block"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors pointer-events-none"></div>
              <h3 className="absolute bottom-6 left-6 text-white font-serif text-2xl pointer-events-none">
                Urban Luxury
              </h3>
            </Link>
          </div>
        </div>
      </section>

      {/* NEWSLETTER BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="relative rounded-3xl overflow-hidden bg-neutral-900 shadow-2xl">
          <LazyLoadImage
            src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2000&auto=format&fit=crop"
            placeholderSrc="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=10&w=50&auto=format&fit=crop"
            alt="Luxury Interior"
            effect="blur"
            wrapperClassName="absolute inset-0 w-full h-full block"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="relative z-10 p-10 md:p-20 text-center flex flex-col items-center">
            <h2 className="text-3xl md:text-5xl font-serif text-white mb-4 leading-tight">
              Unlock Secret Prices
            </h2>
            <p className="text-white/80 text-base md:text-lg max-w-lg mb-10 font-light">
              Join our private list to receive member-only pricing, early access
              to new villas, and exclusive travel perks.
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="w-full max-w-md flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:bg-white/20 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="bg-white text-black font-bold px-8 py-3.5 rounded-xl hover:bg-neutral-200 transition-colors active:scale-95 flex-shrink-0"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
