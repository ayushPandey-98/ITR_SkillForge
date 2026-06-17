import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../../App";
import { useNavigate } from "react-router-dom";
import { FaArrowLeftLong } from "react-icons/fa6";
import { toast } from "react-toastify";

function AdminCreateCourse() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "",
    creator: "",
    subTitle: "",
    description: "",
    level: "",
    price: "",
    isPublished: false,
    thumbnail: null,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(serverUrl + "/api/admin/users", {
          withCredentials: true,
        });
        setUsers(res.data);
      } catch (e) {
        toast.error(e?.response?.data?.message || "Failed to load users");
      }
    };
    fetchUsers();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.category || !form.creator) {
      toast.error("title, category, creator are required");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("category", form.category);
      fd.append("creator", form.creator);
      fd.append("subTitle", form.subTitle || "");
      fd.append("description", form.description || "");
      fd.append("level", form.level || "");
      fd.append("price", form.price || "");
      fd.append("isPublished", form.isPublished);
      if (form.thumbnail) fd.append("thumbnail", form.thumbnail);

      await axios.post(serverUrl + "/api/admin/courses", fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Course created");
      navigate("/admin/courses");
    } catch (e2) {
      toast.error(e2?.response?.data?.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <FaArrowLeftLong className="w-[22px] h-[22px] cursor-pointer" onClick={() => navigate("/admin/courses")} />
          <h1 className="text-xl font-semibold">Add Course (Admin)</h1>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input className="w-full border border-gray-300 rounded-md px-3 py-2" value={form.title} onChange={(e)=>setForm(p=>({...p,title:e.target.value}))} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white" value={form.category} onChange={(e)=>setForm(p=>({...p,category:e.target.value}))}>
                <option value="">Select</option>
                <option>App Development</option>
                <option>AI/ML</option>
                <option>AI Tools</option>
                <option>Data Science</option>
                <option>Data Analytics</option>
                <option>Ethical Hacking</option>
                <option>UI UX Designing</option>
                <option>Web Development</option>
                <option>Others</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Creator</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white" value={form.creator} onChange={(e)=>setForm(p=>({...p,creator:e.target.value}))}>
                <option value="">Select user</option>
                {users.map(u=> (
                  <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sub Title</label>
            <input className="w-full border border-gray-300 rounded-md px-3 py-2" value={form.subTitle} onChange={(e)=>setForm(p=>({...p,subTitle:e.target.value}))} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea className="w-full border border-gray-300 rounded-md px-3 py-2 h-24 resize-none" value={form.description} onChange={(e)=>setForm(p=>({...p,description:e.target.value}))} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Level</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white" value={form.level} onChange={(e)=>setForm(p=>({...p,level:e.target.value}))}>
                <option value="">Select</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <input type="number" className="w-full border border-gray-300 rounded-md px-3 py-2" value={form.price} onChange={(e)=>setForm(p=>({...p,price:e.target.value}))} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" checked={form.isPublished} onChange={(e)=>setForm(p=>({...p,isPublished:e.target.checked}))} />
            <span>Publish now</span>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Thumbnail (optional)</label>
            <input type="file" accept="image/*" onChange={(e)=>setForm(p=>({...p,thumbnail:e.target.files?.[0]||null}))} />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" className="px-4 py-2 rounded-md border border-gray-300" onClick={()=>navigate("/admin/courses")}>Cancel</button>
            <button type="submit" disabled={loading} className="bg-black text-white px-5 py-2 rounded-md disabled:opacity-60">{loading?"Please wait...":"Create"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminCreateCourse;

