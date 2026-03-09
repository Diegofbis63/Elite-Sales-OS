"use client";

import React from 'react';
import { EliteLayout } from '@/components/EliteLayout';
import { SpotlightCard } from '@/components/SpotlightCard';
import { Briefcase, Construction, Rocket, Clock } from 'lucide-react';

export default function ProjectsPage() {
    return (
        <EliteLayout>
            <div className="max-w-[1400px] mx-auto px-8 py-16 space-y-16 animate-in fade-in duration-1000">
                <div className="space-y-4">
                    <h1 className="text-5xl font-sans font-black tracking-[0.2em] text-white/95 uppercase">Project <span className="text-white/20 italic">Command</span></h1>
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.5em] font-black">Gestión de Implementaciones y Lifecycle de Producto.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <SpotlightCard className="col-span-full p-20 flex flex-col items-center justify-center text-center space-y-8 bg-white/[0.01] border-white/5">
                        <div className="relative">
                            <Construction className="w-16 h-16 text-cyan-500 animate-pulse" />
                            <Rocket className="w-8 h-8 text-white absolute -top-4 -right-4 animate-bounce" />
                        </div>
                        <div className="space-y-4 max-w-lg">
                            <h2 className="text-2xl font-serif tracking-widest uppercase text-white/90">Sección en <span className="text-white/20 italic">Desarrollo</span></h2>
                            <p className="text-sm font-serif italic text-white/40 leading-relaxed">
                                El Centro de Comando de Proyectos está siendo calibrado para ofrecer seguimiento en tiempo real, hitos de implementación y entrega automatizada.
                            </p>
                        </div>
                        <div className="flex items-center gap-6 px-8 py-4 bg-white/5 rounded-full border border-white/10">
                            <Clock className="w-4 h-4 text-cyan-500/50" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Esperando Directivas de Ingeniería...</span>
                        </div>
                    </SpotlightCard>
                </div>
            </div>
        </EliteLayout>
    );
}
