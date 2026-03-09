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
import {
    getProspects,
    getTemplates,
    getDashboardStats,
    syncProspects,
    updateProspectStatus,
    queueMessage,
    uploadToCloudinary,
    createProspect,
    createTemplate,
    processOutbox,
    importLeads,
    chatWithAI
} from '@/lib/actions';

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
            className={`relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md group ${className}`}
        >
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-500 z-0 bg-white/5 group-hover:opacity-100"
                style={{
                    opacity,
                    background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, rgba(34,211,238,0.06), transparent 40%)`,
                }}
            />
            <div className="relative z-10 h-full">
                {children}
            </div>
            {neon && (
                <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
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
                background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(34,211,238,0.04) 0%, transparent 600px)`,
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
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-serif font-light tracking-widest uppercase text-white/90">WhatsApp <span className="text-white/30 italic">Concierge</span></h3>
                                <p className="text-[9px] text-white/30 tracking-[0.4em] mt-1 font-black uppercase">Level 4 Messaging Protocol</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/30 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-10">
                            {step === 1 ? (
                                <div className="space-y-6">
                                    <p className="text-[10px] text-white/40 tracking-[0.2em] font-black uppercase mb-4">Seleccione la Estrategia:</p>
                                    <div className="grid grid-cols-1 gap-4">
                                        {templates.map(tpl => (
                                            <button
                                                key={tpl.id}
                                                onClick={() => handleSelectTemplate(tpl)}
                                                className="text-left p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all group"
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
                                        <label className="text-[10px] text-white/40 tracking-[0.3em] font-black uppercase">Mensaje de Alta Fidelidad:</label>
                                        <textarea
                                            value={customMessage}
                                            onChange={(e) => setCustomMessage(e.target.value)}
                                            className="w-full h-40 bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-sm text-white/80 focus:outline-none focus:border-cyan-500/30 transition-all leading-relaxed"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] text-white/40 tracking-[0.3em] font-black uppercase">Adjuntos Multimedia:</label>
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
                                                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                                                        <CheckCircle2 className="w-6 h-6" />
                                                    </div>
                                                    <span className="text-xs font-mono text-white/60">{media.name}</span>
                                                    <button onClick={(e) => { e.stopPropagation(); setMedia(null); }} className="text-[10px] text-red-500/40 uppercase tracking-widest font-black">Remover</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="w-6 h-6 text-white/20 mb-3 group-hover:scale-110 transition-transform" />
                                                    <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">Sincronizar activos multimedios</p>
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
                                        {isSending ? 'Autorizando...' : 'Lanzar Campaña'}
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
        <aside className="w-64 border-r border-white/5 bg-black/50 backdrop-blur-3xl h-full fixed left-0 top-0 hidden lg:flex flex-col z-[50]">
            <div className="h-24 flex items-center px-10 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black font-black text-xs shadow-[0_0_15px_rgba(255,255,255,0.2)]">E</div>
                    <span className="font-serif font-light tracking-[0.4em] text-[10px] uppercase text-white/90">Elite Sales</span>
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
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            )}
                            <item.icon className={`w-4 h-4 relative z-10 transition-colors ${isActive ? 'text-white' : 'group-hover:text-white'}`} />
                            <span className="ml-5 text-[10px] font-black tracking-[0.2em] relative z-10 uppercase">{item.label}</span>
                        </button>
                    );
                })}
            </nav>
            <div className="p-8 border-t border-white/5">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/5">
                    <p className="text-[9px] text-white/30 uppercase tracking-widest font-black mb-3">Protocolo Activo</p>
                    <p className="text-[10px] text-white/60 leading-relaxed font-light">Soporte biótico por Antigravity Lab.</p>
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
                    placeholder="Búsqueda profunda en la red..."
                    className="w-full bg-transparent text-[11px] font-light tracking-widest text-white/80 placeholder-white/20 focus:outline-none"
                />
            </div>
            <div className="flex items-center gap-10">
                <div className="flex items-center gap-3 pr-10 border-r border-white/5">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)] animate-pulse" />
                    <span className="text-[9px] font-black tracking-[0.3em] uppercase text-white/30 font-bold">IA Sincro</span>
                </div>
                <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">Director Elite</p>
                        <p className="text-[8px] uppercase tracking-widest text-white/20 mt-1">Socio Autorizado</p>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-white/10 p-0.5 group-hover:border-white/40 transition-all duration-500">
                        <div className="w-full h-full rounded-full bg-white/5 overflow-hidden">
                            <img src="https://picsum.photos/seed/elite_user/100/100" className="w-full h-full object-cover grayscale brightness-125" alt="Avatar" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

