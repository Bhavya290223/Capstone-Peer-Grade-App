import {
	BrowserRouter as Router,
	Routes,
	Route,
	useLocation
} from "react-router-dom";
import { UserProvider } from "./contexts/userContext";
import { ClassProvider } from "./contexts/classContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Class from "./pages/Class";
import Assignment from "./pages/Assignment";
import PeerReview from "./pages/Reviews";
import Settings from "./pages/Settings";
import AppNavbar from "./components/global/Navbar";
import ManageClass from "./pages/ManageClass";
import ViewAllReviews from "./pages/ViewAllReviews";
import Submission from "./components/assign/assignment/StudentSubmission";
import StudentEnrollmentRequests from "./pages/StudentEnrollmentRequests";
import Report from "./pages/Report";
import Notifications from "./pages/Notifications";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/global/ProtectedRoute";
import ManageClassDashboard from "./components/manageClass/ManageClassDashboard";
import NotFound from "./components/global/NotFound";
import TitleUpdater from "@/utils/TitleUpdater";
import { Toaster } from "@/components/ui/toaster";
import ManageGradesAndReviews from "./components/instructorReview/ManageGradesAndReviews";

function App() {
	return (
		<Router>
			<UserProvider>
				<ClassProvider>
					<TitleUpdater />
					<MainLayout />
				</ClassProvider>
			</UserProvider>
		</Router>
	);
}

function MainLayout() {
	const location = useLocation();

	// May need to change this? Idk if this is necessary of the best way to do redirects

	const isLoginPage = location.pathname === "/";

	return (
		<div className="flex gradient-background min-h-screen">
			{!isLoginPage && <AppNavbar />}
			<main className={`flex-grow ml-[200px] flex justify-center`}>
				<div className="w-full max-w-7xl px-6 py-8">
					<Routes>
						<Route path="/" element={<Login />} />
						<Route
							path="/dashboard"
							element={
								<ProtectedRoute
									element={<Dashboard />}
									allowedRoles={["STUDENT", "INSTRUCTOR", "ADMIN"]}
								/>
							}
						/>
						<Route
							path="/admin"
							element={
								<ProtectedRoute
									element={<AdminDashboard />}
									allowedRoles={["ADMIN"]}
								/>
							}
						/>
						<Route
							path="/class/:classId"
							element={
								<ProtectedRoute
									element={<Class />}
									allowedRoles={["STUDENT", "INSTRUCTOR", "ADMIN"]}
								/>
							}
						/>
						<Route
							path="/manage-class"
							element={
								<ProtectedRoute
									element={<ManageClass />}
									allowedRoles={["INSTRUCTOR", "ADMIN"]}
								/>
							}
						/>
						<Route
							path="/manage-class/:classId"
							element={
								<ProtectedRoute
									element={<ManageClassDashboard />}
									allowedRoles={["INSTRUCTOR", "ADMIN"]}
								/>
							}
						/>
						<Route
							path="/enrollment"
							element={
								<ProtectedRoute
									element={<StudentEnrollmentRequests />}
									allowedRoles={["STUDENT", "ADMIN"]}
								/>
							}
						/>
						<Route
							path="/class/:classId/assignment/:assignmentId"
							element={
								<ProtectedRoute
									element={<Assignment />}
									allowedRoles={["STUDENT", "INSTRUCTOR", "ADMIN"]}
								/>
							}
						/>
						<Route
							path="/viewSubmission/:submissionId"
							element={
								<ProtectedRoute
									element={<ViewAllReviews />}
									allowedRoles={["STUDENT", "INSTRUCTOR", "ADMIN"]}
								/>
							}
						/>
						<Route
							path="/peer-review"
							element={
								<ProtectedRoute
									element={<PeerReview />}
									allowedRoles={["STUDENT"]}
								/>
							}
						/>
						<Route
							path="/manage-grades-and-reviews"
							element={
								<ProtectedRoute
									element={<ManageGradesAndReviews />}
									allowedRoles={["INSTRUCTOR", "ADMIN"]}
								/>
							}
						/>
						<Route
							path="/settings"
							element={
								<ProtectedRoute
									element={<Settings />}
									allowedRoles={["STUDENT", "INSTRUCTOR", "ADMIN"]}
								/>
							}
						/>
						<Route
							path="/class/:classId/submit/:assignmentId"
							element={
								<ProtectedRoute
									element={<Submission />}
									allowedRoles={["STUDENT"]}
								/>
							}
						/>
						<Route
							path="/report"
							element={
								<ProtectedRoute
									element={<Report />}
									allowedRoles={["STUDENT", "INSTRUCTOR", "ADMIN"]}
								/>
							}
						/>
						<Route
							path="/notifications"
							element={
								<ProtectedRoute
									element={<Notifications />}
									allowedRoles={["STUDENT", "INSTRUCTOR", "ADMIN"]}
								/>
							}
						/>
						<Route path="*" element={<NotFound />} />
					</Routes>
				</div>
				<Toaster />
			</main>
		</div>
	);
}

export default App;
