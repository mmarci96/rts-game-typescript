export default {
    darkMode: "class", // Enables dark mode support
    theme: {
        extend: {
            colors: {
                "dark-main": "#060312", // Primary dark background
                "dark-secondary": "#110D1A", // Slightly lighter secondary background
                "dark-highlight": "#1E1651", // A bit brighter highlight color
                "dark-danger": "#D72638", // Red shade for errors, warnings
                "dark-warning": "#FF9F1C", // Yellow shade for cautionary actions
            },
        },
    },
    plugins: [],
} as const;
