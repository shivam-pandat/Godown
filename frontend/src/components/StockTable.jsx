// src/components/StockTable.jsx
export default function StockTable({ items, onUpdate, onDelete }) {
  return (
    <table className="w-full mt-4 border-collapse">
      <thead>
        <tr className="bg-gray-200">
          <th className="border p-2">Item</th>
          <th className="border p-2">Quantity</th>
          <th className="border p-2">Unit</th>
          <th className="border p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map((i) => (
          <tr key={i.id}>
            <td className="border p-2">{i.name}</td>
            <td className="border p-2">
              <input
                type="number"
                defaultValue={i.quantity}
                onBlur={(e) => onUpdate(i.id, Number(e.target.value))}
                className="w-20 border p-1"
              />
            </td>
            <td className="border p-2">{i.unit}</td>
            <td className="border p-2">
              <button className="bg-red-500 text-white px-2 py-1 rounded"
                onClick={() => onDelete(i.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