// --- Page Components ---

const ProspectsList = () => {
    const [prospects, setProspects] = useState<any[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [selectedProspect, setSelectedProspect] = useState<any>(null);
    const [showWhatsApp, setShowWhatsApp] = useState(false);
    const [filter, setFilter] = useState('');
    const [showNewModal, setShowNewModal] = useState(false);

    const fetchProspects = () => {
        setIsFetching(true);
        getProspects().then(data => {
            setProspects(data);
            setIsFetching(false);
        });
    };

    useEffect(() => {
        fetchProspects();
    }, []);

    const filteredProspects = prospects.filter(p =>
        p.name?.toLowerCase().includes(filter.toLowerCase()) ||
        p.business_name?.toLowerCase().includes(filter.toLowerCase()) ||
        p.industry?.toLowerCase().includes(filter.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'interested': return 'text-amber-400 border-amber-400/20 bg-amber-400/5';
            case 'contacted': return 'text-cyan-400 border-cyan-400/20 bg-cyan-400/5';
            case 'closed': return 'text-purple-400 border-purple-400/20 bg-purple-400/5';
            default: return 'text-white/20 border-white/5 bg-white/[0.02]';
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
                    <h1 className="text-5xl font-serif font-light tracking-tight text-white/95">Strategic <span className="text-white/20 italic">Portfolio</span></h1>
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.5em] font-black">Segmentación de Alta Fidelidad por IA.</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-cyan-500/50 transition-colors" />
                        <input
                            placeholder="FILTRAR PORTFOLIO..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="pl-14 pr-10 py-3.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.3em] focus:outline-none focus:border-white/20 transition-all w-64"
                        />
                    </div>
                    <button
                        onClick={() => setShowNewModal(true)}
                        className="px-10 py-3.5 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-full transition-all hover:shadow-[0_10px_30px_rgba(255,255,255,0.2)] flex items-center gap-3"
                    >
                        <Plus className="w-4 h-4" /> Nuevo Lead
                    </button>
                </div>
            </div>

            <NewLeadModal isOpen={showNewModal} onClose={() => setShowNewModal(false)} onRefresh={fetchProspects} />

            <SpotlightCard className="overflow-hidden border-0" neon={false}>
                <div className="bg-[#0f0f0f]/30 backdrop-blur-3xl rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="border-b border-white/5 text-white/20 text-[9px] font-black uppercase tracking-[0.4em] bg-white/[0.01]">
                                    <th className="px-12 py-10 font-black">Entidades / Corporación</th>
                                    <th className="px-12 py-10 font-black">Industria</th>
                                    <th className="px-12 py-10 font-black">Canal Directo</th>
                                    <th className="px-12 py-10 font-black">Status</th>
                                    <th className="px-12 py-10 text-right font-black">Despacho</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="popLayout">
                                    {isFetching ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} className="border-b border-white/5 animate-pulse">
                                                <td colSpan={5} className="px-12 py-12 bg-white/[0.01]" />
                                            </tr>
                                        ))
                                    ) : filteredProspects.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-12 py-32 text-center text-white/10 uppercase tracking-[0.5em] text-[10px] font-black">Sin coincidencias estratégicas.</td>
                                        </tr>
                                    ) : (
                                        filteredProspects.map((p, i) => (
                                            <motion.tr
                                                key={p.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="border-b border-white/5 hover:bg-white/[0.03] transition-all group"
                                            >
                                                <td className="px-12 py-10">
                                                    <div className="text-[14px] font-serif tracking-widest text-white/90 group-hover:text-white transition-colors uppercase leading-normal font-light">{p.business_name || p.name}</div>
                                                    <div className="text-[8px] text-white/10 mt-3 uppercase tracking-[0.4em] font-black">UID: {String(p.id).slice(0, 8)}</div>
                                                </td>
                                                <td className="px-12 py-10">
                                                    <span className="text-[10px] text-white/40 font-light tracking-[0.3em] uppercase">/ {p.industry || 'General'}</span>
                                                </td>
                                                <td className="px-12 py-10">
                                                    <div className="text-[12px] font-mono text-white/80 font-bold tracking-widest">{p.phone || 'Privado'}</div>
                                                    <div className={`mt-3 flex items-center gap-3 ${p.has_website ? 'text-green-500/30' : 'text-red-500/30'}`}>
                                                        <div className={`w-1 h-1 rounded-full ${p.has_website ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                                                        <span className="text-[8px] font-black uppercase tracking-[0.3em]">{p.has_website ? 'Infraestructura Web' : 'Sintonía Pendiente'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-12 py-10">
                                                    <span className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.4em] border ${getStatusColor(p.status)} shadow-sm`}>
                                                        {p.status || 'COLD'}
                                                    </span>
                                                </td>
                                                <td className="px-12 py-10">
                                                    <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-700">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleOpenWhatsApp(p); }}
                                                            className="p-4 rounded-full bg-white/5 border border-white/10 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/40 transition-all hover:shadow-[0_0_25px_rgba(34,211,238,0.2)]"
                                                        >
                                                            <MessageSquare className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-4 rounded-full bg-white/5 border border-white/10 text-white/20 hover:text-white hover:bg-white/10 transition-all">
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

const NewLeadModal = ({ isOpen, onClose, onRefresh }: { isOpen: boolean, onClose: () => void, onRefresh: () => void }) => {
    const [formData, setFormData] = useState({ name: '', business_name: '', phone: '', industry: '' });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const res = await createProspect({ ...formData, status: 'cold' });
        if (res.success) {
            onRefresh();
            onClose();
        } else {
            alert("Error al guardar lead: " + res.error);
        }
        setIsSaving(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl p-10 shadow-2xl">
                        <h3 className="text-xl font-serif mb-8 tracking-widest uppercase">Nuevo <span className="text-white/20 italic">Prospecto</span></h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <input placeholder="Nombre del Contacto" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            <input placeholder="Nombre del Negocio" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm" value={formData.business_name} onChange={e => setFormData({ ...formData, business_name: e.target.value })} />
                            <input placeholder="WhatsApp (Formato Int.)" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            <input placeholder="Industria" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm" value={formData.industry} onChange={e => setFormData({ ...formData, industry: e.target.value })} />
                            <button disabled={isSaving} className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-xl">
                                {isSaving ? 'Guardando...' : 'Registrar Lead'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const NewTemplateModal = ({ isOpen, onClose, onRefresh, initialTitle = '', initialContent = '' }: { isOpen: boolean, onClose: () => void, onRefresh: () => void, initialTitle?: string, initialContent?: string }) => {
    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTitle(initialTitle);
            setContent(initialContent);
        }
    }, [isOpen, initialTitle, initialContent]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const res = await createTemplate(title, content);
        if (res.success) {
            onRefresh();
            onClose();
        } else {
            alert("Error al guardar estrategia: " + res.error);
        }
        setIsSaving(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl p-10 shadow-2xl">
                        <h3 className="text-xl font-serif mb-8 tracking-widest uppercase">Estrategia <span className="text-white/20 italic">Personalizada</span></h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <input placeholder="Título de la Campaña" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white" value={title} onChange={e => setTitle(e.target.value)} />
                            <textarea placeholder="Cuerpo del Mensaje ({nombre}, {negocio})" required className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white" value={content} onChange={e => setContent(e.target.value)} />
                            <div className="flex gap-4">
                                <button type="button" onClick={onClose} className="flex-1 py-4 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-white/5 transition-all">Cancelar</button>
                                <button disabled={isSaving} className="flex-[2] py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-xl">
                                    {isSaving ? 'Guardando...' : 'Guardar Estrategia'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const TemplatesList = () => {
    const [templates, setTemplates] = useState<any[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [showNewModal, setShowNewModal] = useState(false);
    const [modalInitial, setModalInitial] = useState({ title: '', content: '' });

    const fetchTemplates = () => {
        setIsFetching(true);
        getTemplates().then(data => {
            setTemplates(data);
            setIsFetching(false);
        });
    };

    const openNewModal = (title = '', content = '') => {
        setModalInitial({ title, content });
        setShowNewModal(true);
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    return (
        <div className="space-y-16 animate-in fade-in duration-1000">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <h1 className="text-5xl font-serif font-light tracking-tight text-white/95">Writing <span className="text-white/20 italic">Strategies</span></h1>
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.5em] font-black">Activos de persuasión para cierre inmediato.</p>
                </div>
                <button
                    onClick={() => openNewModal()}
                    className="px-10 py-4 bg-white text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-full transition-all hover:shadow-[0_20px_40px_rgba(255,255,255,0.2)] flex items-center gap-4"
                >
                    <Plus className="w-5 h-5" /> Nueva Apertura
                </button>
            </div>

            <NewTemplateModal
                isOpen={showNewModal}
                onClose={() => setShowNewModal(false)}
                onRefresh={fetchTemplates}
                initialTitle={modalInitial.title}
                initialContent={modalInitial.content}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {isFetching ? (
                    <div className="col-span-full py-20 text-center text-white/10 uppercase tracking-widest text-[10px]">Cargando protocolos de copia...</div>
                ) : (
                    <>
                        {/* Predefined Templates Section */}
                        <div className="col-span-full border-b border-white/5 pb-10 mb-10">
                            <h3 className="text-[10px] text-white/20 uppercase tracking-[0.5em] font-black mb-10">Plantillas Maestras Predefinidas (Editables)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { title: 'Apertura Empática', content: 'Hola {nombre}, vi tu negocio {negocio} en Córdoba y me encantó lo que hacen. Noté que aún no tienen un sitio web optimizado, ¿te interesaría ver cómo podemos elevar su presencia digital?' },
                                    { title: 'Oferta Directa Luxury', content: 'Estimados de {negocio}, estamos seleccionando 3 negocios en Córdoba para una transformación digital gratuita de 7 días. ¿Le gustaría a {nombre} ser el primero?' },
                                    { title: 'Seguimiento High-Stake', content: 'Hola {nombre}, sigo esperando tu respuesta sobre el upgrade de {negocio}. El mercado de Córdoba se mueve rápido, no te quedes atrás.' }
                                ].map((tpl, i) => (
                                    <div key={i} className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer"
                                        onClick={() => openNewModal(tpl.title, tpl.content)}>
                                        <div className="text-[10px] font-black uppercase text-cyan-400/60 mb-4">{tpl.title}</div>
                                        <p className="text-[11px] text-white/30 leading-relaxed italic line-clamp-3">"{tpl.content}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {templates.length === 0 ? (
                            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl text-white/20 uppercase tracking-widest text-[10px]">No hay estrategias personalizadas registradas.</div>
                        ) : templates.map((tpl, i) => (
                            <SpotlightCard key={tpl.id} delay={i * 0.1} className="p-12 group h-full flex flex-col justify-between cursor-default">
                                <div className="space-y-12">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-serif font-light tracking-widest text-white hover:text-cyan-400 transition-colors duration-500 uppercase">{tpl.title}</h3>
                                        <div className="p-2.5 bg-white/[0.03] rounded-xl border border-white/10">
                                            <MessageSquare className="w-4.5 h-4.5 text-white/20" />
                                        </div>
                                    </div>
                                    <p className="text-sm text-white/40 leading-[2.2] font-light italic tracking-wide">
                                        "{tpl.content}"
                                    </p>
                                </div>
                                <div className="mt-14 flex items-center justify-between pt-12 border-t border-white/5">
                                    <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Estrategia Elite / v2.1</div>
                                    <div className="flex gap-5 opacity-0 group-hover:opacity-100 transition-all duration-700">
                                        <button className="p-3.5 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/5">
                                            <Edit2 className="w-3.5 h-3.5 text-white/40" />
                                        </button>
                                        <button className="p-3.5 bg-white/5 rounded-full hover:bg-red-500/20 transition-colors border border-white/5">
                                            <Trash2 className="w-3.5 h-3.5 text-red-400/40" />
                                        </button>
                                    </div>
                                </div>
                            </SpotlightCard>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

// --- Layout & App ---

const Layout = ({ children, currentRoute, setCurrentRoute }: { children: React.ReactNode, currentRoute: string, setCurrentRoute: (r: string) => void }) => {
    return (
        <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-white">
            <GlobalSpotlight />
            <Sidebar currentRoute={currentRoute} setCurrentRoute={setCurrentRoute} />
            <div className="flex-1 lg:ml-64 flex flex-col min-w-0 overflow-hidden relative">
                {/* Background Ambient Depth */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-cyan-500/[0.03] blur-[180px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[400px] bg-purple-500/[0.02] blur-[150px] rounded-full pointer-events-none" />

                <Header />
                <main className="flex-1 overflow-y-auto p-10 lg:p-16 relative z-10 custom-scrollbar scroll-smooth">
                    {children}
                </main>
            </div>
        </div>
    );
};

interface DashboardStats {
    projectedRevenue?: string;
    withoutWeb?: number;
    conversionRate?: string;
    messagesSent?: string;
}

export default function App() {
    const [currentRoute, setCurrentRoute] = useState('dashboard');
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [stats, setStats] = useState<DashboardStats | null>(null);

    const fetchStats = () => {
        getDashboardStats().then(s => setStats(s as DashboardStats));
    };

    useEffect(() => {
        const session = localStorage.getItem('elite_session');
        if (session === 'true') {
            setIsAuthenticated(true);
            fetchStats();
        } else {
            setIsAuthenticated(false);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const userInput = password.trim();
        const envPass = process.env.NEXT_PUBLIC_PASSCODE;
        const targetPass = (envPass && typeof envPass === 'string' ? envPass.trim() : 'elite2024');

        if (userInput === targetPass) {
            localStorage.setItem('elite_session', 'true');
            setIsAuthenticated(true);
            fetchStats();
        } else {
            alert('AUTORIZACIÓN DENEGADA: Credenciales inválidas.');
        }
    };

    if (isAuthenticated === null) return null;

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8 selection:bg-cyan-500/40">
                <GlobalSpotlight />
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-xl p-16 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl relative overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,1)] group"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/5 blur-[80px] rounded-full group-hover:bg-cyan-500/10 transition-all duration-1000" />

                    <div className="relative z-10 space-y-16">
                        <div className="space-y-8">
                            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-black font-black text-xl mx-auto shadow-[0_0_40px_rgba(255,255,255,0.2)]">E</div>
                            <div className="text-center space-y-4">
                                <h1 className="text-4xl font-serif font-light tracking-[0.25em] uppercase text-white/95">Elite <span className="text-white/20 italic">Interface</span></h1>
                                <p className="text-[10px] text-white/20 uppercase tracking-[0.6em] font-black">Secure Encryption Layer / Level 4 Prot.</p>
                            </div>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-10">
                            <div className="space-y-5">
                                <label className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 ml-4">Ingresar Passcode Maestro</label>
                                <input
                                    type="password"
                                    autoFocus
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-3xl py-7 px-10 text-center text-3xl tracking-[1em] font-mono focus:outline-none focus:border-white/20 focus:bg-white/5 transition-all text-white/90"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoggingIn}
                                className="w-full py-6 bg-white text-black text-[11px] font-black uppercase tracking-[0.5em] rounded-3xl hover:bg-neutral-100 transition-all shadow-[0_25px_50px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4 disabled:opacity-50"
                            >
                                {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sincronizar Acceso'}
                            </button>
                        </form>

                        <div className="text-center pt-10 border-t border-white/5">
                            <p className="text-[8px] text-white/10 uppercase tracking-[0.3em] font-black leading-relaxed">
                                Elite Sales OS ® Enterprise Edition<br />
                                Accelerated by Antigravity Neuro-Link Technology
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <Layout currentRoute={currentRoute} setCurrentRoute={setCurrentRoute}>
            {currentRoute === 'dashboard' && <Dashboard stats={stats} onRefresh={fetchStats} />}
            {currentRoute === 'prospects' && <ProspectsList />}
            {currentRoute === 'templates' && <TemplatesList />}
            {currentRoute === 'analytics' && <AnalyticsView stats={stats} onRefresh={fetchStats} />}
            {currentRoute === 'settings' && <SettingsView />}
        </Layout>
    );
}

const Dashboard = ({ stats, onRefresh }: { stats: DashboardStats | null, onRefresh: () => void }) => {
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const result = await syncProspects() as { success: boolean; leadsAdded?: number; error?: string };
            if (result.success) {
                alert(`SINCRONIZACIÓN EXITOSA: Se han localizado ${result.leadsAdded} nuevos prospectos de alta fidelidad.`);
            } else {
                alert(`ERROR DE PROTOCOLO: ${result.error || 'Fallo desconocido en el motor de IA'}`);
            }
            onRefresh();
        } catch (err) {
            alert(`EXCEPCIÓN CRÍTICA: ${err}`);
        } finally {
            setIsSyncing(false);
        }
    };

    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', parts: { text: string }[] }[]>([]);
    const [isAILoading, setIsAILoading] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    const handleAIChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || isAILoading) return;

        const userMsg = chatInput;
        setChatInput('');
        setChatHistory(prev => [...prev, { role: 'user', parts: [{ text: userMsg }] }]);
        setIsAILoading(true);

        try {
            const res = await chatWithAI(userMsg, chatHistory);
            if (res.success) {
                setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: res.text || '' }] }]);
            } else {
                alert("Error de Conexión Neural: " + res.error);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsAILoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsImporting(true);
        try {
            const text = await file.text();
            let leads: any = [];
            if (file.name.endsWith('.json')) {
                const parsed = JSON.parse(text);
                leads = parsed.leads || parsed;
            } else {
                const lines = text.split('\n');
                leads = lines.slice(1).map(line => {
                    const values = line.split(',');
                    return { business_name: values[0], phone: values[1], name: values[2] || 'Gerencia' };
                }).filter(l => l.business_name);
            }
            const res = await importLeads(leads);
            if (res.success) {
                alert(`INGESTA COMPLETADA: ${res.leadsAdded} prospectos integrados.`);
                onRefresh();
            } else {
                alert("FALLO EN INGESTA: " + res.error);
            }
        } catch (err) {
            alert("ERROR DE FORMATO: El archivo no es válido.");
        } finally {
            setIsImporting(false);
        }
    };

    const kpiData = [
        { label: 'Ingresos Proyectados', value: stats?.projectedRevenue || '$0', trend: '+14% Mensual', color: 'cyan' },
        { label: 'Leads de Alta Prioridad', value: stats?.withoutWeb || '0', trend: 'Sincronizado', color: 'purple' },
        { label: 'Tasa de Conversión', value: stats?.conversionRate || '0%', trend: '+3.2%', color: 'white' },
        { label: 'Alcance Estratégico', value: stats?.messagesSent || '0', trend: 'Activo', color: 'green' },
    ];

    return (
        <div className="space-y-16 animate-in fade-in duration-1000">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <h1 className="text-6xl font-serif font-light tracking-tighter text-white/95">Strategic <span className="text-white/20 italic">Dashboard</span></h1>
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.5em] font-black">Central de Inteligencia Comercial de Lujo.</p>
                </div>
                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="px-10 py-4 bg-white text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-full hover:shadow-[0_20px_40px_rgba(255,255,255,0.2)] transition-all flex items-center gap-4 disabled:opacity-50"
                >
                    {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {isSyncing ? 'Sincronizando' : 'Sincro Automática'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiData.map((kpi, i) => (
                    <SpotlightCard key={i} delay={i * 0.1} className="p-10 group cursor-default">
                        <div className="space-y-10 relative z-10">
                            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30">{kpi.label}</p>
                            <div className="space-y-3">
                                <p className="text-4xl font-serif font-light text-white/90">{kpi.value}</p>
                                <div className="flex items-center gap-3">
                                    <div className="h-0.5 w-4 bg-white/20" />
                                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest font-bold">{kpi.trend}</span>
                                </div>
                            </div>
                        </div>
                    </SpotlightCard>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                    <SpotlightCard className="p-10 min-h-[500px] flex flex-col group">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">AI Intelligence Chat</h3>
                            <div className="px-5 py-2.5 border border-white/10 rounded-full text-[9px] font-mono text-cyan-400 tracking-widest uppercase bg-cyan-400/5">
                                Live Neural Link
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-6 mb-8 custom-scrollbar pr-2 max-h-[350px]">
                            {chatHistory.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30 px-10">
                                    <MessageCircle className="w-12 h-12" />
                                    <p className="text-[10px] uppercase font-black tracking-widest leading-loose">
                                        Escribe para buscar prospectos.<br />
                                        "Busca 15 estéticas en Córdoba y dame un JSON"
                                    </p>
                                </div>
                            ) : (
                                chatHistory.map((chat, i) => (
                                    <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-5 rounded-2xl text-[11px] leading-relaxed tracking-wide ${chat.role === 'user' ? 'bg-white/5 border border-white/10 text-white/90' : 'bg-cyan-500/5 border border-cyan-500/10 text-cyan-50/80 shadow-[0_0_20px_rgba(34,211,238,0.05)]'}`}>
                                            <ReactMarkdown className="prose prose-invert prose-xs">{chat.parts[0].text}</ReactMarkdown>
                                        </div>
                                    </div>
                                ))
                            )}
                            {isAILoading && (
                                <div className="flex justify-start">
                                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                                        <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Procesando Red...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleAIChat} className="relative">
                            <input
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Consultar inteligencia de mercado..."
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 pl-8 pr-20 text-[11px] font-light tracking-widest text-white/80 placeholder-white/20 focus:outline-none focus:border-cyan-500/30 transition-all border-dashed"
                            />
                            <button type="submit" disabled={isAILoading} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-cyan-400 hover:text-white transition-colors">
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </SpotlightCard>
                </div>

                <SpotlightCard className="p-10 flex flex-col group h-full">
                    <div className="space-y-10 h-full flex flex-col">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Strategic Ingest</h3>

                        <div className="flex-1 flex flex-col">
                            <label className="flex-1 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] hover:border-cyan-500/30 transition-all cursor-pointer group flex flex-col items-center justify-center p-8 text-center space-y-6">
                                <input type="file" accept=".json,.csv" className="hidden" onChange={handleFileUpload} />
                                <div className="p-6 rounded-full bg-white/5 group-hover:bg-cyan-500/20 transition-all">
                                    {isImporting ? <Loader2 className="w-10 h-10 animate-spin text-cyan-400" /> : <Upload className="w-10 h-10 text-white/10 group-hover:text-cyan-400 transition-all" />}
                                </div>
                                <div className="space-y-3">
                                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/80 group-hover:text-white">Cargar Leads</p>
                                    <p className="text-[9px] text-white/20 uppercase tracking-widest font-black leading-relaxed">JSON / CSV de Alta Fidelidad</p>
                                </div>
                            </label>

                            <div className="mt-10 p-8 rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/5">
                                <div className="flex items-center gap-4 mb-3">
                                    <Sparkles className="w-4 h-4 text-cyan-400/40" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Inyección Directa</span>
                                </div>
                                <p className="text-[10px] text-white/20 font-light leading-relaxed">
                                    Sube el archivo extraído del chat para integrarlo sin consumir cuota.
                                </p>
                            </div>
                        </div>

                        <div className="mt-10 pt-10 border-t border-white/5">
                            <div className="text-3xl font-serif italic text-white/20 mb-3 group-hover:text-white/40 transition-colors duration-1000">Liquid Luxury</div>
                            <p className="text-[9px] text-white/10 font-black uppercase tracking-[0.4em]">Elite Engine v3.1</p>
                        </div>
                    </div>
                </SpotlightCard>
            </div>
        </div>
    );
};

const AnalyticsView = ({ stats, onRefresh }: { stats: any, onRefresh: () => void }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleProcessOutbox = async () => {
        setIsProcessing(true);
        const res = await processOutbox();
        if (res.success) {
            alert(`PROTOCOLO COMPLETADO: Se han emitido ${res.processed} comunicaciones estratégicas.`);
            onRefresh();
        } else {
            alert("FRECUENCIA INTERRUMPIDA: Fallo en el bridge de WhatsApp.");
        }
        setIsProcessing(false);
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <h2 className="text-4xl font-serif font-light tracking-tight text-white/90">Performance <span className="text-white/20 italic">Metrics</span></h2>
                <button
                    onClick={handleProcessOutbox}
                    disabled={isProcessing}
                    className="px-8 py-3 bg-cyan-500 text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:shadow-[0_10px_30px_rgba(34,211,238,0.3)] transition-all flex items-center gap-3 disabled:opacity-50"
                >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {isProcessing ? 'Procesando...' : 'Procesar Outbox'}
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <SpotlightCard className="p-10 h-80 flex flex-col justify-center items-center">
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] mb-10">Eficiencia de Conversión</p>
                    <div className="text-6xl font-serif text-cyan-400">{stats?.conversionRate || '0%'}</div>
                    <p className="text-[9px] text-white/20 uppercase tracking-widest mt-6">Basado en {stats?.totalProspects || 0} entidades</p>
                </SpotlightCard>
                <SpotlightCard className="p-10 h-80 flex flex-col justify-center items-center">
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] mb-10">Alcance de Red</p>
                    <div className="text-6xl font-serif text-white">{stats?.messagesSent || 0}</div>
                    <p className="text-[9px] text-white/20 uppercase tracking-widest mt-6">Envíos validados por Outbox</p>
                </SpotlightCard>
            </div>
        </div>
    );
};

const SettingsView = () => (
    <div className="space-y-12 animate-in fade-in duration-700">
        <h2 className="text-4xl font-serif font-light tracking-tight text-white/90">System <span className="text-white/20 italic">Protocol</span></h2>
        <div className="max-w-2xl space-y-6">
            <SpotlightCard className="p-10 space-y-8">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">API Core (Gemini 3.1 Flash Lite - High Capacity)</span>
                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_green]" />
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">Storage Bridge (Neon)</span>
                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_green]" />
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">CDN Services (Cloudinary)</span>
                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_green]" />
                </div>
            </SpotlightCard>
            <button
                onClick={() => { localStorage.removeItem('elite_session'); window.location.reload(); }}
                className="px-8 py-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-red-500/20 transition-all"
            >
                Terminar Sesión Segura
            </button>
        </div>
    </div>
);

