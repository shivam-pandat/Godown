// src/App.js
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "./AuthContext";
import Login from "./Login";
import AddItemForm from "./components/AddItemForm";
import StockTable from "./components/StockTable";
import ExportButtons from "./components/ExportButtons";
import BarcodeScannerWeb from "./components/BarcodeScannerWeb";
import { getStock, addItem, updateItem, deleteItem, scanBarcode, checkLowStock } from "./api";

function MainApp() {
  const { token, logout } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [onlyLow, setOnlyLow] = useState(false);

  const load = async () => {
    try {
      const res = await getStock();
      setItems(res.data);
    } catch (e) {
      console.error(e);
      if (e.response?.status === 401) logout();
    }
  };

  useEffect(() => { if (token) load(); /* eslint-disable-next-line */ }, [token]);

  const handleAdd = async (data) => { await addItem(data); await load(); };
  const handleUpdate = async (id, data) => { await updateItem(id, data); await load(); };
  const handleDelete = async (id) => { await deleteItem(id); await load(); };
  const handleScan = async (barcode) => {
    try {
      await scanBarcode({ barcode, change: -1 });
      await load();
      alert("Barcode processed: " + barcode);
    } catch (e) {
      alert("Scan error: " + (e.response?.data?.error || e.message));
    }
  };

  const visible = onlyLow ? items.filter(i => i.quantity <= (i.low_threshold || 0) && (i.low_threshold > 0)) : items;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📦 Godown Stock Manager</h1>
        <div className="flex gap-2">
          <button onClick={() => checkLowStock().then(()=>alert('Low stock check triggered'))} className="px-3 py-1 border rounded">Check Low Stock</button>
          <button onClick={logout} className="px-3 py-1 border rounded">Logout</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <AddItemForm onAdd={handleAdd} />
          <div className="mt-4">
            <label className="mr-2"><input type="checkbox" checked={onlyLow} onChange={(e)=>setOnlyLow(e.target.checked)} /> Show only low-stock</label>
          </div>
          <ExportButtons />
          <div className="mt-4">
            <button onClick={() => setShowScanner(s => !s)} className="px-3 py-1 bg-indigo-600 text-white rounded">
              {showScanner ? "Hide Scanner" : "Open Scanner"}
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          {showScanner && <div className="mb-4 p-2 bg-white rounded shadow"><BarcodeScannerWeb onDetected={handleScan} /></div>}
          <StockTable items={visible} onUpdate={(id, qty)=>handleUpdate(id,{quantity:qty})} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { token } = useContext(AuthContext);
  return token ? <MainApp /> : <Login />;
}
