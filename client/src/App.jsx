import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Navbar from "./components/Navbar";
import ResetPassword from "./components/auth/ResetPassword";
import ForgotPassword from "./components/auth/ForgotPassword";
import AdminDashboard from "./components/AdminDashboard";

import ProtectedRoute from "./routes/ProtectedRoute";

import SuperAdminLayout from "./SuperAdmin/SuperAdminLayout";
import StateManager from "./SuperAdmin/pages/StateManager";
import DistrictManager from "./SuperAdmin/pages/DistrictManager";
import CityManager from "./SuperAdmin/pages/CityManager";
import HotelRegistration from "./components/HotelRegistration";
import HotelManager from "./SuperAdmin/pages/HotelManager";
import CheckHotelStatus from "./components/CheckHotelStatus";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/forget-password" element={<ForgotPassword />} />
          <Route path="/register-hotel" element={<HotelRegistration />} />
          <Route path="/check-hotel-status" element={<CheckHotelStatus />} />
          <Route
            path="/superadmin"
            element={
              <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                <SuperAdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="states" replace />} />
            <Route path="states" element={<StateManager />} />
            <Route path="districts" element={<DistrictManager />} />
            <Route path="cities" element={<CityManager />} />
            <Route path="hotels" element={<HotelManager />} />
          </Route>{" "}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
