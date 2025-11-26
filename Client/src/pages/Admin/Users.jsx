import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from "react-hot-toast";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      // Normalize user list from possible response shapes
      let list = res.data?.users 
        || res.data?.data 
        || res.data?.data?.users 
        || [];
      setUsers(list);
    } catch {
      setUsers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("User deleted successfully");
      fetchUsers(); // refresh
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  // Helper to check if user is verified (by OTP or other means)
  const isUserVerified = (user) => {
    // Consider user verified if they have ever verified OTP (set by backend)
    // Common fields: isEmailVerified, emailVerified, or a field like otpVerified
    return (
      user.isEmailVerified === true ||
      user.isEmailVerified === 'true' ||
      user.isEmailVerified === 'verified' ||
      user.emailVerified === true ||
      user.emailVerified === 'true' ||
      user.emailVerified === 'verified' ||
      user.otpVerified === true ||
      user.otpVerified === 'true'
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">All Registered Users</h2>
        <span className="text-lg font-semibold text-gray-700">
          Total Users: {users.length}
        </span>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : users.length === 0 ? (
        <div>No users found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left">#</th>
                <th className="py-2 px-4 border-b text-left">Email</th>
                <th className="py-2 px-4 border-b text-left">Name</th>
                <th className="py-2 px-4 border-b text-left">Verified</th>
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={user._id} className="hover:bg-orange-50 transition">
                  <td className="py-2 px-4 border-b">{idx + 1}</td>
                  <td className="py-2 px-4 border-b">{user.email}</td>
                  <td className="py-2 px-4 border-b">{user.name || '-'}</td>
                  <td className="py-2 px-4 border-b">
                    {isUserVerified(user) ? (
                      <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-xs">
                        Verified
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 font-semibold text-xs">
                        Not Verified
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;
