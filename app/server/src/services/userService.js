import prisma from "../../prisma/prismaClient";
import ApiError from "../utils/apiError.js";

export async function getUserClasses(userId) {
  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { userId: userId },
      include: {
        classes: true,           // Include user classes to get class IDs
        classesInstructed: true  // Include instructed classes to get class IDs
      }
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    let classIds;
    if (user.role === 'STUDENT') {
      classIds = user.classes.map(userClass => userClass.classId);
    } else {
      classIds = user.classesInstructed.map(classInstructed => classInstructed.classId);
    }

    // Retrieve classes based on class IDs
    const classes = await prisma.class.findMany({
      where: { classId: { in: classIds } },
      include: { instructor: true } // Include any related data you need
    });

    return classes;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    } else {
      throw new ApiError("Failed to retrieve user's classes", 500);
    }
  }
}
export async function getUserAssignments(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { userId: userId },
      include: {
        classes: true,
        classesInstructed: true
      }
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    let classIds;
    if (user.role === 'STUDENT') {
      classIds = user.classes.map(userClass => userClass.classId);
    } else {
      classIds = user.classesInstructed.map(classInstructed => classInstructed.classId);
    }

    const assignments = await prisma.assignment.findMany({
      where: { classId: { in: classIds } },
      include: { class: true }
    });

    return assignments;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    } else {
      throw new ApiError("Failed to retrieve user's assignments", 500);
    }
  }
}

export default {
  getUserClasses,
  getUserAssignments,
};
