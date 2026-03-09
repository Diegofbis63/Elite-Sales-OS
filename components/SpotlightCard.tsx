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
            className={`relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.01] transition-all duration-700 ${className}`}
        >
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-500"
                style={{
                    opacity,
                    background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.06), transparent 40%)`,
                }}
            />
            {neon && (
                <div
                    className="pointer-events-none absolute -inset-px opacity-0 transition duration-1000 group-hover:opacity-100"
                    style={{
                        background: `radial-gradient(1200px circle at ${position.x}px ${position.y}px, rgba(34,211,238,0.02), transparent 40%)`,
                    }}
                />
            )}
            {children}
        </motion.div>
    );
};
