import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const EditRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

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

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await api.get(`/rooms/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const room = res.data.data;

        setFormData({
          roomNumber: room.roomNumber || "",
          roomName: room.roomName || "",
          roomType: room.roomType || "Standard",
          floorNumber: room.floorNumber || "",
          description: room.description || "",
          pricePerNight: room.pricePerNight || "",
          weekendPrice: room.weekendPrice || "",
          holidayPrice: room.holidayPrice || "",
          discount: room.discount || "0",
          taxIncluded: room.taxIncluded || false,
          maxAdults: room.maxAdults || 2,
          maxChildren: room.maxChildren || 0,
          totalGuests:
            room.totalGuests ||
            Number(room.maxAdults || 2) + Number(room.maxChildren || 0),
          numberOfBeds: room.numberOfBeds || 1,
          bedType: room.bedType || "Double Bed",
          status: room.status || "Available",
          cancellationPolicy: room.cancellationPolicy || "Free Cancellation",
          facilities: room.facilities || [],
        });

        setExistingImages(room.images || []);
      } catch (error) {
        alert("Error fetching room details.");
        navigate("/hotel-dashboard");
      } finally {
        setFetching(false);
      }
    };
    fetchRoom();
  }, [id, navigate, token]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      const updatedForm = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "maxAdults" || name === "maxChildren") {
        updatedForm.totalGuests =
          Number(updatedForm.maxAdults || 0) +
          Number(updatedForm.maxChildren || 0);
      }

      return updatedForm;
    });
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

  const handleRemoveExistingImage = (indexToRemove) => {
    setExistingImages((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleImageChange = (e) => {
    setNewImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "facilities") {
          data.append(key, JSON.stringify(formData[key]));
        } else {
          data.append(key, formData[key]);
        }
      });

      data.append("existingImages", JSON.stringify(existingImages));

      if (newImages) {
        for (let i = 0; i < newImages.length; i++) {
          data.append("images", newImages[i]);
        }
      }

      await api.put(`/rooms/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Room updated successfully!");
      navigate("/hotel-dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update room");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm max-w-5xl mx-auto">
        <div className="flex items-center space-x-2">
          <div
            className="w-3 h-3 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce"
            style={{ animationDelay: "-0.3s" }}
          ></div>
          <div
            className="w-3 h-3 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce"
            style={{ animationDelay: "-0.15s" }}
          ></div>
          <div className="w-3 h-3 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce"></div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm font-medium">
          Loading Room Details...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-10 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 animate-in fade-in duration-500 font-sans">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Edit Room {formData.roomNumber}
          </h1>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-2">
            Update room details and settings
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Basic Info */}
        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-5 border-b border-gray-100 dark:border-gray-800 pb-2">
            Basic Room Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Room Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="roomNumber"
                autoComplete="off"
                required
                value={formData.roomNumber}
                onChange={handleInputChange}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Room Name
              </label>
              <input
                type="text"
                name="roomName"
                autoComplete="off"
                value={formData.roomName}
                onChange={handleInputChange}
                placeholder="e.g. Ocean View Suite"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Room Type
              </label>
              <select
                name="roomType"
                value={formData.roomType}
                onChange={handleInputChange}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm cursor-pointer"
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
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Floor Number
              </label>
              <input
                type="text"
                name="floorNumber"
                autoComplete="off"
                value={formData.floorNumber}
                onChange={handleInputChange}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Description
              </label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm resize-none"
              ></textarea>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-5 border-b border-gray-100 dark:border-gray-800 pb-2">
            Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Price Per Night <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  name="pricePerNight"
                  autoComplete="off"
                  min="0"
                  required
                  value={formData.pricePerNight}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 pl-8 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Weekend Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  name="weekendPrice"
                  autoComplete="off"
                  min="0"
                  value={formData.weekendPrice}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 pl-8 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Holiday Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  name="holidayPrice"
                  autoComplete="off"
                  min="0"
                  value={formData.holidayPrice}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 pl-8 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Discount (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="discount"
                  autoComplete="off"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 pr-8 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                  %
                </span>
              </div>
            </div>
            <div className="flex items-center pt-2 md:col-span-4">
              <label className="flex items-center gap-3 cursor-pointer text-[13px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  name="taxIncluded"
                  checked={formData.taxIncluded}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                Price includes all taxes
              </label>
            </div>
          </div>
        </section>

        {/* Capacity and Beds */}
        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-5 border-b border-gray-100 dark:border-gray-800 pb-2">
            Capacity & Beds
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Max Adults
              </label>
              <input
                type="number"
                name="maxAdults"
                autoComplete="off"
                min="1"
                value={formData.maxAdults}
                onChange={handleInputChange}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Max Children
              </label>
              <input
                type="number"
                name="maxChildren"
                autoComplete="off"
                min="0"
                value={formData.maxChildren}
                onChange={handleInputChange}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Total Guests
              </label>
              <input
                type="number"
                name="totalGuests"
                autoComplete="off"
                min="1"
                value={formData.totalGuests}
                onChange={handleInputChange}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                No. of Beds
              </label>
              <input
                type="number"
                name="numberOfBeds"
                autoComplete="off"
                min="1"
                value={formData.numberOfBeds}
                onChange={handleInputChange}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Bed Type
              </label>
              <select
                name="bedType"
                value={formData.bedType}
                onChange={handleInputChange}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm cursor-pointer"
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
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-5 border-b border-gray-100 dark:border-gray-800 pb-2">
            Facilities & Amenities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-50 dark:bg-gray-800/50 p-6 sm:p-8 rounded-2xl border border-gray-100 dark:border-gray-800">
            {Object.entries(facilityCategories).map(([category, items]) => (
              <div key={category}>
                <h3 className="font-extrabold text-gray-900 dark:text-white mb-3 uppercase text-[10px] tracking-widest border-b border-gray-200 dark:border-gray-700 pb-2">
                  {category}
                </h3>
                <div className="space-y-3 mt-4">
                  {items.map((facility) => (
                    <label
                      key={facility}
                      className="flex items-center gap-3 text-[13px] font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.facilities.includes(facility)}
                        onChange={() => handleFacilityToggle(facility)}
                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      {facility}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Admin, Policies & Media */}
        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-5 border-b border-gray-100 dark:border-gray-800 pb-2">
            Rules & Media
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm cursor-pointer"
              >
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Reserved">Reserved</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Out of Service">Out of Service</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Cancellation Policy
              </label>
              <select
                name="cancellationPolicy"
                value={formData.cancellationPolicy}
                onChange={handleInputChange}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm cursor-pointer"
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
          </div>

          {/* Image Management */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 sm:p-8 rounded-2xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              Manage Images
            </h3>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Currently Uploaded
                </p>
                <div className="flex flex-wrap gap-4">
                  {existingImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm group"
                    >
                      <img
                        src={img}
                        alt="Room"
                        className="w-full h-full object-cover"
                      />
                      {/* Delete Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(idx)}
                          className="bg-rose-500 text-white w-8 h-8 flex items-center justify-center rounded-full shadow-lg hover:bg-rose-600 transition-colors cursor-pointer"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload New Images */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Upload Additional Images
              </p>
              <div className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-center hover:bg-white dark:hover:bg-gray-800 transition-colors flex flex-col justify-center items-center">
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2 cursor-pointer">
                  {newImages && newImages.length > 0
                    ? `Selected: ${newImages.length} file(s) ready to upload`
                    : "Select New High-Quality Images"}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {(!newImages || newImages.length === 0) && (
                  <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    Click to browse (JPG, JPEG, PNG)
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER ACTIONS */}
        <div className="pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl text-[12px] font-bold uppercase tracking-wide border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer active:scale-95 shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-xl text-[12px] font-bold uppercase tracking-wide bg-emerald-600 hover:bg-emerald-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            {loading && (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            )}
            {loading ? "Updating Room..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditRoom;
