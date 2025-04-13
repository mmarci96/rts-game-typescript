import { CreateGameForm } from "@/components/create-game-form";
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

export default function CreateGamePage() {
    return (
        <DefaultLayout>
            <section className="flex flex-col items-center justify-center gap-4 p-4 md:py-10">
                <div className="inline-block max-w-lg text-center justify-center">
                    <h1 className={title()}>Create new game</h1>
                </div>
                <CreateGameForm />
            </section>
        </DefaultLayout>
    );
}
