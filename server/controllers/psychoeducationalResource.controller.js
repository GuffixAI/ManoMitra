// // server/controllers/psychoeducationalResource.controller.js
// import PsychoeducationalResource from '../models/psychoeducationalResource.model.js';
// import { asyncHandler } from '../middlewares/error.middleware.js'; // Ensure this middleware exists

// // @desc    Admin creates a new psychoeducational resource (handles both URL and file uploads)
// // @route   POST /api/resources
// export const createResource = asyncHandler(async (req, res) => {
//   const { title, description, url, type, language, category } = req.body;
//   const adminId = req.user.id; // From auth.middleware

//   if (!title || !type || !language) {
//     return res.status(400).json({ success: false, message: "Title, type, and language are required." });
//   }

//   const resourceData = { title, description, type, language, createdBy: adminId };

//   if (type === 'document' || type === 'audio' || type === 'video') { // These types might have file uploads
//     if (req.file) { // Multer has processed a file upload
//       resourceData.file = {
//         filename: req.file.filename,
//         originalName: req.file.originalname,
//         mimeType: req.file.mimetype,
//         size: req.file.size,
//         url: `/uploads/resources/${req.file.filename}`, // Public path to access the file
//       };
//       // If a file is uploaded, URL is optional or ignored
//       if (url) resourceData.url = url; // Still allow URL for things like YouTube if also uploading description file
//     } else if (url) { // If no file but URL is provided for these types (e.g., YouTube video link)
//       resourceData.url = url;
//     } else {
//       return res.status(400).json({ success: false, message: `Either a file upload or a URL is required for resource type '${type}'.` });
//     }
//   } else if (type === 'article') { // Article typically has a URL
//       if (!url) {
//           return res.status(400).json({ success: false, message: "URL is required for article type." });
//       }
//       resourceData.url = url;
//   }

//   if (category) {
//     resourceData.category = Array.isArray(category) ? category : [category];
//   }

//   const newResource = await PsychoeducationalResource.create(resourceData);
//   res.status(201).json({ success: true, message: "Resource created successfully.", data: newResource });
// });


// // @desc    Get all psychoeducational resources (can be filtered by language, type, category)
// // @route   GET /api/resources
// export const getAllResources = asyncHandler(async (req, res) => {
//   const { language, type, category, search, page = 1, limit = 10 } = req.query;

//   const query = { isApproved: true };
//   if (language) query.language = language;
//   if (type) query.type = type;
//   if (category) query.category = { $in: [category] }; // Search within categories array
//   if (search) query.title = { $regex: search, $options: "i" }; // Case-insensitive search

//   const resources = await PsychoeducationalResource.find(query)
//     .limit(parseInt(limit as string))
//     .skip((parseInt(page as string) - 1) * parseInt(limit as string))
//     .sort({ createdAt: -1 });

//   const total = await PsychoeducationalResource.countDocuments(query);

//   res.status(200).json({
//     success: true,
//     data: resources,
//     pagination: {
//       currentPage: parseInt(page as string),
//       totalPages: Math.ceil(total / parseInt(limit as string)),
//       totalItems: total,
//       itemsPerPage: parseInt(limit as string),
//     },
//   });
// });

// // @desc    Get a single psychoeducational resource by ID
// // @route   GET /api/resources/:id
// export const getResourceById = asyncHandler(async (req, res) => {
//   const resource = await PsychoeducationalResource.findById(req.params.id);
//   if (!resource || !resource.isApproved) { // Only show approved resources
//     return res.status(404).json({ success: false, message: "Resource not found." });
//   }
//   res.status(200).json({ success: true, data: resource });
// });

// // @desc    Admin updates an existing psychoeducational resource
// // @route   PUT /api/resources/:id
// export const updateResource = asyncHandler(async (req, res) => {
//   const { title, description, url, type, language, category, isApproved } = req.body;

//   const updateData = { title, description, url, type, language, category, isApproved };

//   if (req.file) { // If a new file is uploaded during update
//     updateData.file = {
//       filename: req.file.filename,
//       originalName: req.file.originalname,
//       mimeType: req.file.mimetype,
//       size: req.file.size,
//       url: `/uploads/resources/${req.file.filename}`,
//     };
//   } else if (req.body.clearFile) { // If frontend explicitly tells to clear existing file
//      updateData.file = undefined;
//   }

//   // Handle category conversion
//   if (category && typeof category === 'string') {
//       updateData.category = category.split(',').map(s => s.trim()).filter(Boolean);
//   }


