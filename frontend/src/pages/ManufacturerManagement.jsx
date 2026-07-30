import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ManufacturerManagement() {
  const [manufacturers, setManufacturers] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/auth/users').then(res => {
      setManufacturers(res.data.filter(u => u.role === "Textile Manufacturer"));
    });
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Manufacturer Management</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-4">ID</th><th className="p-4">Manufacturer Name</th><th className="p-4">Email</th>
            </tr>
          </thead>
          <tbody>
            {manufacturers.length === 0 ? <tr><td colSpan="3" className="p-4 text-center text-gray-500">No manufacturers registered.</td></tr> :
              manufacturers.map(u => (
                <tr key={u.id} className="border-b">
                  <td className="p-4">#{u.id}</td>
                  <td className="p-4 font-semibold">{u.username}</td>
                  <td className="p-4">{u.email}</td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}