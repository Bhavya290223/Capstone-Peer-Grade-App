import { createContext, useState, useEffect } from "react";
import { getCurrentUser, loginUser, logoutUser } from "@/api/authApi";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null);

	useEffect(() => {
		const user = getCurrentUser();
		setUser(user);
	}, []);

	const setUserContext = (user) => {
		setUser(user);
	};

	const clearUserContext = () => {
		setUser(null);
	};

	return (
		<UserContext.Provider value={{ user, setUserContext, clearUserContext }}>
			{children}
		</UserContext.Provider>
	);
};
