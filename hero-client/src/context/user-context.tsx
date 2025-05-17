import { UserContent, UserContextType } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";

export const UserContext = createContext<UserContextType>({
    userData: {
        id: null,
        username: null,
        email: null,
    },
    onLogin: () => {},
    onLogout: () => {},
});

export const UserContextProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [userData, setUserData] = useState<UserContent>({
        id: null,
        username: null,
        email: null,
    });
    const onLogin = (data: UserContent) => {
        setUserData(data);
        const { id, username, email } = data;
        id && localStorage.setItem("userId", id);
        username && localStorage.setItem("username", username);
        email && localStorage.setItem("email", email);
    };
    const onLogout = () => {
        localStorage.removeItem("userId");
        localStorage.removeItem("username");
        localStorage.removeItem("email");
        setUserData({ id: null, username: null, email: null });
    };
    useEffect(() => {
        const id = localStorage.getItem("userId");
        const username = localStorage.getItem("username");
        const email = localStorage.getItem("email");
        if (id && username && email) {
            setUserData({ id, username, email });
        }
    }, []);

    return (
        <UserContext.Provider
            value={{
                userData,
                onLogout,
                onLogin,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => {
    return useContext(UserContext);
};
