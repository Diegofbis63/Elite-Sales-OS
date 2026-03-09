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
    CheckCircle2,
    Target
} from 'lucide-react';
import { EliteLayout } from '@/components/EliteLayout';
import { useLanguage } from '@/components/LanguageContext';

interface Project {
    id: string;
    es: {
        name: string;
        description: string;
        value_props: string[];
        niche: string;
        roi_metric: string;
    };
    en: {
        name: string;
        description: string;
        value_props: string[];
        niche: string;
        roi_metric: string;
    };
    vercel_url: string;
    doc_url: string;
    estimated_price: string;
}

const INITIAL_PROJECTS: Project[] = [
    {
        id: '1',
        es: {
            name: 'NOVA Estética B2B Suite',
            description: 'Ecosistema de flujo agéntico total. Chatbot NLP con razonamiento autónomo que cierra ventas y gestiona crisis en WhatsApp. Sustituye el 100% de la carga de recepción.',
            value_props: [
                'Ahorro operativo de +$1,200 USD/mes vs staff humano.',
                'Razonamiento multimodal para interpretar fotos de piel/cabello.',
                'Integración nativa con pasarelas de pago instantáneo.'
            ],
            niche: 'Operaciones Autónomas',
            roi_metric: 'Breakeven: 90 días'
        },
        en: {
            name: 'NOVA Aesthetics B2B Suite',
            description: 'Total agentic flow ecosystem. NLP Chatbot with autonomous reasoning that closes sales and manages crises on WhatsApp. Replaces 100% of the reception load.',
            value_props: [
                'Operational savings of +$1,200 USD/month vs human staff.',
                'Multimodal reasoning to interpret skin/hair photos.',
                'Native integration with instant payment gateways.'
            ],
            niche: 'Autonomous Beauty Ops',
            roi_metric: 'Breakeven: 90 days'
        },
        vercel_url: 'https://nova-estetica.vercel.app/',
        doc_url: 'https://github.com/Diegofbis63/nova-estetica-demo',
        estimated_price: '$6,500 - $12,000'
    },
    {
        id: '2',
        es: {
            name: 'SaaS Estética Pro',
            description: 'Núcleo ERP con Inteligencia Predictiva. No solo gestiona, sino que anticipa compras y tendencias de consumo. Vendido como IP propia "Lifetime".',
            value_props: [
                'Propiedad intelectual absoluta del cliente (Valor Activo).',
                'Sincronización Multi-Sucursal en tiempo real vía Edge.',
                'Auditoría automática de caja mediante visión artificial.'
            ],
            niche: 'Empresa Predictiva',
            roi_metric: 'Valor de Reventa +40%'
        },
        en: {
            name: 'SaaS Aesthetics Pro',
            description: 'ERP core with Predictive Intelligence. Not only manages, but anticipates purchases and consumption trends. Sold as custom "Lifetime" IP.',
            value_props: [
                'Absolute intellectual property for the client (Asset Value).',
                'Real-time Multi-Branch synchronization via Edge.',
                'Automatic cash audit through computer vision.'
            ],
            niche: 'Predictive Enterprise',
            roi_metric: 'Resale Value +40%'
        },
        vercel_url: 'https://saas-estetica-pro.vercel.app/',
        doc_url: 'https://github.com/Diegofbis63/saas-estetica-pro-demo',
        estimated_price: '$4,800 - $7,500'
    },
    {
        id: '3',
        es: {
            name: 'Santo Cuore Salud (Medical Hub)',
            description: 'Infraestructura clínica de alta disponibilidad. Booking agéntico sin costos de tokens externos (Arquitectura Local-First). Estabilidad crítica.',
            value_props: [
                '0% dependencia de APIs externas para el Booking.',
                'Cumplimiento normativo de datos médicos (HIPAA/GDPR).',
                'Portal del médico acelerado por IA para diagnóstico previo.'
            ],
            niche: 'Infraestructura Salud',
            roi_metric: '99.99% Uptime Médico'
        },
        en: {
            name: 'Santo Cuore Health (Medical Hub)',
            description: 'High-availability clinical infrastructure. Agentic booking without external token costs (Local-First Architecture). Critical stability.',
            value_props: [
                '0% dependence on external APIs for Booking.',
                'Regulatory compliance for medical data (HIPAA/GDPR).',
                'AI-accelerated doctor portal for pre-diagnosis.'
            ],
            niche: 'HealthTech Infrastructure',
            roi_metric: '99.99% Medical Uptime'
        },
        vercel_url: 'https://santo-cuore-salud.vercel.app',
        doc_url: 'https://github.com/Diegofbis63/santo-cuore-salud-showcase',
        estimated_price: '$4,500 - $6,500'
    },
    {
        id: '4',
        es: {
            name: 'Quantix AI (BI E-Commerce)',
            description: 'Cerebro de analítica prescriptiva. Ejecuta acciones preventivas en el e-commerce basándose en el comportamiento VIP.',
            value_props: [
                'Motor de recomendación agéntico hyper-personalizado.',
                'Reducción de abandono de carrito en 35% vía IA.',
                'Dashboard predictivo 2026 con simulación de escenarios.'
            ],
            niche: 'Inteligencia Prescriptiva',
            roi_metric: 'ROI Mensual +18%'
        },
        en: {
            name: 'Quantix AI (BI E-Commerce)',
            description: 'Prescriptive analytics brain. Executes preventive actions on e-commerce based on VIP behavior.',
            value_props: [
                'Hyper-personalized agentic recommendation engine.',
                '35% reduction in cart abandonment via AI.',
                '2026 predictive dashboard with scenario simulation.'
            ],
            niche: 'Prescriptive Intelligence',
            roi_metric: 'Monthly ROI +18%'
        },
        vercel_url: 'https://e-commerce-analytics-saas.vercel.app/',
        doc_url: 'https://github.com/Diegofbis63/quantix-ai-ecommerce-demo',
        estimated_price: '$5,800 - $9,500'
    },
    {
        id: '5',
        es: {
            name: 'Gemini AI Architect',
            description: 'Fábrica de Agentes de IA Industriales. Framework de orquestación para despliegue de micro-agentes especializados en tareas complejas.',
            value_props: [
                'Despliegue de "Agentes Empleados" en 24 horas.',
                'Infraestructura escalable en Vercel/Google Cloud.',
                'Protocolo de seguridad cuántica en el manejo de seeds.'
            ],
            niche: 'Infraestructura Agéntica',
            roi_metric: 'Digital Transformation 2.0'
        },
        en: {
            name: 'Gemini AI Architect',
            description: 'Industrial AI Agent Factory. Orchestration framework for deploying specialized micro-agents for complex tasks.',
            value_props: [
                'Deployment of "Digital Employees" in 24 hours.',
                'Scalable infrastructure on Vercel/Google Cloud.',
                'Quantum security protocol in seed management.'
            ],
            niche: 'Agentic Infrastructure',
            roi_metric: 'Digital Transformation 2.0'
        },
        vercel_url: 'https://gemini-code-assistant-five.vercel.app/',
        doc_url: 'https://github.com/Diegofbis63/gemini-ai-architect-demo',
        estimated_price: '$8,500 - $25,000'
    },
    {
        id: '6',
        es: {
            name: 'Conversion Engine',
            description: 'Funnel Agéntico Auto-Optimizado. La landing se re-escribe sola en tiempo real basándose en el origen del visitante.',
            value_props: [
                'A/B Testing autónomo sin intervención humana.',
                'Puntaje perfecto en métricas de experiencia 2026.',
                'Captura de leads enriquecida con data scraping.'
            ],
            niche: 'Crecimiento Autónomo',
            roi_metric: 'Conversion Velocity x4'
        },
        en: {
            name: 'Conversion Engine',
            description: 'Self-Optimized Agentic Funnel. The landing page rewrites itself in real-time based on visitor origin.',
            value_props: [
                'Autonomous A/B Testing without human intervention.',
                'Perfect score on 2026 experience metrics.',
                'Enriched lead capture through agentic scraping.'
            ],
            niche: 'Self-Optimizing Growth',
            roi_metric: 'Conversion Velocity x4'
        },
        vercel_url: 'https://landing-page-ab-test-demo.vercel.app',
        doc_url: 'https://github.com/Diegofbis63/landing-page-ab-test-demo',
        estimated_price: '$2,500 - $4,500'
    }
];

