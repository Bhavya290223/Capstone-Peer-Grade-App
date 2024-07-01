import axios from "axios";
import showStatusToast from "@/utils/showToastStatus";

const BASE_URL = "/api"; // TODO change this to an environment var?

export const getGroups = async (userId) => {
	try {
		const response = await axios.post(`${BASE_URL}/users/get-groups`, {
			userId
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
		console.log("Unexpected error from Auth API: ", error);
		showStatusToast({
			status: "Error",
			message: "An unexpected error occurred. Please try again."
		});
	}
}
