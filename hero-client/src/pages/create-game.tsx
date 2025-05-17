import { AuthModal } from "@/components/auth-modal";
import { CreateGameForm } from "@/components/create-game-form";
import { title } from "@/components/primitives";
import { useUserContext } from "@/context/user-context";
import DefaultLayout from "@/layouts/default";
import { Card, CardBody, CardHeader } from "@heroui/react";

export default function CreateGamePage() {
    const { userData } = useUserContext();
    return (
        <DefaultLayout>
            <span
                className="absolute inset-0  w-screen h-screen bg-cover bg-center"
                style={{ backgroundImage: "url('./create-game-bg.png')" }}
            ></span>

            <span className="absolute inset-0  w-screen  bg-cover bg-center bg-gradient-to-b dark:from-background to-transparent flex flex-col items-center justify-center gap-4 p-4 md:py-10"></span>

            <section className="absolute inset-0  w-screen h-full bg-cover bg-center bg-gradient-to-t from-slate-300 dark:from-background to-transparent flex flex-col items-center justify-center gap-4 p-4 md:py-8 pb-0">
                <div className="inline-block max-w-lg text-center justify-center">
                    <h1 className={title()}>New Game</h1>
                </div>
                {!userData.id ? (
                    <Card
                        fullWidth={true}
                        className="w-full max-w-xl min-h-72 py-8 px-6 bg-background bg-opacity-60"
                        isBlurred={true}
                    >
                        <CardHeader>
                            <h2 className="text-2xl font-bold mr-auto">
                                Login first to create a game!
                            </h2>
                        </CardHeader>
                        <CardBody>
                            <p className="p-2 m-2">Press login to continue</p>
                            <AuthModal />
                        </CardBody>
                    </Card>
                ) : (
                    <CreateGameForm />
                )}
            </section>
        </DefaultLayout>
    );
}
