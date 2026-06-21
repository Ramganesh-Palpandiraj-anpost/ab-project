"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
export function ThemeToggle(){ const {theme,setTheme}=useTheme(); return <button aria-label="Toggle theme" onClick={()=>setTheme(theme==="dark"?"light":"dark")} className="rounded-xl border border-slate-200 p-2.5 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"><Sun className="hidden size-4 dark:block"/><Moon className="size-4 dark:hidden"/></button> }
