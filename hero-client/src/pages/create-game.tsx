import { CreateGameForm } from "@/components/create-game-form";
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

export default function CreateGamePage() {
    return (
        <DefaultLayout>
            <span
                className="absolute inset-0  w-screen h-screen bg-cover bg-center"
                style={{ backgroundImage: "url('./create-game-bg.png')" }}
            ></span>

            <span className="absolute inset-0 top-0 w-screen h-32 bg-[#000]"></span>
            <span className="absolute inset-0 mt-32  w-screen  bg-cover bg-center bg-gradient-to-b from-[#000] to-transparent flex flex-col items-center justify-center gap-4 p-4 md:py-10"></span>
            <section className="absolute inset-0  w-screen h-full bg-cover bg-center bg-gradient-to-t from-[#0D0913] to-transparent flex flex-col items-center justify-center gap-4 p-4 md:py-10 pb-0">
                <div className="inline-block max-w-lg text-center justify-center">
                    <h1 className={title()}>Create new game</h1>
                </div>
                <CreateGameForm />
            </section>
        </DefaultLayout>
    );
}
