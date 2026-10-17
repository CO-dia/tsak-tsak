import { Archivo, Barlow_Condensed } from "next/font/google";

const body = Archivo({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const display = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

/** Classes à poser sur <html> pour définir les variables de police du site. */
export const fontVariables = `${body.variable} ${display.variable}`;
