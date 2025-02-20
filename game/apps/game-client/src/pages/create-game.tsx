import { AnimatedComponent } from "../components/common/animated-component";
import DefaultLayout from "../layouts/default";

const CreateGame = () => {
    return (
        <AnimatedComponent>
            <DefaultLayout>
                <div>Games</div>
            </DefaultLayout>
        </AnimatedComponent>
    );
};

export default CreateGame;
