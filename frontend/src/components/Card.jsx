import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";

const CourseCard = ({ thumbnail, title, category, level, materials = 0, id }) => {
  const navigate = useNavigate();

  const resolvedThumbnail =
    typeof thumbnail === "string"
      ? thumbnail.startsWith("/api/files/")
        ? `${serverUrl}${thumbnail}`
        : thumbnail.startsWith("http")
          ? thumbnail
          : thumbnail
      : "";


  return (
    <div className="max-w-sm w-full bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-300 cursor-pointer" onClick={()=>navigate(`/viewcourse/${id}`)}>
      <img
        src={resolvedThumbnail}
        alt={title}

        className="w-full h-48 object-cover"
      />
      <div className="p-5 space-y-2">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>

        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-0.5 bg-gray-100 rounded-full text-gray-700 capitalize">
            {category}
          </span>
          {level && (
            <span className="px-2 py-0.5 bg-gray-100 rounded-full text-gray-700">
              {level}
            </span>
          )}
        </div>

        <div className="flex justify-between text-sm text-gray-600 mt-3">
          <span>{materials} learning materials</span>
          <span className="font-semibold text-gray-800">Internal</span>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
