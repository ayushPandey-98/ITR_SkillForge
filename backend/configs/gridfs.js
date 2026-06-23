import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// GridFS bucket helpers
// Requires: connection via mongoose.connect(...) already done in configs/db.js

const getBucket = () => {
  const conn = mongoose.connection;
  if (!conn) throw new Error("Mongoose connection not initialized");
  return new mongoose.mongo.GridFSBucket(conn.db, { bucketName: "uploads" });
};

const saveFileToGridFS = async (localPath, { filename, contentType, metadata } = {}) => {
  if (!localPath) return null;
  const bucket = getBucket();

  const safeFilename = filename || path.basename(localPath);

  const fileId = new mongoose.Types.ObjectId();

  // Read file into buffer (simple + reliable for moderate file sizes)
  // If you need streaming for large files, we can refactor.
  const buffer = await fs.promises.readFile(localPath);

  await new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStreamWithId(fileId, safeFilename, {
      contentType: contentType || undefined,
      metadata: metadata || undefined,
    });

    uploadStream.end(buffer);
    uploadStream.on("finish", resolve);
    uploadStream.on("error", reject);
  });

  // Remove local file after successful save
  try {
    await fs.promises.unlink(localPath);
  } catch (_) {
    // ignore
  }

  return fileId;
};

const getFileUrl = (fileId) => {
  // Backend-relative URL; frontend can use this directly
  return `/api/files/${fileId}`;
};

export { saveFileToGridFS, getFileUrl };

