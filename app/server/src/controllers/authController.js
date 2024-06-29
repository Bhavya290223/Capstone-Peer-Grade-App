import authService from "../services/authService.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";

// AUTH CONTROLLERS / HANDLERS
// These functions are called by the routes and meant to handle the logic of the request

export const register = asyncErrorHandler(async (req, res) => {
	const userRegisterInfo = req.body;
	await authService.registerUser(userRegisterInfo);
	await authService.sendVerificationEmail(userRegisterInfo.email);
	return res.status(200).json({
		status: "Success",
		message: "Account successfully created! Verification email sent."
	});
});

export const login = asyncErrorHandler(async (req, res, next) => {
	const { email, password } = req.body;
	const user = await authService.loginUser(email, password);
	req.logIn(user, (err) => {
		if (err) {
			return next(err);
		}
		return res.status(200).json({
			status: "Success",
			message: "You have been logged in!"
		});
	});
});

export const logout = asyncErrorHandler(async (req, res) => {
	req.logout(() => {
		return res.status(200).json({
			status: "Success",
			message: "You have been logged out!"
		});
	});
});

export const forgotPassword = asyncErrorHandler(async (req, res) => {
	const { email } = req.body;
	await authService.sendForgotPasswordEmail(email);
	return res.status(200).json({
		status: "Success",
		message: "Password reset email sent"
	});
});

export const resetPassword = asyncErrorHandler(async (req, res) => {
	const token = req.query.token;
	const { password } = req.body;
	await authService.resetPassword(token, password);
	return res.status(200).json({
		status: "Success",
		message: "Password has been reset"
	});
});

export const resendVerificationEmail = asyncErrorHandler(async (req, res) => {
	const { email } = req.body;
	await authService.sendVerificationEmail(email);
	return res.status(200).json({
		status: "Success",
		message: "Verification email resent"
	});
});

export const confirmEmail = asyncErrorHandler(async (req, res) => {
	const { token } = req.body;
	await authService.confirmEmail(token);
	return res.status(200).json({
		status: "Success",
		message: "Email has been verified"
	});
});

export const currentUser = asyncErrorHandler(async (req, res) => {
	const userInfo = await authService.getCurrentUser(req.user.email);
	return res.status(200).json({
		userInfo: userInfo,
		status: "Success",
		message: "Current user fetched successfully!"
	});
});

export default {
	register,
	login,
	logout,
	forgotPassword,
	resetPassword,
	resendVerificationEmail,
	confirmEmail,
	currentUser // Export the new controller method
};
