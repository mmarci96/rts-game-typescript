import { useState } from "react"
import { ToggleForm } from "../forms/ToggleForm";

const Navbar = () => {
    const [isLogin, setIsLogin] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const handleAuthSubmit = (data: any) => {
        if (isLogin) {
            console.log('Logging in:', data);
            fetch('/api/auth/login', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            })
                .then(res => res.json())
                .then(data => console.log(data))
                .catch(err => console.error(err))

        } else {
            fetch('/api/auth/signup', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            })
                .then(res => res.json())
                .then(data => console.log(data))
                .catch(err => console.error(err))
            console.log('Signing up:', data);
        }
    };

    return (
        <div className="min-w-screen flex h-16 sticky">
            <button onClick={() => setIsPopupOpen(!isPopupOpen)}>
                Log in
            </button>

            {isPopupOpen &&
                <div className="absolute -top-1/2 right-1/2 translate-1/2">
                    <ToggleForm
                        isLogin={isLogin}
                        onSubmit={handleAuthSubmit}
                        onToggle={() => setIsLogin(!isLogin)}
                    />
                </div>
            }

        </div>
    );
}

export default Navbar;
