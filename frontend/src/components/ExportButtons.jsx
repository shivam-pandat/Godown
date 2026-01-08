// components/ExportButtons.jsx
import React from "react";
import FileSaver from "file-saver";
import { exportExcel, exportPDF, exportTally } from "../api";

export default function ExportButtons() {
  const downloadBlob = (res, defaultName) => {
    const blob = new Blob([res.data], { type: res.headers["content-type"] });
    FileSaver.saveAs(blob, defaultName);
  };

  const handleExcel = async () => {
    try {
      const res = await exportExcel();
      downloadBlob(res, "stock.xlsx");
    } catch (e) {
      alert("Export error: " + (e.response?.data?.error || e.message));
    }
  };

  const handlePDF = async () => {
    try {
      const res = await exportPDF();
      downloadBlob(res, "stock.pdf");
    } catch (e) {
      alert("Export error: " + (e.response?.data?.error || e.message));
    }
  };

  const handleTally = async () => {
    try {
      const res = await exportTally();
      downloadBlob(res, "stock_tally.xml");
    } catch (e) {
      alert("Export error: " + (e.response?.data?.error || e.message));
    }
  };

  return (
    <div className="flex gap-2 mt-4">
      <button onClick={handleExcel} className="px-3 py-1 bg-green-600 text-white rounded">Export Excel</button>
      <button onClick={handlePDF} className="px-3 py-1 bg-gray-700 text-white rounded">Export PDF</button>
      <button onClick={handleTally} className="px-3 py-1 bg-yellow-600 text-white rounded">Export to Tally (XML)</button>
    </div>
  );
}
