import { useState } from "react"
import { ToggleForm } from "../forms/ToggleForm";
import PopupCard from "../common/PopupCard";
import useAuth from "../../hooks/useAuth";

const Navbar = () => {
    const [isLogin, setIsLogin] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const { handleAuthSubmit, userId, handleLogout } = useAuth();

    const onClose = () => {
        setIsPopupOpen(false)
    }
    const onOpen = () => {
        setIsPopupOpen(true)
    }


    return (
        <div className="w-screen flex justify-end h-16 sticky bg-[#181818]">
            {userId ?
                <button className="my-auto m-2" onClick={handleLogout}>
                    Log out
                </button>
                :
                <button className="my-auto m-2" onClick={onOpen}>
                    Log in
                </button>}

            {isPopupOpen &&
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
            }

        </div>
    );
}

export default Navbar;
