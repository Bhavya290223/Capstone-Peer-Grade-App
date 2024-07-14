import prisma from "../../prisma/prismaClient.js";
import apiError from "../utils/apiError.js";

// Review operations

const getPeerReviews = async (submissionId) => {
    try {
        const submission = await prisma.review.findFirst({
            where: {
                submissionId: submissionId
            }, include: {
                reviewer: true
            }
        });

        if (submission.reviewer.role === "STUDENT") {
            return submission;
        }

        return;
    }
    catch (error) {
        throw new apiError("Failed to retrieve submission", 500);
    }
}


const getInstructorReview = async (submissionId) => {
    try {
        const submission = await prisma.review.findFirst({
            where: {
                submissionId: submissionId
            }, include: {
                reviewer: true
            }
        });

        if (submission.reviewer.role === "INSTRUCTOR") {
            return submission;
        }

        return;
    } catch (error) {
        throw new apiError("Failed to retrieve submission", 500);
    }
}

const getAllReviews = async (submissionId) => {
    try {
        const reviews = await prisma.review.findMany({
            where: {
                submissionId: submissionId
            }
        });

        return reviews;
    } catch (error) {
        throw new apiError("Failed to retrieve reviews", 500);
    }
}



const updateReview = async (reviewId, review) => {
    try {
        const updatedReview = await prisma.review.update({
            where: {
                reviewId: reviewId
            },
            data: review
        });

        return updatedReview;
    } catch (error) {
        throw new apiError("Failed to update review", 500);
    }
}

const deleteReview = async (reviewId) => {
    try {
        await prisma.review.delete({
            where: {
                reviewId: reviewId
            }
        });

        return;
    } catch (error) {
        throw new apiError("Failed to delete review", 500);
    }
}

const createReview = async (userId, review, criterionGrades) => {
    try {
        const newReview = await prisma.review.create({
            data: {
                reviewerId: userId,
                ...review,
                criterionGrades: {
                    create: criterionGrades.map(cg => ({
                        criterionId: cg.criterionId,
                        grade: cg.grade,
                        comment: cg.comment
                    }))
                }
            },
            include: {
                criterionGrades: true
            }
        });

        // Update the submission's final grade
        await prisma.submission.update({
            where: { submissionId: review.submissionId },
            data: { finalGrade: newReview.reviewGrade }
        });

        return newReview;
    } catch (error) {
        throw new apiError("Failed to create review", 500);
    }
};


const getReviewDetails = async (reviewId) => {
    try {
        const review = await prisma.review.findUnique({
            where: { reviewId },
            include: {
                criterionGrades: {
                    include: {
                        criterion: true
                    }
                },
                submission: {
                    include: {
                        assignment: {
                            include: {
                                rubric: true
                            }
                        }
                    }
                }
            }
        });

        if (!review) {
            throw new apiError("Review not found", 404);
        }

        return review;
    } catch (error) {
        throw new apiError("Failed to retrieve review details", 500);
    }
};

export default {
    getPeerReviews,
    getInstructorReview,
    getAllReviews,
    updateReview,
    deleteReview,
    createReview,
    getReviewDetails
};