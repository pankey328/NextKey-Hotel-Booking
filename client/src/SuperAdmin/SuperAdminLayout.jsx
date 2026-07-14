import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

const SuperAdminLayout = () => {
  const location = useLocation();

  // Helper to highlight active menu item
  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-colors">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Super Admin
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            System Management
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link
            to="/superadmin/states"
            className={`block px-4 py-3 rounded-lg transition-colors ${
              isActive("/states")
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Manage States
          </Link>
          <Link
            to="/superadmin/districts"
            className={`block px-4 py-3 rounded-lg transition-colors ${
              isActive("/districts")
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Manage Districts
          </Link>
          <Link
            to="/superadmin/cities"
            className={`block px-4 py-3 rounded-lg transition-colors ${
              isActive("/cities")
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Manage Cities
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />{" "}
        {/* This renders StateManager, DistrictManager, etc based on route */}
      </main>
    </div>
  );
};

export default SuperAdminLayout;
