import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../../App";
import { FaArrowLeftLong } from "react-icons/fa6";
import { toast } from "react-toastify";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    description: "",
  });

  const [roleUpdating, setRoleUpdating] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(serverUrl + "/api/admin/users", {
        withCredentials: true,
      });
      setUsers(res.data);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.password) {
      toast.error("Fill name, email, password, role");
      return;
    }

    setLoading(true);
    try {
      await axios.post(serverUrl + "/api/admin/users", createForm, {
        withCredentials: true,
      });
      toast.success("User created");
      setCreateForm({ name: "", email: "", password: "", role: "employee", description: "" });
      await fetchUsers();
    } catch (e2) {
      toast.error(e2?.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    setRoleUpdating(userId);
    try {
      const res = await axios.patch(
        serverUrl + `/api/admin/users/${userId}/role`,
        { role: newRole },
        { withCredentials: true }
      );
      toast.success("Role updated");
      setUsers((prev) => prev.map((u) => (u._id === userId ? res.data : u)));
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update role");
    } finally {
      setRoleUpdating(null);
    }
  };

  const handleDelete = async (userId) => {
    const ok = window.confirm("Delete this user? This cannot be undone.");
    if (!ok) return;

    setLoading(true);
    try {
      await axios.delete(serverUrl + `/api/admin/users/${userId}`, {
        withCredentials: true,
      });
      toast.success("User deleted");
      await fetchUsers();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-6 flex-col sm:flex-row">
          <div className="flex items-center gap-3">
            <FaArrowLeftLong
              className="w-[22px] h-[22px] cursor-pointer"
              onClick={() => (window.location.href = "/dashboard")}
            />
            <h1 className="text-xl font-semibold">User Management</h1>
          </div>
        </div>

        {/* Create user */}
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={createForm.name}
              onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Employee name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={createForm.email}
              onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="employee@org.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={createForm.password}
              onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
              placeholder="Minimum 8 chars"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
              value={createForm.role}
              onChange={(e) => setCreateForm((p) => ({ ...p, role: e.target.value }))}
            >
              <option value="employee">employee</option>
              <option value="manager">manager</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description (optional)</label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={createForm.description}
              onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Short bio"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-5 py-2 rounded-md disabled:opacity-60"
            >
              {loading ? "Please wait..." : "Create user"}
            </button>
          </div>
        </form>

        {/* Users table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4">User</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Role</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b hover:bg-gray-50 transition">
                  <td className="py-3 px-4">{u.name}</td>
                  <td className="py-3 px-4">{u.email}</td>
                  <td className="py-3 px-4">
                    <select
                      className="border border-gray-300 rounded-md px-2 py-1 bg-white"
                      value={u.role}
                      disabled={roleUpdating === u._id}
                      onChange={(e) => handleRoleUpdate(u._id, e.target.value)}
                    >
                      <option value="admin">admin</option>
                      <option value="manager">manager</option>
                      <option value="employee">employee</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(u._id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td className="py-10 px-4 text-center text-gray-500" colSpan={4}>
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Users;

