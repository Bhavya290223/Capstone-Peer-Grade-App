import assignService from "../services/assignService.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const BASE_URL = "http://localhost:8080/"; //ngix storage (replace with cloud storage once developed)

const upload = multer({ storage: multer.memoryStorage() });
const UPLOAD_PATH = "/usr/server/uploads";

export const addAssignmentToClass = [
	upload.single("file"),
	asyncErrorHandler(async (req, res) => {
	  const classId = req.body.classId;
	  const categoryId = req.body.categoryId;
	  const assignmentData = JSON.parse(req.body.assignmentData);
  
	  console.log('Received assignment data:', assignmentData);  // Add this line for debugging
  
		let fileUrl = null;
		if (req.file) {
			const uniqueFilename = `${uuidv4()}${path.extname(req.file.originalname)}`;
			console.log("uniqueFilename", uniqueFilename);
			const filePath = path.join(UPLOAD_PATH, uniqueFilename);

			// Ensure the upload directory exists
			fs.mkdirSync(UPLOAD_PATH, { recursive: true });

			// Write the file to the shared volume
			fs.writeFileSync(filePath, req.file.buffer);

			// Construct the URL that Nginx will serve
			fileUrl = `${BASE_URL}/${uniqueFilename}`;
		}

		
		const newAssignment = await assignService.addAssignmentToClass(
			classId,
			categoryId,
			{
			  ...assignmentData,
			  assignmentFilePath: fileUrl,
			  rubricId: assignmentData.rubricId,
			  allowedFileTypes: assignmentData.allowedFileTypes,  
			}
		  );

		if (newAssignment) {
			return res.status(200).json({
				status: "Success",
				message: "Assignment successfully added to class and category",
				data: newAssignment
			});
		} else {
			return res.status(500).json({
				status: "Error",
				message: "Failed to add assignment to class and category"
			});
		}
	})
];


export const removeAssignmentFromClass = asyncErrorHandler(async (req, res) => {
    const { assignmentId } = req.body;
    try {
        const deletedAssignment = await assignService.removeAssignmentFromClass(assignmentId);
        return res.status(200).json({
            status: "Success",
            message: "Assignment successfully removed from class",
            data: deletedAssignment
        });
    } catch (error) {
        console.error("Error in removeAssignmentFromClass controller:", error);
        return res.status(error.statusCode || 500).json({
            status: "Error",
            message: error.message || "An unexpected error occurred"
        });
    }
});

export const updateAssignmentInClass = [
	upload.single("file"),
	asyncErrorHandler(async (req, res) => {
	  const classId = req.body.classId;
	  const assignmentId = req.body.assignmentId;
	  const categoryId = req.body.categoryId;
	  const assignmentData = JSON.parse(req.body.assignmentData);
  
	  console.log('Received assignment data for update:', assignmentData);  // Add this line for debugging
  
	  let fileUrl = null;
	  if (req.file) {
		const uniqueFilename = `${uuidv4()}${path.extname(req.file.originalname)}`;
		const filePath = path.join(UPLOAD_PATH, uniqueFilename);
  
		// Ensure the upload directory exists
		fs.mkdirSync(UPLOAD_PATH, { recursive: true });
  
		// Write the file to the shared volume
		fs.writeFileSync(filePath, req.file.buffer);
  
		// Construct the URL that Nginx will serve
		fileUrl = `${BASE_URL}/${uniqueFilename}`;
	  }
  
	  const updatedAssignment = await assignService.updateAssignmentInClass(
		classId,
		assignmentId,
		categoryId,
		{
			...assignmentData,
			assignmentFilePath: fileUrl || assignmentData.assignmentFilePath,
			rubricId: assignmentData.rubricId, // Add this line
			allowedFileTypes: assignmentData.allowedFileTypes, // Add this line
		}
	);
  
	  if (updatedAssignment) {
		return res.status(200).json({
		  status: 'Success',
		  message: 'Assignment successfully updated',
		  data: updatedAssignment
		});
	  } else {
		return res.status(500).json({
		  status: 'Error',
		  message: 'Failed to update assignment'
		});
	  }
	})
  ];

export const getAssignmentInClass = asyncErrorHandler(async (req, res) => {
	const { classId, assignmentId } = req.body;
	const assignmentData = await assignService.getAssignmentInClass(
		classId,
		assignmentId
	);
	return res.status(200).json({
		status: "Success",
		data: assignmentData
	});
});

export const getAllAssignments = asyncErrorHandler(
	async (req, res) => {
		const assignments = await assignService.getAllAssignments();
		return res.status(200).json({
			status: "Success",
			data: assignments
		});
	}
);

export const getAllAssignmentsByClassId = asyncErrorHandler(
	async (req, res) => {
		const { classId } = req.body;
		const assignments = await assignService.getAllAssignmentsByClassId(classId);
		return res.status(200).json({
			status: "Success",
			data: assignments
		});
	}
);

// Export all controller methods
export default {
	addAssignmentToClass,
	removeAssignmentFromClass,
	updateAssignmentInClass,
	getAssignmentInClass,
	getAllAssignments,
	getAllAssignmentsByClassId
};
