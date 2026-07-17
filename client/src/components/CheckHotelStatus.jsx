import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

const CheckHotelStatus = () => {
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState("");
  const [hotelData, setHotelData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({});
  const [image, setImage] = useState(null);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);

  const fetchStates = async () => {
    try {
      const res = await api.get("/states?isDeleted=false");
      setStates(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchDistricts = async (stateId) => {
    try {
      const res = await api.get(
        `/districts?stateId=${stateId}&isDeleted=false`,
      );
      setDistricts(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchCities = async (districtId) => {
    try {
      const res = await api.get(
        `/cities?districtId=${districtId}&isDeleted=false`,
      );
      setCities(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (
      hotelData &&
      (hotelData.status === "pending" || hotelData.status === "rejected")
    ) {
      fetchStates();
      fetchDistricts(hotelData.stateId);
      fetchCities(hotelData.districtId);
    }
  }, [hotelData]);

  const handleCheckStatus = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    setLoading(true);
    try {
      const res = await api.get(`/hotels/status/${trackingId}`);
      setHotelData(res.data.data);
      // fill the form data
      setFormData({
        name: res.data.data.name,
        hotelType: res.data.data.hotelType,
        description: res.data.data.description,
        address: res.data.data.address,
        starRating: res.data.data.starRating,
        email: res.data.data.email,
        phone: res.data.data.phone,
        locationLink: res.data.data.locationLink,
        stateId: res.data.data.stateId,
        districtId: res.data.data.districtId,
        cityId: res.data.data.cityId,
      });
    } catch (error) {
      alert(error.response?.data?.message || "Invalid Tracking ID");
      setHotelData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = new FormData();
    Object.keys(formData).forEach((key) =>
      submitData.append(key, formData[key]),
    );
    if (image) submitData.append("image", image);

    try {
      await api.put(`/hotels/update/${trackingId}`, submitData);
      alert("Application updated successfully!");
      setHotelData({ ...hotelData, status: "pending" });
    } catch (error) {
      alert(error.response?.data?.message || "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  // Check Appliaction status Id UI (asking for Tracking Id)
  if (!hotelData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Check Application Status
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
            Enter the Tracking ID sent to your email.
          </p>
          <form onSubmit={handleCheckStatus}>
            <input
              type="text"
              required
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter Tracking ID"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all"
            >
              {loading ? "Checking..." : "Check Status"}
            </button>
          </form>
          <div className="mt-4">
            <Link
              to="/register-hotel"
              className="text-sm text-blue-600 hover:underline"
            >
              Back to Registration
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Approved State (After User submit the Tracking ID)
  if (hotelData.status === "approved") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Application Approved!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your credentials have been sent to <b>{hotelData.email}</b>.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Pending or Rejected State (Show Update Form with prefilled data)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-10 w-full max-w-3xl border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Update Application
          </h1>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${hotelData.status === "rejected" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"}`}
          >
            {hotelData.status}
          </span>
        </div>

        {hotelData.status === "rejected" && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <h3 className="text-red-800 dark:text-red-400 font-bold mb-1">
              Rejection Reason:
            </h3>
            <p className="text-red-700 dark:text-red-300 text-sm">
              {hotelData.rejectRemark}
            </p>
            <p className="text-red-600 dark:text-red-400 text-xs mt-2 font-medium">
              Please update your details below and resubmit.
            </p>
          </div>
        )}

        <form onSubmit={handleUpdateSubmit} className="space-y-6">
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
                className="w-full px-4 py-2.5 rounded-lg border dark:border-gray-600 border-gray-300 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-2.5 rounded-lg border dark:border-gray-600 border-gray-300 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
                className="w-full px-4 py-2.5 rounded-lg border dark:border-gray-600 border-gray-300 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
                className="w-full px-4 py-2.5 rounded-lg border dark:border-gray-600 border-gray-300 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
                className="w-full px-4 py-2.5 rounded-lg border dark:border-gray-600 border-gray-300 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State
              </label>
              <select
                value={formData.stateId}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    stateId: e.target.value,
                    districtId: "",
                    cityId: "",
                  });
                  fetchDistricts(e.target.value);
                }}
                className="w-full px-4 py-2.5 rounded-lg border dark:border-gray-600 border-gray-300 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="" disabled>
                  Select State
                </option>
                {states.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                District
              </label>
              <select
                value={formData.districtId}
                disabled={!formData.stateId}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    districtId: e.target.value,
                    cityId: "",
                  });
                  fetchCities(e.target.value);
                }}
                className="w-full px-4 py-2.5 rounded-lg border dark:border-gray-600 border-gray-300 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
              >
                <option value="" disabled>
                  Select District
                </option>
                {districts.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City
              </label>
              <select
                value={formData.cityId}
                disabled={!formData.districtId}
                onChange={(e) =>
                  setFormData({ ...formData, cityId: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-lg border dark:border-gray-600 border-gray-300 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
              >
                <option value="" disabled>
                  Select City
                </option>
                {cities.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name.toUpperCase()}
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
                className="w-full px-4 py-2.5 rounded-lg border dark:border-gray-600 border-gray-300 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-2.5 rounded-lg border dark:border-gray-600 border-gray-300 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
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
              className="w-full px-4 py-2.5 rounded-lg border dark:border-gray-600 border-gray-300 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 cursor-pointer">
              {image
                ? `New Image: ${image.name}`
                : "Upload New Image (Leave blank to keep current image)"}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-70"
          >
            {loading ? "Updating..." : "Resubmit Application"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckHotelStatus;
