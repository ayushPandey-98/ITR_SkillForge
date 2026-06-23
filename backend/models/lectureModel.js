import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    chapterTitle: {
      type: String,
      default: "",
    },

    lectureTitle: {
      type: String,
      required: true,
    },

    // Store multiple materials per lecture (pdf/video/file upload + video links)
    materials: [
      {
        type: {
          type: String,
          enum: ["pdf", "video", "videoLink"],
          required: true,
        },
        // GridFS-backed URL (e.g. /api/files/:id)
        fileUrl: {
          type: String,
          default: "",
        },

        // for videoLink
        videoLink: {
          type: String,
          default: "",
        },
        title: {
          type: String,
          default: "",
        },
      },
    ],

    // simple flag; used by UI to decide preview
    isPreviewFree: {
      type: Boolean,
      default: false,
    },

    // Optional quiz/test structure (minimal for now)
    test: {
      enabled: { type: Boolean, default: false },
      // For future: questions schema
      // For now keep a free-form JSON array/string
      questions: { type: mongoose.Schema.Types.Mixed, default: [] },
    },
  },
  { timestamps: true }
);

const Lecture = mongoose.model("Lecture", lectureSchema);

export default Lecture;

