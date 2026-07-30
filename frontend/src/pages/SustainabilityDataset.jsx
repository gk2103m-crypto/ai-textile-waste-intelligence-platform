const MOCK_DATA = [
  { id: 1, brand: "EcoWear", country: "India", material: "Cotton", rating: "A", carbon: "2.1 kg CO2/kg" },
  { id: 2, brand: "GreenFiber", country: "Bangladesh", material: "Polyester", rating: "C", carbon: "5.8 kg CO2/kg" },
  { id: 3, brand: "PureLinen Co.", country: "India", material: "Linen", rating: "B", carbon: "3.4 kg CO2/kg" },
];

const RATING_COLORS = { A: "bg-green-100 text-green-700", B: "bg-blue-100 text-blue-700", C: "bg-yellow-100 text-yellow-700", D: "bg-red-100 text-red-700" };

export default function SustainabilityDataset() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Sustainability Dataset</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-4">ID</th><th className="p-4">Brand</th><th className="p-4">Country</th><th className="p-4">Material</th><th className="p-4">Rating</th><th className="p-4">Carbon Footprint</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_DATA.map(row => (
              <tr key={row.id} className="border-b">
                <td className="p-4">#{row.id}</td>
                <td className="p-4 font-semibold">{row.brand}</td>
                <td className="p-4">{row.country}</td>
                <td className="p-4">{row.material}</td>
                <td className="p-4"><span className={`px-2 py-1 rounded text-sm font-medium ${RATING_COLORS[row.rating]}`}>{row.rating}</span></td>
                <td className="p-4">{row.carbon}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-3 italic">Real-time dataset integration planned for Milestone 3.</p>
    </div>
  );
}