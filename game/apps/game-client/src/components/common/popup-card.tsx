import { ReactNode } from "react";
import { Card } from "./card";
import { CloseIcon } from "./icons";
import { AnimatedComponent } from "./animated-component";

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
            <div className="backdrop-blur-xs w-screen h-screen absolute"></div>
            <div
                className="fixed inset-0 flex items-center z-30 justify-center"
                onClick={onClose}
            >
                <div className="absolute scale-110 top-2 right-2 hover:scale-120 cursor-pointer">
                    <CloseIcon />
                </div>
                <div
                    className="relative z-20  rounded-lg shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                >
                    <AnimatedComponent>
                        <Card header={header} footer={footer}>
                            {children}
                        </Card>
                    </AnimatedComponent>
                </div>
            </div>
        </>
    );
};
