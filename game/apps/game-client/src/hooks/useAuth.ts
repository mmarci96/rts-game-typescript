import { useEffect, useState } from "react"

const useAuth = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const saveUser = (userId: string) => {
        window.localStorage.setItem('userId', userId)
    }

    const getUserId = () => {
        const id = window.localStorage.getItem('userId');
        setUserId(id);
    }

    const handleAuthSubmit = (formData: any, isLogin: boolean) => {
        if (isLogin) {
            fetch('/api/auth/login', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
                .then(res => res.json())
                .then(data => saveUser(data.id))
                .catch(err => console.error(err))

        } else {
            fetch('/api/auth/signup', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
                .then(res => res.json())
                .then(data => saveUser(data.id))
                .catch(err => console.error(err))
        }
    };

    const handleLogout = () => {
        window.localStorage.clear();
        setUserId(null);
    }

    useEffect(() => {
        getUserId();
    }, [handleAuthSubmit])

    return { userId, handleAuthSubmit, handleLogout };
}

export default useAuth;
