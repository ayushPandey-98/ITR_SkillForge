import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaEdit } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { serverUrl } from "../../App";
import { ClipLoader } from "react-spinners";
import { useDispatch, useSelector } from "react-redux";
import { setLectureData } from "../../redux/lectureSlice";

function CreateLecture() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const dispatch = useDispatch();
  const { lectureData } = useSelector((state) => state.lecture);

  const [lectureTitle, setLectureTitle] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [isPreviewFree, setIsPreviewFree] = useState(true);

  // materials UI
  // Each item: { type: 'pdf'|'video'|'videoLink', title, file (File|null), videoLink (string) }
  const [materials, setMaterials] = useState([
    { type: "pdf", title: "", file: null, videoLink: "" },
  ]);

  const [loading, setLoading] = useState(false);

  const addMaterialRow = () => {
    setMaterials((prev) => [
      ...prev,
      { type: "videoLink", title: "", file: null, videoLink: "" },
    ]);
  };

  const handleMaterialChange = (idx, patch) => {
    setMaterials((prev) => prev.map((m, i) => (i === idx ? { ...m, ...patch } : m)));
  };

  const createLectureHandler = async () => {
    if (!lectureTitle || !courseId) {
      toast.error("lectureTitle and courseId are required");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("lectureTitle", lectureTitle);
      fd.append("chapterTitle", chapterTitle || "");
      fd.append("isPreviewFree", isPreviewFree);

      const payloadMaterials = materials.map((m) => {
        if (m.type === "videoLink") {
          return {
            type: m.type,
            title: m.title || "",
            videoLink: m.videoLink || "",
            fileUrl: "",
          };
        }

        // pdf/video
        return {
          type: m.type,
          title: m.title || "",
          fileUrl: "", // backend will upload and fill
          videoLink: "",
        };
      });

      fd.append("materials", JSON.stringify(payloadMaterials));

      // append files according to type
      materials.forEach((m) => {
        if (!m.file) return;
        if (m.type === "pdf") fd.append("pdfFiles", m.file);
        if (m.type === "video") fd.append("videoFiles", m.file);
      });

      const result = await axios.post(
        serverUrl + `/api/course/createlecture/${courseId}`,
        fd,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success("Lecture / Chapter material created");
      dispatch(setLectureData([...lectureData, result.data.lecture]));

      // reset form
      setLectureTitle("");
      setChapterTitle("");
      setIsPreviewFree(true);
      setMaterials([{ type: "pdf", title: "", file: null, videoLink: "" }]);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to create lecture/materials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getLecture = async () => {
      try {
        const result = await axios.get(
          serverUrl + `/api/course/getcourselecture/${courseId}`,
          { withCredentials: true }
        );
        dispatch(setLectureData(result.data.lectures));
      } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.message || "Failed to load lectures");
      }
    };
    getLecture();
  }, []);

  const visibleLectureList = useMemo(() => lectureData || [], [lectureData]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-xl w-full max-w-2xl p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-1">
            Let’s Add Chapter Materials
          </h1>
          <p className="text-sm text-gray-500">
            Add a lecture title inside a chapter and attach PDFs/videos/video links.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Chapter Title</label>
            <input
              type="text"
              placeholder="e.g. Chapter 1: Basics"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Lecture Title</label>
            <input
              type="text"
              placeholder="e.g. Introduction"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={lectureTitle}
              onChange={(e) => setLectureTitle(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isPreviewFree}
              onChange={(e) => setIsPreviewFree(e.target.checked)}
            />
            <span className="text-sm">Free preview</span>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold">Materials</h2>
              <button
                type="button"
                className="text-sm font-medium text-black hover:text-gray-700"
                onClick={addMaterialRow}
              >
                + Add Material
              </button>
            </div>

            <div className="space-y-3">
              {materials.map((m, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 rounded-md p-3 border border-gray-200"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                        value={m.type}
                        onChange={(e) => handleMaterialChange(idx, { type: e.target.value, file: null })}
                      >
                        <option value="pdf">PDF</option>
                        <option value="video">Video Upload</option>
                        <option value="videoLink">Video Link</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        value={m.title}
                        onChange={(e) => handleMaterialChange(idx, { title: e.target.value })}
                        placeholder="Material name (optional)"
                      />
                    </div>

                    {m.type === "pdf" && (
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">PDF file</label>
                        <input
                          type="file"
                          accept="application/pdf"
                          className="w-full text-sm"
                          onChange={(e) =>
                            handleMaterialChange(idx, { file: e.target.files?.[0] || null })
                          }
                        />
                      </div>
                    )}

                    {m.type === "video" && (
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Video file</label>
                        <input
                          type="file"
                          accept="video/*"
                          className="w-full text-sm"
                          onChange={(e) =>
                            handleMaterialChange(idx, { file: e.target.files?.[0] || null })
                          }
                        />
                      </div>
                    )}

                    {m.type === "videoLink" && (
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Video link</label>
                        <input
                          type="url"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          value={m.videoLink}
                          onChange={(e) =>
                            handleMaterialChange(idx, { videoLink: e.target.value })
                          }
                          placeholder="https://..."
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-sm font-medium w-[40%]"
            onClick={() => navigate(`/addcourses/${courseId}`)}
          >
            <FaArrowLeft /> Back to Course
          </button>

          <button
            type="button"
            className="w-[60%] px-5 py-2 rounded-md bg-black text-white hover:bg-gray-800 transition-all text-sm font-medium shadow disabled:opacity-60"
            disabled={loading}
            onClick={createLectureHandler}
          >
            {loading ? <ClipLoader size={30} color="white" /> : "+ Save Materials"}
          </button>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Existing Chapters / Lectures</h2>
          <div className="space-y-2">
            {visibleLectureList.map((lecture, index) => (
              <div
                key={lecture._id || index}
                className="bg-gray-100 rounded-md flex justify-between items-center p-3 text-sm font-medium text-gray-700"
              >
                <span>
                  {lecture.chapterTitle ? `${lecture.chapterTitle} - ` : ""}
                  {lecture.lectureTitle}
                </span>
                <FaEdit
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                  onClick={() => navigate(`/editlecture/${courseId}/${lecture._id}`)}
                />
              </div>
            ))}

            {visibleLectureList.length === 0 && (
              <div className="text-sm text-gray-500">No lectures/materials added yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateLecture;

