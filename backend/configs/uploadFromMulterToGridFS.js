import { saveFileToGridFS, getFileUrl } from "./gridfs.js";

// Helper used by controllers that already receive multer local files
// - localPath: req.file.path
// - filename: optional
// - metadata: optional
const uploadMulterFileToGridFS = async (localPath, { filename, contentType, metadata } = {}) => {
  const fileId = await saveFileToGridFS(localPath, { filename, contentType, metadata });
  return {
    fileId,
    url: getFileUrl(fileId),
  };
};

export default uploadMulterFileToGridFS;

