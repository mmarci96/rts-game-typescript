import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--color-background)",
                foreground: "var(--color-foreground)",

                black: "var(--color-black)",
                blue: "var(--color-blue)",
                cyan: "var(--color-cyan)",
                green: "var(--color-green)",
                magenta: "var(--color-magenta)",
                red: "var(--color-red)",
                white: "var(--color-white)",
                yellow: "var(--color-yellow)",

                bblack: "var(--color-bblack)",
                bblue: "var(--color-bblue)",
                bcyan: "var(--color-bcyan)",
                bgreen: "var(--color-bgreen)",
                bmagenta: "var(--color-bmagenta)",
                bred: "var(--color-bred)",
                bwhite: "var(--color-bwhite)",
                byellow: "var(--color-byellow)",
            },
        },
    },
    darkMode: "class",
    plugins: [heroui()],
};
