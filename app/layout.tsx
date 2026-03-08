import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Elite Sales OS - Liquid Luxury",
    description: "Advanced Sales Operating System",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" className="dark">
            <body className={`${inter.className} bg-[#0a0a0a] text-white antialiased`}>
                {children}
            </body>
        </html>
    );
}
