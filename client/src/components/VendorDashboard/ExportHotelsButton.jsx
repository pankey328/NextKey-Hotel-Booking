import React, { useState } from "react";
import api from "../../api";

const ExportHotelsButton = ({ vendorId, disabled }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadHotelsExcel = async () => {
    if (!vendorId) return;
    setDownloading(true);
    try {
      const res = await api.get(`/export/hotels/${vendorId}`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Vendor_Hotels_List_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Failed to download hotels sheet. Please try again.");
      console.error(error.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownloadHotelsExcel}
      disabled={disabled || downloading}
      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-medium rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap w-full sm:w-auto"
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
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      {downloading ? "Generating Sheet..." : "Export Hotels (.xlsx)"}
    </button>
  );
};

export default ExportHotelsButton;