//   const updatedResource = await PsychoeducationalResource.findByIdAndUpdate(
//     req.params.id,
//     updateData,
//     { new: true, runValidators: true }
//   );

//   if (!updatedResource) {
//     return res.status(404).json({ success: false, message: "Resource not found." });
//   }
//   res.status(200).json({ success: true, message: "Resource updated successfully.", data: updatedResource });
// });

// // @desc    Admin deletes a psychoeducational resource
// // @route   DELETE /api/resources/:id
// export const deleteResource = asyncHandler(async (req, res) => {
//   const resource = await PsychoeducationalResource.findByIdAndDelete(req.params.id);
//   if (!resource) {
//     return res.status(404).json({ success: false, message: "Resource not found." });
//   }
//   // Optional: Delete the actual file from storage if resource.file exists
//   // fs.unlinkSync(path.join(__dirname, '..', resource.file.url));
//   res.status(200).json({ success: true, message: "Resource deleted successfully." });
// });

// // @desc    Get recommended resources based on AI's suggested topics and student language
// // @route   GET /api/resources/recommended
// // Accessible by student/AI
// export const getRecommendedResources = asyncHandler(async (req, res) => {
//     // topics should be a comma-separated string from AI or an array from frontend
//     const topicsParam = req.query.topics;
//     const studentLanguage = req.query.language || 'en'; // Default to English

//     let queryTopics = [];
//     if (typeof topicsParam === 'string') {
//         queryTopics = topicsParam.split(',').map(t => t.trim()).filter(Boolean);
//     } else if (Array.isArray(topicsParam)) {
//         queryTopics = topicsParam.map(t => String(t).trim()).filter(Boolean);
//     }
    
//     let query = { isApproved: true, language: studentLanguage };

//     if (queryTopics.length > 0) {
//         // Find resources that match any of the suggested topics
//         query.category = { $in: queryTopics };
//     }

//     const resources = await PsychoeducationalResource.find(query).limit(5).sort({ createdAt: -1 }); // Limit to top 5-10
    
//     // Fallback to general resources if no specific topics found or if language has few resources
//     if (resources.length === 0 && queryTopics.length > 0) {
//         const fallbackQuery = { isApproved: true, language: studentLanguage };
//         const fallbackResources = await PsychoeducationalResource.find(fallbackQuery).limit(5).sort({ createdAt: -1 });
//         return res.status(200).json({ success: true, data: fallbackResources });
//     } else if (resources.length === 0 && !studentLanguage) {
//         // Ultimate fallback if no language specified either
//         const ultimateFallback = await PsychoeducationalResource.find({ isApproved: true }).limit(5).sort({ createdAt: -1 });
//         return res.status(200).json({ success: true, data: ultimateFallback });
//     }

//     res.status(200).json({ success: true, data: resources });
// });























// server/controllers/psychoeducationalResource.controller.js
import PsychoeducationalResource from '../models/psychoeducationalResource.model.js';
import { asyncHandler } from '../middlewares/error.middleware.js'; // Ensure this middleware exists

