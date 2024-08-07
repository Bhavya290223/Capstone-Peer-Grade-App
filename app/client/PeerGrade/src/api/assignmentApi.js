import axios from "axios";
import showStatusToast from "@/utils/showToastStatus";

const BASE_URL = "/api"; // Use environment variable if available

export const addAssignmentToClass = async (formData) => {
  try {
    // Get the assignmentData from formData
    const assignmentDataString = formData.get('assignmentData');
    let assignmentData = JSON.parse(assignmentDataString);
    
    assignmentData.maxSubmissions = parseInt(assignmentData.maxSubmissions, 10);


    // Ensure allowedFileTypes is included in assignmentData
    if (!assignmentData.allowedFileTypes || assignmentData.allowedFileTypes.length === 0) {
      console.warn('allowedFileTypes is empty or not set');
    }


    const response = await axios.post('/api/assignment/add-assignment', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data.status === 'Success') {
      showStatusToast({
        status: response.data.status,
        message: "The assignment has been successfully created."
      });
    }

    return response.data;
  } catch (error) {
    handleError(error);
    return error.response.data;
  }
};

export const addAssignmentWithRubric = async (data) => {
  console.log('Data to add assignment with rubric:', data);
  try {
    const formData = new FormData();
    formData.append('classId', data.classId);
    formData.append('categoryId', data.categoryId);
    formData.append('assignmentData', JSON.stringify(data.assignmentData));
    formData.append('rubricData', JSON.stringify(data.rubricData));
    formData.append('creatorId', data.creatorId);

    if (data.file) {
      formData.append('file', data.file);
    }

    const response = await axios.post('/api/assignment/add-assignment-with-rubric', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateAssignmentInClass = async (formData) => {
    try {
      const response = await axios.post('/api/assignment/update-assignment', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      if (response.data.status === 'Success') {
        showStatusToast({
          status: response.data.status,
          message: "The assignment has been successfully updated."
        });
      }
      return response.data;

    } catch (error) {
      handleError(error);
      return error.response.data;
    }
  };

  export const removeAssignmentFromClass = async (assignmentId) => {
    try {
        const response = await axios.post(`${BASE_URL}/assignment/remove-assignment`, {
            assignmentId
        });
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

export const getAssignmentInClass = async (classId, assignmentId) => {
    try {
        console.log(classId, assignmentId)
        const response = await axios.post(`${BASE_URL}/assignment/get-assignment`, {
            classId,
            assignmentId
        });
        console.log(response.data)
        return response.data;
    } catch (error) {
        handleError(error);
        return error.response.data;
    }
};

export const getAllAssignments = async () => {
    try {
        const response = await axios.post(`${BASE_URL}/assignment/get-all-assignments`);
        return response.data;
    } catch (error) {
        handleError(error);
        return error.response.data;
    }
};

export const getAllAssignmentsByClassId = async (classId) => {
    try {
        const response = await axios.post(`${BASE_URL}/assignment/get-class-assignments`, {
            classId
        });
        return response.data;
    } catch (error) {
        handleError(error);
        return error.response.data;
    }
};

export const addAssignmentToCategory = async (classId, categoryId, assignmentData) => {
    try {
      const response = await axios.post(`${BASE_URL}/assignment/${classId}/categories/${categoryId}/assignments`, assignmentData);
      return response.data.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
};

export const extendDeadlineForStudent = async (assignmentId, studentId, newDueDate) => {
    try {
        const response = await axios.post(`${BASE_URL}/assignment/extend-deadline`, {
            studentId,
            assignmentId,
            newDueDate
        });
        return response.data;
    } catch (error) {
        handleError(error);
        return error.response.data;
    }
};

export const deleteExtendedDeadlineForStudent = async (studentId, assignmentId) => {
    try {
        const response = await axios.post(`${BASE_URL}/assignment/delete-extended-deadline`, {
            studentId,
            assignmentId
        });
        return response.data;
    } catch (error) {
        handleError(error);
        return error.response.data;
    }
};

function handleError(error) {
    if (error.response && error.response.data) {
        showStatusToast({
            status: error.response.data.status,
            message: error.response.data.message
        });
    } else {
        showStatusToast({
            status: "Error",
            message: "An unexpected error occurred. Please try again."
        });
    }
}
