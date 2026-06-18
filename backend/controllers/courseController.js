import uploadOnCloudinary from "../configs/cloudinary.js"
import Course from "../models/courseModel.js"
import Lecture from "../models/lectureModel.js"
import User from "../models/userModel.js"

// create Courses
export const createCourse = async (req,res) => {

    try {
        const {title,category} = req.body
        if(!title || !category){
            return res.status(400).json({message:"title and category is required"})
        }
        const course = await Course.create({
            title,
            category,
            creator: req.userId
        })
        
        return res.status(201).json(course)
    } catch (error) {
         return res.status(500).json({message:`Failed to create course ${error}`})
    }
    
}

export const getPublishedCourses = async (req,res) => {
    try {
        const courses = await Course.find({isPublished:true}).populate("lectures reviews")
        if(!courses)
        {
            return res.status(404).json({message:"Course not found"})
        }

        return res.status(200).json(courses)
        
    } catch (error) {
          return res.status(500).json({message:`Failed to get All  courses ${error}`})
    }
}


export const getCreatorCourses = async (req,res) => {
    try {
        const userId = req.userId
        const courses = await Course.find({creator:userId})
        if(!courses)
        {
            return res.status(404).json({message:"Course not found"})
        }
        return res.status(200).json(courses)
        
    } catch (error) {
        return res.status(500).json({message:`Failed to get creator courses ${error}`})
    }
}

export const editCourse = async (req,res) => {
    try {
        const {courseId} = req.params;
        const {title , subTitle , description , category , level , isPublished } = req.body;
        let thumbnail
         if(req.file){
            thumbnail =await uploadOnCloudinary(req.file.path)
                }
        let course = await Course.findById(courseId)
        if(!course){
            return res.status(404).json({message:"Course not found"})
        }
        const updateData = {title , subTitle , description , category , level , isPublished ,thumbnail}

        course = await Course.findByIdAndUpdate(courseId , updateData , {new:true})
        return res.status(201).json(course)
    } catch (error) {
        return res.status(500).json({message:`Failed to update course ${error}`})
    }
}


export const getCourseById = async (req,res) => {
    try {
        const {courseId} = req.params
        let course = await Course.findById(courseId)
        if(!course){
            return res.status(404).json({message:"Course not found"})
        }
         return res.status(200).json(course)
        
    } catch (error) {
        return res.status(500).json({message:`Failed to get course ${error}`})
    }
}
export const removeCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    await course.deleteOne();
    return res.status(200).json({ message: "Course Removed Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({message:`Failed to remove course ${error}`})
  }
};



//create lecture

export const createLecture = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { chapterTitle, lectureTitle, materials, isPreviewFree, test } = req.body;

    if (!courseId || !lectureTitle) {
      return res.status(400).json({ message: "lectureTitle and courseId are required" });
    }

    // materials can come as JSON string from frontend
    let parsedMaterials = [];
    if (materials) {
      if (typeof materials === "string") {
        parsedMaterials = JSON.parse(materials);
      } else {
        parsedMaterials = materials;
      }
    }

    // If files are sent (pdf/video), multer should provide req.files.
    // Expected field names:
    // - pdfFiles[]
    // - videoFiles[]
    // We'll map uploaded files into parsedMaterials where type matches.
    const files = req.files || {};

    const pdfUploads = files.pdfFiles || [];
    const videoUploads = files.videoFiles || [];

    let pdfIdx = 0;
    let videoIdx = 0;

    const finalMaterials = (parsedMaterials || []).map((m) => {
      const type = m?.type;
      if (type === "pdf") {
        const f = pdfUploads[pdfIdx++];
        if (f) return { ...m, fileUrl: m.fileUrl || f.path };
      }
      if (type === "video") {
        const f = videoUploads[videoIdx++];
        if (f) return { ...m, fileUrl: m.fileUrl || f.path };
      }
      return m;
    });

    // upload file(s) to cloudinary only for those items that have local fileUrl/path
    const uploadedMaterials = await Promise.all(
      finalMaterials.map(async (m) => {
        if (!m?.fileUrl) return m;
        // if already a URL (cloudinary) we keep it
        if (typeof m.fileUrl === "string" && m.fileUrl.startsWith("http")) return m;
        // otherwise treat as local path
        const uploaded = await uploadOnCloudinary(m.fileUrl);
        return {
          ...m,
          fileUrl: uploaded?.url || uploaded?.secure_url || uploaded,
        };
      })
    );

    const lecture = await Lecture.create({
      chapterTitle: chapterTitle || "",
      lectureTitle,
      materials: uploadedMaterials || [],
      isPreviewFree: isPreviewFree === "true" || isPreviewFree === true,
      test: test || { enabled: false, questions: [] },
    });

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // ensure lecture isn't duplicated
    if (!course.lectures.includes(lecture._id)) {
      course.lectures.push(lecture._id);
    }

    await course.populate("lectures");
    await course.save();

    return res.status(201).json({ lecture, course });
  } catch (error) {
    return res.status(500).json({ message: `Failed to Create Lecture ${error}` });
  }
};


