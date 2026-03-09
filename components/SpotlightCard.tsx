"use client";

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export const SpotlightCard = ({ children, className = '', delay = 0, neon = true, onClick }: { children: React.ReactNode, className?: string, delay?: number, neon?: boolean, onClick?: () => void }) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;
        const div = divRef.current;
        const rect = div.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <motion.div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setOpacity(1)}
            onMouseLeave={() => setOpacity(0)}
            onClick={onClick}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
            className={`group relative rounded-[2.5rem] bg-black/20 backdrop-blur-xl border border-white/5 transition-all duration-700 overflow-hidden ${className}`}
        >
            {/* Laser Border Effect - Using Mask Layer */}
            {neon && (
                <div className="absolute inset-0 pointer-events-none rounded-[2.5rem] overflow-hidden laser-mask z-30 opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-[-500%] animate-laser bg-[conic-gradient(from_0deg,transparent_0deg,transparent_10deg,#22d3ee_45deg,transparent_80deg)] brightness-[2.5] saturate-[2.5]" />
                </div>
            )}

            {/* Interactive Spotlight */}
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-500 z-10"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(34,211,238,0.15), transparent 40%)`,
                }}
            />

            <div className="relative z-20 w-full h-full">
                {children}
            </div>
        </motion.div>
    );
};
