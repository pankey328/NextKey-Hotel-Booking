import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import Home from "./components/Home";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Navbar from "./components/Navbar";
import ResetPassword from "./components/auth/ResetPassword";
import ForgotPassword from "./components/auth/ForgotPassword";

import SearchHotels from "./components/SearchHotels";
import HotelDetails from "./components/HotelDetails";
import MyBookings from "./components/MyBookings";

import VendorDashboard from "./components/VendorDashboard";
import VendorRegistration from "./components/VendorRegistration";
import CheckVendorStatus from "./components/CheckVendorStatus";
import HotelRegistration from "./components/HotelRegistration";
import EditHotel from "./components/EditHotel";
import AddRoomByVendor from "./components/AddRoomByVendor";
import CouponManagement from "./components/CouponManagement";

import HotelDashboard from "./components/HotelDashboard";
import AddRoom from "./components/AddRoom";
import EditRoom from "./components/EditRoom";

import SuperAdminLayout from "./SuperAdmin/SuperAdminLayout";
import StateManager from "./SuperAdmin/pages/StateManager";
import DistrictManager from "./SuperAdmin/pages/DistrictManager";
import CityManager from "./SuperAdmin/pages/CityManager";
import HotelManager from "./SuperAdmin/pages/HotelManager";
import VendorManager from "./SuperAdmin/pages/VendorManager";
import SuperAdminAddVendor from "./SuperAdmin/pages/SuperAdminAddVendor";
import SuperAdminAddHotel from "./SuperAdmin/pages/SuperAdminAddHotel";

import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/forget-password" element={<ForgotPassword />} />
          <Route path="/check-partner-status" element={<CheckVendorStatus />} />
          <Route path="/search" element={<SearchHotels />} />
          <Route
            path="/partner-registration"
            element={<VendorRegistration />}
          />

          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hotel/:id"
            element={
              <ProtectedRoute>
                <HotelDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hotel-dashboard"
            element={
              <ProtectedRoute allowedRoles={["hotel"]}>
                <HotelDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hotel-dashboard/add-room"
            element={
              <ProtectedRoute allowedRoles={["hotel"]}>
                <AddRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hotel-dashboard/edit-room/:id"
            element={
              <ProtectedRoute allowedRoles={["hotel"]}>
                <EditRoom />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <VendorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard/add-hotel"
            element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <HotelRegistration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard/edit-hotel/:id"
            element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <EditHotel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard/add-room/:hotelId"
            element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <AddRoomByVendor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard/coupons/:hotelId"
            element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <CouponManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/superadmin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <SuperAdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="states" replace />} />
            <Route path="states" element={<StateManager />} />
            <Route path="districts" element={<DistrictManager />} />
            <Route path="cities" element={<CityManager />} />

            <Route path="vendors" element={<VendorManager />} />
            <Route path="add-vendor" element={<SuperAdminAddVendor />} />

            <Route path="hotels" element={<HotelManager />} />
            <Route path="add-hotel" element={<SuperAdminAddHotel />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