export const getCourseLecture = async (req,res) => {
    try {
        const {courseId} = req.params
        const course = await Course.findById(courseId)
        if(!course){
            return res.status(404).json({message:"Course not found"})
        }
        await course.populate("lectures")
        await course.save()
        return res.status(200).json(course)
    } catch (error) {
        return res.status(500).json({message:`Failed to get Lectures ${error}`})
    }
}

export const editLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const {
      isPreviewFree,
      lectureTitle,
      chapterTitle,
      materials,
      test,
    } = req.body;

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    // Parse materials JSON string
    let parsedMaterials = [];
    if (materials) {
      if (typeof materials === "string") {
        parsedMaterials = JSON.parse(materials);
      } else {
        parsedMaterials = materials;
      }
    };

    const files = req.files || {};
    const pdfUploads = files.pdfFiles || [];
    const videoUploads = files.videoFiles || [];

    let pdfIdx = 0;
    let videoIdx = 0;

    const finalMaterials = (parsedMaterials || []).map((m) => {
      const type = m?.type;
      if (type === "pdf") {
        const f = pdfUploads[pdfIdx++];
        if (f) return { ...m, fileUrl: m.fileUrl || f.path };
      }
      if (type === "video") {
        const f = videoUploads[videoIdx++];
        if (f) return { ...m, fileUrl: m.fileUrl || f.path };
      }
      return m;
    });

    const uploadedMaterials = await Promise.all(
      finalMaterials.map(async (m) => {
        if (!m?.fileUrl) return m;
        if (typeof m.fileUrl === "string" && m.fileUrl.startsWith("http")) return m;
        const uploaded = await uploadOnCloudinary(m.fileUrl);
        return {
          ...m,
          fileUrl: uploaded?.url || uploaded?.secure_url || uploaded,
        };
      })
    );

    if (lectureTitle) lecture.lectureTitle = lectureTitle;
    if (chapterTitle !== undefined) lecture.chapterTitle = chapterTitle;
    if (Array.isArray(uploadedMaterials)) lecture.materials = uploadedMaterials;

    if (isPreviewFree !== undefined) {
      lecture.isPreviewFree = isPreviewFree === "true" || isPreviewFree === true;
    }

    if (test !== undefined) lecture.test = test;

    await lecture.save();
    return res.status(200).json(lecture);
  } catch (error) {
    return res.status(500).json({ message: `Failed to edit Lectures ${error}` });
  }
};


export const removeLecture = async (req,res) => {
    try {
        const {lectureId} = req.params
        const lecture = await Lecture.findByIdAndDelete(lectureId)
        if(!lecture){
             return res.status(404).json({message:"Lecture not found"})
        }
        //remove the lecture from associated course

        await Course.updateOne(
            {lectures: lectureId},
            {$pull:{lectures: lectureId}}
        )
        return res.status(200).json({message:"Lecture Remove Successfully"})
        }
    
     catch (error) {
        return res.status(500).json({message:`Failed to remove Lectures ${error}`})
    }
}



//get Creator data


// controllers/userController.js

export const getCreatorById = async (req, res) => {
  try {
    const {userId} = req.body;

    const user = await User.findById(userId).select("-password"); // Exclude password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json( user );
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ message: "get Creator error" });
  }
};




