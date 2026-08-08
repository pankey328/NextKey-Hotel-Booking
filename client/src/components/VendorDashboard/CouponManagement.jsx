import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import useDebounce from "../../hooks/useDebounce";
import ExportCouponsButton from "./ExportCouponsButton";

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
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 font-sans h-full flex flex-col">
      {/* PREMIUM HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-gray-900 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden shrink-0">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-gray-100 dark:bg-gray-800/50 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex items-center gap-5">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer shadow-sm"
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
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Coupon Management
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-2">
              Create and manage property discounts
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto relative z-10">
          <ExportCouponsButton
            hotelId={hotelId}
            disabled={coupons.length === 0 || loading}
          />
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
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-[12px] font-bold uppercase tracking-wide bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
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
                strokeWidth="2.5"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
            Add Coupon
          </button>
        </div>
      </div>

      {/* TABS & CONTROLS ROW */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-5 border-b border-gray-200 dark:border-gray-800 pb-4 xl:pb-0 shrink-0">
        {/* TABS (LEFT) */}
        <div className="flex gap-6 px-2 overflow-x-auto whitespace-nowrap w-full xl:w-auto border-b-0 hide-scrollbar">
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-4 px-1 text-[13px] font-bold uppercase tracking-wide border-b-2 transition-all cursor-pointer ${
              activeTab === "active"
                ? "border-gray-900 text-gray-900 dark:border-white dark:text-white"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            Active Coupons
          </button>
          <button
            onClick={() => setActiveTab("trash")}
            className={`pb-4 px-1 text-[13px] font-bold uppercase tracking-wide border-b-2 transition-all cursor-pointer ${
              activeTab === "trash"
                ? "border-gray-900 text-gray-900 dark:border-white dark:text-white"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            Trash (Deleted)
          </button>
        </div>

        {/* CONTROLS (SEARCH & SORT) - RIGHT */}
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto mb-3 px-2 sm:px-0">
          {/* SORT DROPDOWN */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-[13px] font-medium outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors cursor-pointer shadow-sm"
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
              className="w-full border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-[13px] font-medium outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors shadow-sm placeholder-gray-400"
            />
            {searchInput !== debouncedSearch && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-900 dark:border-gray-600 dark:border-t-white rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col flex-1 overflow-hidden min-h-[50vh]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-950/50 text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-5">Code</th>
                <th className="px-6 py-5">Discount</th>
                <th className="px-6 py-5">Expiry</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-[13px]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce"
                          style={{ animationDelay: "-0.3s" }}
                        ></div>
                        <div
                          className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce"
                          style={{ animationDelay: "-0.15s" }}
                        ></div>
                        <div className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce"></div>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm font-medium">
                        Loading coupons...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-16 text-center text-gray-500 dark:text-gray-400 font-medium"
                  >
                    {debouncedSearch
                      ? `No matching coupons found for "${debouncedSearch}".`
                      : `No ${activeTab} coupons found.`}
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr
                    key={c._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="px-6 py-5 font-extrabold text-gray-900 dark:text-white uppercase tracking-wider text-sm">
                      {c.code}
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-bold text-gray-900 dark:text-gray-200">
                        {c.discount}%
                      </span>{" "}
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1 block mt-0.5">
                        Max ₹{c.maxDiscount}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-medium text-gray-600 dark:text-gray-300">
                      {new Date(c.expiryDate).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-5">
                      {c.isDeleted ? (
                        <span className="px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                          In Trash
                        </span>
                      ) : (
                        <span
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest ${
                            c.status === "active"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          }`}
                        >
                          {c.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        {activeTab === "active" ? (
                          <>
                            <button
                              onClick={() => {
                                setCurrentCoupon(c);
                                setIsEdit(true);
                                setShowModal(true);
                              }}
                              className="px-4 py-2 text-[12px] font-bold rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors cursor-pointer active:scale-95"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleAction("softDelete", c._id)}
                              className="px-4 py-2 text-[12px] font-bold rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40 transition-colors cursor-pointer active:scale-95"
                            >
                              Bin
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleAction("restore", c._id)}
                              className="px-4 py-2 text-[12px] font-bold rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer active:scale-95"
                            >
                              Restore
                            </button>
                            <button
                              onClick={() => handleAction("hardDelete", c._id)}
                              className="px-4 py-2 text-[12px] font-bold rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40 transition-colors cursor-pointer active:scale-95"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PREMIUM MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in zoom-in-95 duration-200">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-900 p-6 sm:p-10 rounded-3xl shadow-2xl w-full max-w-xl border border-gray-200 dark:border-gray-800 relative"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
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
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>

            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {isEdit ? "Edit Coupon" : "Create New Coupon"}
              </h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-2">
                Configure discount rules and validity
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Coupon Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. SUMMER20"
                  className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white uppercase outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm font-bold tracking-widest"
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

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                    Discount (%) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="20"
                      className="w-full p-3 pr-8 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm font-medium"
                      value={currentCoupon.discount}
                      onChange={(e) =>
                        setCurrentCoupon({
                          ...currentCoupon,
                          discount: e.target.value,
                        })
                      }
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                      %
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                    Max ₹ Off <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder="1000"
                      className="w-full p-3 pl-8 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm font-medium"
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
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                    Min Order Value <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder="5000"
                      className="w-full p-3 pl-8 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm font-medium"
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
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                    Status
                  </label>
                  <select
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm font-medium cursor-pointer"
                    value={currentCoupon.status}
                    onChange={(e) =>
                      setCurrentCoupon({
                        ...currentCoupon,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                    Valid From <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm font-medium cursor-pointer"
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
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                    Expiry Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors shadow-sm font-medium cursor-pointer"
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
            </div>

            <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-6 py-3 rounded-xl text-[12px] font-bold uppercase tracking-wide border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer active:scale-95 shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 rounded-xl text-[12px] font-bold uppercase tracking-wide bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer active:scale-95 shadow-md hover:shadow-lg"
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
