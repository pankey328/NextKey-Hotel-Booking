import React, { useState, useEffect } from "react";
import api from "../api";

const HotelRegistration = () => {
  const [formData, setFormData] = useState({
    name: "",
    hotelType: "Hotel",
    starRating: 3,
    email: "",
    phone: "",
    address: "",
    locationLink: "",
    description: "",
  });
  const [image, setImage] = useState(null);

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch states
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await api.get("/states?isDeleted=false");
        setStates(res.data.data);
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };
    fetchStates();
  }, []);

  const handleStateChange = async (e) => {
    const stateId = e.target.value;
    setSelectedStateId(stateId);
    setSelectedDistrictId("");
    setSelectedCityId("");
    setCities([]);
    try {
      const res = await api.get(
        `/districts?stateId=${stateId}&isDeleted=false`,
      );
      setDistricts(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDistrictChange = async (e) => {
    const districtId = e.target.value;
    setSelectedDistrictId(districtId);
    setSelectedCityId("");
    try {
      const res = await api.get(
        `/cities?districtId=${districtId}&isDeleted=false`,
      );
      setCities(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return alert("Please upload a hotel image.");
    if (!selectedCityId)
      return alert("Please complete the location selection.");

    setLoading(true);

    // FormData to send files
    const submitData = new FormData();
    Object.keys(formData).forEach((key) =>
      submitData.append(key, formData[key]),
    );
    submitData.append("stateId", selectedStateId);
    submitData.append("districtId", selectedDistrictId);
    submitData.append("cityId", selectedCityId);
    submitData.append("image", image);

    try {
      await api.post("/hotels/register", submitData);
      setSuccess(true);
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Registration Submitted!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your application is currently under review by our team. If
            approved, you will receive your login credentials via email shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-10 w-full max-w-3xl border border-gray-100 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 text-center">
          Become a Hotel Partner
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
          Fill out the details below to list your property on our platform.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Property Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Property Type
              </label>
              <select
                value={formData.hotelType}
                onChange={(e) =>
                  setFormData({ ...formData, hotelType: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="Hotel">Hotel</option>
                <option value="Resort">Resort</option>
                <option value="Homestay">Homestay</option>
                <option value="Guest House">Guest House</option>
                <option value="Hostel">Hostel</option>
                <option value="Villa">Villa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rating
              </label>
              <select
                value={formData.starRating}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    starRating: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value={1}>1 Star</option>
                <option value={2}>2 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={5}>5 Stars</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Business Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State
              </label>
              <select
                value={selectedStateId}
                onChange={handleStateChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="" disabled>
                  Select State...
                </option>
                {states.map((state) => (
                  <option key={state._id} value={state._id}>
                    {state.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                District
              </label>
              <select
                value={selectedDistrictId}
                onChange={handleDistrictChange}
                required
                disabled={!selectedStateId}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
              >
                <option value="" disabled>
                  Select District...
                </option>
                {districts.map((district) => (
                  <option key={district._id} value={district._id}>
                    {district.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City
              </label>
              <select
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                required
                disabled={!selectedDistrictId}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
              >
                <option value="" disabled>
                  Select City...
                </option>
                {cities.map((city) => (
                  <option key={city._id} value={city._id}>
                    {city.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Local Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Google Maps Location Link (Optional)
            </label>
            <input
              type="url"
              value={formData.locationLink}
              onChange={(e) =>
                setFormData({ ...formData, locationLink: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 cursor-pointer">
              {image
                ? `Selected: ${image.name}`
                : "Upload Main Property Image (Required)"}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                required
                className="hidden"
              />
            </label>
            {!image && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Click to browse (JPG, PNG, WEBP)
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-70"
          >
            {loading
              ? "Submitting Registration..."
              : "Submit Registration Application"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HotelRegistration;
