import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeftLong } from "react-icons/fa6";
import { serverUrl } from "../../App";

function AssignCourseToEmployees() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [course, setCourse] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);

  const selectedSet = useMemo(
    () => new Set(selectedEmployeeIds.map((id) => String(id))),
    [selectedEmployeeIds]
  );

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${serverUrl}/api/admin/employees`, {
          withCredentials: true,
        });
        setEmployees(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        toast.error(e?.response?.data?.message || "Failed to fetch employees");
      } finally {
        setLoading(false);
      }
    };

    const fetchCourse = async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/admin/courses/${courseId}`,
          { withCredentials: true }
        );
        setCourse(res.data);
      } catch (e) {
        toast.error(e?.response?.data?.message || "Failed to load course");
      }
    };

    if (courseId) {
      fetchEmployees();
      fetchCourse();
    }
  }, [courseId]);

  const toggleEmployee = (id) => {
    setSelectedEmployeeIds((prev) => {
      const s = new Set(prev.map((x) => String(x)));
      const sid = String(id);
      if (s.has(sid)) {
        s.delete(sid);
      } else {
        s.add(sid);
      }
      return Array.from(s);
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!courseId) {
      toast.error("Missing courseId");
      return;
    }

    if (selectedEmployeeIds.length === 0) {
      toast.error("Select at least one employee");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        `${serverUrl}/api/admin/assign-course`,
        {
          courseId,
          employeeIds: selectedEmployeeIds,
        },
        { withCredentials: true }
      );

      toast.success("Course assigned successfully");
      navigate("/admin/courses");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to assign course");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <FaArrowLeftLong
            className="w-[22px] h-[22px] cursor-pointer"
            onClick={() => navigate("/admin/courses")}
          />
          <div>
            <h1 className="text-xl font-semibold">Assign Course</h1>
            <p className="text-sm text-gray-600">
              {course?.title ? `Course: ${course.title}` : "Select employees to assign"}
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">Employees</h2>
            <p className="text-sm text-gray-600 mb-3">
              Multi-select employees to grant them access immediately.
            </p>

            {loading ? (
              <div className="text-sm text-gray-600">Loading employees...</div>
            ) : employees.length === 0 ? (
              <div className="text-sm text-gray-600">No employees found.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {employees.map((u) => (
                  <label
                    key={u._id}
                    className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition ${
                      selectedSet.has(u._id)
                        ? "border-black bg-gray-50"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSet.has(u._id)}
                      onChange={() => toggleEmployee(u._id)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{u.name}</div>
                      <div className="text-sm text-gray-600">{u.email}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded-md border border-gray-300"
              onClick={() => navigate("/admin/courses")}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-black text-white px-5 py-2 rounded-md disabled:opacity-60"
            >
              {submitting ? "Assigning..." : `Assign (${selectedEmployeeIds.length})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssignCourseToEmployees;

