import React from "react";
import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import Reservations from "../HotelDashboard/Reservations";

const VendorReservations = () => {
  const { hotelId } = useParams();
  const { myHotels } = useOutletContext();
  const navigate = useNavigate();

  if (!hotelId) {
    return (
      <div className="flex h-[50vh] items-center justify-center p-12 text-center text-gray-500 font-medium bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm max-w-5xl mx-auto">
        Please select an active property from the dropdown above to manage
        bookings.
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 font-sans h-full flex flex-col">
      {/* HEADER WITH SELECT DROPDOWN */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-gray-900 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden shrink-0">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-gray-100 dark:bg-gray-800/50 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Manage Bookings
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              Reservations
            </span>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-2">
            View, edit, and update guest reservations
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full md:w-auto relative z-10">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            Select Hotel
          </label>
          <select
            value={hotelId}
            onChange={(e) =>
              navigate(`/admin-dashboard/hotel/${e.target.value}/reservations`)
            }
            className="w-full md:w-64 px-4 py-3 text-[13px] font-bold rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none cursor-pointer shadow-sm focus:border-gray-400 transition-colors"
          >
            {myHotels
              .filter((h) => h.status === "approved")
              .map((h) => (
                <option key={h._id} value={h._id}>
                  {h.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      <Reservations hotelId={hotelId} />
    </div>
  );
};

export default VendorReservations;
