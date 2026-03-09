"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageContext";
import { motion } from "framer-motion";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" className="dark min-h-screen bg-black overflow-x-hidden">
            <body className={`${inter.className} text-white antialiased min-h-screen relative overflow-x-hidden bg-transparent`}>
                {/* Global Background Layer - The Fallback Black Background */}
                <div className="fixed inset-0 bg-[#0a0a0a] z-[-20]" />

                {/* Global Background Video - Liquid Luxury Integration */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, ease: "linear" }}
                    className="fixed inset-0 z-[-10] overflow-hidden pointer-events-none"
                >
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                    >
                        <source src="/elite.mp4" type="video/mp4" />
                    </video>
                </motion.div>

                <div className="relative z-0">
                    <LanguageProvider>
                        {children}
                    </LanguageProvider>
                </div>
            </body>
        </html>
    );
}

