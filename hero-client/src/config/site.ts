export type SiteConfig = typeof siteConfig;

export const siteConfig = {
    name: "RTS game",
    description: "Create or find a game online",
    navItems: [
        {
            label: "Home",
            href: "/",
        },
        {
            label: "Games",
            href: "/games",
        },
        {
            label: "New Game",
            href: "/create-game",
        },
        {
            label: "Blog",
            href: "/blog",
        },
        {
            label: "About",
            href: "/about",
        },
    ],
    navMenuItems: [
        {
            label: "Profile",
            href: "/profile",
        },
        {
            label: "Dashboard",
            href: "/dashboard",
        },
        {
            label: "Projects",
            href: "/projects",
        },
        {
            label: "Team",
            href: "/team",
        },
        {
            label: "Calendar",
            href: "/calendar",
        },
        {
            label: "Settings",
            href: "/settings",
        },
        {
            label: "Help & Feedback",
            href: "/help-feedback",
        },
        {
            label: "Logout",
            href: "/logout",
        },
    ],
};
