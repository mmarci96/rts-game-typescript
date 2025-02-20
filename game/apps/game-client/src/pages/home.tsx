import { Link } from "react-router-dom";
import { Card } from "../components/common/card";
import { AnimatedComponent } from "../components/common/animated-component";
import DefaultLayout from "../layouts/default";

const Home = () => {
    return (
        <AnimatedComponent>
            <DefaultLayout>
                <div className="flex flex-col items-center m-4">
                    <Card header="Home" footer="Online Browser RTS Game">
                        <div className="m-4 flex flex-col items-center p-4 ring-1 w-4/5 rounded-2xl">
                            <h2 className="text-xl m-2">Create Game</h2>
                            <Link className="m-2" to={"/create-game"}>
                                <button>New lobby</button>
                            </Link>
                        </div>
                        <div className="m-4 flex flex-col items-center p-4 ring-1 w-4/5 rounded-2xl">
                            <h2 className="text-xl m-2">Join Game</h2>
                            <Link className="m-2" to={"/games"}>
                                <button>Show lobbies</button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </DefaultLayout>
        </AnimatedComponent>
    );
};

export default Home;
