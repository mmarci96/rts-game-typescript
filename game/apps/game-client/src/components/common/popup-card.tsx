import { ReactNode } from "react";
import { Card } from "./card";
import { CloseIcon } from "../../icons/close-icon";

interface PopupCardProps {
    header: string;
    children: ReactNode;
    footer: string;
    onClose: () => void;
}

export const PopupCard = ({
    header,
    children,
    footer,
    onClose,
}: PopupCardProps) => {
    return (
        <>
            <div className=" backdrop-blur-xs w-screen h-screen z-10 absolute"></div>
            <div
                className="fixed inset-0 flex items-center z-20 justify-center"
                onClick={onClose}
            >
                <div className="absolute scale-110 top-28 right-28 hover:scale-120 cursor-pointer">
                    <CloseIcon />
                </div>
                <div
                    className="relative z-20  rounded-lg shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Card header={header} footer={footer}>
                        {children}
                    </Card>
                </div>
            </div>
        </>
    );
};
