import { useEffect, useState } from 'react';
import axios from 'axios';

export default function UserManagement() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/auth/users').then(res => setUsers(res.data));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">User Management</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-4">ID</th><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? <tr><td colSpan="4" className="p-4 text-center text-gray-500">No users found.</td></tr> :
              users.map(u => (
                <tr key={u.id} className="border-b">
                  <td className="p-4">#{u.id}</td>
                  <td className="p-4 font-semibold">{u.username}</td>
                  <td className="p-4">{u.email}</td>
                  <td className="p-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">{u.role}</span></td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}