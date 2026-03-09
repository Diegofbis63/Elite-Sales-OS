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
            transition={{ duration: 1, delay, ease: [0.23, 1, 0.32, 1] }}
            className={`group relative overflow-hidden rounded-[2.5rem] bg-[#050505] p-[1px] transition-all duration-700 ${className}`}
        >
            {/* Laser Border Effect */}
            {neon && (
                <div className="absolute inset-[-50%] pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 animate-laser bg-[conic-gradient(from_0deg,transparent_0deg,transparent_20deg,#22d3ee_45deg,transparent_70deg)] opacity-40 group-hover:opacity-100 transition-opacity duration-1000" />
                </div>
            )}

            {/* Inner Content Container */}
            <div className="relative h-full w-full rounded-[calc(2.5rem-1px)] bg-[#0a0a0a]/95 backdrop-blur-3xl overflow-hidden px-1">
                <div
                    className="pointer-events-none absolute -inset-px opacity-0 transition duration-500"
                    style={{
                        opacity,
                        background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(34,211,238,0.1), transparent 40%)`,
                    }}
                />
                {neon && (
                    <div
                        className="pointer-events-none absolute -inset-px opacity-0 transition duration-1000 group-hover:opacity-100"
                        style={{
                            background: `radial-gradient(1000px circle at ${position.x}px ${position.y}px, rgba(34,211,238,0.05), transparent 40%)`,
                        }}
                    />
                )}
                {children}
            </div>
        </motion.div>
    );
};
