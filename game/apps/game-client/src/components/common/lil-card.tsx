import { ReactNode } from "react";

export interface LilCardProps {
    header: string;
    children: ReactNode;
    footer: string;
}

export const LilCard = ({ header, children, footer }: LilCardProps) => {
    return (
        <div className="flex flex-col w-full min-w-[260px] items-center bg-gray-900 p-0 ring-1 ring-slate-600 rounded-2xl shadow-2xl">
            <div className="w-full items-start mt-0 mb-auto bg-gray-950 p-2 rounded-t-2xl">
                <h2 className="text-xl text-gray-300">{header}</h2>
            </div>
            <div className="w-full flex flex-col items-center p-2 py-4 h-full">
                {children}
            </div>
            <div className="mt-auto mb-0 p-2 w-full max-h-12 bg-gray-950 rounded-b-2xl">
                <p className="italic">{footer} </p>
            </div>
        </div>
    );
};
