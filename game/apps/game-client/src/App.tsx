import { LoadingAnimation } from "./layouts/fallback";
import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";

const Home = lazy(() => import("./pages/home"));
const Games = lazy(() => import("./pages/games"));
const Lobby = lazy(() => import("./pages/lobby"));
const CreateGame = lazy(() => import("./pages/create-game"));

function App() {
    return (
        <Suspense fallback={<LoadingAnimation />}>
            <Routes>
                <Route element={<Home />} path="/" />
                <Route element={<Games />} path="/games" />
                <Route element={<Lobby />} path="/lobby" />
                <Route element={<CreateGame />} path="/create-game" />
            </Routes>
        </Suspense>
    );
}

export default App;
