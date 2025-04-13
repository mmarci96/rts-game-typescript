import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import GamesPage from "@/pages/games";
import CreateGamePage from "@/pages/create-game";
import BlogPage from "@/pages/blog";
import AboutPage from "@/pages/about";

function App() {
    return (
        <Routes>
            <Route element={<IndexPage />} path="/" />
            <Route element={<GamesPage />} path="/games" />
            <Route element={<CreateGamePage />} path="/create-game" />
            <Route element={<BlogPage />} path="/blog" />
            <Route element={<AboutPage />} path="/about" />
        </Routes>
    );
}

export default App;