export default function ProjectsPage() {
    const { language, t } = useLanguage();
    const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    const filteredProjects = projects.filter(p => {
        const content = language === 'en' ? p.en : p.es;
        return content.name.toLowerCase().includes(search.toLowerCase()) ||
            content.niche.toLowerCase().includes(search.toLowerCase());
    });

    const handleEdit = (project: Project) => {
        setEditingProject(JSON.parse(JSON.stringify(project))); // Deep clone
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        const newProject: Project = {
            id: Date.now().toString(),
            es: { name: '', description: '', value_props: ['', '', ''], niche: '', roi_metric: '' },
            en: { name: '', description: '', value_props: ['', '', ''], niche: '', roi_metric: '' },
            vercel_url: 'https://',
            doc_url: 'https://github.com/',
            estimated_price: '0'
        };
        setEditingProject(newProject);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm(t('delete_confirm') || 'Are you sure?')) {
            setProjects(projects.filter(p => p.id !== id));
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProject) {
            const exists = projects.find(p => p.id === editingProject.id);
            if (exists) {
                setProjects(projects.map(p => p.id === editingProject.id ? editingProject : p));
            } else {
                setProjects([editingProject, ...projects]);
            }
            setIsModalOpen(false);
            setEditingProject(null);
        }
    };

    return (
        <EliteLayout onSearch={setSearch}>
            <div className="max-w-[1600px] mx-auto space-y-20 animate-in fade-in slide-in-from-bottom-5 duration-1000 px-4 lg:px-0">
                {/* Header - Larger Text */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-14 border-b border-white/5">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 text-cyan-400">
                            <div className="p-3 bg-cyan-400/10 rounded-xl border border-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.5em]">{t('projects_title_main')}</span>
                        </div>
                        <h1 className="text-8xl font-sans font-black tracking-tighter text-white leading-none">
                            {t('projects_title_main').toUpperCase()} <span className="text-white/20 italic font-serif">{t('projects_title_accent').toUpperCase()}</span>
                        </h1>
                        <p className="text-2xl text-white/40 font-light tracking-wide max-w-3xl leading-relaxed">
                            {t('projects_subtitle')}
                        </p>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="px-10 py-6 bg-white/[0.03] border border-white/5 rounded-[2rem] backdrop-blur-3xl flex items-center gap-6">
                            <Rocket className="w-5 h-5 text-white/20" />
                            <div className="text-left">
                                <p className="text-3xl font-serif text-white leading-none">{projects.length}</p>
                                <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-black mt-2">{t('projects_listed')}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleAddNew}
                            className="h-14 px-8 bg-white text-black rounded-full hover:scale-105 transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-3 group"
                        >
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                            <span className="hidden lg:inline text-[10px] font-black uppercase tracking-[0.2em]">{t('projects_new_asset')}</span>
                        </button>
                    </div>
                </div>

                {/* Projects Grid - Balanced Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProjects.map((p, i) => {
                        const content = language === 'en' ? p.en : p.es;
                        return (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group relative"
                            >
                                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-cyan-500/0 rounded-[2.5rem] group-hover:from-white/5 group-hover:via-white/2 group-hover:to-cyan-500/5 blur-xl transition-all duration-1000 -z-10" />

                                <div className="h-full bg-[#0d0d0d] border border-white/5 rounded-[1.5rem] overflow-hidden flex flex-col hover:border-white/10 transition-all duration-700 shadow-xl">
                                    {/* Header del Proyecto */}
                                    <div className="p-6 pb-0 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-2">
                                                <div className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full">
                                                    <p className="text-[7px] font-black uppercase tracking-widest text-white/40">{content.niche}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => handleEdit(p)} className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 text-white/20 hover:text-white transition-all"><Edit3 className="w-3 h-3" /></button>
                                                <button onClick={() => handleDelete(p.id)} className="p-1.5 bg-white/5 rounded-lg hover:bg-red-500/20 text-white/20 hover:text-red-400 transition-all"><Trash2 className="w-3 h-3" /></button>
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-serif font-light tracking-wide text-white group-hover:text-cyan-400 transition-colors duration-500 uppercase">
                                            {content.name}
                                        </h3>

                                        <p className="text-[13px] font-serif italic text-white/30 leading-snug line-clamp-2">
                                            {content.description}
                                        </p>
                                    </div>

                                    {/* Value Props & Metrics */}
                                    <div className="flex-1 p-6 space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-[1px] w-4 bg-cyan-500/20" />
                                                <p className="text-[7px] font-black uppercase tracking-[0.4em] text-cyan-500/40">{t('projects_value_prop')}</p>
                                            </div>
                                            <div className="space-y-2">
                                                {content.value_props.slice(0, 3).map((v, idx) => (
                                                    <div key={idx} className="flex gap-2.5 items-start group/item">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500/20 mt-0.5 shrink-0 group-hover/item:text-cyan-400 transition-colors" />
                                                        <p className="text-[11px] text-white/50 font-serif leading-tight line-clamp-1">{v}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 rounded-xl bg-white/[0.01] border border-white/5 space-y-1.5 group/metric">
                                                <p className="text-[7px] text-white/10 uppercase tracking-widest font-black">{t('projects_yield')}</p>
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="w-3 h-3 text-cyan-500/40" />
                                                    <p className="text-xs text-white/80 font-black uppercase tracking-tighter">{content.roi_metric}</p>
                                                </div>
                                            </div>
                                            <div className="p-3 rounded-xl bg-cyan-500/[0.01] border border-cyan-500/5 space-y-1.5 group/price">
                                                <p className="text-[7px] text-cyan-500/20 uppercase tracking-widest font-black">{t('projects_price_point')}</p>
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="w-3 h-3 text-cyan-400/40" />
                                                    <p className="text-xs text-cyan-400 font-black uppercase tracking-tighter shrink-0">{p.estimated_price}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="p-6 pt-0 flex gap-2 mt-auto">
                                        <a
                                            href={p.vercel_url}
                                            target="_blank"
                                            className="flex-1 h-10 bg-white text-black text-[9px] font-black uppercase tracking-[0.2em] rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-400 hover:text-black transition-all duration-300"
                                        >
                                            <Globe className="w-3 h-3" /> {t('projects_live_demo')}
                                        </a>
                                        <a
                                            href={p.doc_url}
                                            target="_blank"
                                            className="w-10 h-10 border border-white/5 hover:bg-white/5 text-white/20 hover:text-white transition-all rounded-lg flex items-center justify-center group/btn"
                                        >
                                            <Code2 className="w-3.5 h-3.5" />
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Modal de Edición - Bigger and Bilingual */}
            <AnimatePresence>
                {isModalOpen && editingProject && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-16 overflow-y-auto max-h-[90vh] shadow-[0_0_100px_rgba(0,0,0,0.5)] space-y-12 relative"
                        >
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-12 right-12 p-5 bg-white/5 rounded-full hover:bg-white/10 text-white/40 transition-all z-10">
                                <X className="w-6 h-6" />
                            </button>

                            <div className="text-center space-y-4">
                                <h2 className="text-5xl font-serif tracking-widest uppercase text-white/90">
                                    {projects.find(p => p.id === editingProject.id) ? t('edit') : t('projects_new_asset')} <span className="text-white/20 italic">Asset</span>
                                </h2>
                                <p className="text-[10px] text-cyan-500 uppercase tracking-[0.4em] font-black">{t('projects_sync_value')}</p>
                            </div>

                            <form onSubmit={handleSave} className="space-y-12">
                                {/* Localized Content Section */}
                                <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-8">
                                    <div className="flex items-center gap-4 mb-4">
                                        <Globe className="w-5 h-5 text-cyan-400" />
                                        <h3 className="text-xs font-black uppercase tracking-widest text-white/80">{language === 'es' ? 'Contenido' : 'Content'} ({language.toUpperCase()})</h3>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">{t('projects_name_label')}</label>
                                        <input
                                            className="w-full bg-black border border-white/10 rounded-2xl p-6 text-2xl font-serif text-white outline-none focus:border-cyan-500 transition-all"
                                            value={editingProject[language].name}
                                            onChange={e => setEditingProject({
                                                ...editingProject,
                                                [language]: { ...editingProject[language], name: e.target.value }
                                            })}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">{t('projects_desc_label')}</label>
                                        <textarea
                                            rows={4}
                                            className="w-full bg-black border border-white/10 rounded-2xl p-6 text-lg font-serif italic text-white/60 outline-none focus:border-cyan-500 transition-all resize-none leading-relaxed"
                                            value={editingProject[language].description}
                                            onChange={e => setEditingProject({
                                                ...editingProject,
                                                [language]: { ...editingProject[language], description: e.target.value }
                                            })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">{t('projects_niche_label')}</label>
                                            <input
                                                className="w-full bg-black border border-white/10 rounded-2xl p-6 text-xs uppercase font-black text-white/60 outline-none focus:border-cyan-500 transition-all"
                                                value={editingProject[language].niche}
                                                onChange={e => setEditingProject({
                                                    ...editingProject,
                                                    [language]: { ...editingProject[language], niche: e.target.value }
                                                })}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">{t('projects_yield')}</label>
                                            <input
                                                className="w-full bg-black border border-white/10 rounded-2xl p-6 text-xl font-serif text-white outline-none focus:border-cyan-500 transition-all"
                                                value={editingProject[language].roi_metric}
                                                onChange={e => setEditingProject({
                                                    ...editingProject,
                                                    [language]: { ...editingProject[language], roi_metric: e.target.value }
                                                })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Global Data */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-4">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">{t('projects_price_label')}</label>
                                        <div className="relative">
                                            < DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
                                            <input
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 pl-14 text-xl font-sans font-black text-cyan-500 outline-none focus:border-cyan-500 transition-all"
                                                value={editingProject.estimated_price}
                                                onChange={e => setEditingProject({ ...editingProject, estimated_price: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">{language === 'es' ? 'Despliegue en' : 'Deployment on'} Vercel</label>
                                        <div className="relative">
                                            <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                            <input
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 pl-14 text-sm font-light text-white/60 outline-none focus:border-cyan-500 transition-all"
                                                value={editingProject.vercel_url}
                                                onChange={e => setEditingProject({ ...editingProject, vercel_url: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="w-full h-24 bg-white text-black text-[13px] font-black uppercase tracking-[0.6em] rounded-[2.5rem] hover:shadow-[0_20px_60px_rgba(255,255,255,0.25)] hover:-translate-y-1 transition-all flex items-center justify-center gap-6">
                                    <Save className="w-6 h-6" /> {t('projects_save')}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </EliteLayout>
    );
}

