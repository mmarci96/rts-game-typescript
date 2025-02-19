
import { ReactNode } from "react";
import Card from "./Card";

interface PopupCardProps {
    header: string;
    children: ReactNode;
    footer: string;
    onClose: () => void;
}

const PopupCard = ({ header, children, footer, onClose }: PopupCardProps) => {
    return (
        <>
            <div className="brightness-50  bg-transparent w-screen h-screen z-10 absolute"></div>
            <div
                className="fixed inset-0 flex items-center z-20 justify-center"
                onClick={onClose}
            >
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

export default PopupCard;

