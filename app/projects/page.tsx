"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase,
    ExternalLink,
    TrendingUp,
    Zap,
    DollarSign,
    Shield,
    Rocket,
    Edit3,
    Trash2,
    Plus,
    X,
    Save,
    ChevronRight,
    Search,
    Globe,
    Code2,
    CheckCircle2
} from 'lucide-react';
import { EliteLayout } from '@/components/EliteLayout';
import { SpotlightCard } from '@/components/SpotlightCard';

interface Project {
    id: string;
    name: string;
    description: string;
    value_props: string[];
    vercel_url: string;
    doc_url: string;
    estimated_price: string;
    niche: string;
    roi_metric: string;
}

const INITIAL_PROJECTS: Project[] = [
    {
        id: '1',
        name: 'NOVA Estética B2B Suite',
        description: 'Ecosistema de flujo agéntico total. Chatbot NLP con razonamiento autónomo (Marzo 2026 update) que cierra ventas y gestiona crisis en WhatsApp. Sustituye el 100% de la carga de recepción.',
        value_props: [
            'Ahorro operativo de +$1,200 USD/mes vs staff humano.',
            'Razonamiento multimodal para interpretar fotos de piel/cabello.',
            'Integración nativa con pasarelas de pago instantáneo.'
        ],
        vercel_url: 'https://nova-estetica.vercel.app/',
        doc_url: 'https://github.com/Diegofbis63/nova-estetica-demo',
        estimated_price: '$6,500 - $12,000',
        niche: 'Autonomous Beauty Ops',
        roi_metric: 'Breakeven: 90 días'
    },
    {
        id: '2',
        name: 'SaaS Estética Pro',
        description: 'Núcleo ERP con Inteligencia Predictiva. No solo gestiona, sino que anticipa compras y tendencias de consumo. Vendido como IP propia "Lifetime" para máxima rentabilidad.',
        value_props: [
            'Propiedad intelectual absoluta del cliente (Valor Activo).',
            'Sincronización Multi-Sucursal en tiempo real vía Edge.',
            'Auditoría automática de caja mediante visión artificial.'
        ],
        vercel_url: 'https://saas-estetica-pro.vercel.app/',
        doc_url: 'https://github.com/Diegofbis63/saas-estetica-pro-demo',
        estimated_price: '$4,800 - $7,500',
        niche: 'Predictive Enterprise',
        roi_metric: 'Valor de Reventa +40%'
    },
    {
        id: '3',
        name: 'Santo Cuore Salud (Medical Hub)',
        description: 'Infraestructura clínica de alta disponibilidad. Booking agéntico sin costos de tokens externos (Arquitectura Local-First). Estabilidad crítica para entornos médicos.',
        value_props: [
            '0% dependencia de APIs externas para el Booking.',
            'Cumplimiento normativo de datos médicos (HIPAA/GDPR compliant).',
            'Portal del médico acelerado por IA para diagnóstico previo.'
        ],
        vercel_url: 'https://santo-cuore-salud.vercel.app',
        doc_url: 'https://github.com/Diegofbis63/santo-cuore-salud-showcase',
        estimated_price: '$4,500 - $6,500',
        niche: 'HealthTech Infrastructure',
        roi_metric: '99.99% Uptime Médico'
    },
    {
        id: '4',
        name: 'Quantix AI (BI E-Commerce)',
        description: 'Cerebro de analítica prescriptiva. No solo muestra qué pasó, sino que ejecuta acciones preventivas en el e-commerce basándose en el comportamiento VIP.',
        value_props: [
            'Motor de recomendación agéntico hyper-personalizado.',
            'Reducción de abandono de carrito en 35% vía IA.',
            'Dashboard predictivo 2026 con simulación de escenarios.'
        ],
        vercel_url: 'https://e-commerce-analytics-saas.vercel.app/',
        doc_url: 'https://github.com/Diegofbis63/quantix-ai-ecommerce-demo',
        estimated_price: '$5,800 - $9,500',
        niche: 'Prescriptive Intelligence',
        roi_metric: 'ROI Mensual Sostenido +18%'
    },
    {
        id: '5',
        name: 'Gemini AI Architect',
        description: 'Fábrica de Agentes de IA Industriales. Framework de orquestación para despliegue de micro-agentes especializados en tareas corporativas complejas.',
        value_props: [
            'Despliegue de "Agentes Empleados" en 24 horas.',
            'Infraestructura escalable en Vercel/Google Cloud.',
            'Protocolo de seguridad cuántica en el manejo de seeds.'
        ],
        vercel_url: 'https://gemini-code-assistant-five.vercel.app/',
        doc_url: 'https://github.com/Diegofbis63/gemini-ai-architect-demo',
        estimated_price: '$8,500 - $25,000',
        niche: 'Agentic Infrastructure',
        roi_metric: 'Digital Transformation 2.0'
    },
    {
        id: '6',
        name: 'Conversion Engine (Elite Landing)',
        description: 'Funnel Agéntico Auto-Optimizado. La landing se re-escribe sola en tiempo real basándose en el origen y perfil del visitante para disparar conversiones.',
        value_props: [
            'A/B Testing autónomo sin intervención humana.',
            'Puntaje perfecto en métricas de experiencia 2026.',
            'Captura de leads enriquecida con data scraping agéntico.'
        ],
        vercel_url: 'https://landing-page-ab-test-demo.vercel.app',
        doc_url: 'https://github.com/Diegofbis63/landing-page-ab-test-demo',
        estimated_price: '$2,500 - $4,500',
        niche: 'Self-Optimizing Growth',
        roi_metric: 'Conversion Velocity x4'
    }
];

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.niche.toLowerCase().includes(search.toLowerCase())
    );

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProject) {
            setProjects(projects.map(p => p.id === editingProject.id ? editingProject : p));
            setIsModalOpen(false);
            setEditingProject(null);
        }
    };

    return (
        <EliteLayout onSearch={setSearch}>
            <div className="max-w-[1400px] mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-5 duration-1000 px-4 lg:px-0">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                    <div className="space-y-4">
                        <h1 className="text-6xl font-sans font-black tracking-[0.2em] text-white/95 uppercase leading-none">Project <span className="text-white/20 italic">Vault</span></h1>
                        <p className="text-[10px] text-cyan-500 uppercase tracking-[0.5em] font-black flex items-center gap-3">
                            <span className="w-10 h-[1px] bg-cyan-500/30"></span> Catálogo de Activos Digitales de Alto Valor
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="px-8 py-4 bg-white/[0.03] border border-white/5 rounded-3xl backdrop-blur-xl flex items-center gap-4">
                            <Briefcase className="w-4 h-4 text-white/20" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{projects.length} Activos Listados</span>
                        </div>
                        <button className="p-6 bg-white text-black rounded-full hover:scale-105 transition-all shadow-xl shadow-white/5 group">
                            <Plus className="w-6 h-6 group-rotate-90 transition-transform duration-500" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-10">
                    {filteredProjects.map((p, i) => (
                        <SpotlightCard key={p.id} delay={i * 0.1} className="p-0 overflow-hidden flex flex-col bg-[#0d0d0d] border-white/5 group">
                            {/* Header del Proyecto */}
                            <div className="p-10 pb-0 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-white/40">{p.niche}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(p)} className="p-3 bg-white/5 rounded-full hover:bg-white/10 text-white/30 hover:text-white transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                                        <button className="p-3 bg-white/5 rounded-full hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-serif font-light tracking-wider text-white group-hover:text-cyan-400 transition-colors uppercase">{p.name}</h3>
                                <p className="text-sm font-serif italic text-white/40 leading-relaxed line-clamp-2">{p.description}</p>
                            </div>

                            {/* Value Props & Metrics */}
                            <div className="flex-1 p-10 space-y-8">
                                <div className="space-y-4">
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-500/50">Value Proposition</p>
                                    <div className="space-y-3">
                                        {p.value_props.map((v, idx) => (
                                            <div key={idx} className="flex gap-3 items-start">
                                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/40 mt-1.5 shrink-0" />
                                                <p className="text-[11px] text-white/60 font-serif lowercase leading-tight">{v}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                                        <p className="text-[8px] text-white/20 uppercase tracking-widest font-black">Yield Metric</p>
                                        <p className="text-[10px] text-white font-black uppercase tracking-widest text-white/80">{p.roi_metric}</p>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 space-y-2">
                                        <p className="text-[8px] text-cyan-500/40 uppercase tracking-widest font-black">Price Point</p>
                                        <p className="text-[10px] text-cyan-400 font-black uppercase tracking-widest">{p.estimated_price} USD</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-10 pt-0 flex gap-4 mt-auto">
                                <a
                                    href={p.vercel_url}
                                    target="_blank"
                                    className="flex-1 py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 hover:shadow-[0_10px_20px_rgba(255,255,255,0.1)] transition-all"
                                >
                                    <Globe className="w-3.5 h-3.5" /> Live Demo
                                </a>
                                <a
                                    href={p.doc_url}
                                    target="_blank"
                                    className="px-6 py-5 border border-white/5 hover:bg-white/5 text-white/40 hover:text-white transition-all rounded-2xl flex items-center justify-center"
                                >
                                    <Code2 className="w-4 h-4" />
                                </a>
                            </div>
                        </SpotlightCard>
                    ))}
                </div>
            </div>

            {/* Modal de Edición */}
            <AnimatePresence>
                {isModalOpen && editingProject && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-12 overflow-hidden shadow-2xl space-y-10"
                        >
                            <div className="flex justify-between items-center text-center w-full">
                                <div className="w-full">
                                    <h2 className="text-3xl font-serif tracking-widest uppercase text-white/90">Edit <span className="text-white/20 italic">Asset</span></h2>
                                    <p className="text-[9px] text-white/30 uppercase tracking-[0.4em] font-black mt-3">Sincronización de Valor Comercial</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-4 bg-white/5 rounded-full hover:bg-white/10 text-white/40 transition-all"><X className="w-5 h-5" /></button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-2">Nombre del Proyecto</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-lg font-serif text-white outline-none focus:border-cyan-500/50 transition-all"
                                        value={editingProject.name}
                                        onChange={e => setEditingProject({ ...editingProject, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-2">Nicho</label>
                                        <input
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs uppercase font-black text-white/60 outline-none focus:border-cyan-500/50 transition-all"
                                            value={editingProject.niche}
                                            onChange={e => setEditingProject({ ...editingProject, niche: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-2">Precio Estimado (USD)</label>
                                        <input
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs uppercase font-black text-cyan-500 outline-none focus:border-cyan-500/50 transition-all"
                                            value={editingProject.estimated_price}
                                            onChange={e => setEditingProject({ ...editingProject, estimated_price: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-2">Descripción de Ventas</label>
                                    <textarea
                                        rows={4}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-serif italic text-white/50 outline-none focus:border-cyan-500/50 transition-all resize-none"
                                        value={editingProject.description}
                                        onChange={e => setEditingProject({ ...editingProject, description: e.target.value })}
                                    />
                                </div>

                                <button type="submit" className="w-full py-6 bg-white text-black text-[11px] font-black uppercase tracking-[0.5em] rounded-3xl hover:shadow-[0_20px_40px_rgba(255,255,255,0.2)] transition-all flex items-center justify-center gap-4">
                                    <Save className="w-5 h-5" /> Guardar Cambios
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </EliteLayout>
    );
}
