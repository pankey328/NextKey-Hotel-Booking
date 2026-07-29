import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";

const facilityCategories = {
  Comfort: [
    "Air Conditioner (AC)",
    "Heating",
    "Ceiling Fan",
    "Balcony",
    "Soundproof Room",
  ],
  Entertainment: ["Smart TV", "Cable TV", "Netflix", "Wi-Fi", "Telephone"],
  Bathroom: [
    "Private Bathroom",
    "Bathtub",
    "Shower",
    "Hot Water",
    "Hair Dryer",
    "Towels",
    "Toiletries",
  ],
  FoodDrink: [
    "Mini Bar",
    "Coffee Maker",
    "Electric Kettle",
    "Refrigerator",
    "Microwave",
  ],
  Safety: [
    "Smoke Detector",
    "Fire Extinguisher",
    "First Aid Kit",
    "Safe Locker",
  ],
  Furniture: [
    "Wardrobe",
    "Study Table",
    "Sofa",
    "Dining Table",
    "Mirror",
    "Iron",
    "Ironing Board",
  ],
  Luxury: [
    "Spa Access",
    "Jacuzzi",
    "Swimming Pool Access",
    "Gym Access",
    "Sea View",
    "Garden View",
    "Mountain View",
  ],
  Services: [
    "Room Service",
    "Laundry",
    "Housekeeping",
    "Wake-up Call",
    "Airport Pickup",
  ],
  Accessibility: [
    "Wheelchair Accessible",
    "Elevator Access",
    "Ground Floor Room",
  ],
};

const AddRoom = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    roomNumber: "",
    roomName: "",
    roomType: "Standard",
    floorNumber: "",
    description: "",
    pricePerNight: "",
    weekendPrice: "",
    holidayPrice: "",
    discount: "0",
    taxIncluded: false,
    maxAdults: 2,
    maxChildren: 0,
    totalGuests: 2,
    numberOfBeds: 1,
    bedType: "Double Bed",
    status: "Available",
    cancellationPolicy: "Free Cancellation",
    facilities: [],
  });

  const [images, setImages] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFacilityToggle = (facility) => {
    let facilities = [...formData.facilities];

    if (facilities.includes(facility)) {
      facilities = facilities.filter((item) => item !== facility);
    } else {
      facilities.push(facility);
    }

    setFormData({
      ...formData,
      facilities,
    });
  };

  const handleImageChange = (e) => {
    setImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "facilities") {
          data.append(key, JSON.stringify(formData[key]));
        } else {
          data.append(key, formData[key]);
        }
      });

      if (images) {
        for (let i = 0; i < images.length; i++) {
          data.append("images", images[i]);
        }
      }

      await api.post("/rooms", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Room added successfully!");
      navigate("/hotel-dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Add New Room
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline text-sm font-medium"
        >
          &larr; Back to Dashboard
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 border-l-4 border-blue-500 pl-2">
            1. Basic Room Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Room Number *
              </label>
              <input
                type="text"
                name="roomNumber"
                required
                value={formData.roomNumber}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Room Name
              </label>
              <input
                type="text"
                name="roomName"
                value={formData.roomName}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Room Type
              </label>
              <select
                name="roomType"
                value={formData.roomType}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {[
                  "Standard",
                  "Deluxe",
                  "Executive",
                  "Suite",
                  "Family Room",
                  "Dormitory",
                ].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Floor Number
              </label>
              <input
                type="text"
                name="floorNumber"
                value={formData.floorNumber}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4">
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows="2"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              ></textarea>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 border-l-4 border-blue-500 pl-2">
            2. Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Price Per Night *
              </label>
              <input
                type="number"
                name="pricePerNight"
                required
                value={formData.pricePerNight}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Weekend Price
              </label>
              <input
                type="number"
                name="weekendPrice"
                value={formData.weekendPrice}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Holiday Price
              </label>
              <input
                type="number"
                name="holidayPrice"
                value={formData.holidayPrice}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm dark:text-gray-300">
                <input
                  type="checkbox"
                  name="taxIncluded"
                  checked={formData.taxIncluded}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                Tax Included
              </label>
            </div>
          </div>
        </section>

        {/* Capacity and Beds */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 border-l-4 border-blue-500 pl-2">
            3. Capacity & Beds
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Max Adults
              </label>
              <input
                type="number"
                name="maxAdults"
                value={formData.maxAdults}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Max Children
              </label>
              <input
                type="number"
                name="maxChildren"
                value={formData.maxChildren}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total Guests
              </label>
              <input
                type="number"
                name="totalGuests"
                value={formData.totalGuests}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                No. of Beds
              </label>
              <input
                type="number"
                name="numberOfBeds"
                value={formData.numberOfBeds}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Bed Type
              </label>
              <select
                name="bedType"
                value={formData.bedType}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {[
                  "Single Bed",
                  "Double Bed",
                  "Queen Bed",
                  "King Bed",
                  "Twin Beds",
                  "Sofa Bed",
                  "Bunk Bed",
                ].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Room Facilities */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 border-l-4 border-blue-500 pl-2">
            4. Facilities & Amenities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
            {Object.entries(facilityCategories).map(([category, items]) => (
              <div key={category}>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase text-xs tracking-wider border-b border-gray-200 dark:border-gray-600 pb-1">
                  {category}
                </h3>
                <div className="space-y-2">
                  {items.map((facility) => (
                    <label
                      key={facility}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.facilities.includes(facility)}
                        onChange={() => handleFacilityToggle(facility)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      {facility}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Admin & Policies */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 border-l-4 border-blue-500 pl-2">
            5. Rules & Media
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Reserved">Reserved</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Out of Service">Out of Service</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Cancellation Policy
              </label>
              <select
                name="cancellationPolicy"
                value={formData.cancellationPolicy}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="Free Cancellation">Free Cancellation</option>
                <option value="Non-Refundable">Non-Refundable</option>
                <option value="Cancellation Before 24 Hours">
                  Before 24 Hours
                </option>
                <option value="Cancellation Before 48 Hours">
                  Before 48 Hours
                </option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Room Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300"
              />
            </div>
          </div>
        </section>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 border rounded-lg text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving Room..." : "Save Room"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRoom;
