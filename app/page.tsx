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
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { getProspects, getTemplates, getDashboardStats, syncProspects, updateProspectStatus, queueMessage, uploadToCloudinary } from '@/lib/actions';

// --- Components ---

const SpotlightCard = ({ children, className = '', delay = 0, neon = true }: { children: React.ReactNode, className?: string, delay?: number, neon?: boolean, key?: React.Key }) => {
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
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 24, delay }}
            whileHover={{ scale: 1.01, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
            className={`relative overflow-hidden rounded-xl bg-[#0f0f0f]/80 backdrop-blur-xl ${className} ${neon ? 'border-0' : 'border border-white/5'}`}
        >
            {neon && (
                <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none z-0">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_70%,rgba(168,85,247,0.8)_90%,rgba(168,85,247,1)_100%)]"
                    />
                    <div className="absolute inset-[1px] bg-[#0f0f0f]/95 rounded-xl backdrop-blur-3xl" />
                </div>
            )}
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 z-0"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,.08), transparent 40%)`,
                }}
            />
            <div className="relative z-10 h-full">
                {children}
            </div>
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
            className="fixed inset-0 pointer-events-none z-[100] transition-opacity duration-300"
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
                } else {
                    console.error("Upload failed:", uploadRes.error);
                }
            }

            const result = await queueMessage(prospect.phone, customMessage, mediaUrl);
            if (result.success) {
                await updateProspectStatus(prospect.id, 'contacted');
                onClose();
            } else {
                alert("Error al encolar el mensaje en el Outbox");
            }
        } catch (error) {
            console.error("Error en el Bridge de WhatsApp:", error);
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                    className="w-full max-w-xl bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                >
                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-purple-500/5 to-transparent">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                                <MessageSquare className="w-5 h-5 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-serif">WhatsApp <span className="text-white/30 italic">Bridge OS</span></h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <p className="text-[9px] text-green-500/70 font-bold uppercase tracking-widest">API Status: Connected</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <X className="w-5 h-5 text-white/30" />
                        </button>
                    </div>
                    <div className="p-8 flex-1 overflow-y-auto">
                        {/* Step Indicators */}
                        <div className="flex justify-between mb-10 px-10 relative">
                            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 -translate-y-1/2 z-0" />
                            {[1, 2, 3].map((s) => (
                                <div key={s} className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-purple-500 text-black shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-[#1a1a1a] text-white/30 border border-white/5'}`}>
                                    {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                                </div>
                            ))}
                        </div>

                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                <h3 className="text-center font-light text-white/70 mb-6 italic">Selecciona una estrategia de apertura</h3>
                                <div className="grid gap-3">
                                    {templates.map((tpl) => (
                                        <button
                                            key={tpl.id}
                                            onClick={() => handleSelectTemplate(tpl)}
                                            className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 group transition-all"
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-serif text-white/90 group-hover:text-purple-400 transition-colors uppercase tracking-widest text-xs">{tpl.title}</span>
                                                <span className="text-[10px] text-white/30 uppercase">{tpl.state}</span>
                                            </div>
                                            <p className="text-sm text-white/50 line-clamp-2">{tpl.content}</p>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <h3 className="font-light text-white/70 italic">Personaliza el mensaje para {prospect.name}</h3>
                                <textarea
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    className="w-full h-48 bg-black/40 border border-white/10 rounded-xl p-5 text-sm text-white/80 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all resize-none leading-relaxed"
                                />
                                <button
                                    onClick={() => setStep(3)}
                                    className="w-full py-4 bg-white text-black rounded-xl font-bold tracking-widest text-xs hover:bg-white/90 transition-all uppercase"
                                >
                                    Continuar a Adjuntos
                                </button>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <h3 className="font-light text-white/70 italic text-center">Aumenta la conversión con contenido visual</h3>

                                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/10 rounded-2xl bg-white/5 hover:bg-white/[0.08] hover:border-purple-500/20 transition-all cursor-pointer group relative">
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => setMedia(e.target.files?.[0] || null)}
                                    />
                                    {media ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                                                <Upload className="w-8 h-8" />
                                            </div>
                                            <span className="text-sm font-medium">{media.name}</span>
                                            <button onClick={(e) => { e.stopPropagation(); setMedia(null); }} className="text-xs text-red-400 hover:text-red-300">Eliminar archivo</button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-4 group-hover:scale-110 group-hover:text-purple-400 transition-all">
                                                <Upload className="w-6 h-6" />
                                            </div>
                                            <p className="text-sm text-white/40 mb-1">Arrastra tus fotos o videos aquí</p>
                                            <p className="text-[10px] text-white/20 uppercase tracking-widest">Máximo 16MB</p>
                                        </>
                                    )}
                                </div>

                                <button
                                    onClick={handleSend}
                                    disabled={isSending}
                                    className="w-full py-5 bg-gradient-to-r from-purple-600 to-purple-400 text-white rounded-xl font-bold tracking-[0.2em] text-xs hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all uppercase flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                                    {isSending ? 'Sincronizando con WhatsApp...' : 'Enviar Campaña Ahora'}
                                </button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// --- Pages ---

const Sidebar = ({ currentRoute, setCurrentRoute }: { currentRoute: string, setCurrentRoute: (r: string) => void }) => {
    const navItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Panel' },
        { id: 'prospects', icon: Users, label: 'Prospectos' },
        { id: 'templates', icon: MessageSquare, label: 'Plantillas' },
        { id: 'analytics', icon: BarChart3, label: 'Métricas' },
        { id: 'settings', icon: Settings, label: 'Configuración' },
    ];

    return (
        <div className="w-20 lg:w-64 border-r border-white/5 bg-[#0a0a0a] flex flex-col transition-all duration-300 z-20">
            <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/5 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/30">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-white to-white/50 flex items-center justify-center text-black font-bold text-sm">
                    E
                </div>
                <span className="ml-3 font-serif font-medium tracking-[0.3em] hidden lg:block text-[10px] uppercase">Elite Sales OS</span>
            </div>
            <nav className="flex-1 py-10 flex flex-col gap-3 px-4">
                {navItems.map((item) => {
                    const isActive = currentRoute === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setCurrentRoute(item.id)}
                            className={`relative flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 group ${isActive ? 'text-white' : 'text-white/40 hover:text-white hover:bg-white/[0.02]'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-nav"
                                    className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                            <item.icon className={`w-5 h-5 flex-shrink-0 relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                            <span className="ml-4 text-[11px] font-medium hidden lg:block tracking-widest relative z-10 uppercase">{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

const Header = () => {
    return (
        <header className="h-16 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md flex items-center justify-between px-10 sticky top-0 z-10">
            <div className="relative w-72 lg:w-[400px]">
                <Search className="w-3.5 h-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                    type="text"
                    placeholder="Rastrear prospectos en la red..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-[11px] text-white placeholder-white/20 focus:outline-none focus:border-white/20 focus:bg-white/5 transition-all tracking-wide"
                />
            </div>
            <div className="flex items-center gap-8">
                <button className="relative p-2 text-white/30 hover:text-white transition-colors group">
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] border border-[#0a0a0a]"></span>
                </button>
                <div className="flex items-center gap-4 cursor-pointer group">
                    <div className="text-right hidden sm:block">
                        <div className="text-[10px] font-bold tracking-widest text-white/90 group-hover:text-purple-400 transition-colors uppercase">Admin Access</div>
                        <div className="text-[9px] text-white/30 uppercase tracking-[0.2em] mt-0.5">Elite OS OS</div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/20 p-[1px] group-hover:border-purple-500/50 transition-all duration-500">
                        <div className="w-full h-full rounded-full overflow-hidden bg-black/40">
                            <img src="https://picsum.photos/seed/avatar/200/200" alt="Profile" className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

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
        { label: 'Ingresos Proyectados', value: stats?.projectedRevenue || '$0', trend: '+12.5%', color: 'from-blue-500/20 to-transparent' },
        { label: 'Negocios sin Web', value: stats?.withoutWeb || '0', trend: 'Alta Prioridad', color: 'from-purple-500/20 to-transparent' },
        { label: 'Tasa de Cierre', value: stats?.conversionRate || '0%', trend: '+2.1%', color: 'from-amber-500/20 to-transparent' },
        { label: 'Mensajes Enviados', value: stats?.messagesSent || '0', trend: '+156', color: 'from-green-500/20 to-transparent' },
    ];

    return (
        <div className="space-y-12 max-w-7xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                    <h1 className="text-5xl font-serif font-light tracking-tight mb-3">Vision <span className="text-white/30 italic">Dashboard</span></h1>
                    <p className="text-white/40 text-[11px] uppercase tracking-[0.4em]">Sintonía fina del flujo de ventas de lujo.</p>
                </motion.div>

                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="px-8 py-3.5 bg-white text-black text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-neutral-200 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] flex items-center gap-3 disabled:opacity-50"
                >
                    {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {kpiData.map((kpi, i) => (
                    <SpotlightCard key={i} delay={i * 0.1} className="p-8 group">
                        <div className={`absolute inset-0 bg-gradient-to-br ${kpi.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="text-white/30 text-[9px] tracking-[0.3em] uppercase mb-10 font-bold">{kpi.label}</div>
                            <div className="space-y-2">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.3 + (i * 0.1) }}
                                    className="text-4xl font-serif font-light tracking-tight"
                                >
                                    {kpi.value}
                                </motion.div>
                                <div className="text-[9px] text-purple-400 font-bold tracking-widest uppercase flex items-center gap-2">
                                    <div className="w-3 h-[1px] bg-purple-500/50" />
                                    {kpi.trend}
                                </div>
                            </div>
                        </div>
                    </SpotlightCard>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <SpotlightCard delay={0.4} neon className="p-10 h-[450px] flex flex-col">
                        <div className="flex items-center justify-between mb-12">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Frecuencia de Captación <span className="text-purple-500 ml-2">•</span></h3>
                            <div className="flex gap-4 text-[9px] font-mono tracking-widest text-white/20">
                                <span>VOLUMEN</span>
                                <span className="text-white/60">682 LEADS</span>
                            </div>
                        </div>
                        <div className="flex-1 flex items-end gap-3 sm:gap-6 pt-4 relative z-10 px-4">
                            {[35, 75, 55, 95, 65, 85, 45].map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-6 group h-full">
                                    <div className="w-full relative bg-white/[0.02] rounded-full overflow-hidden h-full flex items-end border border-white/5">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${h}%` }}
                                            transition={{ duration: 2, delay: 0.6 + (i * 0.1), ease: [0.23, 1, 0.32, 1] }}
                                            className="w-full bg-white/[0.05] group-hover:bg-purple-500/20 transition-all duration-700 relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20" />
                                        </motion.div>
                                    </div>
                                    <span className="text-[9px] text-white/20 font-bold tracking-widest uppercase">Sem {i + 1}</span>
                                </div>
                            ))}
                        </div>
                    </SpotlightCard>
                </div>

                <div>
                    <SpotlightCard delay={0.5} className="p-8 h-[450px] flex flex-col">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-10">Línea de Tiempo <span className="text-white/20 ml-2">/ Live</span></h3>
                        <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
                            {[
                                { entity: 'Dental Luxury Clinic', action: 'Captado sin Web', time: '14:20' },
                                { entity: 'Estética Nova', action: 'Mensaje Entregado', time: '13:45' },
                                { entity: 'Spa Urban', action: 'Respuesta Recibida', time: '12:10' },
                                { entity: 'Dermo Center', action: 'Lead Calificado', time: '11:05' },
                                { entity: 'Odonto Ser', action: 'Campaña Iniciada', time: '09:30' },
                                { entity: 'Clinic Pro', action: 'Detección Automática', time: '08:15' },
                            ].map((act, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.7 + (i * 0.1) }}
                                    className="flex items-start gap-5 group cursor-pointer"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/10 mt-2 group-hover:bg-purple-500 transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0)] group-hover:shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
                                    <div className="flex-1">
                                        <div className="text-[11px] font-serif tracking-widest text-white/80 group-hover:text-white transition-colors uppercase">{act.entity}</div>
                                        <div className="flex items-center justify-between mt-1">
                                            <div className="text-[9px] text-white/20 uppercase tracking-[0.1em]">{act.action}</div>
                                            <div className="text-[9px] font-mono text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">{act.time}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </SpotlightCard>
                </div>
            </div>
        </div>
    );
};

const ProspectsView = () => {
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
            default: return 'text-white/40 border-white/10 bg-white/5';
        }
    };

    const handleOpenWhatsApp = (p: any) => {
        setSelectedProspect(p);
        setShowWhatsApp(true);
    };

    return (
        <div className="max-w-7xl mx-auto pb-20 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-4xl font-serif font-light mb-3">Portfolio <span className="text-white/30 italic">Prospectos</span></h1>
                    <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Directorio de leads de alta fidelidad detectados por IA.</p>
                </motion.div>

                <div className="flex gap-4">
                    <button className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all group">
                        <Filter className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" /> Filtrar
                    </button>
                    <button className="flex items-center gap-3 px-8 py-3 bg-white text-black rounded-full text-[10px] font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all">
                        <Plus className="w-3.5 h-3.5" /> Nuevo Lead
                    </button>
                </div>
            </div>

            <SpotlightCard className="overflow-hidden p-[1px] bg-gradient-to-br from-white/10 to-transparent">
                <div className="overflow-x-auto bg-[#0a0a0a] rounded-xl">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="border-b border-white/5 text-white/30 text-[9px] uppercase tracking-[0.3em] font-bold bg-white/[0.02]">
                                <th className="px-8 py-6">ID / Entidad</th>
                                <th className="px-8 py-6">Industria</th>
                                <th className="px-8 py-6">Canal / Contacto</th>
                                <th className="px-8 py-6">Estado</th>
                                <th className="px-8 py-6">Ranking</th>
                                <th className="px-8 py-6 text-right">Despacho</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode="popLayout">
                                {isFetching ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="border-b border-white/5 animate-pulse">
                                            <td colSpan={6} className="px-8 py-10 bg-white/[0.01]" />
                                        </tr>
                                    ))
                                ) : prospects.map((p, i) => (
                                    <motion.tr
                                        key={p.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="border-b border-white/5 hover:bg-white/[0.02] transition-all group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="text-[12px] font-serif tracking-widest text-white/90 group-hover:text-white transition-colors uppercase">{p.businessName || p.name}</div>
                                            <div className="text-[9px] text-white/30 mt-1 uppercase tracking-tighter">ID: {p.id.slice(0, 8)}</div>
                                        </td>
                                        <td className="px-8 py-6 text-[10px] text-white/50 lowercase tracking-widest">/ {p.industry || 'General'}</td>
                                        <td className="px-8 py-6">
                                            <div className="text-[10px] text-white/80 font-mono tracking-tighter">{p.phone || 'No disponible'}</div>
                                            <div className={`mt-1.5 flex items-center gap-2 ${p.hasWebsite ? 'text-green-500/50' : 'text-red-500/50'}`}>
                                                <div className={`w-1 h-1 rounded-full ${p.hasWebsite ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <span className="text-[8px] uppercase tracking-widest font-bold">{p.hasWebsite ? 'Con Website' : 'Sin Website'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border ${getStatusColor(p.status)}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 italic font-serif text-white/30">{p.rating || '4.0'}+</td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                                                <button
                                                    onClick={() => handleOpenWhatsApp(p)}
                                                    className="p-3 rounded-full bg-white/[0.03] border border-white/5 text-purple-400 hover:bg-white/10 hover:border-purple-500/50 transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                                                >
                                                    <MessageCircle className="w-4 h-4" />
                                                </button>
                                                <button className="p-3 rounded-full bg-white/[0.03] border border-white/5 text-white/30 hover:text-white hover:bg-white/10 transition-all">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
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

const TemplatesView = () => {
    const [templates, setTemplates] = useState<any[]>([]);

    useEffect(() => {
        getTemplates().then(setTemplates);
    }, []);

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-4xl font-serif font-light mb-3">Copy <span className="text-white/30 italic">Architect</span></h1>
                    <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Algoritmos de persuasión por estado de conciencia.</p>
                </motion.div>

                <button className="px-8 py-3 bg-white text-black rounded-full text-[10px] font-bold uppercase tracking-widest hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all flex items-center gap-3">
                    <Plus className="w-4 h-4" /> Nueva Suite
                </button>
            </div>

            <div className="grid gap-8">
                {templates.map((tpl, index) => (
                    <SpotlightCard key={tpl.id} delay={index * 0.1} className="p-10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-6">
                                <h3 className="text-2xl font-serif font-light tracking-wide">{tpl.title}</h3>
                                <span className="px-3 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-[0.3em] bg-white/5 border border-white/10 text-white/40">
                                    {tpl.state || 'General'}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 text-white/20 hover:text-white transition-colors"><Edit2 className="w-4 h-4" /></button>
                                <button className="p-2 text-white/20 hover:text-white transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl rounded-2xl" />
                            <div className="relative p-6 rounded-xl bg-black/40 border border-white/5 group-hover:border-white/10 transition-all">
                                <p className="text-sm text-white/60 leading-[1.8] font-light">
                                    {tpl.content.split(/(\{.*?\})/).map((part: string, i: number) =>
                                        part.startsWith('{') && part.endsWith('}')
                                            ? <span key={i} className="text-purple-400 font-mono italic px-1 bg-purple-400/5 rounded">{part}</span>
                                            : part
                                    )}
                                </p>
                                <div className="mt-6 flex gap-3">
                                    {tpl.mediaUrls?.map((m: string, i: number) => (
                                        <div key={i} className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-white/20">IMG</div>
                                    ))}
                                </div>
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
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-cyan-500/[0.02] blur-[150px] rounded-full pointer-events-none" />
                <Header />
                <main className="flex-1 overflow-y-auto p-8 lg:p-14 relative z-10 custom-scrollbar">
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
        if (session === 'active') {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const validPass = process.env.NEXT_PUBLIC_PASSCODE || 'elite2024';
        if (password === validPass) {
            localStorage.setItem('elite_session', 'active');
            setIsAuthenticated(true);
        } else {
            alert("Acceso denegado: Código inválido.");
        }
    };

    if (isAuthenticated === null) return null;

    if (!isAuthenticated) {
        return (
            <div className="h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
                <SpotlightCard className="w-full max-w-md p-10" neon>
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded bg-white mx-auto mb-6 flex items-center justify-center text-black font-bold text-2xl">E</div>
                        <h1 className="text-2xl font-serif tracking-widest uppercase">Elite OS</h1>
                        <p className="text-white/30 text-[10px] mt-2 uppercase tracking-[0.3em]">Acceso Restringido</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <input
                            type="password"
                            placeholder="System Passcode"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-center text-white tracking-[0.5em] focus:border-purple-500/50 outline-none transition-all"
                        />
                        <button className="w-full py-4 bg-white text-black rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-neutral-200 transition-all">
                            Initialize Session
                        </button>
                    </form>
                </SpotlightCard>
            </div>
        );
    }

    const renderContent = () => {
        switch (currentRoute) {
            case 'dashboard': return <Dashboard />;
            case 'prospects': return <ProspectsView />;
            case 'templates': return <TemplatesView />;
            default: return (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-white/10 space-y-8">
                    <div className="w-32 h-32 rounded-full border border-white/5 flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent group-hover:opacity-100 transition-opacity" />
                        <Settings className="w-8 h-8 opacity-20 group-hover:rotate-90 transition-transform duration-1000" />
                    </div>
                    <p className="font-serif tracking-[0.5em] uppercase text-[10px] italic">Deep learning integration in progress...</p>
                </motion.div>
            );
        }
    };

    return (
        <Layout currentRoute={currentRoute} setCurrentRoute={setCurrentRoute}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentRoute}
                    initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                    className="h-full"
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </Layout>
    );
}
