import { useState } from "react";
import { ToggleForm } from "../forms/toggle-form";
import { PopupCard } from "../common/popup-card";
import { useAuth } from "../../hooks/use-auth";

export const Navbar = () => {
    const [isLogin, setIsLogin] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const { handleAuthSubmit, userId, handleLogout } = useAuth();

    const onClose = () => {
        setIsPopupOpen(false);
    };
    const onOpen = () => {
        setIsPopupOpen(true);
    };

    return (
        <div className="w-screen flex justify-end h-16 sticky bg-[#0F141E] ring-1 ring-gray-950 shadow-xl">
            {userId ? (
                <button className="my-auto m-2" onClick={handleLogout}>
                    Log out
                </button>
            ) : (
                <button className="my-auto m-2" onClick={onOpen}>
                    Log in
                </button>
            )}

            {isPopupOpen && (
                <PopupCard
                    header="Login or Sign up to get started!"
                    footer="Fun fun fun!"
                    onClose={onClose}
                >
                    <ToggleForm
                        isLogin={isLogin}
                        onSubmit={handleAuthSubmit}
                        onToggle={() => setIsLogin(!isLogin)}
                    />
                </PopupCard>
            )}
        </div>
    );
};
