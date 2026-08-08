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
      navigate(-1);
    } catch (error) {
      alert(error.response?.data?.message || "Update failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
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
          Loading Property Details...
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
            Edit Property
          </h1>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-2">
            Update your property's core details
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
        {/* Basic Information */}
        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-5 border-b border-gray-100 dark:border-gray-800 pb-2">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Property Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Property Type
              </label>
              <select
                value={formData.hotelType}
                onChange={(e) =>
                  setFormData({ ...formData, hotelType: e.target.value })
                }
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm cursor-pointer"
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
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Star Rating
              </label>
              <select
                value={formData.starRating}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    starRating: Number(e.target.value),
                  })
                }
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm cursor-pointer"
              >
                <option value={1}>1 Star</option>
                <option value={2}>2 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={5}>5 Stars</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Business Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm"
              />
            </div>
          </div>
        </section>

        {/* Location Details */}
        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-5 border-b border-gray-100 dark:border-gray-800 pb-2">
            Location Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-3">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Local Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                State <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedStateId}
                onChange={handleStateChange}
                required
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm cursor-pointer"
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
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                District <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedDistrictId}
                onChange={handleDistrictChange}
                required
                disabled={!selectedStateId}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
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
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                City <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                required
                disabled={!selectedDistrictId}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
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
            <div className="md:col-span-3">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Google Maps Link (Optional)
              </label>
              <input
                type="url"
                value={formData.locationLink}
                onChange={(e) =>
                  setFormData({ ...formData, locationLink: e.target.value })
                }
                placeholder="https://maps.google.com/..."
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm placeholder-gray-400"
              />
            </div>
          </div>
        </section>

        {/* Amenities & Description */}
        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-5 border-b border-gray-100 dark:border-gray-800 pb-2">
            Property Features & Description
          </h2>

          <div className="mb-6">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-3">
              Amenities
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
              {hotelFeaturesList.map((feature) => (
                <label
                  key={feature}
                  className="flex items-center gap-3 text-[13px] font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.features.includes(feature)}
                    onChange={() => handleFeatureChange(feature)}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  {feature}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
              Detailed Description
            </label>
            <textarea
              rows="4"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm resize-none"
            ></textarea>
          </div>
        </section>

        {/* Media */}
        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-5 border-b border-gray-100 dark:border-gray-800 pb-2">
            Media
          </h2>
          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800/50 flex flex-col md:flex-row items-start md:items-center gap-6">
            {currentImageUrl && !image && (
              <div className="shrink-0 relative group">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Current Cover
                </p>
                <img
                  src={currentImageUrl}
                  alt="Current Property"
                  className="w-32 h-32 object-cover rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
                />
              </div>
            )}

            <div className="flex-1 w-full">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Update Cover Image
              </p>
              <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-center hover:bg-white dark:hover:bg-gray-800 transition-colors flex flex-col items-center justify-center bg-transparent">
                <label className="block text-[13px] font-bold text-gray-900 dark:text-white mb-2 cursor-pointer">
                  {image
                    ? `Selected: ${image.name}`
                    : "Click to select a new image"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                {!image && (
                  <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    Leave empty to keep current image
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
            disabled={submitting}
            className="px-8 py-3 rounded-xl text-[12px] font-bold uppercase tracking-wide bg-emerald-600 hover:bg-emerald-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            {submitting && (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            )}
            {submitting ? "Saving Updates..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditHotel;
