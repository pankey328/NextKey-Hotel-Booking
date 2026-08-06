import React, { useState, useEffect } from "react";
import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import api from "../../api";
import HotelDashboardOverview from "../HotelDashboard/HotelDashboardOverview";

const SpecificHotelOverview = () => {
  const { hotelId } = useParams();
  const { myHotels } = useOutletContext();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);

  const hotelInfo = myHotels.find((h) => h._id === hotelId);

  useEffect(() => {
    if (!hotelId) return;
    api
      .get(`/search/hotels/${hotelId}/rooms`)
      .then((res) => setRooms(res.data.data || []))
      .catch((err) => console.error(err));
  }, [hotelId]);

  if (!hotelInfo)
    return (
      <div className="p-12 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
        Property not found. Please select an active property.
      </div>
    );

  return (
    <div className="animate-fade-in">
      {/* HEADER WITH SELECT DROPDOWN */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Hotel Overview
          </h1>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
            Select Hotel:
          </label>
          <select
            value={hotelId}
            onChange={(e) =>
              navigate(`/admin-dashboard/hotel/${e.target.value}/overview`)
            }
            className="flex-1 sm:flex-none px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none cursor-pointer shadow-sm focus:ring-2 focus:ring-blue-500"
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

      <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          {hotelInfo.name}{" "}
          <span className="text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            Property Dashboard
          </span>
        </h2>
      </div>
      <HotelDashboardOverview hotelInfo={hotelInfo} rooms={rooms} />
    </div>
  );
};

export default SpecificHotelOverview;
