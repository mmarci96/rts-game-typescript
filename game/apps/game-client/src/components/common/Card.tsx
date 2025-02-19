import { ReactNode } from "react";

export interface CardProps {
    header: string;
    children: ReactNode;
    footer: string;
}

const Card = ({ header, children, footer }: CardProps) => {

    return (
        <div
            className="flex flex-col w-[64vw] min-w-[320px] max-w-[640px] items-center bg-[#110D1A] p-0  ring-1 ring-slate-600 rounded-2xl shadow-2xl"
        >
            <div className="w-full items-start mt-0 mb-auto bg-[#060312] p-2 rounded-t-2xl">
                <h2 className="text-xl text-gray-50" >{header}</h2>
            </div>
            <div className="w-full flex flex-col items-center p-2 h-full">
                {children}
            </div>
            <div className="mt-auto mb-0 p-2 w-full max-h-12 bg-[#060312] rounded-b-2xl">
                <p>{footer} </p>
            </div>
        </div>
    )
}


export default Card;
