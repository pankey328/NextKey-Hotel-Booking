import React, { useState, useEffect } from "react";
import api from "../../api";
import { useNavigate, useParams } from "react-router-dom";

const hotelFeaturesList = [
  "Parking",
  "Elevator",
  "Luggage Storage",
  "Restaurant",
  "Cafe",
  "Bar",
  "Gym",
  "Swimming Pool",
  "EV Charging Station",
  "Garden",
  "Terrace",
  "Laundry Service",
];

const EditHotel = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    hotelType: "",
    starRating: 3,
    email: "",
    phone: "",
    address: "",
    locationLink: "",
    description: "",
    features: [],
  });
  const [image, setImage] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);

  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const statesRes = await api.get("/states?isDeleted=false");
        setStates(statesRes.data.data);

        const hotelRes = await api.get(`/hotels/status/${id}`);
        const hotel = hotelRes.data.data;

        if (hotel.status === "approved") {
          alert("Approved hotels cannot be edited.");
          navigate("/admin-dashboard");
          return;
        }

        setFormData({
          name: hotel.name,
          hotelType: hotel.hotelType,
          starRating: hotel.starRating,
          email: hotel.email,
          phone: hotel.phone,
          address: hotel.address,
          locationLink: hotel.locationLink || "",
          description: hotel.description || "",
          features: hotel.features || [],
        });
        setCurrentImageUrl(hotel.imageUrl);

        const stateId = hotel.stateId?._id || hotel.stateId;
        const districtId = hotel.districtId?._id || hotel.districtId;
        const cityId = hotel.cityId?._id || hotel.cityId;

        setSelectedStateId(stateId);

        if (stateId) {
          const distRes = await api.get(
            `/districts?stateId=${stateId}&isDeleted=false`,
          );
          setDistricts(distRes.data.data);
          setSelectedDistrictId(districtId);
        }
        if (districtId) {
          const cityRes = await api.get(
            `/cities?districtId=${districtId}&isDeleted=false`,
          );
          setCities(cityRes.data.data);
          setSelectedCityId(cityId);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to load property details.");
        navigate("/admin-dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id, navigate]);

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

  const handleFeatureChange = (feature) => {
    let features = [...formData.features];

    if (features.includes(feature)) {
      features = features.filter((item) => item !== feature);
    } else {
      features.push(feature);
    }

    setFormData({
      ...formData,
      features,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCityId)
      return alert("Please complete the location selection.");
    setSubmitting(true);

    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "features") {
        submitData.append("features", JSON.stringify(formData.features));
      } else {
        submitData.append(key, formData[key]);
      }
    });

    submitData.append("stateId", selectedStateId);
    submitData.append("districtId", selectedDistrictId);
    submitData.append("cityId", selectedCityId);

    if (image) submitData.append("image", image);

    try {
      await api.put(`/hotels/update/${id}`, submitData);
      alert("Property updated successfully! Status is now pending review.");
      navigate("/admin-dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Update failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="p-12 text-center text-gray-500">
        Loading Property Details...
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-10 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white text-center mb-8">
          Edit Property
        </h1>

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
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
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
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="" disabled>
                  Select State...
                </option>
                {states.map((state) => (
                  <option key={state._id} value={state._id}>
                    {state.name}
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
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="" disabled>
                  Select District...
                </option>
                {districts.map((district) => (
                  <option key={district._id} value={district._id}>
                    {district.name}
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
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="" disabled>
                  Select City...
                </option>
                {cities.map((city) => (
                  <option key={city._id} value={city._id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Google Maps Link (Optional)
            </label>
            <input
              type="url"
              value={formData.locationLink}
              onChange={(e) =>
                setFormData({ ...formData, locationLink: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Property Features Selection */}
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
              Property Features & Amenities
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {hotelFeaturesList.map((feature) => (
                <label
                  key={feature}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.features.includes(feature)}
                    onChange={() => handleFeatureChange(feature)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 cursor-pointer"
                  />
                  {feature}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            ></textarea>
          </div>

          {/* Image Upload section for Editing */}
          <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 flex flex-col sm:flex-row items-center gap-4">
            {currentImageUrl && !image && (
              <img
                src={currentImageUrl}
                alt="Current Property"
                className="w-24 h-24 object-cover rounded-md shadow-sm"
              />
            )}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Update Property Image (Leave empty to keep current image)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/admin-dashboard")}
              className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all"
            >
              {submitting ? "Saving Updates..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditHotel;
