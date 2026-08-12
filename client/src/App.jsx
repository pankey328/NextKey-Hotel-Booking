import React from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  Outlet,
  useLocation,
} from "react-router-dom";

import Home from "./components/Home";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Navbar from "./components/Navbar";
import ResetPassword from "./components/auth/ResetPassword";
import ForgotPassword from "./components/auth/ForgotPassword";

import SearchHotels from "./components/SearchHotels";
import HotelDetails from "./components/HotelDetails";
import MyBookings from "./components/MyBookings";

import VendorLayout from "./components/VendorDashboard/VendorLayout";
import VendorDashboardOverview from "./components/VendorDashboard/VendorDashboardOverview";
import VendorProperties from "./components/VendorDashboard/VendorProperties";
import SpecificHotelOverview from "./components/VendorDashboard/SpecificHotelOverview";
import VendorReservations from "./components/VendorDashboard/VendorReservations";
import VendorRegistration from "./components/VendorRegistration";
import CheckVendorStatus from "./components/CheckVendorStatus";
import AddHotel from "./components/VendorDashboard/AddHotel";
import EditHotel from "./components/VendorDashboard/EditHotel";
import AddRoomByVendor from "./components/VendorDashboard/AddRoomByVendor";
import CouponManagement from "./components/VendorDashboard/CouponManagement";

import HotelLayout from "./components/HotelDashboard/HotelLayout";
import HotelDashboardOverview from "./components/HotelDashboard/HotelDashboardOverview";
import Reservations from "./components/HotelDashboard/Reservations";
import ManageRooms from "./components/HotelDashboard/ManageRooms";
import AddRoom from "./components/HotelDashboard/AddRoom";
import EditRoom from "./components/HotelDashboard/EditRoom";

import SuperAdminLayout from "./SuperAdmin/SuperAdminLayout";
import StateManager from "./SuperAdmin/pages/StateManager";
import DistrictManager from "./SuperAdmin/pages/DistrictManager";
import CityManager from "./SuperAdmin/pages/CityManager";
import HotelManager from "./SuperAdmin/pages/HotelManager";
import VendorManager from "./SuperAdmin/pages/VendorManager";
import SuperAdminAddVendor from "./SuperAdmin/pages/SuperAdminAddVendor";
import SuperAdminAddHotel from "./SuperAdmin/pages/SuperAdminAddHotel";
import SuperAdminDashboardOverview from "./SuperAdmin/pages/SuperAdminDashboardOverview";

import ProtectedRoute from "./routes/ProtectedRoute";
import Footer from "./components/Footer";
import About from "./components/About";
import Contact from "./components/Contact";
import Help from "./components/Help";
import ScrollToTop from "./components/ScrollToTop";

const PublicLayout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <>
      <Navbar />
      <div className={`min-h-screen ${!isHomePage ? "pt-20" : ""}`}>
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/forget-password" element={<ForgotPassword />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/help" element={<Help />} />
            <Route
              path="/check-partner-status"
              element={<CheckVendorStatus />}
            />
            <Route path="/search" element={<SearchHotels />} />
            <Route
              path="/partner-registration"
              element={<VendorRegistration />}
            />

            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
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
          </Route>

          <Route
            path="/hotel-dashboard"
            element={
              <ProtectedRoute allowedRoles={["hotel"]}>
                <HotelLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HotelDashboardOverview />} />
            <Route path="overview" element={<HotelDashboardOverview />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="rooms" element={<ManageRooms />} />
            <Route path="add-room" element={<AddRoom />} />
            <Route path="edit-room/:id" element={<EditRoom />} />
          </Route>

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <VendorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<VendorDashboardOverview />} />
            <Route path="properties" element={<VendorProperties />} />
            <Route
              path="hotel/:hotelId/overview"
              element={<SpecificHotelOverview />}
            />
            <Route
              path="hotel/:hotelId/reservations"
              element={<VendorReservations />}
            />
            <Route path="add-hotel" element={<AddHotel />} />
            <Route path="edit-hotel/:id" element={<EditHotel />} />
            <Route path="add-room/:hotelId" element={<AddRoomByVendor />} />
            <Route path="coupons/:hotelId" element={<CouponManagement />} />
          </Route>

          <Route
            path="/superadmin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <SuperAdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SuperAdminDashboardOverview />} />
            <Route path="overview" element={<SuperAdminDashboardOverview />} />
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
