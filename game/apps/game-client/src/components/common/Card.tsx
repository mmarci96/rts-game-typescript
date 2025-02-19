export interface CardProps {
    header: string;
    body: string;
    footer: string;
}

const Card = ({ header, body, footer }: CardProps) => {

    return (
        <div className="flex flex-col items-center p-0 m-2 ring-1 ring-indigo-600 rounded-2xl shadow-2xl">
            <div className="w-full items-start m-2 bg-gray-800 p-2 rounded-2xl">
                <h2 className="text-xl text-gray-50" >{header}</h2>
            </div>
            <div className="w-full p-2 h-full">
                <p className="text-lg text-gray-50" >{body}</p>
            </div>
            <div className="mt-auto mb-1 w-full max-h-12 bg-gray-900">
                <p>{footer} </p>
            </div>
        </div>
    )
}


export default Card;
