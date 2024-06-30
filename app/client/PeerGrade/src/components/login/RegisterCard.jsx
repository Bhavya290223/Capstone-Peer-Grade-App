import { useState } from "react";
import { cn } from "@/utils/utils";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from "@/components/ui/popover";
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList
} from "@/components/ui/command";
import {
	ChevronDown as ChevronDownIcon,
	ChevronUp as ChevronUpIcon,
	Check as CheckIcon
} from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

const RegisterCard = ({ onSwitchToLogin }) => {
	const { toast } = useToast();
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
	const [error, setError] = useState("");
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState("");

	const handleRegister = (e) => {
		e.preventDefault();

		const passwordRegex =
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

		if (!passwordRegex.test(password)) {
			setError(
				"Password must be at least 8 characters long, with at least one uppercase letter, one lowercase letter, one number, and one special character."
			);
			return;
		}

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		} else {
			// Test if this is needed
			setError("");
		}

		const createUser = async (newUser) => {
			try {
				const response = await fetch(
					"http://localhost:3000/api/auth/register",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify(newUser)
					}
				);

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const data = await response.json();
				return data;
			} catch (error) {
				console.error("Error:", error);
				throw error;
			}
		};

		const newUser = {
			username: "testuser",
			password: password,
			email: email,
			firstname: firstName,
			lastname: lastName,
			role: value
		};

		createUser(newUser)
			.then(() => {
				toast({
					title: "Success",
					description: "Account created successfully!",
					variant: "positive"
				});
				onSwitchToLogin(); // Switch back to login after registration
			})
			.catch((error) => {
				toast({
					title: "Error",
					description: "Failed to create account",
					variant: "destructive"
				});
			});
	};

	const dropdown_options = [
		{
			value: "STUDENT",
			label: "Student"
		},
		{
			value: "INSTRUCTOR",
			label: "Instructor"
		},
		{
			value: "ADMIN",
			label: "Admin"
		}
	];

	return (
		<>
			<Card className="w-full max-w-lg h-[670px] flex flex-col">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl font-bold">Register</CardTitle>
					<CardDescription className="text-gray-600">
						Please enter your details to create an account
					</CardDescription>
				</CardHeader>
				<CardContent className="flex-1 my-3 space-y-4">
					<form className="space-y-4" onSubmit={handleRegister}>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="firstName"
									className="block text-sm font-medium text-gray-700"
								>
									First Name:
								</label>
								<input
									id="firstName"
									name="firstName"
									type="text"
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
									required
									className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								/>
							</div>
							<div>
								<label
									htmlFor="lastName"
									className="block text-sm font-medium text-gray-700"
								>
									Last Name:
								</label>
								<input
									id="lastName"
									name="lastName"
									type="text"
									value={lastName}
									onChange={(e) => setLastName(e.target.value)}
									required
									className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								/>
							</div>
						</div>
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700"
							>
								Email Address:
							</label>
							<input
								id="email"
								name="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							/>
						</div>
						<div className="relative">
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700"
							>
								Password:
							</label>
							<input
								id="password"
								name="password"
								type={passwordVisible ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className={`block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border ${error ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
							/>
							<div className="absolute inset-y-0 mt-6 right-0 pr-3 flex items-center">
								<button
									type="button"
									onClick={() => setPasswordVisible(!passwordVisible)}
								>
									{passwordVisible ? (
										<EyeSlashIcon className="h-5 w-5 text-gray-500" />
									) : (
										<EyeIcon className="h-5 w-5 text-gray-500" />
									)}
								</button>
							</div>
						</div>
						<div className="relative">
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-medium text-gray-700"
							>
								Confirm Password:
							</label>
							<input
								id="confirmPassword"
								name="confirmPassword"
								type={confirmPasswordVisible ? "text" : "password"}
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								className={`block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border ${password !== confirmPassword ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
							/>
							<div className="absolute inset-y-0 mt-6 right-0 pr-3 flex items-center">
								<button
									type="button"
									onClick={() =>
										setConfirmPasswordVisible(!confirmPasswordVisible)
									}
								>
									{confirmPasswordVisible ? (
										<EyeSlashIcon className="h-5 w-5 text-gray-500" />
									) : (
										<EyeIcon className="h-5 w-5 text-gray-500" />
									)}
								</button>
							</div>
						</div>
						<div>
							<label
								htmlFor="selectUserType"
								className="block text-sm font-medium text-gray-700"
							>
								Select User Type (debug):
							</label>
							{/*Popover content box doesnt match width, will fix later!*/}
							<Popover open={open} onOpenChange={setOpen} id="selectUserType">
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										role="combobox"
										aria-expanded={open}
										className="w-full justify-between bg-white mt-1"
									>
										{value
											? dropdown_options.find(
													(option) => option.value === value
												)?.label
											: "Select option..."}
										{open ? (
											<ChevronUpIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
										) : (
											<ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="p-5 rounded-md">
									<Command>
										<CommandList>
											<CommandGroup>
												{dropdown_options.map((option) => (
													<CommandItem
														key={option.value}
														value={option.value}
														onSelect={(currentValue) => {
															setValue(
																currentValue === value ? "" : currentValue
															);
															setOpen(false);
														}}
													>
														{option.label}
														<CheckIcon
															className={cn(
																"ml-auto h-4 w-4",
																value === option.value
																	? "opacity-100"
																	: "opacity-0"
															)}
														/>
													</CommandItem>
												))}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
						</div>
						{error && <p className="text-red-500 text-sm">{error}</p>}
						<div className="flex justify-center">
							<Button
								variant="outline"
								type="submit"
								className="w-full bg-green-200"
							>
								Sign up
							</Button>
						</div>
					</form>
				</CardContent>
				<CardFooter className="flex justify-center items-center text-center bg-indigo-100">
					<p className="text-sm mt-5 text-gray-600">
						Already have an account?{" "}
						<button
							onClick={onSwitchToLogin}
							className="text-green-600 hover:text-gray-900"
						>
							Log in
						</button>
					</p>
				</CardFooter>
			</Card>
			<Toaster />
		</>
	);
};

export default RegisterCard;
