import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";

const SuperAdminAddHotel = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Dropdown Data
  const [vendors, setVendors] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);

  // Form State
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
        // Fetch approved vendors
        const vendorRes = await api.get("/vendors?status=approved", config);
        setVendors(vendorRes.data.data || vendorRes.data);

        // Fetch states
        const stateRes = await api.get("/states?isDeleted=false", config);
        setStates(stateRes.data.data || stateRes.data);
      } catch (error) {
        console.error("Error fetching initial data", error);
      }
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
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setCities(res.data.data || res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return alert("Property image is required.");
    if (!selectedCityId)
      return alert("Please select a complete location (City).");
    if (!formData.vendorId) return alert("Please select a Vendor.");

    setLoading(true);
    const submitData = new FormData();
    Object.keys(formData).forEach((key) =>
      submitData.append(key, formData[key]),
    );
    submitData.append("stateId", selectedStateId);
    submitData.append("districtId", selectedDistrictId);
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-10 max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
        Add Hotel (Auto-Approve)
      </h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
        Creates a live hotel assigned to an existing vendor.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* VENDOR SELECTION */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
          <label className="block text-sm font-bold text-blue-800 dark:text-blue-300 mb-1">
            Assign to Vendor *
          </label>
          <select
            required
            value={formData.vendorId}
            onChange={(e) =>
              setFormData({ ...formData, vendorId: e.target.value })
            }
            className="w-full px-4 py-2.5 rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="" disabled>
              Select Vendor 
            </option>
            {vendors.map((v) => (
              <option key={v._id} value={v._id}>
                {v.companyName} ({v.applicantName})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Property Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
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
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rating
            </label>
            <select
              value={formData.starRating}
              onChange={(e) =>
                setFormData({ ...formData, starRating: Number(e.target.value) })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} Stars
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hotel Email (Login ID)
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Local Address
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              State
            </label>
            <select
              required
              value={selectedStateId}
              onChange={handleStateChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              District
            </label>
            <select
              required
              disabled={!selectedStateId}
              value={selectedDistrictId}
              onChange={handleDistrictChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              City
            </label>
            <select
              required
              disabled={!selectedDistrictId}
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Property Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="md:col-span-2">
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
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition-all"
          >
            {loading ? "Creating..." : "Create & Approve Hotel"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SuperAdminAddHotel;
