import { AnimatedComponent } from "../components/common/animated-component";
import { Navbar } from "../components/nav/navbar";

export default function DefaultLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AnimatedComponent>
            <div className="relative flex flex-col min-h-screen">
                <Navbar />
                <main className=" mx-auto px-2 flex-grow">{children}</main>
                <footer className="w-full flex items-center justify-center py-3">
                    <span className="text-default-600 mr-1">Powered by </span>
                    <p className="text-blue-400">CodeCool</p>
                </footer>
            </div>
        </AnimatedComponent>
    );
}
