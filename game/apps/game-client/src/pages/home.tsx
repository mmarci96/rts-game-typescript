import { Card } from "../components/common/card";

export const Home = () => {
    return (
        <div className="flex flex-col items-center m-4">
            <Card header="Home" footer="Online Browser RTS Game">
                <div className="flex justify-self-end h-[64vh]">
                    <div className="mx-2">
                        <h2 className="text-xl">Create Game</h2>
                    </div>
                    <div className="mx-2">
                        <h2 className="text-xl">Join Game</h2>
                    </div>
                </div>
            </Card>
        </div>
    );
};
