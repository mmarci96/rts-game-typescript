import { Navbar } from "./components/nav/navbar";
import { LoadingAnimation } from "./layouts/fallback";
import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Home } from "./pages/home";
import { Games } from "./pages/games";
import { Lobby } from "./pages/lobby";

function App() {
    return (
        <Suspense fallback={<LoadingAnimation />}>
            <Navbar />
            <Routes>
                <Route element={<Home />} path="/" />
                <Route element={<Games />} path="/games" />
                <Route element={<Lobby />} path="/lobby" />
            </Routes>
        </Suspense>
    );
}

export default App;
