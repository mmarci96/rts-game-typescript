import { GameTable } from "@/components/game-table";
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

export default function GamesPage() {
    return (
        <DefaultLayout>
            <span
                className="absolute inset-0 z-0  w-screen h-screen bg-cover bg-center"
                style={{ backgroundImage: "url('./ladder.png')" }}
            ></span>

            <span className="absolute inset-0  z-10  w-screen h-screen bg-cover bg-center bg-gradient-to-t from-[#000] to-[#000ef1]"></span>

            <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
                <div className="inline-block max-w-lg text-center justify-center">
                    <h1 className={title()}>Docs</h1>
                </div>
                <GameTable />
            </section>
        </DefaultLayout>
    );
}
