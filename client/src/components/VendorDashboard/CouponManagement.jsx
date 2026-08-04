import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import useDebounce from "../../hooks/useDebounce";

const CouponManagement = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("active");
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const debouncedSearch = useDebounce(searchInput, 1000);

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState({
    code: "",
    discount: "",
    maxDiscount: "",
    minPrice: "",
    availFrom: "",
    expiryDate: "",
    status: "active",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    setSearchInput("");
    setSortBy("newest");
  }, [activeTab]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const isDeleted = activeTab === "trash";
      let url = `/coupons/${hotelId}?isDeleted=${isDeleted}`;

      if (debouncedSearch) {
        url += `&search=${debouncedSearch}`;
      }

      if (sortBy) {
        url += `&sortBy=${sortBy}`;
      }

      const res = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error fetching coupons");
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [hotelId, activeTab, debouncedSearch, sortBy]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await api.put(`/coupons/${currentCoupon._id}`, currentCoupon, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post(
          `/coupons`,
          { ...currentCoupon, hotelId },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }
      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save coupon");
    }
  };

  const handleAction = async (action, id) => {
    try {
      if (action === "softDelete") {
        await api.patch(
          `/coupons/${id}/soft-delete`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else if (action === "restore") {
        await api.patch(
          `/coupons/${id}/restore`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else if (action === "hardDelete") {
        if (
          !window.confirm(
            "Permanently delete this coupon? This cannot be undone.",
          )
        )
          return;
        await api.delete(`/coupons/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to perform ${action}`);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:underline text-sm font-medium mb-2 block cursor-pointer"
          >
            &larr; Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Coupon Management
          </h1>
        </div>

        <button
          onClick={() => {
            setCurrentCoupon({
              code: "",
              discount: "",
              maxDiscount: "",
              minPrice: "",
              availFrom: "",
              expiryDate: "",
              status: "active",
            });
            setIsEdit(false);
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-5 py-2.5 rounded-lg shadow-sm font-medium cursor-pointer"
        >
          + Add Coupon
        </button>
      </div>

      {/* TABS & CONTROLS ROW */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 border-b border-gray-200 dark:border-gray-700 mb-6 pb-2 lg:pb-0">
        {/* TABS (LEFT) */}
        <div className="flex gap-4 sm:gap-6 text-sm sm:text-base w-full lg:w-auto overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-3 px-1 font-medium transition-all duration-200 border-b-2 cursor-pointer ${
              activeTab === "active"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            Active Coupons
          </button>
          <button
            onClick={() => setActiveTab("trash")}
            className={`pb-3 px-1 font-medium transition-all duration-200 border-b-2 cursor-pointer ${
              activeTab === "trash"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            Trash (Deleted)
          </button>
        </div>

        {/* CONTROLS (SEARCH & SORT) - RIGHT */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto mb-2 px-2 lg:px-0">
          {/* SORT DROPDOWN */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="discount_desc">Discount: High to Low</option>
            <option value="discount_asc">Discount: Low to High</option>
            <option value="expiry_asc">Expiry: Expiring Soon</option>
            <option value="expiry_desc">Expiry: Expiring Later</option>
          </select>

          {/* SEARCH INPUT */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by code..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
            {/* Loading spinner */}
            {searchInput !== debouncedSearch && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
                  Code
                </th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
                  Discount
                </th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
                  Expiry
                </th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
                  Status
                </th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-16 text-center">
                    {/* LOADER */}
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "-0.3s" }}
                        ></div>
                        <div
                          className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "-0.15s" }}
                        ></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm font-medium">
                        Loading coupons...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-500">
                    {debouncedSearch
                      ? `No matching coupons found for "${debouncedSearch}".`
                      : `No ${activeTab} coupons found.`}
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr
                    key={c._id}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <td className="p-4 font-bold text-gray-800 dark:text-white uppercase tracking-wide">
                      {c.code}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">
                      {c.discount}%{" "}
                      <span className="text-xs text-gray-400">
                        (Max ₹{c.maxDiscount})
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">
                      {new Date(c.expiryDate).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="p-4">
                      {c.isDeleted ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                          In Trash
                        </span>
                      ) : (
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${c.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                        >
                          {c.status}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-3">
                      {activeTab === "active" ? (
                        <>
                          <button
                            onClick={() => {
                              setCurrentCoupon(c);
                              setIsEdit(true);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm cursor-pointer active:scale-95"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleAction("softDelete", c._id)}
                            className="text-orange-500 hover:text-orange-700 font-medium text-sm cursor-pointer active:scale-95"
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleAction("restore", c._id)}
                            className="text-green-600 hover:text-green-800 font-medium text-sm cursor-pointer active:scale-95"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => handleAction("hardDelete", c._id)}
                            className="text-red-500 hover:text-red-700 font-medium text-sm cursor-pointer active:scale-95"
                          >
                            Hard Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md space-y-5"
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
              {isEdit ? "Edit Coupon" : "Add New Coupon"}
            </h2>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Coupon Code
              </label>
              <input
                type="text"
                placeholder="e.g. SUMMER20"
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white uppercase"
                value={currentCoupon.code}
                onChange={(e) =>
                  setCurrentCoupon({
                    ...currentCoupon,
                    code: e.target.value.toUpperCase(),
                  })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Discount (%)
                </label>
                <input
                  type="number"
                  placeholder="20"
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  value={currentCoupon.discount}
                  onChange={(e) =>
                    setCurrentCoupon({
                      ...currentCoupon,
                      discount: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Max ₹ Off
                </label>
                <input
                  type="number"
                  placeholder="1000"
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  value={currentCoupon.maxDiscount}
                  onChange={(e) =>
                    setCurrentCoupon({
                      ...currentCoupon,
                      maxDiscount: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Min Order Value (₹)
              </label>
              <input
                type="number"
                placeholder="5000"
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                value={currentCoupon.minPrice}
                onChange={(e) =>
                  setCurrentCoupon({
                    ...currentCoupon,
                    minPrice: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Valid From
                </label>
                <input
                  type="date"
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  value={
                    currentCoupon.availFrom
                      ? currentCoupon.availFrom.split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setCurrentCoupon({
                      ...currentCoupon,
                      availFrom: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  value={
                    currentCoupon.expiryDate
                      ? currentCoupon.expiryDate.split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setCurrentCoupon({
                      ...currentCoupon,
                      expiryDate: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Status
              </label>
              <select
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                value={currentCoupon.status}
                onChange={(e) =>
                  setCurrentCoupon({ ...currentCoupon, status: e.target.value })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm cursor-pointer"
              >
                {isEdit ? "Update Coupon" : "Save Coupon"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CouponManagement;
