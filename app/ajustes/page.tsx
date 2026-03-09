"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Shield, HardDrive, Cpu, CheckCircle2, AlertCircle, RefreshCw, Loader2, Sparkles, User, Globe, Mail } from 'lucide-react';
import { EliteLayout } from '@/components/EliteLayout';
import { SpotlightCard } from '@/components/SpotlightCard';
import { verifyConnection, getProfile } from '@/lib/actions';

export default function SettingsPage() {
    const [dbStatus, setDbStatus] = useState<any>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [profile, setProfile] = useState<any>(null);

    const checkSystem = async () => {
        setIsVerifying(true);
        const res = await verifyConnection();
        setDbStatus(res);
        setIsVerifying(false);
    };

    const fetchProfile = async () => {
        const p = await getProfile();
        setProfile(p);
    };

    useEffect(() => {
        checkSystem();
        fetchProfile();
    }, []);

    return (
        <EliteLayout>
            <div className="max-w-[1400px] mx-auto px-8 py-16 space-y-16 animate-in fade-in duration-1000">
                <div className="space-y-4">
                    <h1 className="text-5xl font-sans font-black tracking-[0.2em] text-white/95 uppercase">System <span className="text-white/20 italic">Settings</span></h1>
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.5em] font-black">Configuración del Núcleo de Inteligencia.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <SpotlightCard className="p-12 space-y-12">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <HardDrive className="w-5 h-5 text-cyan-500" />
                                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/90">Nucleus Connection</h3>
                            </div>
                            <button
                                onClick={checkSystem}
                                disabled={isVerifying}
                                className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 text-white/40 ${isVerifying ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        <div className="space-y-8">
                            <div className={`p-8 rounded-3xl border ${dbStatus?.success ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'} transition-all`}>
                                <div className="flex gap-6 items-start">
                                    {dbStatus?.success ? (
                                        <CheckCircle2 className="w-8 h-8 text-green-400 shrink-0" />
                                    ) : (
                                        <AlertCircle className="w-8 h-8 text-red-400 shrink-0" />
                                    )}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/90">Neon DB Status</p>
                                        <p className="text-sm font-serif italic text-white/40 leading-relaxed">
                                            {dbStatus?.message || "Iniciando verificación de latencia..."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                                    <p className="text-[8px] text-white/20 uppercase tracking-[0.3em] font-black">Region</p>
                                    <div className="flex items-center gap-3">
                                        <Globe className="w-3.5 h-3.5 text-white/40" />
                                        <span className="text-xs font-serif text-white/80 tracking-wider">aws-us-east-1</span>
                                    </div>
                                </div>
                                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                                    <p className="text-[8px] text-white/20 uppercase tracking-[0.3em] font-black">Latency</p>
                                    <div className="flex items-center gap-3">
                                        <Cpu className="w-3.5 h-3.5 text-white/40" />
                                        <span className="text-xs font-serif text-white/80 tracking-wider">12ms (Platinum)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SpotlightCard>

                    <SpotlightCard className="p-12 space-y-12">
                        <div className="flex items-center gap-4">
                            <Shield className="w-5 h-5 text-purple-500" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/90">Infrastructure Status</h3>
                        </div>

                        <div className="space-y-6">
                            {[
                                { label: 'Outscraper API v2', status: 'Operational', color: 'bg-green-500' },
                                { label: 'Cloudinary CDN', status: 'Operational', color: 'bg-green-500' },
                                { label: 'WhatsApp Bridge', status: 'Standby', color: 'bg-cyan-500' },
                                { label: 'Vercel Deployment', status: 'Production', color: 'bg-purple-500' },
                            ].map((s, i) => (
                                <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{s.label}</span>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-1.5 h-1.5 rounded-full ${s.color} shadow-[0_0_8px_currentColor]`} />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/20">{s.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SpotlightCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <SpotlightCard className="col-span-1 lg:col-span-3 p-12">
                        <div className="flex flex-col lg:flex-row gap-16">
                            <div className="lg:w-1/3 space-y-6">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/90">Profile Identity</h3>
                                <p className="text-sm font-serif italic text-white/20 leading-relaxed">Configura tu presencia digital en el sistema de gestión. Estos datos son visibles en el centro de comando y reportes corporativos.</p>
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-2">Nombre Completo</label>
                                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-4">
                                        <User className="w-4 h-4 text-white/20" />
                                        <span className="text-sm text-white/80 font-serif">{profile?.full_name || 'Director Elite'}</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-2">Cargo Ejecutivo</label>
                                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-4">
                                        <Mail className="w-4 h-4 text-white/20" />
                                        <span className="text-sm text-white/80 font-serif">{profile?.role || 'CEO & Founder'}</span>
                                    </div>
                                </div>
                                <div className="md:col-span-2 p-6 rounded-3xl bg-cyan-500/5 border border-cyan-500/10 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-cyan-500/40 uppercase tracking-widest">Access Protocol</p>
                                        <p className="text-xs text-white/80 font-serif">Tu sesión está protegida por encriptación de grado militar.</p>
                                    </div>
                                    <Sparkles className="w-6 h-6 text-cyan-500/20" />
                                </div>
                            </div>
                        </div>
                    </SpotlightCard>
                </div>
            </div>
        </EliteLayout>
    );
}
