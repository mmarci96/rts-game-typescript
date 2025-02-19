
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
        <div
            className="fixed inset-0 flex items-center justify-center "
            onClick={onClose}
        >
            <div
                className="relative z-10  rounded-lg shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <Card header={header} footer={footer}>
                    {children}
                </Card>
            </div>
        </div>
    );
};

export default PopupCard;

