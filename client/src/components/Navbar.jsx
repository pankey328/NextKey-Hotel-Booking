import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useTheme from "../../src/hooks/useTheme";
import {
  ArrowRightOnRectangleIcon,
  KeyIcon,
  BookmarkSquareIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);

  const isAuthenticated = !!localStorage.getItem("token");

  const isHomePage = location.pathname === "/";
  const isTransparent = isHomePage && !isScrolled;

  useEffect(() => {
    if (isAuthenticated) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } else {
      setUser(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate("/");
    window.location.reload();
  };

  const formatRole = (role) => {
    if (role) {
      return role.replaceAll("_", " ");
    }
    return "Traveler";
  };

  let dashboardRoute = null;
  let dashboardLabel = "";

  if (user?.role === "super_admin") {
    dashboardRoute = "/superadmin-dashboard";
    dashboardLabel = "Super Admin Dashboard";
  } else if (user?.role === "vendor") {
    dashboardRoute = "/admin-dashboard";
    dashboardLabel = "Admin Dashboard";
  } else if (user?.role === "hotel") {
    dashboardRoute = "/hotel-dashboard";
    dashboardLabel = "Hotel Dashboard";
  }

  const renderAvatar = () => {
    if (user?.photo) {
      return (
        <img
          src={user.photo}
          alt={user.name || "User"}
          className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-700 shadow-sm"
        />
      );
    }
    const initial = user?.email ? user.email.charAt(0).toUpperCase() : "U";
    return (
      <div
        className={`w-10 h-10 rounded-full font-semibold flex items-center justify-center text-sm shadow-sm transition-transform active:scale-95 ${
          isTransparent
            ? "bg-white text-black"
            : "bg-black dark:bg-white text-white dark:text-black"
        }`}
      >
        {initial}
      </div>
    );
  };

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        isTransparent
          ? "bg-transparent border-transparent py-2"
          : "bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo - NextKey */}
        <div
          className={`font-sans text-2xl tracking-tight transition-colors ${
            isTransparent
              ? "text-white drop-shadow-md"
              : "text-neutral-900 dark:text-white"
          }`}
        >
          <Link
            to="/"
            className="hover:opacity-80 transition-opacity flex items-center gap-2.5"
          >
            <img
              src="/favicon.svg"
              alt="NextKey Logo"
              className="w-8 h-8 md:w-9 md:h-9 object-contain drop-shadow-sm"
            />
            <div className="flex items-baseline">
              <span className="font-bold">Next</span>
              <span className="font-light">Key</span>
              <span
                className={
                  isTransparent
                    ? "text-white"
                    : "text-blue-600 dark:text-blue-500"
                }
              >
                .
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${
              isTransparent
                ? "text-white/90 hover:text-white drop-shadow-md"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Home
          </Link>
          <Link
            to="/search"
            className={`text-sm font-medium transition-colors ${
              isTransparent
                ? "text-white/90 hover:text-white drop-shadow-md"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Explore Stays
          </Link>
          <Link
            to="/about"
            className={`text-sm font-medium transition-colors ${
              isTransparent
                ? "text-white/90 hover:text-white drop-shadow-md"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            About
          </Link>

          <Link
            to="/help"
            className={`text-sm font-medium transition-colors ${
              isTransparent
                ? "text-white/90 hover:text-white drop-shadow-md"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Help
          </Link>
        </div>

        {/* Desktop Controls (Right Side) */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-full transition-colors cursor-pointer ${
              isTransparent
                ? "bg-white/20 hover:bg-white/30 text-white backdrop-blur-md"
                : "bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800"
            }`}
          >
            {theme === "dark" ? (
              <SunIcon className="w-5 h-5 text-yellow-400" />
            ) : (
              <MoonIcon className="w-5 h-5" />
            )}
          </button>

          {/* Auth Section */}
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 focus:outline-none cursor-pointer"
              >
                {renderAvatar()}
              </button>

              {/* Desktop Profile Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/50 border border-neutral-100 dark:border-neutral-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-3.5 border-b border-neutral-100 dark:border-neutral-800">
                    <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-0.5">
                      Signed in as
                    </p>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate mb-2">
                      {user?.email || "User Account"}
                    </p>
                    <div className="inline-block px-2 py-1 bg-neutral-100/50 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-300 text-[10px] font-bold uppercase tracking-widest rounded-md">
                      {formatRole(user?.role)}
                    </div>
                  </div>

                  <div className="py-2">
                    {dashboardRoute && (
                      <div className="border-b border-neutral-100 dark:border-neutral-800 pb-1 mb-1">
                        <Link
                          to={dashboardRoute}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          <Squares2X2Icon className="w-5 h-5" />
                          {dashboardLabel}
                        </Link>
                      </div>
                    )}

                    {(!user?.role || user?.role === "user") && (
                      <Link
                        to="/my-bookings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors"
                      >
                        <BookmarkSquareIcon className="w-5 h-5 text-neutral-400" />
                        My Trips
                      </Link>
                    )}

                    <Link
                      to="/reset-password"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      <KeyIcon className="w-5 h-5 text-neutral-400" />
                      Reset Password
                    </Link>
                  </div>

                  <div className="border-t border-neutral-100 dark:border-neutral-800 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/30 transition-colors cursor-pointer text-left"
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md active:scale-95 ${
                isTransparent
                  ? "bg-white text-black hover:bg-neutral-100"
                  : "bg-black dark:bg-white text-white dark:text-black hover:opacity-80"
              }`}
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Controls */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-full ${
              isTransparent
                ? "bg-white/20 text-white"
                : "bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400"
            }`}
          >
            {theme === "dark" ? (
              <SunIcon className="w-5 h-5 text-yellow-400" />
            ) : (
              <MoonIcon className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2.5 rounded-xl ${
              isTransparent
                ? "bg-white/20 text-white"
                : "bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300"
            }`}
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-6 space-y-4 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col space-y-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-neutral-800 dark:text-neutral-200"
            >
              Home
            </Link>
            <Link
              to="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-neutral-800 dark:text-neutral-200"
            >
              Explore Stays
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-neutral-800 dark:text-neutral-200"
            >
              About
            </Link>

            <Link
              to="/help"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-neutral-800 dark:text-neutral-200"
            >
              Help
            </Link>
          </div>

          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                {renderAvatar()}
                <div>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
                    Logged in as
                  </p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                    {user?.email}
                  </p>
                  <div className="inline-block px-2 py-0.5 mt-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-[10px] font-bold uppercase tracking-widest rounded">
                    {formatRole(user?.role)}
                  </div>
                </div>
              </div>

              {dashboardRoute && (
                <Link
                  to={dashboardRoute}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2 text-base font-bold text-blue-600 dark:text-blue-400"
                >
                  <Squares2X2Icon className="w-5 h-5" /> {dashboardLabel}
                </Link>
              )}

              {(!user?.role || user?.role === "user") && (
                <Link
                  to="/my-bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2 text-base font-medium text-neutral-700 dark:text-neutral-300"
                >
                  <BookmarkSquareIcon className="w-5 h-5 text-neutral-400" /> My
                  Trips
                </Link>
              )}

              <Link
                to="/reset-password"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 py-2 text-base font-medium text-neutral-700 dark:text-neutral-300"
              >
                <KeyIcon className="w-5 h-5 text-neutral-400" /> Reset Password
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 py-2 text-base font-medium text-red-600 dark:text-red-400 text-left"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" /> Logout
              </button>
            </>
          ) : (
            <div className="pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center bg-black dark:bg-white text-white dark:text-black font-semibold py-3.5 rounded-xl shadow-md"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
