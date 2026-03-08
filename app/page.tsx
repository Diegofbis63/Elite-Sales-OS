"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    MessageSquare,
    BarChart3,
    Settings,
    Search,
    Bell,
    MessageCircle,
    Edit2,
    Trash2,
    Filter,
    Plus,
    Save,
    MapPin,
    Loader2,
    X,
    TrendingUp,
    Sparkles,
    Send,
    Upload,
    CheckCircle2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getProspects, getTemplates, getDashboardStats, syncProspects, updateProspectStatus, queueMessage, uploadToCloudinary } from '@/lib/actions';

// --- Components ---

const SpotlightCard = ({ children, className = '', delay = 0, neon = true }: { children: React.ReactNode, className?: string, delay?: number, neon?: boolean }) => {
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay, ease: [0.23, 1, 0.32, 1] }}
            className={`relative overflow-hidden rounded-2xl bg-[#0f0f0f]/50 border border-white/5 backdrop-blur-3xl group ${className}`}
        >
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-500 z-0 bg-white/5 group-hover:opacity-100"
                style={{
                    background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, rgba(34,211,238,0.04), transparent 40%)`,
                }}
            />
            <div className="relative z-10 h-full">
                {children}
            </div>
            {neon && (
                <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            )}
        </motion.div>
    );
};

// --- Global Spotlight ---
const GlobalSpotlight = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div
            className="fixed inset-0 pointer-events-none z-[100] transition-opacity duration-300 pointer-events-none"
            style={{
                background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(34,211,238,0.03) 0%, transparent 600px)`,
            }}
        />
    );
};

