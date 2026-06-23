import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    req.headers["access-control-request-headers"] ||
      "Content-Type, Authorization, Range",
  );
  res.setHeader(
    "Access-Control-Expose-Headers",
    "Content-Range, Content-Length",
  );

  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "private, max-age=0, must-revalidate");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid file id",
      });
    }

    const fileObjectId = new mongoose.Types.ObjectId(id);

    const filesCollection = mongoose.connection.db.collection("uploads.files");

    const fileDoc = await filesCollection.findOne({
      _id: fileObjectId,
    });

    if (!fileDoc) {
      return res.status(404).json({
        message: "File not found",
      });
    }

    console.log("FILE DOC:", {
      id: fileDoc._id,
      filename: fileDoc.filename,
      contentType: fileDoc.contentType,
      length: fileDoc.length,
      metadata: fileDoc.metadata,
    });

    const filename = fileDoc.filename || id;
    const fileSize = fileDoc.length || 0;

    let contentType =
      fileDoc.contentType ||
      fileDoc.metadata?.contentType ||
      "application/octet-stream";

    if (
      filename.toLowerCase().endsWith(".pdf") ||
      contentType === "application/octet-stream"
    ) {
      contentType = "application/pdf";
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Accept-Ranges", "bytes");

    // Force browser preview
    if (contentType.includes("pdf")) {
      res.setHeader("Content-Disposition", "inline");
    } else {
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    }

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads",
    });

    const range = req.headers.range;

    if (range && fileSize > 0) {
      const match = /^bytes=(\d+)-(\d*)$/.exec(range);

      if (match) {
        const start = Number(match[1]);
        const end = match[2] ? Number(match[2]) : fileSize - 1;

        if (!Number.isNaN(start) && !Number.isNaN(end) && start <= end) {
          res.status(206);

          res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);

          res.setHeader("Content-Length", end - start + 1);

          const stream = bucket.openDownloadStream(fileObjectId, {
            start,
            end,
          });

          stream.on("error", (err) => {
            console.error("GridFS Range Error:", err);

            if (!res.headersSent) {
              res.status(500).json({
                message: "Failed to stream file",
              });
            }
          });

          return stream.pipe(res);
        }
      }
    }

    const stream = bucket.openDownloadStream(fileObjectId);

    stream.on("error", (err) => {
      console.error("GridFS Stream Error:", err);

      if (!res.headersSent) {
        res.status(500).json({
          message: "Failed to stream file",
        });
      }
    });

    stream.pipe(res);
  } catch (error) {
    console.error("File Stream Error:", error);

    return res.status(500).json({
      message: "Failed to stream file",
      error: error.message,
    });
  }
});

export default router;
