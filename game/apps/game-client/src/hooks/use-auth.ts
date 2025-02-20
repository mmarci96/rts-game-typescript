import { useEffect, useState } from "react";

export const useAuth = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const saveUser = (userId: string) => {
        window.localStorage.setItem("userId", userId);
    };

    const getUserId = () => {
        const id = window.localStorage.getItem("userId");
        setUserId(id);
    };

    const handleAuthSubmit = async (formData: any, isLogin: boolean) => {
        try {
            const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";

            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            saveUser(data.id);
            window.location.reload();
        } catch (error) {
            console.error("Authentication failed:", error);
        }
    };

    const handleLogout = () => {
        window.localStorage.clear();
        setUserId(null);
    };

    useEffect(() => {
        getUserId();
    }, [handleAuthSubmit]);

    return { userId, handleAuthSubmit, handleLogout };
};
