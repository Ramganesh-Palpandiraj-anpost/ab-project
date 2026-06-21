import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
const inter=Inter({subsets:["latin"],variable:"--font-inter"}); const manrope=Manrope({subsets:["latin"],variable:"--font-display"});
export const metadata:Metadata={title:{default:"Adengappa Boys",template:"%s | Adengappa Boys"},description:"Community Sandha, donations and financial management portal"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><body className={`${inter.variable} ${manrope.variable}`}><ThemeProvider>{children}<Toaster richColors/></ThemeProvider></body></html>}
