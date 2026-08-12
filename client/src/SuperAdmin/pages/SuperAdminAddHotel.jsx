import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";

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

const SuperAdminAddHotel = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [vendors, setVendors] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);

  const [formData, setFormData] = useState({
    vendorId: "",
    name: "",
    hotelType: "Hotel",
    starRating: 3,
    email: "",
    phone: "",
    address: "",
    locationLink: "",
    description: "",
    features: [],
  });
  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [image, setImage] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const vendorRes = await api.get("/vendors?status=approved", config);
        setVendors(vendorRes.data.data || vendorRes.data);
        const stateRes = await api.get("/states?isDeleted=false", config);
        setStates(stateRes.data.data || stateRes.data);
      } catch (error) {}
    };
    fetchInitialData();
  }, [token]);

  const handleStateChange = async (e) => {
    const stateId = e.target.value;
    setSelectedStateId(stateId);
    setSelectedDistrictId("");
    setSelectedCityId("");
    setCities([]);
    try {
      const res = await api.get(
        `/districts?stateId=${stateId}&isDeleted=false`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setDistricts(res.data.data || res.data);
    } catch (error) {}
  };

  const handleDistrictChange = async (e) => {
    const districtId = e.target.value;
    setSelectedDistrictId(districtId);
    setSelectedCityId("");
    try {
      const res = await api.get(
        `/cities?districtId=${districtId}&isDeleted=false`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setCities(res.data.data || res.data);
    } catch (error) {}
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
    if (!image) return alert("Property image is required.");
    if (!selectedCityId)
      return alert("Please select a complete location (City).");
    if (!formData.vendorId) return alert("Please select a Vendor.");

    setLoading(true);
    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "features") {
        submitData.append("features", JSON.stringify(formData.features));
      } else {
        submitData.append(key, formData[key]);
      }
    });
    submitData.append("cityId", selectedCityId);
    submitData.append("image", image);

    try {
      await api.post("/hotels/superadmin/add", submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert(
        "Hotel created successfully, auto-approved, and credentials emailed!",
      );
      navigate("/superadmin-dashboard/hotels");
    } catch (error) {
      alert(error.response?.data?.message || "Error creating hotel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 font-sans">
      <div className="max-w-5xl mx-auto p-6 sm:p-10 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 animate-in fade-in duration-500">
        {/* HEADER SECTION */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-gray-800 pb-6 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              Add Hotel
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] uppercase tracking-widest rounded-lg shadow-sm border border-emerald-200 dark:border-emerald-800/30">
                Auto-Approve
              </span>
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-2">
              Directly assign a live property to a vendor
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="relative z-10 w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer shadow-sm"
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
          {/* VENDOR ASSIGNMENT */}
          <div className="bg-blue-50 dark:bg-blue-900/10 p-6 sm:p-8 rounded-2xl border border-blue-100 dark:border-blue-800/30 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">
                Assign to Vendor <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.vendorId}
                onChange={(e) =>
                  setFormData({ ...formData, vendorId: e.target.value })
                }
                className="w-full border border-blue-200 dark:border-blue-700/50 rounded-xl p-3.5 text-[13px] font-bold bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors shadow-sm cursor-pointer tracking-wide"
              >
                <option value="" disabled>
                  Select Vendor...
                </option>
                {vendors.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.companyName} ({v.applicantName})
                  </option>
                ))}
              </select>
            </div>
          </div>

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
                  required
                  autoComplete="off"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Grand Plaza Hotel"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm placeholder-gray-400"
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
                  Hotel Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  autoComplete="off"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="contact@property.com"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  autoComplete="off"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+91 9876543210"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm placeholder-gray-400"
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
                  required
                  autoComplete="off"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Street address, neighborhood"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  State <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedStateId}
                  onChange={handleStateChange}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm cursor-pointer"
                >
                  <option value="" disabled>
                    Select State...
                  </option>
                  {states.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  District <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  disabled={!selectedStateId}
                  value={selectedDistrictId}
                  onChange={handleDistrictChange}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <option value="" disabled>
                    Select District...
                  </option>
                  {districts.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  City <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  disabled={!selectedDistrictId}
                  value={selectedCityId}
                  onChange={(e) => setSelectedCityId(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <option value="" disabled>
                    Select City...
                  </option>
                  {cities.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
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
                  autoComplete="off"
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
                placeholder="Describe the property, its uniqueness, and surroundings..."
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-[13px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm resize-none placeholder-gray-400"
              ></textarea>
            </div>
          </section>

          {/* Media */}
          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-5 border-b border-gray-100 dark:border-gray-800 pb-2">
              Media
            </h2>
            <div className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex flex-col items-center justify-center">
              <label className="block text-[13px] font-bold text-gray-900 dark:text-white mb-2 cursor-pointer">
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
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  Click to browse (JPG, PNG, WEBP)
                </span>
              )}
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
              {loading ? "Creating..." : "Create & Auto-Approve"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminAddHotel;