// --- WhatsApp Modal Component ---
const WhatsAppModal = ({ isOpen, onClose, prospect }: { isOpen: boolean, onClose: () => void, prospect: any }) => {
    const [step, setStep] = useState(1);
    const [templates, setTemplates] = useState<any[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [customMessage, setCustomMessage] = useState('');
    const [media, setMedia] = useState<File | null>(null);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (isOpen) {
            getTemplates().then(setTemplates);
            setStep(1);
            setSelectedTemplate(null);
            setCustomMessage('');
            setMedia(null);
        }
    }, [isOpen]);

    const handleSelectTemplate = (tpl: any) => {
        setSelectedTemplate(tpl);
        let msg = tpl.content.replace('{nombre}', prospect.name || 'Cliente');
        msg = msg.replace('{negocio}', prospect.business_name || 'su negocio');
        setCustomMessage(msg);
        setStep(2);
    };

    const handleSend = async () => {
        setIsSending(true);
        try {
            let mediaUrl = undefined;
            if (media) {
                const formData = new FormData();
                formData.append('file', media);
                const uploadRes: any = await uploadToCloudinary(formData);
                if (uploadRes.success) {
                    mediaUrl = uploadRes.url;
                }
            }

            const result = await queueMessage(prospect.phone, customMessage, mediaUrl);
            if (result.success) {
                await updateProspectStatus(prospect.id, 'contacted');
                onClose();
            } else {
                alert("Error al encolar el mensaje en el Outbox");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,1)]"
                    >
                        {/* Header Header */}
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-serif font-light tracking-widest uppercase">WhatsApp <span className="text-white/30 italic">Concierge</span></h3>
                                <p className="text-[9px] text-white/30 tracking-[0.4em] mt-1 font-bold uppercase">Envío de Campaña de Alta Fidelización</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <X className="w-5 h-5 text-white/30" />
                            </button>
                        </div>

                        <div className="p-10">
                            {step === 1 ? (
                                <div className="space-y-6">
                                    <p className="text-[10px] text-white/40 tracking-[0.2em] font-bold uppercase mb-4">Seleccione una Estrategia de Apertura:</p>
                                    <div className="grid grid-cols-1 gap-4">
                                        {templates.map(tpl => (
                                            <button
                                                key={tpl.id}
                                                onClick={() => handleSelectTemplate(tpl)}
                                                className="text-left p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group"
                                            >
                                                <div className="text-sm font-medium mb-2 tracking-wide text-white/90 group-hover:text-white">{tpl.title}</div>
                                                <div className="text-xs text-white/30 line-clamp-2 leading-relaxed">{tpl.content}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] text-white/40 tracking-[0.3em] font-bold uppercase">Mensaje Personalizado:</label>
                                        <textarea
                                            value={customMessage}
                                            onChange={(e) => setCustomMessage(e.target.value)}
                                            className="w-full h-40 bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-sm text-white/80 focus:outline-none focus:border-purple-500/50 transition-all leading-relaxed"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] text-white/40 tracking-[0.3em] font-bold uppercase">Contenido Multimedia (Opcional):</label>
                                        <div
                                            onClick={() => document.getElementById('media-upload')?.click()}
                                            className="w-full aspect-[21/9] border-2 border-dashed border-white/5 bg-white/[0.02] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.04] transition-all group relative overflow-hidden"
                                        >
                                            <input
                                                id="media-upload"
                                                type="file"
                                                className="hidden"
                                                onChange={(e) => setMedia(e.target.files?.[0] || null)}
                                            />
                                            {media ? (
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                                                        <CheckCircle2 className="w-6 h-6" />
                                                    </div>
                                                    <span className="text-xs font-mono text-white/60">{media.name}</span>
                                                    <button onClick={(e) => { e.stopPropagation(); setMedia(null); }} className="text-[10px] text-red-400/60 uppercase tracking-widest">Remover</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="w-6 h-6 text-white/20 mb-3 group-hover:scale-110 transition-transform" />
                                                    <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">Sube fotos o videos (Máx 16MB)</p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSend}
                                        disabled={isSending}
                                        className="w-full py-6 bg-white text-black text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                                    >
                                        {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                                        {isSending ? 'Sincronizando...' : 'Enviar ahora'}
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

// --- Pages ---

const Sidebar = ({ currentRoute, setCurrentRoute }: { currentRoute: string, setCurrentRoute: (r: string) => void }) => {
    const navItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Resumen' },
        { id: 'prospects', icon: Users, label: 'Lead List' },
        { id: 'templates', icon: MessageSquare, label: 'Copywriting' },
        { id: 'analytics', icon: BarChart3, label: 'Performance' },
        { id: 'settings', icon: Settings, label: 'Ajustes' },
    ];

    return (
        <aside className="w-64 border-r border-white/5 bg-black/20 backdrop-blur-3xl h-full fixed left-0 top-0 hidden lg:flex flex-col z-[50]">
            <div className="h-24 flex items-center px-10 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black font-black text-xs">E</div>
                    <span className="font-serif font-light tracking-[0.4em] text-[10px] uppercase">Elite Sales</span>
                </div>
            </div>
            <nav className="flex-1 py-14 px-6 space-y-2">
                {navItems.map((item) => {
                    const isActive = currentRoute === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setCurrentRoute(item.id)}
                            className={`w-full relative flex items-center px-6 py-4 rounded-xl transition-all group ${isActive ? 'text-white' : 'text-white/30 hover:text-white hover:bg-white/[0.02]'}`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-nav"
                                    className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl"
                                />
                            )}
                            <item.icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-white' : 'group-hover:text-white'}`} />
                            <span className="ml-5 text-[10px] font-bold tracking-[0.2em] relative z-10 uppercase">{item.label}</span>
                        </button>
                    );
                })}
            </nav>
            <div className="p-8 border-t border-white/5">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/5">
                    <p className="text-[9px] text-white/30 uppercase tracking-widest font-black mb-3">Soporte VIP</p>
                    <p className="text-[10px] text-white/60 leading-relaxed font-light">Acceso directo al equipo elite de Antigravity Lab.</p>
                </div>
            </div>
        </aside>
    );
};

const Header = () => {
    return (
        <header className="h-24 flex items-center justify-between px-10 lg:px-14 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-40">
            <div className="flex items-center gap-6 flex-1 max-w-2xl">
                <Search className="w-4 h-4 text-white/20" />
                <input
                    type="text"
                    placeholder="Búsqueda profunda en la red de prospectos..."
                    className="w-full bg-transparent text-[11px] font-light tracking-widest text-white/80 placeholder-white/20 focus:outline-none"
                />
            </div>
            <div className="flex items-center gap-10">
                <div className="flex items-center gap-3 pr-10 border-r border-white/5">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)] animate-pulse" />
                    <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-white/30">Motor IA Activo</span>
                </div>
                <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">Director General</p>
                        <p className="text-[8px] uppercase tracking-widest text-white/20 mt-1">Socio Elite Access</p>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-white/10 p-0.5 group-hover:border-white/30 transition-all">
                        <div className="w-full h-full rounded-full bg-white/5 overflow-hidden">
                            <img src="https://picsum.photos/seed/elite/100/100" className="w-full h-full object-cover grayscale" alt="Avatar" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

// --- Page Components ---

const Dashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        getDashboardStats().then(setStats);
    }, []);

    const handleSync = async () => {
        setIsSyncing(true);
        await syncProspects();
        const newStats = await getDashboardStats();
        setStats(newStats);
        setIsSyncing(false);
    };

    const kpiData = [
        { label: 'Revenue Proyectado', value: stats?.projectedRevenue || '$0', trend: '+14% Mensual', color: 'cyan' },
        { label: 'Leads Pendientes', value: stats?.withoutWeb || '0', trend: 'Alta Prioridad', color: 'purple' },
        { label: 'Efectividad Closing', value: stats?.conversionRate || '0%', trend: '+3.2%', color: 'white' },
        { label: 'Campañas Activas', value: stats?.messagesSent || '0', trend: 'Sincronizado', color: 'green' },
    ];

    return (
        <div className="space-y-16 animate-in fade-in duration-1000">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <h1 className="text-6xl font-serif font-light tracking-tighter">Strategic <span className="text-white/20 italic">Intelligence</span></h1>
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.5em] font-bold">Control total de captación ultra-segmentada.</p>
                </div>
                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="px-10 py-4 bg-white text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-full hover:shadow-[0_20px_40px_rgba(255,255,255,0.15)] transition-all flex items-center gap-4 disabled:opacity-50"
                >
                    {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {isSyncing ? 'Sincronizando' : 'Activar Sincro'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiData.map((kpi, i) => (
                    <SpotlightCard key={i} delay={i * 0.1} className="p-10 group cursor-default">
                        <div className="space-y-10 relative z-10">
                            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">{kpi.label}</p>
                            <div className="space-y-3">
                                <p className="text-4xl font-serif font-light">{kpi.value}</p>
                                <div className="flex items-center gap-3">
                                    <div className="h-0.5 w-4 bg-cyan-500/30" />
                                    <span className="text-[9px] font-bold text-cyan-500/60 uppercase tracking-widest">{kpi.trend}</span>
                                </div>
                            </div>
                        </div>
                    </SpotlightCard>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                    <SpotlightCard className="p-10 min-h-[500px] flex flex-col group">
                        <div className="flex items-center justify-between mb-16">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Velocidad de Captación Mensual</h3>
                            <div className="px-4 py-2 border border-white/5 rounded-full text-[9px] font-mono text-white/40 tracking-widest uppercase">
                                Real-Time Feed
                            </div>
                        </div>
                        <div className="flex-1 flex items-end gap-6 h-64 px-4">
                            {[45, 85, 55, 95, 75, 88, 62].map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-8 h-full">
                                    <div className="w-full relative h-full bg-white/[0.01] rounded-2xl overflow-hidden flex items-end border border-white/5">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${h}%` }}
                                            transition={{ duration: 2.5, delay: 0.8 + (i * 0.1), ease: [0.16, 1, 0.3, 1] }}
                                            className="w-full bg-gradient-to-t from-white/[0.08] to-white/[0.02] border-t border-white/20 group-hover:from-cyan-500/10 transition-all duration-1000"
                                        />
                                    </div>
                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Sem {i + 1}</span>
                                </div>
                            ))}
                        </div>
                    </SpotlightCard>
                </div>
                <SpotlightCard className="p-10 flex flex-col justify-between overflow-hidden">
                    <div className="space-y-8">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Estado de Operaciones</h3>
                        <div className="space-y-6">
                            {[
                                { label: 'Scraping Engine', status: 'Online', w: 'w-[90%]' },
                                { label: 'WhatsApp Bridge', status: 'Standby', w: 'w-[40%]' },
                                { label: 'Gemini Analyser', status: 'Active', w: 'w-[85%]' },
                                { label: 'Cloudinary CDN', status: 'Ready', w: 'w-[100%]' },
                            ].map((s, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                                        <span className="text-white/60">{s.label}</span>
                                        <span className="text-white/20">{s.status}</span>
                                    </div>
                                    <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: s.w.replace('w-[', '').replace(']', '') + '%' }}
                                            transition={{ duration: 2, delay: 1 + (i * 0.2) }}
                                            className="h-full bg-white/30"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/5">
                        <div className="text-2xl font-serif italic text-white/40 mb-2">Liquid Luxury</div>
                        <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-black">Release v1.2.8 - Antigravity Lab</p>
                    </div>
                </SpotlightCard>
            </div>
        </div>
    );
};

const ProspectsList = () => {
    const [prospects, setProspects] = useState<any[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [selectedProspect, setSelectedProspect] = useState<any>(null);
    const [showWhatsApp, setShowWhatsApp] = useState(false);

    useEffect(() => {
        getProspects().then(data => {
            setProspects(data);
            setIsFetching(false);
        });
    }, []);

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'interested': return 'text-amber-400 border-amber-400/20 bg-amber-400/5';
            case 'contacted': return 'text-blue-400 border-blue-400/20 bg-blue-400/5';
            case 'closed': return 'text-purple-400 border-purple-400/20 bg-purple-400/5';
            default: return 'text-white/30 border-white/5 bg-white/5';
        }
    };

    const handleOpenWhatsApp = (p: any) => {
        setSelectedProspect(p);
        setShowWhatsApp(true);
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-1000">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <h1 className="text-5xl font-serif font-light tracking-tight">Active <span className="text-white/20 italic">Portfolio</span></h1>
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.5em] font-bold">Base de datos de alta fidelidad.</p>
                </div>
                <div className="flex items-center gap-6">
                    <button className="px-8 py-3.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all flex items-center gap-3">
                        <Filter className="w-3.5 h-3.5" /> Filtrar Lista
                    </button>
                    <button className="px-10 py-3.5 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-full transition-all hover:shadow-[0_10px_30px_rgba(255,255,255,0.15)] flex items-center gap-3">
                        <Plus className="w-3.5 h-3.5" /> Nuevo Lead
                    </button>
                </div>
            </div>

            <SpotlightCard className="overflow-hidden border-0" neon={false}>
                <div className="bg-[#0f0f0f]/30 backdrop-blur-3xl rounded-3xl overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="border-b border-white/5 text-white/20 text-[9px] font-black uppercase tracking-[0.4em] bg-white/[0.01]">
                                    <th className="px-12 py-8">Entidad / Contacto</th>
                                    <th className="px-12 py-8">Industria</th>
                                    <th className="px-12 py-8">Canal</th>
                                    <th className="px-12 py-8">Estado</th>
                                    <th className="px-12 py-8 text-right">Despacho</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="popLayout">
                                    {isFetching ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} className="border-b border-white/5 animate-pulse">
                                                <td colSpan={5} className="px-12 py-10 bg-white/[0.01]" />
                                            </tr>
                                        ))
                                    ) : (
                                        prospects.map((p, i) => (
                                            <motion.tr
                                                key={p.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="border-b border-white/5 hover:bg-white/[0.03] transition-all group"
                                            >
                                                <td className="px-12 py-8">
                                                    <div className="text-[13px] font-serif tracking-widest text-white/90 group-hover:text-white transition-colors uppercase">{p.business_name || p.name}</div>
                                                    <div className="text-[8px] text-white/20 mt-2 uppercase tracking-[0.3em] font-bold">UID: {String(p.id).slice(0, 8)}</div>
                                                </td>
                                                <td className="px-12 py-8">
                                                    <span className="text-[10px] text-white/40 font-light tracking-[0.2em] uppercase">/ {p.industry || 'General'}</span>
                                                </td>
                                                <td className="px-12 py-8">
                                                    <div className="text-[11px] font-mono text-white/80 font-bold tracking-tighter">{p.phone || 'Privado'}</div>
                                                    <div className={`mt-2 flex items-center gap-2 ${p.has_website ? 'text-green-500/40' : 'text-red-500/40'}`}>
                                                        <div className={`w-1 h-1 rounded-full ${p.has_website ? 'bg-green-500' : 'bg-red-500'}`} />
                                                        <span className="text-[8px] font-black uppercase tracking-widest">{p.has_website ? 'Web Activa' : 'Sin Web'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-12 py-8">
                                                    <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] border ${getStatusColor(p.status)}`}>
                                                        {p.status || 'COLD'}
                                                    </span>
                                                </td>
                                                <td className="px-12 py-8">
                                                    <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-700">
                                                        <button
                                                            onClick={() => handleOpenWhatsApp(p)}
                                                            className="p-4 rounded-full bg-white/5 border border-white/5 text-purple-400 hover:bg-white/10 hover:border-purple-500/30 transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                                                        >
                                                            <MessageSquare className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-4 rounded-full bg-white/5 border border-white/5 text-white/20 hover:text-white hover:bg-white/10 transition-all">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            </SpotlightCard>

            <WhatsAppModal
                isOpen={showWhatsApp}
                onClose={() => setShowWhatsApp(false)}
                prospect={selectedProspect}
            />
        </div>
    );
};

const TemplatesList = () => {
    const [templates, setTemplates] = useState<any[]>([]);

    useEffect(() => {
        getTemplates().then(setTemplates);
    }, []);

    return (
        <div className="space-y-16 animate-in fade-in duration-1000">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <h1 className="text-5xl font-serif font-light tracking-tight">Copywriting <span className="text-white/20 italic">Assets</span></h1>
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.5em] font-bold">Estrategias de persuasión automatizada.</p>
                </div>
                <button className="px-10 py-4 bg-white text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-full transition-all hover:shadow-[0_20px_40px_rgba(255,255,255,0.15)] flex items-center gap-4">
                    <Plus className="w-5 h-5" /> Nueva Plantilla
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {templates.map((tpl, i) => (
                    <SpotlightCard key={tpl.id} delay={i * 0.1} className="p-12 group h-full flex flex-col justify-between">
                        <div className="space-y-10">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-serif font-light tracking-widest text-white/90 group-hover:text-white transition-colors uppercase">{tpl.title}</h3>
                                <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                                    <MessageSquare className="w-4 h-4 text-white/20" />
                                </div>
                            </div>
                            <p className="text-sm text-white/40 leading-[2] font-light italic">
                                "{tpl.content}"
                            </p>
                        </div>
                        <div className="mt-12 flex items-center justify-between pt-10 border-t border-white/5">
                            <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Plantilla Master / v1.0</div>
                            <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-all duration-700">
                                <button className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                                    <Edit2 className="w-3.5 h-3.5 text-white/40" />
                                </button>
                                <button className="p-3 bg-white/5 rounded-full hover:bg-red-500/20 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5 text-red-400/40" />
                                </button>
                            </div>
                        </div>
                    </SpotlightCard>
                ))}
            </div>
        </div>
    );
};

// --- Layout & App ---

const Layout = ({ children, currentRoute, setCurrentRoute }: { children: React.ReactNode, currentRoute: string, setCurrentRoute: (r: string) => void }) => {
    return (
        <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden font-sans selection:bg-cyan-500/30">
            <GlobalSpotlight />
            <Sidebar currentRoute={currentRoute} setCurrentRoute={setCurrentRoute} />
            <div className="flex-1 lg:ml-64 flex flex-col min-w-0 overflow-hidden relative">
                {/* Background Ambient Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-cyan-500/[0.02] blur-[150px] rounded-full pointer-events-none" />

                <Header />
                <main className="flex-1 overflow-y-auto p-10 lg:p-16 relative z-10 custom-scrollbar scroll-smooth">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default function App() {
    const [currentRoute, setCurrentRoute] = useState('dashboard');
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [password, setPassword] = useState('');

    useEffect(() => {
        const session = localStorage.getItem('elite_session');
        if (session === 'true') {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const correctPass = process.env.NEXT_PUBLIC_PASSCODE || 'elite2024';
        if (password === correctPass) {
            setIsAuthenticated(true);
            localStorage.setItem('elite_session', 'true');
        } else {
            alert('Acceso Denegado. Credenciales incorrectas.');
        }
    };

    if (isAuthenticated === null) return null;

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 selection:bg-purple-500/30">
                <GlobalSpotlight />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-lg p-14 rounded-3xl bg-[#0f0f0f]/50 border border-white/5 backdrop-blur-3xl relative overflow-hidden group shadow-[0_50px_100px_rgba(0,0,0,1)]"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                    <div className="relative z-10 space-y-12">
                        <div className="space-y-6">
                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-black font-black text-lg mx-auto shadow-[0_0_30px_rgba(255,255,255,0.3)]">E</div>
                            <div className="text-center space-y-3">
                                <h1 className="text-3xl font-serif font-light tracking-[0.2em] uppercase">Elite <span className="text-white/20 italic">Gateway</span></h1>
                                <p className="text-[10px] text-white/20 uppercase tracking-[0.5em] font-black">Restricted Access / Level 4 Protocol</p>
                            </div>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 ml-2">Secure Passcode</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-8 text-center text-2xl tracking-[0.8em] font-mono focus:outline-none focus:border-white/20 focus:bg-white/5 transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-5 bg-white text-black text-xs font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-neutral-200 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                            >
                                Autorizar Acceso
                            </button>
                        </form>

                        <div className="text-center pt-6 border-t border-white/5">
                            <p className="text-[9px] text-white/10 uppercase tracking-widest font-black leading-relaxed">
                                Elite Sales OS ® System Proprietary Software<br />
                                encrypted by antigravity neuro-link
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <Layout currentRoute={currentRoute} setCurrentRoute={setCurrentRoute}>
            {currentRoute === 'dashboard' && <Dashboard />}
            {currentRoute === 'prospects' && <ProspectsList />}
            {currentRoute === 'templates' && <TemplatesList />}
            {currentRoute === 'analytics' && <div className="text-white/20 font-serif italic m-10">Métricas avanzadas en desarrollo...</div>}
            {currentRoute === 'settings' && <div className="text-white/20 font-serif italic m-10">Configuración del sistema en desarrollo...</div>}
        </Layout>
    );
}
