import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Navbar from "./components/Navbar";
import ResetPassword from "./components/auth/ResetPassword";
import ForgotPassword from "./components/auth/ForgotPassword";
import VendorDashboard from "./components/VendorDashboard";
import VendorRegistration from "./components/VendorRegistration";

import ProtectedRoute from "./routes/ProtectedRoute";

import SuperAdminLayout from "./SuperAdmin/SuperAdminLayout";
import StateManager from "./SuperAdmin/pages/StateManager";
import DistrictManager from "./SuperAdmin/pages/DistrictManager";
import CityManager from "./SuperAdmin/pages/CityManager";
import HotelRegistration from "./components/HotelRegistration";
import HotelManager from "./SuperAdmin/pages/HotelManager";
import CheckVendorStatus from "./components/CheckVendorStatus";
import VendorManager from "./SuperAdmin/pages/VendorManager";
import EditHotel from "./components/EditHotel";
import SuperAdminAddVendor from "./SuperAdmin/pages/SuperAdminAddVendor";
import SuperAdminAddHotel from "./SuperAdmin/pages/SuperAdminAddHotel";
import HotelDashboard from "./components/HotelDashboard";
import AddRoom from "./components/AddRoom";
import EditRoom from "./components/EditRoom";
import AddRoomByVendor from "./components/AddRoomByVendor";
import CouponManagement from "./components/CouponManagement";
import HotelDetails from "./components/HotelDetails";
import SearchHotels from "./components/SearchHotels";

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
          <Route path="/hotel/:id" element={<HotelDetails />} />

          <Route
            path="/partner-registration"
            element={<VendorRegistration />}
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
