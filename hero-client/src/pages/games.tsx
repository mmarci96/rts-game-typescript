import { GameTable } from "@/components/game-table";
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

export default function GamesPage() {
    return (
        <DefaultLayout>
            <span
                className="absolute inset-0  w-screen h-screen bg-cover bg-center"
                style={{ backgroundImage: "url('./ladder.png')" }}
            ></span>

            <span className="absolute inset-0  w-screen  bg-cover bg-center bg-gradient-to-b from-[#000] to-transparent flex flex-col items-center justify-center gap-4 p-4 md:py-10"></span>
            <section className="absolute inset-0  w-screen h-full bg-cover bg-center bg-gradient-to-t from-[#0D0913] to-transparent flex flex-col items-center justify-center gap-4 p-4 md:py-10 pb-0">
                <div className="inline-block max-w-lg text-center justify-center">
                    <h1 className={title()}>Docs</h1>
                </div>
                <GameTable />
            </section>
        </DefaultLayout>
    );
}
