import React, { useState } from "react";
import api from "../../api";
import { parseCsvText, fetchCsvContent } from "../../utils/csvParser";
import {
  XMarkIcon,
  CloudArrowUpIcon,
  LinkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

const ImportHotelsButton = ({ vendorId, disabled, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("file"); // "file" | "link"
  const [sheetUrl, setSheetUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [step, setStep] = useState(1);
  const [previewData, setPreviewData] = useState(null);
  const [duplicateMode, setDuplicateMode] = useState("skip"); // "skip" | "overwrite"

  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Frontend Parsing & Backend Dry Run Preview
  const handleFetchPreview = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      // Frontend Parsing - convert CSV file or Google Sheet to JSON array
      const csvText = await fetchCsvContent(activeTab, sheetUrl, selectedFile);
      const rawRows = parseCsvText(csvText);

      if (!rawRows || rawRows.length === 0) {
        throw new Error("The sheet/CSV file contains no hotel data rows.");
      }

      // Dry Run (Preview API) - send JSON array to backend preview endpoint
      const res = await api.post("/import/hotels/preview", {
        vendorId,
        rawRows,
      });

      // Store backend annotated preview data
      setPreviewData(res.data);
      setStep(2);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || err.message || "Failed to process hotel preview dry run.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateModeChange = (mode) => {
    setDuplicateMode(mode);
    if (!previewData) return;

    const updatedItems = previewData.items.map((item) => {
      if (item.status === "duplicate") {
        return {
          ...item,
          action: mode === "overwrite" ? "update" : "skip",
        };
      }
      return item;
    });

    setPreviewData({
      ...previewData,
      items: updatedItems,
    });
  };

  const startEditing = (item) => {
    setEditingId(item.tempId);
    setEditFormData({ ...item.data });
  };

  const saveEditing = (tempId) => {
    if (!previewData) return;

    const updatedItems = previewData.items.map((item) => {
      if (item.tempId === tempId) {
        return {
          ...item,
          data: { ...editFormData },
          status: "new",
          action: "create",
          existingData: null,
        };
      }
      return item;
    });

    const newCount = updatedItems.filter((i) => i.status === "new").length;
    const duplicateCount = updatedItems.filter((i) => i.status === "duplicate").length;
    const invalidCount = updatedItems.filter((i) => i.status === "invalid").length;

    setPreviewData({
      ...previewData,
      summary: {
        total: updatedItems.length,
        newCount,
        duplicateCount,
        invalidCount,
      },
      items: updatedItems,
    });

    setEditingId(null);
  };

  // Import Submission
  const handleConfirmImport = async () => {
    if (!previewData || !previewData.items) return;

    setConfirming(true);
    setErrorMsg("");

    try {
      const payload = {
        vendorId,
        items: previewData.items,
      };

      const res = await api.post("/import/hotels/confirm", payload);

      alert(
        res.data.message ||
          `Hotels imported successfully! ${res.data.createdCount} created, ${res.data.updatedCount} updated.`,
      );

      if (onSuccess) onSuccess();
      handleCloseModal();
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Failed to confirm hotels import.",
      );
    } finally {
      setConfirming(false);
    }
  };

  const handleCloseModal = () => {
    setStep(1);
    setPreviewData(null);
    setSelectedFile(null);
    setSheetUrl("");
    setErrorMsg("");
    setEditingId(null);
    setIsOpen(false);
  };

  return (
    <>
      {/* TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(true)}
        disabled={disabled || !vendorId}
        className="flex items-center justify-center gap-2.5 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-bold uppercase tracking-wide rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none w-full sm:w-auto"
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
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
        <span>Import Hotels (.csv / Sheet)</span>
      </button>

      {/* IMPORT HOTELS MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden transition-all duration-300">
            {/* MODAL HEADER */}
            <div className="px-6 sm:px-8 py-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <span>Bulk Import Hotels</span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-full">
                    Step {step} of 2
                  </span>
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-light">
                  {step === 1
                    ? "Upload a CSV file or paste a public Google Sheets URL."
                    : "Verify parsed hotel properties, resolve duplicates, and confirm."}
                </p>
              </div>

              <button
                onClick={handleCloseModal}
                className="p-2 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 text-xs font-medium flex items-center gap-3">
                  <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* STEP 1: SOURCE SELECTION & UPLOAD */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex border-b border-neutral-200 dark:border-neutral-800">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("file");
                        setErrorMsg("");
                      }}
                      className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-colors ${
                        activeTab === "file"
                          ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                          : "border-transparent text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
                      }`}
                    >
                      <CloudArrowUpIcon className="w-4 h-4" />
                      CSV File Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("link");
                        setErrorMsg("");
                      }}
                      className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-colors ${
                        activeTab === "link"
                          ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                          : "border-transparent text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
                      }`}
                    >
                      <LinkIcon className="w-4 h-4" />
                      Google Sheet Link
                    </button>
                  </div>

                  <form onSubmit={handleFetchPreview} className="space-y-6">
                    {activeTab === "file" ? (
                      <div className="border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-neutral-50/50 dark:bg-neutral-950/40">
                        <CloudArrowUpIcon className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                          Choose Hotels CSV File
                        </h3>
                        <p className="text-xs text-neutral-400 mb-4 font-light">
                          Must be a valid `.csv` file format
                        </p>
                        <input
                          type="file"
                          accept=".csv"
                          id="hotels-csv-input"
                          className="hidden"
                          onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                        />
                        <label
                          htmlFor="hotels-csv-input"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-black text-xs font-semibold rounded-xl cursor-pointer transition-all active:scale-95 shadow-md"
                        >
                          Browse File
                        </label>
                        {selectedFile && (
                          <div className="mt-4 inline-block px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-medium rounded-lg">
                            Selected: {selectedFile.name}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                          Google Sheets Public URL
                        </label>
                        <div className="relative">
                          <LinkIcon className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            type="url"
                            value={sheetUrl}
                            onChange={(e) => setSheetUrl(e.target.value)}
                            placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit#gid=0"
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                          />
                        </div>
                        <p className="text-[11px] text-neutral-400 font-light ml-1">
                          ⚠️ Make sure Google Sheet Sharing is set to <strong>"Anyone with the link can view"</strong>.
                        </p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto px-8 py-3.5 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin"></div>
                            <span>Parsing & Checking Hotels...</span>
                          </>
                        ) : (
                          "Preview Hotels & Check Duplicates"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* STEP 3: PREVIEW UI & INTERACTIVE VERIFICATION */}
              {step === 2 && previewData && (
                <div className="space-y-6">
                  {/* SUMMARY BADGES */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/50 text-center">
                      <span className="text-2xl font-black text-neutral-900 dark:text-white">
                        {previewData.summary.total}
                      </span>
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mt-0.5">
                        Total Hotels
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-center">
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {previewData.summary.newCount}
                      </span>
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                        New Hotels
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 text-center">
                      <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                        {previewData.summary.duplicateCount}
                      </span>
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-amber-600/80 dark:text-amber-400/80 mt-0.5">
                        Duplicates
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-800/40 text-center">
                      <span className="text-2xl font-black text-red-600 dark:text-red-400">
                        {previewData.summary.invalidCount}
                      </span>
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-red-600/80 dark:text-red-400/80 mt-0.5">
                        Invalid Rows
                      </span>
                    </div>
                  </div>

                  {/* DUPLICATE HANDLING SELECTOR */}
                  {previewData.summary.duplicateCount > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-semibold">
                        <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
                        <span>Duplicate hotel properties exist in your portfolio! Choose how to handle them:</span>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => handleDuplicateModeChange("skip")}
                          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                            duplicateMode === "skip"
                              ? "bg-amber-600 text-white shadow-md"
                              : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                          }`}
                        >
                          Skip Duplicates
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateModeChange("overwrite")}
                          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                            duplicateMode === "overwrite"
                              ? "bg-amber-600 text-white shadow-md"
                              : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                          }`}
                        >
                          Overwrite Hotels
                        </button>
                      </div>
                    </div>
                  )}

                  {/* PREVIEW HOTELS TABLE */}
                  <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white dark:bg-neutral-900">
                    <div className="overflow-x-auto max-h-[350px]">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-neutral-100 dark:bg-neutral-950 text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-10">
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5">Hotel Name</th>
                            <th className="p-3.5">Contact & Location</th>
                            <th className="p-3.5">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                          {previewData.items.map((item) => {
                            const isEditing = editingId === item.tempId;

                            return (
                              <tr
                                key={item.tempId}
                                className={`transition-colors ${
                                  item.status === "duplicate"
                                    ? "bg-amber-50/40 dark:bg-amber-950/10"
                                    : item.status === "invalid"
                                      ? "bg-red-50/40 dark:bg-red-950/10"
                                      : "hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                                }`}
                              >
                                {/* STATUS BADGE */}
                                <td className="p-3.5 align-top whitespace-nowrap">
                                  {item.status === "new" && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] uppercase">
                                      <CheckCircleIcon className="w-3.5 h-3.5" />
                                      NEW
                                    </span>
                                  )}
                                  {item.status === "duplicate" && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 font-bold text-[10px] uppercase">
                                      <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                                      DUPLICATE
                                    </span>
                                  )}
                                  {item.status === "invalid" && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 font-bold text-[10px] uppercase">
                                      INVALID
                                    </span>
                                  )}
                                </td>

                                {/* HOTEL NAME */}
                                <td className="p-3.5 align-top font-bold text-neutral-900 dark:text-white whitespace-nowrap">
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={editFormData.name || ""}
                                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                      className="px-2 py-1 rounded border border-blue-500 dark:bg-neutral-950 text-xs w-48 font-semibold"
                                    />
                                  ) : (
                                    <div>
                                      <p>{item.data.name}</p>
                                      <span className="text-[10px] text-neutral-400 uppercase font-mono">{item.data.hotelType || "Hotel"}</span>
                                    </div>
                                  )}
                                </td>

                                {/* CONTACT & LOCATION */}
                                <td className="p-3.5 align-top">
                                  {isEditing ? (
                                    <div className="grid grid-cols-2 gap-2">
                                      <input
                                        type="email"
                                        placeholder="Email"
                                        value={editFormData.email || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                        className="px-2 py-1 border rounded dark:bg-neutral-950"
                                      />
                                      <input
                                        type="text"
                                        placeholder="Phone"
                                        value={editFormData.phone || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                        className="px-2 py-1 border rounded dark:bg-neutral-950"
                                      />
                                    </div>
                                  ) : (
                                    <div className="space-y-1">
                                      <p className="font-medium text-neutral-900 dark:text-white">
                                        {item.data.email} | {item.data.phone}
                                      </p>
                                      <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                                        {item.data.address} ({item.data.cityName || "N/A"}, {item.data.stateName || "N/A"})
                                      </p>
                                      {item.existingData && (
                                        <div className="p-1.5 rounded-lg bg-amber-100/60 dark:bg-amber-900/30 text-[11px] text-amber-800 dark:text-amber-300 font-mono">
                                          <strong>Existing DB Hotel:</strong> {item.existingData.name} ({item.existingData.email})
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </td>

                                {/* ROW ACTION / EDIT */}
                                <td className="p-3.5 align-top whitespace-nowrap">
                                  {isEditing ? (
                                    <button
                                      type="button"
                                      onClick={() => saveEditing(item.tempId)}
                                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold flex items-center gap-1 text-[11px]"
                                    >
                                      <CheckIcon className="w-3.5 h-3.5" />
                                      Save & Add
                                    </button>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => startEditing(item)}
                                        className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-lg font-medium flex items-center gap-1 text-[11px]"
                                      >
                                        <PencilSquareIcon className="w-3.5 h-3.5" />
                                        Edit
                                      </button>
                                      <span className="text-[10px] font-mono text-neutral-400 uppercase">
                                        {item.action || "create"}
                                      </span>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* FOOTER ACTIONS */}
                  <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                    >
                      ← Back to Upload Source
                    </button>

                    <button
                      type="button"
                      onClick={handleConfirmImport}
                      disabled={confirming}
                      className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {confirming ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Importing Hotels...</span>
                        </>
                      ) : (
                        "Confirm & Import Hotels"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImportHotelsButton;
