// src/components/AddItemForm.jsx
import { useState } from "react";

export default function AddItemForm({ onAdd }) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!name) return alert("Enter name");
    onAdd({ name, quantity: Number(quantity || 0), unit });
    setName(""); setQuantity(""); setUnit("");
  };

  return (
    <form className="p-4 bg-white shadow rounded" onSubmit={submit}>
      <h2 className="text-xl font-semibold mb-2">Add New Stock Item</h2>

      <input className="border p-2 w-full mb-2" placeholder="Item name"
        value={name} onChange={(e) => setName(e.target.value)} />

      <input className="border p-2 w-full mb-2" type="number"
        placeholder="Quantity" value={quantity}
        onChange={(e) => setQuantity(e.target.value)} />

      <input className="border p-2 w-full mb-2" placeholder="Unit (Kg, Box, etc.)"
        value={unit} onChange={(e) => setUnit(e.target.value)} />

      <button className="bg-blue-500 text-white px-4 py-2 rounded">Add</button>
    </form>
  );
}
