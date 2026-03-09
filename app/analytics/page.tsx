"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EliteLayout } from '@/components/EliteLayout';
import { SpotlightCard } from '@/components/SpotlightCard';
import { getDashboardStats } from '@/lib/actions';
import { TrendingUp, Users, DollarSign, Target, ArrowUpRight, BarChart2 } from 'lucide-react';

export default function AnalyticsPage() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        getDashboardStats().then(setStats);
    }, []);

    const metrics = [
        { label: 'Bruto Proyectado', value: stats?.projectedRevenue || '$0', icon: DollarSign, trend: '+12.5%', color: 'text-green-400' },
        { label: 'Ratio de Cierre', value: stats?.conversionRate || '0%', icon: Target, trend: '+2.1%', color: 'text-cyan-400' },
        { label: 'Volumen de Captación', value: stats?.totalProspects || '0', icon: Users, trend: '+45', color: 'text-purple-400' },
        { label: 'Interacciones IA', value: stats?.messagesSent || '0', icon: TrendingUp, trend: 'En Tiempo Real', color: 'text-blue-400' },
    ];

    return (
        <EliteLayout>
            <div className="space-y-16 animate-in fade-in duration-1000">
                <div className="space-y-4">
                    <h1 className="text-5xl font-sans font-black tracking-[0.2em] text-white/95 uppercase text-center lg:text-left">Performance <span className="text-white/20 italic">Analytics</span></h1>
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.5em] font-black text-center lg:text-left">Métricas de Alto Impacto y Proyección Financiera.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {metrics.map((m, i) => (
                        <SpotlightCard key={i} delay={i * 0.1} className="p-10 border-white/5 bg-white/[0.01]">
                            <div className="space-y-8">
                                <div className="flex justify-between items-start">
                                    <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 ${m.color}`}>
                                        <m.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-black text-white/20">
                                        <ArrowUpRight className="w-3 h-3" />
                                        {m.trend}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-3">{m.label}</p>
                                    <p className="text-4xl font-serif text-white/90">{m.value}</p>
                                </div>
                            </div>
                        </SpotlightCard>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <SpotlightCard className="p-12 min-h-[400px]">
                        <div className="flex items-center justify-between mb-12">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Crecimiento de Cartera</h3>
                            <BarChart2 className="w-4 h-4 text-white/10" />
                        </div>
                        <div className="h-64 flex items-end gap-4 px-4">
                            {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ delay: i * 0.1, duration: 1 }}
                                    className="flex-1 bg-gradient-to-t from-cyan-500/20 to-cyan-400/80 rounded-t-lg relative group"
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {h}%
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-8 text-[9px] font-black text-white/10 uppercase tracking-widest pb-4 border-b border-white/5">
                            <span>Enero</span>
                            <span>Febrero</span>
                            <span>Marzo</span>
                            <span>Abril</span>
                            <span>Mayo</span>
                            <span>Junio</span>
                            <span>Julio</span>
                        </div>
                    </SpotlightCard>

                    <SpotlightCard className="p-12 overflow-hidden">
                        <div className="flex items-center justify-between mb-12">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Distribución por Nicho</h3>
                            <Target className="w-4 h-4 text-white/10" />
                        </div>
                        <div className="space-y-8">
                            {[
                                { name: 'Salud & Estética', percent: 65, color: 'bg-cyan-500' },
                                { name: 'Fitness & Deporte', percent: 45, color: 'bg-purple-500' },
                                { name: 'Real Estate', percent: 30, color: 'bg-green-500' },
                                { name: 'Profesionales', percent: 20, color: 'bg-yellow-500' },
                            ].map((n, i) => (
                                <div key={i} className="space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-white/60">{n.name}</span>
                                        <span className="text-white/20">{n.percent}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${n.percent}%` }}
                                            transition={{ delay: i * 0.2, duration: 1.5 }}
                                            className={`h-full ${n.color} shadow-[0_0_15px_rgba(34,211,238,0.2)]`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SpotlightCard>
                </div>
            </div>
        </EliteLayout>
    );
}
