import type { Config } from "tailwindcss";
export default { darkMode: ["class"], content: ["./app/**/*.{ts,tsx}","./components/**/*.{ts,tsx}"], theme: { extend: { colors: { ink: "#102a2b", brand: { DEFAULT: "#0d7c66", light: "#dcf4ed" }, gold: "#e0a82e" }, boxShadow: { card: "0 12px 35px rgba(16,42,43,.07)" } } }, plugins: [] } satisfies Config;
