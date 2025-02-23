import { useState, useEffect, ReactNode } from "react";
interface ComponentProps {
    children: ReactNode;
}
export const AnimatedComponent = ({ children }: ComponentProps) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 100);
    }, []);

    return (
        <div
            className={`animate-fade-in z-0 m-auto ${isVisible ? "animate-fade-in-active" : ""}`}
        >
            {children}
        </div>
    );
};
