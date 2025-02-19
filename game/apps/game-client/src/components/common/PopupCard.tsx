import Card, { CardProps } from "./Card"
interface PopupCardProps {
    cardProps: CardProps;
    onClose: () => void;
}

const PopupCard = ({ cardProps, onClose }: PopupCardProps) => {
    return (
        <div
            className="absolute w-screen h-screen top-0 bg-gray-800 bg-opacity-80"
            onClick={onClose}
        >
            <div className="absolute top-1/2 right-1/2 translate-1/2 z-10">
                <Card
                    header={cardProps.header}
                    body={cardProps.body}
                    footer={cardProps.footer}
                />
            </div>
        </div>
    )

}

export default PopupCard;
