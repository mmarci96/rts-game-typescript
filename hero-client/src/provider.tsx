import type { NavigateOptions } from "react-router-dom";

import { HeroUIProvider } from "@heroui/system";
import { useHref, useNavigate } from "react-router-dom";
import { UserContextProvider } from "./context/user-context";

declare module "@react-types/shared" {
    interface RouterConfig {
        routerOptions: NavigateOptions;
    }
}

export function Provider({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();

    return (
        <UserContextProvider>
            <HeroUIProvider navigate={navigate} useHref={useHref}>
                {children}
            </HeroUIProvider>
        </UserContextProvider>
    );
}