// @desc    Admin creates a new psychoeducational resource (handles both URL and file uploads)
// @route   POST /api/resources
export const createResource = asyncHandler(async (req, res) => {
  const { title, description, url, type, language, category } = req.body;
  const adminId = req.user.id; // From auth.middleware

  if (!title || !type || !language) {
    return res.status(400).json({ success: false, message: "Title, type, and language are required." });
  }

  const resourceData = { title, description, type, language, createdBy: adminId };

  if (type === 'document' || type === 'audio' || type === 'video') { // These types might have file uploads
    if (req.file) { // Multer has processed a file upload
      resourceData.file = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/resources/${req.file.filename}`, // Public path to access the file
      };
      // If a file is uploaded, URL is optional or ignored
      if (url) resourceData.url = url; // Still allow URL for things like YouTube if also uploading description file
    } else if (url) { // If no file but URL is provided for these types (e.g., YouTube video link)
      resourceData.url = url;
    } else {
      return res.status(400).json({ success: false, message: `Either a file upload or a URL is required for resource type '${type}'.` });
    }
  } else if (type === 'article') { // Article typically has a URL
      if (!url) {
          return res.status(400).json({ success: false, message: "URL is required for article type." });
      }
      resourceData.url = url;
  }

  if (category) {
    resourceData.category = Array.isArray(category) ? category : [category];
  }

  const newResource = await PsychoeducationalResource.create(resourceData);
  res.status(201).json({ success: true, message: "Resource created successfully.", data: newResource });
});


// @desc    Get all psychoeducational resources (can be filtered by language, type, category)
// @route   GET /api/resources
export const getAllResources = asyncHandler(async (req, res) => {
  const { language, type, category, search, page = 1, limit = 10 } = req.query;

  const query = { isApproved: true };
  if (language) query.language = language;
  if (type) query.type = type;
  if (category) query.category = { $in: [category] }; // Search within categories array
  if (search) query.title = { $regex: search, $options: "i" }; // Case-insensitive search

  const resources = await PsychoeducationalResource.find(query)
    .limit(parseInt(limit)) // Removed 'as string'
    .skip((parseInt(page) - 1) * parseInt(limit)) // Removed 'as string'
    .sort({ createdAt: -1 });

  const total = await PsychoeducationalResource.countDocuments(query);

  res.status(200).json({
    success: true,
    data: resources,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit),
    },
  });
});

// @desc    Get a single psychoeducational resource by ID
// @route   GET /api/resources/:id
export const getResourceById = asyncHandler(async (req, res) => {
  const resource = await PsychoeducationalResource.findById(req.params.id);
  if (!resource || !resource.isApproved) { // Only show approved resources
    return res.status(404).json({ success: false, message: "Resource not found." });
  }
  res.status(200).json({ success: true, data: resource });
});

// @desc    Admin updates an existing psychoeducational resource
// @route   PUT /api/resources/:id
export const updateResource = asyncHandler(async (req, res) => {
  const { title, description, url, type, language, category, isApproved } = req.body;

  const updateData = { title, description, url, type, language, category, isApproved };

  if (req.file) { // If a new file is uploaded during update
    updateData.file = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/resources/${req.file.filename}`,
    };
  } else if (req.body.clearFile) { // If frontend explicitly tells to clear existing file
     updateData.file = undefined;
  }

  // Handle category conversion
  if (category && typeof category === 'string') {
      updateData.category = category.split(',').map(s => s.trim()).filter(Boolean);
  }


  const updatedResource = await PsychoeducationalResource.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!updatedResource) {
    return res.status(404).json({ success: false, message: "Resource not found." });
  }
  res.status(200).json({ success: true, message: "Resource updated successfully.", data: updatedResource });
});

// @desc    Admin deletes a psychoeducational resource
// @route   DELETE /api/resources/:id
export const deleteResource = asyncHandler(async (req, res) => {
  const resource = await PsychoeducationalResource.findByIdAndDelete(req.params.id);
  if (!resource) {
    return res.status(404).json({ success: false, message: "Resource not found." });
  }
  // Optional: Delete the actual file from storage if resource.file exists
  // fs.unlinkSync(path.join(__dirname, '..', resource.file.url)); // This line requires 'fs' and 'path' imports if uncommented
  res.status(200).json({ success: true, message: "Resource deleted successfully." });
});

// @desc    Get recommended resources based on AI's suggested topics and student language
// @route   GET /api/resources/recommended
// Accessible by student/AI
export const getRecommendedResources = asyncHandler(async (req, res) => {
    // topics should be a comma-separated string from AI or an array from frontend
    const topicsParam = req.query.topics;
    const studentLanguage = req.query.language || 'en'; // Default to English

    let queryTopics = [];
    if (typeof topicsParam === 'string') {
        queryTopics = topicsParam.split(',').map(t => t.trim()).filter(Boolean);
    } else if (Array.isArray(topicsParam)) {
        queryTopics = topicsParam.map(t => String(t).trim()).filter(Boolean);
    }
    
    let query = { isApproved: true, language: studentLanguage };

    if (queryTopics.length > 0) {
        // Find resources that match any of the suggested topics
        query.category = { $in: queryTopics };
    }

    const resources = await PsychoeducationalResource.find(query).limit(5).sort({ createdAt: -1 }); // Limit to top 5-10
    
    // Fallback to general resources if no specific topics found or if language has few resources
    if (resources.length === 0 && queryTopics.length > 0) {
        const fallbackQuery = { isApproved: true, language: studentLanguage };
        const fallbackResources = await PsychoeducationalResource.find(fallbackQuery).limit(5).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: fallbackResources });
    } else if (resources.length === 0 && !studentLanguage) {
        // Ultimate fallback if no language specified either
        const ultimateFallback = await PsychoeducationalResource.find({ isApproved: true }).limit(5).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: ultimateFallback });
    }

    res.status(200).json({ success: true, data: resources });
});